import { Response } from 'express';
import { ERROR_MESSAGES } from '../constants/errorMessages';

// Success response helper
export const sendSuccess = (
  res: Response,
  data: any,
  message: string = 'Success',
  statusCode: number = 200
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

// Error response helper
export const sendError = (
  res: Response,
  message: string,
  statusCode: number = 500,
  error?: any
) => {
  return res.status(statusCode).json({
    success: false,
    message,
    error: error?.message || error || message
  });
};

// Not found response helper
export const sendNotFound = (
  res: Response,
  message: string
) => {
  return res.status(404).json({
    success: false,
    message
  });
};

// Validation error response helper
export const sendValidationError = (
  res: Response,
  message: string
) => {
  return res.status(400).json({
    success: false,
    message
  });
};

// Conflict error response helper
export const sendConflictError = (
  res: Response,
  message: string
) => {
  return res.status(409).json({
    success: false,
    message
  });
};
