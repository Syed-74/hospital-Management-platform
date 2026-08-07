import express from "express";
import { register, login, getMe, refreshToken, logout } from "./auth.controller.js";
import { protect } from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);
router.get("/refresh-token", refreshToken);
router.post("/logout", logout);

export default router;
