import { Router } from 'express';
import { body, param, query } from 'express-validator';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { config } from '../config.js';
import { execute, queryOne, queryRows } from '../db.js';
import { requireAdmin } from '../middleware/auth.js';
import { ApiError } from '../middleware/error.js';
import { validateRequest } from '../middleware/validate.js';
import { asyncHandler } from '../utils/async-handler.js';
import { safeJsonParse, parseJsonInput, toJsonString } from '../utils/json.js';
import { getPagination } from '../utils/pagination.js';
import { toInt, toTinyInt } from '../utils/parse.js';
import { sanitizeRichText } from '../utils/sanitize.js';

const router = Router();

// ====== NEW: 生成绝对 URL（适配反代） ======
const toAbsoluteUrl = (req, urlPath) => {
  if (!urlPath) return urlPath;

  const proto = (req.headers['x-forwarded-proto'] || req.protocol || 'http').split(',')[0].trim();
  const host = (req.headers['x-forwarded-host'] || req.headers.host || '').split(',')[0].trim();
  if (!host) return urlPath;

  return `${proto}://${host}${urlPath.startsWith('/') ? '' : '/'}${urlPath}`;
};

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

const memberValidators = [
  body('name').isString().trim().notEmpty().isLength({ max: 100 }),
  body('position').optional({ nullable: true, checkFalsy: true }).isString().trim().isLength({ max: 100 }),
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

const mapModule = (row) => ({
  ...row,
  config_json: safeJsonParse(row.config_json, {})
});

const mapContent = (row) => ({
  ...row,
  tags_json: safeJsonParse(row.tags_json, []),
  authors_json: safeJsonParse(row.authors_json, []),
  meta_json: safeJsonParse(row.meta_json, {}),
  module_slug: row.module_slug,
  module_name: row.module_name
});

// ====== CHANGED: mapAsset/mapMember 改为绝对 URL ======
const mapAsset = (req, row) => ({
  ...row,
  url: toAbsoluteUrl(req, `/static/${row.relative_path}`)
});

const mapMember = (req, row) => ({
  id: row.id,
  name: row.name,
  position: row.position,
  research_interests: row.research_interests,
  hobbies: row.hobbies,
  email: row.email,
  image_asset_id: row.image_asset_id,
  sort_order: row.sort_order,
  enabled: row.enabled,
  created_at: row.created_at,
  updated_at: row.updated_at,
  image:
    row.image_asset_id && row.image_relative_path
      ? {
          id: row.image_asset_id,
          url: toAbsoluteUrl(req, `/static/${row.image_relative_path}`),
          mime: row.image_mime || null,
          original_name: row.image_original_name || null
        }
      : null
});

const sanitizeFilename = (filename) => {
  const base = path.basename(filename || 'file');
  const cleaned = base.replace(/[^a-zA-Z0-9._-]/g, '_');
  return cleaned || 'file';
};

const fixMulterFilename = (name) => {
  if (!name) return name;

  const looksMojibake = /[ÃÂåäæçéèêëíìîïñóòôöõúùûüýÿ]/.test(name);
  if (!looksMojibake) {
    return name;
  }

  try {
    const fixed = Buffer.from(name, 'latin1').toString('utf8');
    return fixed || name;
  } catch {
    return name;
  }
};

const getSafeStoragePath = (relativePath) => {
  if (!relativePath) {
    return null;
  }

  const normalized = relativePath.replace(/\\/g, '/');
  const resolved = path.resolve(config.storageDir, normalized);
  const root = path.resolve(config.storageDir);
  const relative = path.relative(root, resolved);

  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    return null;
  }

  return resolved;
};

const ensureJsonObjectOrArray = (value, fieldName) => {
  const parsed = parseJsonInput(value);
  if (parsed === null || parsed === undefined) {
    return null;
  }
  if (typeof parsed !== 'object') {
    throw new ApiError(400, `${fieldName} must be JSON object or array`);
  }
  return parsed;
};

const ensureJsonObject = (value, fieldName) => {
  const parsed = parseJsonInput(value);
  if (parsed === null || parsed === undefined) {
    return {};
  }
  if (typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new ApiError(400, `${fieldName} must be JSON object`);
  }
  return parsed;
};

