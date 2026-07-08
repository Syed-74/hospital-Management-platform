import catchAsync from "../../utils/catchAsync.js";
import authService from "./auth.service.js";

/**
 * Controller for POST /api/v1/auth/register
 */
export const register = catchAsync(async (req, res, next) => {
  const user = await authService.registerUser(req.body);

  res.status(201).json({
    status: "success",
    data: { user },
  });
});

/**
 * Controller for POST /api/v1/auth/login
 */
export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      status: "fail",
      message: "Please provide email and password",
    });
  }

  const { user, accessToken, refreshToken } = await authService.loginUser(email, password);

  // Send refresh token in a secure HTTP-Only cookie
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  res.status(200).json({
    status: "success",
    data: {
      user,
      accessToken,
    },
  });
});

/**
 * Controller for GET /api/v1/auth/me
 * Returns the currently authenticated user's profile and roles.
 */
export const getMe = catchAsync(async (req, res, next) => {
  // Remove password from response just in case, though it shouldn't be selected typically
  const user = { ...req.user };
  delete user.password;

  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});
