import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { requireAdmin } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validate.js';
import { asyncHandler } from '../utils/async-handler.js';
import { createAssetUploadMiddleware } from '../utils/upload.js';
import * as adminController from '../controllers/admin.controller.js';

const router = Router();

const moduleTypes = ['SinglePage', 'ListDetail', 'ExternalLink', 'LandingGrid', 'Contact'];
const contentStatuses = ['draft', 'published'];
const contentFormats = ['markdown', 'richtext'];

const isBooleanLike = (value) => {
  if (value === undefined || value === null) {
    return true;
  }

  if (typeof value === 'boolean') {
    return true;
  }

  if (typeof value === 'number') {
    return value === 0 || value === 1;
  }

  if (typeof value === 'string') {
    return ['0', '1', 'true', 'false'].includes(value.trim().toLowerCase());
  }

  return false;
};

const isJsonLike = (value) => {
  if (value === undefined || value === null) {
    return true;
  }

  if (typeof value === 'object') {
    return true;
  }

  if (typeof value === 'string') {
    try {
      JSON.parse(value);
      return true;
    } catch {
      return false;
    }
  }

  return false;
};

const isPlainObject = (value) => {
  if (value === undefined || value === null) {
    return true;
  }
  return typeof value === 'object' && !Array.isArray(value);
};

const memberValidators = [
  body('name').isString().trim().notEmpty().isLength({ max: 100 }),
  body('position').optional({ nullable: true, checkFalsy: true }).isString().trim().isLength({ max: 100 }),
  body('type').optional().isIn(['in_service', 'student', 'alumni']),
  body('is_pi').optional().custom(isBooleanLike),
  body('research_interests')
    .optional({ nullable: true, checkFalsy: true })
    .isString()
    .trim()
    .isLength({ max: 500 }),
  body('hobbies').optional({ nullable: true, checkFalsy: true }).isString().trim().isLength({ max: 200 }),
  body('email').optional({ nullable: true, checkFalsy: true }).isString().trim().isLength({ max: 255 }),
  body('image_asset_id').optional({ nullable: true, checkFalsy: true }).isInt({ min: 1 }),
  body('sort_order').optional().isInt({ min: 0 }),
  body('enabled').optional().custom(isBooleanLike)
];

const siteSettingsValidators = [
  body('site_title').optional({ nullable: true }).isString().trim().isLength({ max: 60 }),
  body('favicon_url').optional({ nullable: true }).isString().trim().isLength({ max: 2048 }),
  body('footer').optional().custom(isPlainObject),
  body('footer.contact').optional().custom(isPlainObject),
  body('footer.contact.address')
    .optional({ nullable: true, checkFalsy: true })
    .isString()
    .trim()
    .isLength({ max: 255 }),
  body('footer.contact.email')
    .optional({ nullable: true, checkFalsy: true })
    .isEmail()
    .isLength({ max: 255 }),
  body('footer.links').optional().isArray()
];

const upload = createAssetUploadMiddleware();

router.post('/admin/assets/upload', upload.single('file'), asyncHandler(adminController.uploadAsset));

router.post(
  '/admin/login',
  [
    body('username').isString().trim().notEmpty().isLength({ max: 64 }),
    body('password').isString().notEmpty()
  ],
  validateRequest,
  asyncHandler(adminController.login)
);

router.use('/admin', requireAdmin);

router.post('/admin/logout', asyncHandler(adminController.logout));

router.get('/admin/me', asyncHandler(adminController.getMe));

router.get(
  '/admin/modules',
  [query('page').optional().isInt({ min: 1 }), query('pageSize').optional().isInt({ min: 1, max: 200 })],
  validateRequest,
  asyncHandler(adminController.listModules)
);

router.post(
  '/admin/modules',
  [
    body('name').isString().trim().notEmpty().isLength({ max: 128 }),
    body('slug').isString().trim().notEmpty().isLength({ max: 128 }),
    body('type').isIn(moduleTypes),
    body('enabled').optional().custom(isBooleanLike),
    body('nav_visible').optional().custom(isBooleanLike),
    body('sort_order').optional().isInt({ min: 0 }),
    body('config_json').optional().custom(isJsonLike)
  ],
  validateRequest,
  asyncHandler(adminController.createModule)
);

router.get(
  '/admin/modules/:id',
  [param('id').isInt({ min: 1 })],
  validateRequest,
  asyncHandler(adminController.getModule)
);

router.put(
  '/admin/modules/:id',
  [
    param('id').isInt({ min: 1 }),
    body('name').isString().trim().notEmpty().isLength({ max: 128 }),
    body('slug').isString().trim().notEmpty().isLength({ max: 128 }),
    body('type').isIn(moduleTypes),
    body('enabled').optional().custom(isBooleanLike),
    body('nav_visible').optional().custom(isBooleanLike),
    body('sort_order').optional().isInt({ min: 0 }),
    body('config_json').optional().custom(isJsonLike)
  ],
  validateRequest,
  asyncHandler(adminController.updateModule)
);