const normalizeOptionalText = (value) => {
  if (value === undefined || value === null) {
    return null;
  }
  const trimmed = String(value).trim();
  return trimmed ? trimmed : null;
};

const parseDateTime = (value, fieldName) => {
  if (!value) {
    return null;
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new ApiError(400, `${fieldName} is invalid`);
  }
  return parsed;
};

const regenerateSession = (req) =>
  new Promise((resolve, reject) => {
    req.session.regenerate((err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });

const saveSession = (req) =>
  new Promise((resolve, reject) => {
    req.session.save((err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });

const allowedImageMimes = new Set(['image/png', 'image/jpeg', 'image/webp']);

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, _file, cb) => {
      const now = new Date();
      const year = String(now.getFullYear());
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const dir = path.join(config.uploadsDir, year, month);
      fs.mkdirSync(dir, { recursive: true });
      req.uploadMeta = { year, month };
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      const fixedOriginalName = fixMulterFilename(file.originalname);
      const safeName = sanitizeFilename(fixedOriginalName);
      const filename = `${crypto.randomUUID()}_${safeName}`;

      if (!req.uploadMeta) req.uploadMeta = {};
      req.uploadMeta.filename = filename;

      // 保存修复后的原始名，供路由入库使用（保证一致）
      req.uploadMeta.fixedOriginalName = fixedOriginalName;

      cb(null, filename);
    }
  }),
  fileFilter: (_req, file, cb) => {
    if (!allowedImageMimes.has(file.mimetype)) {
      cb(new ApiError(400, '仅支持上传 PNG/JPG/WEBP 图片'));
      return;
    }
    cb(null, true);
  },
  limits: {
    fileSize: 20 * 1024 * 1024
  }
});

// ====== admin 认证前：上传接口（你的原逻辑保留，返回 mapAsset(req,row)） ======
router.post(
  '/admin/assets/upload',
  upload.single('file'),
  asyncHandler(async (req, res) => {
    if (!req.file || !req.uploadMeta) {
      throw new ApiError(400, 'File is required');
    }

    const { year, month, filename } = req.uploadMeta;
    const relativePath = path.posix.join('uploads', year, month, filename);
    const kind = req.file.mimetype && req.file.mimetype.startsWith('image/') ? 'image' : 'file';

    const fixedOriginalName =
      req.uploadMeta.fixedOriginalName || fixMulterFilename(req.file.originalname);

    const result = await execute(
      `INSERT INTO asset (original_name, mime, size, relative_path, kind, width, height)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        path.basename(fixedOriginalName),
        req.file.mimetype,
        req.file.size,
        relativePath,
        kind,
        null,
        null
      ]
    );

    const row = await queryOne('SELECT * FROM asset WHERE id = ?', [result.insertId]);
    res.json({
      ok: true,
      data: mapAsset(req, row)
    });
  })
);

router.use('/admin', requireAdmin);

router.post(
  '/admin/logout',
  asyncHandler(async (req, res) => {
    await new Promise((resolve, reject) => {
      req.session.destroy((err) => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });

    res.clearCookie(config.sessionName);
    res.json({ ok: true });
  })
);

router.get(
  '/admin/me',
  asyncHandler(async (req, res) => {
    const user = await queryOne(
      'SELECT id, username, is_active, last_login_at, created_at, updated_at FROM admin_user WHERE id = ?',
      [req.session.adminId]
    );

    if (!user || user.is_active !== 1) {
      req.session.destroy(() => {});
      throw new ApiError(401, 'Unauthorized');
    }

    res.json({
      ok: true,
      data: user
    });
  })
);

router.get(
  '/admin/modules',
  [query('page').optional().isInt({ min: 1 }), query('pageSize').optional().isInt({ min: 1, max: 200 })],
  validateRequest,
  asyncHandler(async (req, res) => {
    const { page, pageSize, offset } = getPagination(req.query, { maxPageSize: 200 });
    const totalRow = await queryOne('SELECT COUNT(*) as total FROM module');
    const rows = await queryRows(
      'SELECT * FROM module ORDER BY sort_order ASC, id ASC LIMIT ? OFFSET ?',
      [pageSize, offset]
    );

    res.json({
      ok: true,
      data: {
        items: rows.map(mapModule),
        total: totalRow ? Number(totalRow.total) : 0,
        page,
        pageSize
      }
    });
  })
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
  asyncHandler(async (req, res) => {
    const configJson = ensureJsonObjectOrArray(req.body.config_json, 'config_json');
    const payload = {
      name: req.body.name.trim(),
      slug: req.body.slug.trim(),
      type: req.body.type,
      enabled: toTinyInt(req.body.enabled, 1),
      nav_visible: toTinyInt(req.body.nav_visible, 1),
      sort_order: toInt(req.body.sort_order, 100),
      config_json: configJson ? JSON.stringify(configJson) : null
    };

    const result = await execute(
      `INSERT INTO module (name, slug, type, enabled, nav_visible, sort_order, config_json)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        payload.name,
        payload.slug,
        payload.type,
        payload.enabled,
        payload.nav_visible,
        payload.sort_order,
        payload.config_json
      ]
    );

    const row = await queryOne('SELECT * FROM module WHERE id = ?', [result.insertId]);
    res.json({
      ok: true,
      data: mapModule(row)
    });
  })
);

