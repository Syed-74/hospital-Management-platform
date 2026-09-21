import { prisma } from "../../config/db.js";
import AppError from "../../utils/AppError.js";
import bcrypt from "bcrypt";
import { generateAccessToken, generateRefreshToken } from "../../utils/jwt.js";
import { attachDerivedRoleView, attachEmploymentContext } from "../../utils/authz.js";

class AuthService {
  /**
   * Register a new user
   */
  async registerUser(userData) {
    const { email, password, firstName, lastName } = userData;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new AppError("Email already in use", 400);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create the identity and its credential together. Roles can be
    // assigned by an admin afterwards.
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: { email, firstName, lastName },
      });
      await tx.userCredential.create({
        data: { userId: newUser.id, passwordHash: hashedPassword },
      });
      return newUser;
    });

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      isActive: user.isActive,
      createdAt: user.createdAt,
    };
  }

  /**
   * Login user and return tokens
   */
  async loginUser(email, password) {
    // 1. Find user, their credential, employment placement, and roles/permissions
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        hospital: true,
        credential: true,
        employee: {
          include: {
            assignments: { include: { branch: true, department: true } },
          },
        },
        roleAssignments: {
          include: {
            role: {
              include: {
                rolePermissions: { include: { permission: true } },
              },
            },
          },
        },
      },
    });

    if (!user || !user.credential) {
      throw new AppError("Incorrect email or password", 401);
    }

    // 2. Verify password
    const isPasswordValid = await bcrypt.compare(password, user.credential.passwordHash);
    if (!isPasswordValid) {
      throw new AppError("Incorrect email or password", 401);
    }

    // 3. Check if active
    if (!user.isActive) {
      throw new AppError("Your account is deactivated", 401);
    }

    // 4. Generate tokens
    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    attachDerivedRoleView(user);
    attachEmploymentContext(user);

    // Remove the credential (password hash) from the response
    delete user.credential;

    return { user, accessToken, refreshToken };
  }
}

export default new AuthService();
