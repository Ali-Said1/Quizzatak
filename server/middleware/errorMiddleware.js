import { env } from "../config/index.js";

export const notFoundHandler = (req, res) => {
  res.status(404).json({ message: "Route not found" });
};

export const errorHandler = (err, req, res, _next) => {
  const status = err.statusCode || 500;
  const response = {
    message: err.message || "Internal server error",
  };
  if (err.details) {
    response.details = err.details;
  }
  if (_next) {
    // satisfy lint for unused param while preserving Express signature
  }
  if (env.NODE_ENV !== "production") {
    response.stack = err.stack;
  }
  if (status >= 500) {
    console.error(err);
  }
  res.status(status).json(response);
};
