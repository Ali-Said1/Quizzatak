import User from "../models/userModel.js";
import { hashPassword, sanitizeUser, verifyPassword } from "../utils/index.js";
import { createHttpError } from "../utils/error.js";

const ALLOWED_ROLES = new Set(["teacher", "student"]);

const normalizeEmail = (email = "") => email.trim().toLowerCase();

export const registerUser = async ({
  username,
  email,
  password,
  role = "student",
}) => {
  if (!username || !email || !password) {
    throw createHttpError(400, "username, email, and password are required");
  }
  if (!ALLOWED_ROLES.has(role)) {
    throw createHttpError(400, "role must be teacher or student");
  }

  const normalizedEmail = normalizeEmail(email);
  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) {
    throw createHttpError(409, "Email already registered");
  }

  const user = await User.create({
    username: username.trim(),
    email: normalizedEmail,
    passwordHash: hashPassword(password),
    role,
    classrooms: [],
    quizSubmissions: [],
  });

  return sanitizeUser(user);
};

export const loginUser = async ({ email, password }) => {
  if (!email || !password) {
    throw createHttpError(400, "Email and password are required");
  }
  const user = await User.findOne({ email: normalizeEmail(email) });
  if (!user || !verifyPassword(password, user.passwordHash)) {
    throw createHttpError(401, "Invalid credentials");
  }
  return sanitizeUser(user);
};

export const getMe = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw createHttpError(404, "User not found");
  }
  return sanitizeUser(user);
};

export const updateProfile = async (userId, { username }) => {
  const user = await User.findById(userId);
  if (!user) {
    throw createHttpError(404, "User not found");
  }

  if (username) user.username = username.trim();
  await user.save();
  return sanitizeUser(user);
};

export const changePassword = async (userId, currentPassword, newPassword) => {
  if (!currentPassword || !newPassword) {
    throw createHttpError(400, "currentPassword and newPassword are required");
  }
  const user = await User.findById(userId);
  if (!user) {
    throw createHttpError(404, "User not found");
  }
  if (!verifyPassword(currentPassword, user.passwordHash)) {
    throw createHttpError(400, "Current password is incorrect");
  }
  user.passwordHash = hashPassword(newPassword);
  await user.save();
  return true;
};
