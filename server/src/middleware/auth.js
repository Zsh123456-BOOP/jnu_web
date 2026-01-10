import { ApiError } from './error.js';
import { AdminUser } from '../models/index.js';

export async function requireAdmin(req, _res, next) {
  if (!req.session || !req.session.adminId) {
    next(new ApiError(401, 'Unauthorized'));
    return;
  }

  try {
    const user = await AdminUser.findByPk(req.session.adminId, {
      attributes: ['id', 'is_active']
    });
    if (!user || user.is_active !== 1) {
      req.session.destroy(() => {});
      next(new ApiError(401, 'Unauthorized'));
      return;
    }
    next();
  } catch (err) {
    next(err);
  }
}
