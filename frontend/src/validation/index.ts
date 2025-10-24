import type {
  IFormDataLogin,
  IFormDataSignUp,
  IFormErrors,
} from "../interface";

export const validateFormSignUp = (data: IFormDataSignUp) => {
  const errors: IFormErrors = {};

  if (!data.email.trim()) {
    errors.email = "Email is required";
  } else if (!/\S+@\S+\.\S+/.test(data.email)) {
    errors.email = "Invalid email format";
  }

  if (!data.password.trim()) {
    errors.password = "Password is required";
  } else if (data.password.length < 6) {
    errors.password = "Password must be at least 6 characters";
  }

  if (!data.fullName.trim()) {
    errors.fullName = "Full name is required";
  } else if (
    data.fullName.trim().length < 3 ||
    data.fullName.trim().length > 50
  ) {
    errors.fullName = "Full name must be between 3 and 50 characters";
  }

  return errors;
};
export const validateFormLogin = (data: IFormDataLogin) => {
  const errors: IFormErrors = {};

  if (!data.email.trim()) {
    errors.email = "Email is required";
  } else if (!/\S+@\S+\.\S+/.test(data.email)) {
    errors.email = "Invalid email format";
  }

  if (!data.password.trim()) {
    errors.password = "Password is required";
  } else if (data.password.length < 6) {
    errors.password = "Password must be at least 6 characters";
  }

  return errors;
};