router.delete(
  '/admin/modules/:id',
  [param('id').isInt({ min: 1 })],
  validateRequest,
  asyncHandler(adminController.deleteModule)
);

router.get(
  '/admin/members',
  [
    query('page').optional().isInt({ min: 1 }),
    query('pageSize').optional().isInt({ min: 1, max: 200 }),
    query('is_pi').optional().custom(isBooleanLike)
  ],
  validateRequest,
  asyncHandler(adminController.listMembers)
);

router.post(
  '/admin/members',
  memberValidators,
  validateRequest,
  asyncHandler(adminController.createMember)
);

router.put(
  '/admin/members/:id',
  [param('id').isInt({ min: 1 }), ...memberValidators],
  validateRequest,
  asyncHandler(adminController.updateMember)
);

router.delete(
  '/admin/members/:id',
  [param('id').isInt({ min: 1 })],
  validateRequest,
  asyncHandler(adminController.deleteMember)
);

router.get(
  '/admin/members/:id/pi-info',
  [param('id').isInt({ min: 1 })],
  validateRequest,
  asyncHandler(adminController.getMemberPiInfo)
);

router.put(
  '/admin/members/:id/pi-info',
  [
    param('id').isInt({ min: 1 }),
    body('content_format').optional().isIn(contentFormats),
    body('content_md').optional().isString(),
    body('content_html').optional().isString()
  ],
  validateRequest,
  asyncHandler(adminController.updateMemberPiInfo)
);

router.get(
  '/admin/contents',
  [
    query('moduleId').optional().isInt({ min: 1 }),
    query('moduleSlug').optional().isString().trim().notEmpty(),
    query('status').optional().isIn(contentStatuses),
    query('year').optional().isInt({ min: 0 }),
    query('keyword').optional().isString().trim(),
    query('page').optional().isInt({ min: 1 }),
    query('pageSize').optional().isInt({ min: 1, max: 100 })
  ],
  validateRequest,
  asyncHandler(adminController.listContents)
);

router.post(
  '/admin/contents',
  [
    body('module_id').isInt({ min: 1 }),
    body('title').isString().trim().notEmpty().isLength({ max: 255 }),
    body('slug').isString().trim().notEmpty().isLength({ max: 255 }),
    body('status').optional().isIn(contentStatuses),
    body('content_format').isIn(contentFormats),
    body('content_md').optional().isString(),
    body('content_html').optional().isString(),
    body('summary').optional().isString(),
    body('cover_asset_id').optional({ nullable: true }).isInt({ min: 1 }),
    body('year').optional().isInt({ min: 0 }),
    body('tags_json').optional().custom(isJsonLike),
    body('authors_json').optional().custom(isJsonLike),
    body('meta_json').optional().custom(isJsonLike),
    body('published_at').optional().isISO8601()
  ],
  validateRequest,
  asyncHandler(adminController.createContent)
);

router.get(
  '/admin/contents/:id',
  [param('id').isInt({ min: 1 })],
  validateRequest,
  asyncHandler(adminController.getContent)
);

router.put(
  '/admin/contents/:id',
  [
    param('id').isInt({ min: 1 }),
    body('module_id').isInt({ min: 1 }),
    body('title').isString().trim().notEmpty().isLength({ max: 255 }),
    body('slug').isString().trim().notEmpty().isLength({ max: 255 }),
    body('status').optional().isIn(contentStatuses),
    body('content_format').isIn(contentFormats),
    body('content_md').optional().isString(),
    body('content_html').optional().isString(),
    body('summary').optional().isString(),
    body('cover_asset_id').optional({ nullable: true }).isInt({ min: 1 }),
    body('year').optional().isInt({ min: 0 }),
    body('tags_json').optional().custom(isJsonLike),
    body('authors_json').optional().custom(isJsonLike),
    body('meta_json').optional().custom(isJsonLike),
    body('published_at').optional().isISO8601()
  ],
  validateRequest,
  asyncHandler(adminController.updateContent)
);

router.delete(
  '/admin/contents/:id',
  [param('id').isInt({ min: 1 })],
  validateRequest,
  asyncHandler(adminController.deleteContent)
);

router.get(
  '/admin/assets',
  [query('page').optional().isInt({ min: 1 }), query('pageSize').optional().isInt({ min: 1, max: 100 })],
  validateRequest,
  asyncHandler(adminController.listAssets)
);

router.delete(
  '/admin/assets/:id',
  [param('id').isInt({ min: 1 }), query('removeFile').optional().isString()],
  validateRequest,
  asyncHandler(adminController.deleteAsset)
);

router.get('/admin/settings/site', asyncHandler(adminController.getSiteSettings));

router.put(
  '/admin/settings/site',
  [body('value').optional(), body('value_json').optional()],
  validateRequest,
  asyncHandler(adminController.updateSiteSettings)
);

router.get('/admin/site-settings', asyncHandler(adminController.getAdminSiteSettings));

router.put(
  '/admin/site-settings',
  siteSettingsValidators,
  validateRequest,
  asyncHandler(adminController.updateAdminSiteSettings)
);

export default router;
