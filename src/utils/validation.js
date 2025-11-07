// src/utils/formValidation.js
export const validateSignup = ({ name, email, password }) => {
  const errors = {};

  if (name !== undefined) {
    if (!name.trim()) {
      errors.name = "Name is required";
    } else if (name.trim().length < 4) {
      errors.name = "Name must be at least 4 characters long";
    }
  }

  if (email !== undefined) {
    if (!email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Invalid email address";
    }
  }

  if (password !== undefined) {
    if (!password) {
      errors.password = "Password is required";
    } else if (
      !/^(?=.*[A-Z])(?=.*\d)(?=.*[@#\$!%*?&])[A-Za-z\d@#\$!%*?&]{6,}$/.test(password)
    ) {
      errors.password =
        "Password must be ≥6 chars and include one uppercase letter, one number, and one symbol (@, #, $, etc.)";
    }
  }

  return errors;
};
