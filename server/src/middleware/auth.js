import { ApiError } from './error.js';

export function requireAdmin(req, _res, next) {
  if (req.session && req.session.adminId) {
    next();
    return;
  }

  next(new ApiError(401, 'Unauthorized'));
}
