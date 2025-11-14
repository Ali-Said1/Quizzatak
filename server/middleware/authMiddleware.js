import User from "../models/userModel.js";
import { verifyAccessToken } from "../services/tokenService.js";
import { createHttpError } from "../utils/error.js";
import { sanitizeUser } from "../utils/index.js";

export const authenticate = async (req, res, next) => {
  const header = req.headers.authorization || "";
  if (!header.startsWith("Bearer ")) {
    return next(createHttpError(401, "Missing authorization token"));
  }
  const token = header.replace("Bearer ", "").trim();
  const payload = verifyAccessToken(token);
  if (!payload) {
    return next(createHttpError(401, "Invalid or expired token"));
  }
  const user = await User.findById(payload.sub);
  if (!user) {
    return next(createHttpError(401, "User not found"));
  }
  req.user = sanitizeUser(user);
  next();
};

const requireRole = (role) => (req, res, next) => {
  if (!req.user || req.user.role !== role) {
    return next(createHttpError(403, `${role}s only`));
  }
  next();
};

export const requireTeacher = requireRole("teacher");
export const requireStudent = requireRole("student");