router.get(
  '/admin/modules/:id',
  [param('id').isInt({ min: 1 })],
  validateRequest,
  asyncHandler(async (req, res) => {
    const row = await queryOne('SELECT * FROM module WHERE id = ?', [req.params.id]);
    if (!row) {
      throw new ApiError(404, 'Module not found');
    }
    res.json({
      ok: true,
      data: mapModule(row)
    });
  })
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
  asyncHandler(async (req, res) => {
    const configJson = ensureJsonObjectOrArray(req.body.config_json, 'config_json');
    const payload = {
      name: req.body.name.trim(),
      slug: req.body.slug.trim(),
      type: req.body.type,
      enabled: toTinyInt(req.body.enabled, 1),
      nav_visible: toTinyInt(req.body.nav_visible, 1),
      sort_order: toInt(req.body.sort_order, 100),
      config_json: configJson ? JSON.stringify(configJson) : null
    };

    const result = await execute(
      `UPDATE module
       SET name = ?, slug = ?, type = ?, enabled = ?, nav_visible = ?, sort_order = ?, config_json = ?
       WHERE id = ?`,
      [
        payload.name,
        payload.slug,
        payload.type,
        payload.enabled,
        payload.nav_visible,
        payload.sort_order,
        payload.config_json,
        req.params.id
      ]
    );

    if (result.affectedRows === 0) {
      throw new ApiError(404, 'Module not found');
    }

    const row = await queryOne('SELECT * FROM module WHERE id = ?', [req.params.id]);
    res.json({
      ok: true,
      data: mapModule(row)
    });
  })
);

router.delete(
  '/admin/modules/:id',
  [param('id').isInt({ min: 1 })],
  validateRequest,
  asyncHandler(async (req, res) => {
    const result = await execute('DELETE FROM module WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      throw new ApiError(404, 'Module not found');
    }
    res.json({ ok: true });
  })
);

router.get(
  '/admin/members',
  [query('page').optional().isInt({ min: 1 }), query('pageSize').optional().isInt({ min: 1, max: 200 })],
  validateRequest,
  asyncHandler(async (req, res) => {
    const { page, pageSize, offset } = getPagination(req.query, { maxPageSize: 200 });
    const totalRow = await queryOne('SELECT COUNT(*) as total FROM member');
    const rows = await queryRows(
      `SELECT m.*, a.relative_path AS image_relative_path, a.mime AS image_mime, a.original_name AS image_original_name
       FROM member m
       LEFT JOIN asset a ON m.image_asset_id = a.id
       ORDER BY m.sort_order ASC, m.id ASC
       LIMIT ? OFFSET ?`,
      [pageSize, offset]
    );

    res.json({
      ok: true,
      data: {
        items: rows.map((r) => mapMember(req, r)),
        total: totalRow ? Number(totalRow.total) : 0,
        page,
        pageSize
      }
    });
  })
);

