import jwt from "jsonwebtoken";
import { ENV } from "../config/env.js";
import AppError from "./AppError.js";

/**
 * Generates an access token for the given user ID.
 */
export const generateAccessToken = (userId) => {
  return jwt.sign({ id: userId }, ENV.JWT_SECRET, {
    expiresIn: ENV.JWT_EXPIRES_IN,
  });
};

/**
 * Generates a refresh token for the given user ID.
 */
export const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, ENV.REFRESH_TOKEN_SECRET, {
    expiresIn: ENV.REFRESH_TOKEN_EXPIRES_IN,
  });
};

/**
 * Verifies a given token and returns the decoded payload.
 */
export const verifyToken = (token, secret) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, secret, (err, decoded) => {
      if (err) {
        return reject(new AppError("Invalid or expired token", 401));
      }
      resolve(decoded);
    });
  });
};
