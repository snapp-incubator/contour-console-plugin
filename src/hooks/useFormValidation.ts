import { useState, useCallback } from 'react';
import { FormData } from '../types';
import { validateForm } from '../utils/schemaValidation';
import { useTranslation } from 'react-i18next';

interface ValidationResult {
  errors: string[];
  isValid: boolean;
}

export const useFormValidation = () => {
  const [errors, setErrors] = useState<string[]>([]);
  const { t } = useTranslation('plugin__contour-console-plugin');

  const validate = useCallback((data: FormData): ValidationResult => {
    const validationErrors = validateForm(data, t);
    setErrors(validationErrors);
    return {
      errors: validationErrors,
      isValid: validationErrors.length === 0,
    };
  }, []);

  return {
    errors,
    validate,
    clearErrors: () => setErrors([]),
  };
};