router.post(
  '/admin/members',
  memberValidators,
  validateRequest,
  asyncHandler(async (req, res) => {
    const payload = {
      name: req.body.name.trim(),
      position: normalizeOptionalText(req.body.position),
      research_interests: normalizeOptionalText(req.body.research_interests),
      hobbies: normalizeOptionalText(req.body.hobbies),
      email: normalizeOptionalText(req.body.email),
      image_asset_id: req.body.image_asset_id ? Number(req.body.image_asset_id) : null,
      sort_order: toInt(req.body.sort_order, 0),
      enabled: toTinyInt(req.body.enabled, 1)
    };

    const result = await execute(
      `INSERT INTO member (name, position, research_interests, hobbies, email, image_asset_id, sort_order, enabled)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        payload.name,
        payload.position,
        payload.research_interests,
        payload.hobbies,
        payload.email,
        payload.image_asset_id,
        payload.sort_order,
        payload.enabled
      ]
    );

    const row = await queryOne(
      `SELECT m.*, a.relative_path AS image_relative_path, a.mime AS image_mime, a.original_name AS image_original_name
       FROM member m
       LEFT JOIN asset a ON m.image_asset_id = a.id
       WHERE m.id = ?`,
      [result.insertId]
    );

    res.json({
      ok: true,
      data: mapMember(req, row)
    });
  })
);

router.put(
  '/admin/members/:id',
  [param('id').isInt({ min: 1 }), ...memberValidators],
  validateRequest,
  asyncHandler(async (req, res) => {
    const payload = {
      name: req.body.name.trim(),
      position: normalizeOptionalText(req.body.position),
      research_interests: normalizeOptionalText(req.body.research_interests),
      hobbies: normalizeOptionalText(req.body.hobbies),
      email: normalizeOptionalText(req.body.email),
      image_asset_id: req.body.image_asset_id ? Number(req.body.image_asset_id) : null,
      sort_order: toInt(req.body.sort_order, 0),
      enabled: toTinyInt(req.body.enabled, 1)
    };

    const result = await execute(
      `UPDATE member
       SET name = ?, position = ?, research_interests = ?, hobbies = ?, email = ?, image_asset_id = ?, sort_order = ?, enabled = ?
       WHERE id = ?`,
      [
        payload.name,
        payload.position,
        payload.research_interests,
        payload.hobbies,
        payload.email,
        payload.image_asset_id,
        payload.sort_order,
        payload.enabled,
        req.params.id
      ]
    );

    if (result.affectedRows === 0) {
      throw new ApiError(404, 'Member not found');
    }

    const row = await queryOne(
      `SELECT m.*, a.relative_path AS image_relative_path, a.mime AS image_mime, a.original_name AS image_original_name
       FROM member m
       LEFT JOIN asset a ON m.image_asset_id = a.id
       WHERE m.id = ?`,
      [req.params.id]
    );

    res.json({
      ok: true,
      data: mapMember(req, row)
    });
  })
);

router.delete(
  '/admin/members/:id',
  [param('id').isInt({ min: 1 })],
  validateRequest,
  asyncHandler(async (req, res) => {
    const result = await execute('DELETE FROM member WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      throw new ApiError(404, 'Member not found');
    }
    res.json({ ok: true });
  })
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
  asyncHandler(async (req, res) => {
    const { page, pageSize, offset } = getPagination(req.query);
    const conditions = [];
    const params = [];

    let joinModule = false;

    if (req.query.moduleId) {
      conditions.push('c.module_id = ?');
      params.push(Number(req.query.moduleId));
    }

    if (req.query.moduleSlug) {
      joinModule = true;
      conditions.push('m.slug = ?');
      params.push(req.query.moduleSlug);
    } else {
      joinModule = true;
    }

    if (req.query.status) {
      conditions.push('c.status = ?');
      params.push(req.query.status);
    }

    if (req.query.year) {
      conditions.push('c.year = ?');
      params.push(Number(req.query.year));
    }

    if (req.query.keyword) {
      conditions.push('(c.title LIKE ? OR c.summary LIKE ?)');
      const like = `%${req.query.keyword}%`;
      params.push(like, like);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const fromClause = joinModule
      ? 'FROM content c JOIN module m ON c.module_id = m.id'
      : 'FROM content c';

    const totalRow = await queryOne(
      `SELECT COUNT(*) as total ${fromClause} ${whereClause}`,
      params
    );

    const rows = await queryRows(
      `SELECT c.*, m.slug AS module_slug, m.name AS module_name ${fromClause} ${whereClause}
       ORDER BY c.updated_at DESC, c.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, pageSize, offset]
    );

    res.json({
      ok: true,
      data: {
        items: rows.map(mapContent),
        total: totalRow ? Number(totalRow.total) : 0,
        page,
        pageSize
      }
    });
  })
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
  asyncHandler(async (req, res) => {
    const contentFormat = req.body.content_format;
    const status = req.body.status || 'draft';

    let contentMd = null;
    let contentHtml = null;

    if (contentFormat === 'markdown') {
      if (!req.body.content_md) {
        throw new ApiError(400, 'content_md is required for markdown');
      }
      contentMd = req.body.content_md;
    }

    if (contentFormat === 'richtext') {
      if (!req.body.content_html) {
        throw new ApiError(400, 'content_html is required for richtext');
      }
      contentHtml = sanitizeRichText(req.body.content_html);
    }

    const tagsJson = ensureJsonObjectOrArray(req.body.tags_json, 'tags_json');
    const authorsJson = ensureJsonObjectOrArray(req.body.authors_json, 'authors_json');
    const metaJson = ensureJsonObjectOrArray(req.body.meta_json, 'meta_json');
    const publishedAt =
      parseDateTime(req.body.published_at, 'published_at') ||
      (status === 'published' ? new Date() : null);

    const result = await execute(
      `INSERT INTO content (
        module_id, title, slug, status, content_format, content_md, content_html,
        summary, cover_asset_id, year, tags_json, authors_json, meta_json, published_at
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.body.module_id,
        req.body.title.trim(),
        req.body.slug.trim(),
        status,
        contentFormat,
        contentMd,
        contentHtml,
        req.body.summary || null,
        req.body.cover_asset_id || null,
        req.body.year || null,
        tagsJson ? JSON.stringify(tagsJson) : null,
        authorsJson ? JSON.stringify(authorsJson) : null,
        metaJson ? JSON.stringify(metaJson) : null,
        publishedAt
      ]
    );

    const row = await queryOne(
      `SELECT c.*, m.slug AS module_slug, m.name AS module_name
       FROM content c
       JOIN module m ON c.module_id = m.id
       WHERE c.id = ?`,
      [result.insertId]
    );

    res.json({
      ok: true,
      data: mapContent(row)
    });
  })
);

router.get(
  '/admin/contents/:id',
  [param('id').isInt({ min: 1 })],
  validateRequest,
  asyncHandler(async (req, res) => {
    const row = await queryOne(
      `SELECT c.*, m.slug AS module_slug, m.name AS module_name
       FROM content c
       JOIN module m ON c.module_id = m.id
       WHERE c.id = ?`,
      [req.params.id]
    );
    if (!row) {
      throw new ApiError(404, 'Content not found');
    }
    res.json({
      ok: true,
      data: mapContent(row)
    });
  })
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
  asyncHandler(async (req, res) => {
    const contentFormat = req.body.content_format;
    const status = req.body.status || 'draft';

    let contentMd = null;
    let contentHtml = null;

    if (contentFormat === 'markdown') {
      if (!req.body.content_md) {
        throw new ApiError(400, 'content_md is required for markdown');
      }
      contentMd = req.body.content_md;
    }

    if (contentFormat === 'richtext') {
      if (!req.body.content_html) {
        throw new ApiError(400, 'content_html is required for richtext');
      }
      contentHtml = sanitizeRichText(req.body.content_html);
    }

    const tagsJson = ensureJsonObjectOrArray(req.body.tags_json, 'tags_json');
    const authorsJson = ensureJsonObjectOrArray(req.body.authors_json, 'authors_json');
    const metaJson = ensureJsonObjectOrArray(req.body.meta_json, 'meta_json');
    const publishedAt =
      parseDateTime(req.body.published_at, 'published_at') ||
      (status === 'published' ? new Date() : null);

    const result = await execute(
      `UPDATE content SET
        module_id = ?, title = ?, slug = ?, status = ?, content_format = ?, content_md = ?, content_html = ?,
        summary = ?, cover_asset_id = ?, year = ?, tags_json = ?, authors_json = ?, meta_json = ?, published_at = ?
       WHERE id = ?`,
      [
        req.body.module_id,
        req.body.title.trim(),
        req.body.slug.trim(),
        status,
        contentFormat,
        contentMd,
        contentHtml,
        req.body.summary || null,
        req.body.cover_asset_id || null,
        req.body.year || null,
        tagsJson ? JSON.stringify(tagsJson) : null,
        authorsJson ? JSON.stringify(authorsJson) : null,
        metaJson ? JSON.stringify(metaJson) : null,
        publishedAt,
        req.params.id
      ]
    );

    if (result.affectedRows === 0) {
      throw new ApiError(404, 'Content not found');
    }

    const row = await queryOne(
      `SELECT c.*, m.slug AS module_slug, m.name AS module_name
       FROM content c
       JOIN module m ON c.module_id = m.id
       WHERE c.id = ?`,
      [req.params.id]
    );

    res.json({
      ok: true,
      data: mapContent(row)
    });
  })
);

router.delete(
  '/admin/contents/:id',
  [param('id').isInt({ min: 1 })],
  validateRequest,
  asyncHandler(async (req, res) => {
    const result = await execute('DELETE FROM content WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      throw new ApiError(404, 'Content not found');
    }
    res.json({ ok: true });
  })
);

// ====== CHANGED: assets 列表返回 mapAsset(req, row) ======
router.get(
  '/admin/assets',
  [query('page').optional().isInt({ min: 1 }), query('pageSize').optional().isInt({ min: 1, max: 100 })],
  validateRequest,
  asyncHandler(async (req, res) => {
    const { page, pageSize, offset } = getPagination(req.query);
    const totalRow = await queryOne('SELECT COUNT(*) as total FROM asset');
    const rows = await queryRows(
      'SELECT * FROM asset ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [pageSize, offset]
    );

    res.json({
      ok: true,
      data: {
        items: rows.map((r) => mapAsset(req, r)),
        total: totalRow ? Number(totalRow.total) : 0,
        page,
        pageSize
      }
    });
  })
);

router.delete(
  '/admin/assets/:id',
  [param('id').isInt({ min: 1 }), query('removeFile').optional().isString()],
  validateRequest,
  asyncHandler(async (req, res) => {
    const asset = await queryOne('SELECT * FROM asset WHERE id = ?', [req.params.id]);
    if (!asset) {
      throw new ApiError(404, 'Asset not found');
    }

    const removeFile = ['1', 'true', 'yes'].includes(
      String(req.query.removeFile || '').trim().toLowerCase()
    );

    await execute('DELETE FROM asset WHERE id = ?', [req.params.id]);

    if (removeFile) {
      const safePath = getSafeStoragePath(asset.relative_path);
      if (safePath) {
        try {
          fs.unlinkSync(safePath);
        } catch {
          // ignore missing file
        }
      }
    }

    res.json({ ok: true });
  })
);

router.get(
  '/admin/settings/site',
  asyncHandler(async (_req, res) => {
    const row = await queryOne('SELECT value_json FROM settings WHERE `key` = ?', ['site']);
    const value = row ? safeJsonParse(row.value_json, {}) : {};
    res.json({
      ok: true,
      data: {
        key: 'site',
        value
      }
    });
  })
);

router.put(
  '/admin/settings/site',
  [body('value').optional(), body('value_json').optional()],
  validateRequest,
  asyncHandler(async (req, res) => {
    const rawValue = req.body.value ?? req.body.value_json;
    if (rawValue === undefined) {
      throw new ApiError(400, 'value is required');
    }

    const value = ensureJsonObject(rawValue, 'value');
    const jsonValue = toJsonString(value);

    await execute(
      `INSERT INTO settings (\`key\`, value_json)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE value_json = VALUES(value_json)`,
      ['site', jsonValue]
    );

    res.json({
      ok: true,
      data: {
        key: 'site',
        value
      }
    });
  })
);

export default router;
