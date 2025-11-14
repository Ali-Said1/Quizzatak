export const createHttpError = (statusCode, message, details) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  if (details) error.details = details;
  return error;
};

export const assert = (condition, statusCode, message) => {
  if (!condition) {
    throw createHttpError(statusCode, message);
  }
};
