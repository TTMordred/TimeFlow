
import { useState, useCallback } from 'react';

interface PasswordValidation {
  hasMinLength: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
  hasUppercase: boolean;
  strength: number;
}

export const usePasswordValidation = () => {
  const [validation, setValidation] = useState<PasswordValidation>({
    hasMinLength: false,
    hasNumber: false,
    hasSpecial: false,
    hasUppercase: false,
    strength: 0
  });

  const validatePassword = useCallback((password: string) => {
    const minLength = password.length >= 8;
    const containsNumber = /\d/.test(password);
    const containsSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const containsUppercase = /[A-Z]/.test(password);

    const strength = [minLength, containsNumber, containsSpecial, containsUppercase]
      .filter(Boolean).length * 25;

    setValidation({
      hasMinLength: minLength,
      hasNumber: containsNumber,
      hasSpecial: containsSpecial,
      hasUppercase: containsUppercase,
      strength
    });

    return strength;
  }, []);

  return {
    ...validation,
    validatePassword
  };
};
