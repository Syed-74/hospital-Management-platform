import { prisma } from "../../config/db.js";
import AppError from "../../utils/AppError.js";
import bcrypt from "bcrypt";
import { generateAccessToken, generateRefreshToken } from "../../utils/jwt.js";

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

    // Create user (and potentially assign default 'User' role)
    // For now, we just create the user. Roles can be assigned by admin.
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isActive: true,
        createdAt: true,
      },
    });

    return user;
  }

  /**
   * Login user and return tokens
   */
  async loginUser(email, password) {
    // 1. Find user and their roles/permissions
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        hospital: true,
        roles: {
          include: {
            permissions: true,
          },
        },
      },
    });

    if (!user) {
      throw new AppError("Incorrect email or password", 401);
    }

    // 2. Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
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

    // Remove password from response
    delete user.password;

    return { user, accessToken, refreshToken };
  }
}

export default new AuthService();
