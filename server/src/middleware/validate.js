import { validationResult } from 'express-validator';
import { ApiError } from './error.js';

export function validateRequest(req, _res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    next(
      new ApiError(400, 'Validation failed', {
        errors: errors.array()
      })
    );
    return;
  }

  next();
}
