import { Router } from 'express';
import { param, query } from 'express-validator';
import { queryOne, queryRows } from '../db.js';
import { asyncHandler } from '../utils/async-handler.js';
import { safeJsonParse } from '../utils/json.js';
import { getPagination } from '../utils/pagination.js';
import { validateRequest } from '../middleware/validate.js';

const router = Router();

const toAbsoluteUrl = (req, urlPath) => {
  if (!urlPath) return urlPath;

  const proto = (req.headers['x-forwarded-proto'] || req.protocol || 'http')
    .split(',')[0]
    .trim();
  const host = (req.headers['x-forwarded-host'] || req.headers.host || '')
    .split(',')[0]
    .trim();

  if (!host) return urlPath;
  return `${proto}://${host}${urlPath.startsWith('/') ? '' : '/'}${urlPath}`;
};


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
          // 返回绝对 URL，避免线上反代/子路径导致图片加载失败
          url: toAbsoluteUrl(req, `/static/${row.image_relative_path}`),
          mime: row.image_mime || null,
          original_name: row.image_original_name || null
        }
      : null
});


router.get(
  '/settings/site',
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

router.get(
  '/members',
  asyncHandler(async (req, res) => {
    const rows = await queryRows(
      `SELECT m.*, a.relative_path AS image_relative_path, a.mime AS image_mime, a.original_name AS image_original_name
       FROM member m
       LEFT JOIN asset a ON m.image_asset_id = a.id
       WHERE m.enabled = 1
       ORDER BY m.sort_order ASC, m.id ASC`
    );

    res.json({
      ok: true,
      data: rows.map((row) => mapMember(req, row))
    });
  })
);


router.get(
  '/modules',
  [query('nav').optional().isIn(['1'])],
  validateRequest,
  asyncHandler(async (_req, res) => {
    const navOnly = String(_req.query.nav || '') === '1';
    const whereClause = navOnly ? 'enabled = 1 AND nav_visible = 1' : 'enabled = 1';
    const rows = await queryRows(
      `SELECT * FROM module WHERE ${whereClause} ORDER BY sort_order ASC, id ASC`
    );
    res.json({
      ok: true,
      data: rows.map(mapModule)
    });
  })
);

router.get(
  '/modules/:slug',
  [param('slug').isString().trim().notEmpty()],
  validateRequest,
  asyncHandler(async (req, res) => {
    const row = await queryOne(
      'SELECT * FROM module WHERE slug = ? AND enabled = 1 LIMIT 1',
      [req.params.slug]
    );

    if (!row) {
      res.status(404).json({
        ok: false,
        error: { message: 'Module not found' }
      });
      return;
    }

    res.json({
      ok: true,
      data: mapModule(row)
    });
  })
);

router.get(
  '/contents',
  [
    query('moduleSlug').optional().isString().trim().notEmpty(),
    query('year').optional().isInt({ min: 0 }),
    query('keyword').optional().isString().trim(),
    query('page').optional().isInt({ min: 1 }),
    query('pageSize').optional().isInt({ min: 1, max: 100 })
  ],
  validateRequest,
  asyncHandler(async (req, res) => {
    const { page, pageSize, offset } = getPagination(req.query);
    const conditions = ['c.status = ?', 'm.enabled = 1'];
    const params = ['published'];
    const joinModule = true;

    if (req.query.moduleSlug) {
      conditions.push('m.slug = ?');
      params.push(req.query.moduleSlug);
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

    const countRow = await queryOne(
      `SELECT COUNT(*) as total ${fromClause} ${whereClause}`,
      params
    );

    const rows = await queryRows(
      `SELECT c.*, m.slug AS module_slug, m.name AS module_name ${fromClause} ${whereClause}
       ORDER BY c.published_at DESC, c.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, pageSize, offset]
    );

    res.json({
      ok: true,
      data: {
        items: rows.map(mapContent),
        total: countRow ? Number(countRow.total) : 0,
        page,
        pageSize
      }
    });
  })
);

router.get(
  '/contents/:id',
  [param('id').isInt({ min: 1 })],
  validateRequest,
  asyncHandler(async (req, res) => {
    const row = await queryOne(
      `SELECT c.*, m.slug AS module_slug, m.name AS module_name
       FROM content c
       JOIN module m ON c.module_id = m.id
       WHERE c.id = ? AND c.status = 'published' AND m.enabled = 1
       LIMIT 1`,
      [req.params.id]
    );

    if (!row) {
      res.status(404).json({
        ok: false,
        error: { message: 'Content not found' }
      });
      return;
    }

    res.json({
      ok: true,
      data: mapContent(row)
    });
  })
);

router.get(
  '/pages/:moduleSlug/:pageSlug',
  [param('moduleSlug').isString().trim().notEmpty(), param('pageSlug').isString().trim().notEmpty()],
  validateRequest,
  asyncHandler(async (req, res) => {
    const row = await queryOne(
      `SELECT c.*, m.slug AS module_slug, m.name AS module_name
       FROM content c
       JOIN module m ON c.module_id = m.id
       WHERE m.slug = ? AND c.slug = ? AND c.status = 'published' AND m.enabled = 1
       LIMIT 1`,
      [req.params.moduleSlug, req.params.pageSlug]
    );

    if (!row) {
      res.status(404).json({
        ok: false,
        error: { message: 'Content not found' }
      });
      return;
    }

    res.json({
      ok: true,
      data: mapContent(row)
    });
  })
);

export default router;
