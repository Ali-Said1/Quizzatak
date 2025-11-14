import asyncHandler from "../middleware/asyncHandler.js";
import * as authService from "../services/authService.js";
import {
  createAccessToken,
  createRefreshToken,
  verifyRefreshToken,
  clearRefreshToken,
  setRefreshCookie,
  getCookie,
} from "../services/tokenService.js";
import { cookieOptions } from "../config/index.js";

export const register = asyncHandler(async (req, res) => {
  const user = await authService.registerUser(req.body);
  const token = createAccessToken(user.id);
  const refreshToken = createRefreshToken(user.id);
  setRefreshCookie(res, refreshToken);
  res.status(201).json({ user, token });
});

export const login = asyncHandler(async (req, res) => {
  const user = await authService.loginUser(req.body);
  const token = createAccessToken(user.id);
  const refreshToken = createRefreshToken(user.id);
  setRefreshCookie(res, refreshToken);
  res.json({ user, token });
});

export const logout = asyncHandler(async (req, res) => {
  const token = getCookie(req, "refreshToken");
  clearRefreshToken(token);
  res.clearCookie("refreshToken", cookieOptions);
  res.json({ message: "Logged out" });
});

export const me = asyncHandler(async (req, res) => {
  const user = await authService.getMe(req.user.id);
  res.json({ user });
});

export const refresh = asyncHandler(async (req, res) => {
  const token = getCookie(req, "refreshToken");
  const userId = verifyRefreshToken(token);
  if (!userId) {
    res.status(401).json({ message: "Invalid refresh token" });
    return;
  }
  clearRefreshToken(token);
  const newRefresh = createRefreshToken(userId);
  setRefreshCookie(res, newRefresh);
  const newAccess = createAccessToken(userId);
  res.json({ token: newAccess });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const user = await authService.updateProfile(req.user.id, req.body);
  res.json({ user });
});

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body || {};
  await authService.changePassword(req.user.id, currentPassword, newPassword);
  res.json({ message: "Password updated" });
});
