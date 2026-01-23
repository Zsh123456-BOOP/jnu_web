import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { Op } from 'sequelize';
import {
  AdminUser,
  Asset,
  Content,
  Member,
  MemberPiInfo,
  Module,
  Settings
} from '../models/index.js';
import { config } from '../config.js';
import { ApiError } from '../middleware/error.js';
import { safeJsonParse, parseJsonInput } from '../utils/json.js';
import { getPagination } from '../utils/pagination.js';
import { toInt, toTinyInt } from '../utils/parse.js';
import { sanitizeRichText } from '../utils/sanitize.js';
import { toAbsoluteUrl } from '../utils/url.js';
import { getSafeStoragePath } from '../utils/upload.js';
import {
  getSiteSettings as getSiteSettingsService,
  updateSiteSettings as updateSiteSettingsService,
  getSiteMetaSettings,
  updateSiteMetaSettings,
  getHomeTextSettings,
  updateHomeTextSettings
} from '../services/site-settings.js';

const toPlain = (row) => (row && typeof row.toJSON === 'function' ? row.toJSON() : row);

const mapModule = (row) => {
  const data = toPlain(row);
  return {
    ...data,
    config_json: safeJsonParse(data.config_json, {})
  };
};

const mapContent = (row) => {
  const data = toPlain(row);
  const { Module: moduleRow, ...rest } = data;
  return {
    ...rest,
    tags_json: safeJsonParse(rest.tags_json, []),
    authors_json: safeJsonParse(rest.authors_json, []),
    meta_json: safeJsonParse(rest.meta_json, {}),
    module_slug: moduleRow?.slug ?? rest.module_slug,
    module_name: moduleRow?.name ?? rest.module_name
  };
};

const mapAsset = (req, row) => {
  const data = toPlain(row);
  return {
    ...data,
    url: toAbsoluteUrl(req, `/static/${data.relative_path}`)
  };
};

const mapMember = (req, row) => {
  const data = toPlain(row);
  const image = data.image || null;
  return {
    id: data.id,
    name: data.name,
    name: data.name,
    position: data.position,
    type: data.type,
    is_pi: data.is_pi,
    research_interests: data.research_interests,
    hobbies: data.hobbies,
    email: data.email,
    image_asset_id: data.image_asset_id,
    sort_order: data.sort_order,
    enabled: data.enabled,
    created_at: data.created_at,
    updated_at: data.updated_at,
    image:
      image && image.relative_path
        ? {
          id: image.id,
          url: toAbsoluteUrl(req, `/static/${image.relative_path}`),
          mime: image.mime || null,
          original_name: image.original_name || null
        }
        : null
  };
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

export async function uploadAsset(req, res) {
  if (!req.file || !req.uploadMeta) {
    throw new ApiError(400, 'File is required');
  }

  const { year, month, filename, fixedOriginalName } = req.uploadMeta;
  const relativePath = path.posix.join('uploads', year, month, filename);
  const kind = req.file.mimetype && req.file.mimetype.startsWith('image/') ? 'image' : 'file';

  const originalName = path.basename(fixedOriginalName || req.file.originalname);

  const asset = await Asset.create({
    original_name: originalName,
    mime: req.file.mimetype,
    size: req.file.size,
    relative_path: relativePath,
    kind,
    width: null,
    height: null
  });
  await asset.reload();

  res.json({
    ok: true,
    data: mapAsset(req, asset)
  });
}

export async function login(req, res) {
  const username = req.body.username.trim();
  const password = req.body.password;

  const user = await AdminUser.findOne({
    where: { username },
    attributes: ['id', 'username', 'password_hash', 'is_active']
  });

  if (!user || user.is_active !== 1) {
    throw new ApiError(401, 'Unauthorized');
  }

  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    throw new ApiError(401, 'Unauthorized');
  }

  await regenerateSession(req);
  req.session.adminId = user.id;
  req.session.username = user.username;
  await saveSession(req);

  await AdminUser.update({ last_login_at: new Date() }, { where: { id: user.id } });

  const payload = await AdminUser.findByPk(user.id, {
    attributes: ['id', 'username', 'is_active', 'last_login_at', 'created_at', 'updated_at']
  });

  res.json({
    ok: true,
    data: payload
  });
}

export async function logout(req, res) {
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
}

export async function getMe(req, res) {
  const user = await AdminUser.findByPk(req.session.adminId, {
    attributes: ['id', 'username', 'is_active', 'last_login_at', 'created_at', 'updated_at']
  });

  if (!user || user.is_active !== 1) {
    req.session.destroy(() => { });
    throw new ApiError(401, 'Unauthorized');
  }

  res.json({
    ok: true,
    data: user
  });
}

export async function listModules(req, res) {
  const { page, pageSize, offset } = getPagination(req.query, { maxPageSize: 200 });
  const total = await Module.count();
  const rows = await Module.findAll({
    order: [
      ['sort_order', 'ASC'],
      ['id', 'ASC']
    ],
    limit: pageSize,
    offset
  });

  res.json({
    ok: true,
    data: {
      items: rows.map(mapModule),
      total,
      page,
      pageSize
    }
  });
}

export async function createModule(req, res) {
  const configJson = ensureJsonObjectOrArray(req.body.config_json, 'config_json');
  const payload = {
    name: req.body.name.trim(),
    slug: req.body.slug.trim(),
    type: req.body.type,
    enabled: toTinyInt(req.body.enabled, 1),
    nav_visible: toTinyInt(req.body.nav_visible, 1),
    sort_order: toInt(req.body.sort_order, 100),
    config_json: configJson
  };

  const row = await Module.create(payload);
  await row.reload();
  res.json({
    ok: true,
    data: mapModule(row)
  });
}

export async function getModule(req, res) {
  const row = await Module.findByPk(req.params.id);
  if (!row) {
    throw new ApiError(404, 'Module not found');
  }
  res.json({
    ok: true,
    data: mapModule(row)
  });
}

export async function updateModule(req, res) {
  const configJson = ensureJsonObjectOrArray(req.body.config_json, 'config_json');
  const payload = {
    name: req.body.name.trim(),
    slug: req.body.slug.trim(),
    type: req.body.type,
    enabled: toTinyInt(req.body.enabled, 1),
    nav_visible: toTinyInt(req.body.nav_visible, 1),
    sort_order: toInt(req.body.sort_order, 100),
    config_json: configJson
  };

  const [affected] = await Module.update(payload, { where: { id: req.params.id } });
  if (!affected) {
    throw new ApiError(404, 'Module not found');
  }

  const row = await Module.findByPk(req.params.id);
  res.json({
    ok: true,
    data: mapModule(row)
  });
}

export async function deleteModule(req, res) {
  const affected = await Module.destroy({ where: { id: req.params.id } });
  if (!affected) {
    throw new ApiError(404, 'Module not found');
  }
  res.json({ ok: true });
}

export async function listMembers(req, res) {
  const { page, pageSize, offset } = getPagination(req.query, { maxPageSize: 200 });
  const where = {};
  if (req.query.is_pi !== undefined) {
    where.is_pi = toTinyInt(req.query.is_pi, 0);
  }
  const total = await Member.count({ where });
  const rows = await Member.findAll({
    where,
    include: [
      {
        model: Asset,
        as: 'image',
        attributes: ['id', 'relative_path', 'mime', 'original_name']
      }
    ],
    order: [
      ['sort_order', 'ASC'],
      ['id', 'ASC']
    ],
    limit: pageSize,
    offset
  });

  res.json({
    ok: true,
    data: {
      items: rows.map((row) => mapMember(req, row)),
      total,
      page,
      pageSize
    }
  });
}

export async function createMember(req, res) {
  const payload = {
    name: req.body.name.trim(),
    name: req.body.name.trim(),
    position: normalizeOptionalText(req.body.position),
    type: req.body.type || 'student',
    is_pi: toTinyInt(req.body.is_pi, 0),
    research_interests: normalizeOptionalText(req.body.research_interests),
    hobbies: normalizeOptionalText(req.body.hobbies),
    email: normalizeOptionalText(req.body.email),
    image_asset_id: req.body.image_asset_id ? Number(req.body.image_asset_id) : null,
    sort_order: toInt(req.body.sort_order, 0),
    enabled: toTinyInt(req.body.enabled, 1)
  };

  const created = await Member.create(payload);
  const row = await Member.findByPk(created.id, {
    include: [
      {
        model: Asset,
        as: 'image',
        attributes: ['id', 'relative_path', 'mime', 'original_name']
      }
    ]
  });

  res.json({
    ok: true,
    data: mapMember(req, row)
  });
}

export async function updateMember(req, res) {
  const payload = {
    name: req.body.name.trim(),
    name: req.body.name.trim(),
    position: normalizeOptionalText(req.body.position),
    type: req.body.type || 'student',
    is_pi: toTinyInt(req.body.is_pi, 0),
    research_interests: normalizeOptionalText(req.body.research_interests),
    hobbies: normalizeOptionalText(req.body.hobbies),
    email: normalizeOptionalText(req.body.email),
    image_asset_id: req.body.image_asset_id ? Number(req.body.image_asset_id) : null,
    sort_order: toInt(req.body.sort_order, 0),
    enabled: toTinyInt(req.body.enabled, 1)
  };

  const [affected] = await Member.update(payload, { where: { id: req.params.id } });
  if (!affected) {
    throw new ApiError(404, 'Member not found');
  }

  const row = await Member.findByPk(req.params.id, {
    include: [
      {
        model: Asset,
        as: 'image',
        attributes: ['id', 'relative_path', 'mime', 'original_name']
      }
    ]
  });

  res.json({
    ok: true,
    data: mapMember(req, row)
  });
}

export async function deleteMember(req, res) {
  const affected = await Member.destroy({ where: { id: req.params.id } });
  if (!affected) {
    throw new ApiError(404, 'Member not found');
  }
  res.json({ ok: true });
}

export async function listContents(req, res) {
  const { page, pageSize, offset } = getPagination(req.query);
  const where = {};
  const moduleInclude = {
    model: Module,
    attributes: ['slug', 'name'],
    required: true
  };

  if (req.query.moduleId) {
    where.module_id = Number(req.query.moduleId);
  }

  if (req.query.moduleSlug) {
    moduleInclude.where = { slug: req.query.moduleSlug };
  }

  if (req.query.status) {
    where.status = req.query.status;
  }

  if (req.query.year) {
    where.year = Number(req.query.year);
  }

  if (req.query.keyword) {
    const like = `%${req.query.keyword}%`;
    where[Op.or] = [{ title: { [Op.like]: like } }, { summary: { [Op.like]: like } }];
  }

  const total = await Content.count({
    where,
    include: [moduleInclude],
    distinct: true
  });

  const rows = await Content.findAll({
    where,
    include: [moduleInclude],
    order: [
      ['updated_at', 'DESC'],
      ['created_at', 'DESC']
    ],
    limit: pageSize,
    offset
  });

  res.json({
    ok: true,
    data: {
      items: rows.map(mapContent),
      total,
      page,
      pageSize
    }
  });
}

export async function createContent(req, res) {
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

  const created = await Content.create({
    module_id: req.body.module_id,
    title: req.body.title.trim(),
    slug: req.body.slug.trim(),
    status,
    content_format: contentFormat,
    content_md: contentMd,
    content_html: contentHtml,
    summary: req.body.summary || null,
    cover_asset_id: req.body.cover_asset_id || null,
    year: req.body.year || null,
    tags_json: tagsJson,
    authors_json: authorsJson,
    meta_json: metaJson,
    published_at: publishedAt
  });

  const row = await Content.findByPk(created.id, {
    include: [{ model: Module, attributes: ['slug', 'name'], required: true }]
  });

  res.json({
    ok: true,
    data: mapContent(row)
  });
}

export async function getContent(req, res) {
  const row = await Content.findOne({
    where: { id: req.params.id },
    include: [{ model: Module, attributes: ['slug', 'name'], required: true }]
  });
  if (!row) {
    throw new ApiError(404, 'Content not found');
  }
  res.json({
    ok: true,
    data: mapContent(row)
  });
}

export async function updateContent(req, res) {
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

  const [affected] = await Content.update(
    {
      module_id: req.body.module_id,
      title: req.body.title.trim(),
      slug: req.body.slug.trim(),
      status,
      content_format: contentFormat,
      content_md: contentMd,
      content_html: contentHtml,
      summary: req.body.summary || null,
      cover_asset_id: req.body.cover_asset_id || null,
      year: req.body.year || null,
      tags_json: tagsJson,
      authors_json: authorsJson,
      meta_json: metaJson,
      published_at: publishedAt
    },
    { where: { id: req.params.id } }
  );

  if (!affected) {
    throw new ApiError(404, 'Content not found');
  }

  const row = await Content.findByPk(req.params.id, {
    include: [{ model: Module, attributes: ['slug', 'name'], required: true }]
  });

  res.json({
    ok: true,
    data: mapContent(row)
  });
}

export async function deleteContent(req, res) {
  const affected = await Content.destroy({ where: { id: req.params.id } });
  if (!affected) {
    throw new ApiError(404, 'Content not found');
  }
  res.json({ ok: true });
}

export async function listAssets(req, res) {
  const { page, pageSize, offset } = getPagination(req.query);
  const total = await Asset.count();
  const rows = await Asset.findAll({
    order: [['created_at', 'DESC']],
    limit: pageSize,
    offset
  });

  res.json({
    ok: true,
    data: {
      items: rows.map((row) => mapAsset(req, row)),
      total,
      page,
      pageSize
    }
  });
}

export async function deleteAsset(req, res) {
  const asset = await Asset.findByPk(req.params.id);
  if (!asset) {
    throw new ApiError(404, 'Asset not found');
  }

  const removeFile = ['1', 'true', 'yes'].includes(
    String(req.query.removeFile || '').trim().toLowerCase()
  );

  await Asset.destroy({ where: { id: req.params.id } });

  if (removeFile) {
    const safePath = getSafeStoragePath(asset.relative_path);
    if (safePath) {
      try {
        await fs.promises.unlink(safePath);
      } catch {
        // ignore missing file
      }
    }
  }

  res.json({ ok: true });
}

export async function getSiteSettings(_req, res) {
  const row = await Settings.findByPk('site');
  const value = row ? safeJsonParse(row.value_json, {}) : {};
  res.json({
    ok: true,
    data: {
      key: 'site',
      value
    }
  });
}

export async function updateSiteSettings(req, res) {
  const rawValue = req.body.value ?? req.body.value_json;
  if (rawValue === undefined) {
    throw new ApiError(400, 'value is required');
  }

  const value = ensureJsonObject(rawValue, 'value');

  await Settings.upsert({
    key: 'site',
    value_json: value
  });

  res.json({
    ok: true,
    data: {
      key: 'site',
      value
    }
  });
}

export async function getAdminSiteSettings(_req, res) {
  const [footerSettings, metaSettings, homeTextSettings] = await Promise.all([
    getSiteSettingsService(),
    getSiteMetaSettings(),
    getHomeTextSettings()
  ]);
  const data = {
    ...metaSettings,
    ...footerSettings,
    home_text: homeTextSettings
  };
  res.json({
    ok: true,
    data
  });
}

export async function updateAdminSiteSettings(req, res) {
  const normalizeText = (value) => {
    if (value === undefined || value === null) {
      return undefined;
    }
    return String(value).trim();
  };

  const footerPatch = {};
  if (req.body.footer) {
    const footer = req.body.footer;
    footerPatch.footer = {
      contact: {
        address: footer?.contact?.address?.trim?.() || footer?.contact?.address || '',
        email: footer?.contact?.email?.trim?.() || footer?.contact?.email || ''
      },
      links: Array.isArray(footer?.links) ? footer.links : undefined
    };
  }

  const metaPatch = {};
  if (req.body.site_title !== undefined) {
    metaPatch.site_title = String(req.body.site_title);
  }
  if (req.body.favicon_url !== undefined) {
    metaPatch.favicon_url = String(req.body.favicon_url);
  }

  const homeTextPatch = {};
  if (req.body.home_text && typeof req.body.home_text === 'object') {
    const homeText = req.body.home_text;
    const mapping = [
      'badge_text',
      'hero_title_prefix',
      'hero_title_highlight',
      'hero_title_suffix',
      'hero_subtitle',
      'hero_primary_label',
      'hero_secondary_label',
      'hero_image_alt',
      'latest_title',
      'latest_loading',
      'latest_error',
      'latest_empty',
      'sidebar_title',
      'card_title_fallback'
    ];

    mapping.forEach((key) => {
      const nextValue = normalizeText(homeText[key]);
      if (nextValue !== undefined) {
        homeTextPatch[key] = nextValue;
      }
    });
  }

  const [footerSettings, metaSettings, homeTextSettings] = await Promise.all([
    Object.keys(footerPatch).length
      ? updateSiteSettingsService(footerPatch)
      : getSiteSettingsService(),
    Object.keys(metaPatch).length ? updateSiteMetaSettings(metaPatch) : getSiteMetaSettings(),
    Object.keys(homeTextPatch).length ? updateHomeTextSettings(homeTextPatch) : getHomeTextSettings()
  ]);

  const data = {
    ...metaSettings,
    ...footerSettings,
    home_text: homeTextSettings
  };

  res.json({
    ok: true,
    data
  });
}

export async function getMemberPiInfo(req, res) {
  const memberId = req.params.id;
  const info = await MemberPiInfo.findOne({ where: { member_id: memberId } });

  res.json({
    ok: true,
    data: info ? toPlain(info) : null
  });
}

export async function updateMemberPiInfo(req, res) {
  const memberId = req.params.id;
  const contentFormat = req.body.content_format || 'markdown';

  let contentMd = null;
  let contentHtml = null;

  if (contentFormat === 'markdown') {
    contentMd = req.body.content_md || '';
  }

  if (contentFormat === 'richtext') {
    contentHtml = sanitizeRichText(req.body.content_html || '');
  }

  const payload = {
    member_id: memberId,
    content_format: contentFormat,
    content_md: contentMd,
    content_html: contentHtml
  };

  const existing = await MemberPiInfo.findOne({ where: { member_id: memberId } });
  if (existing) {
    await existing.update(payload);
  } else {
    await MemberPiInfo.create(payload);
  }

  const updated = await MemberPiInfo.findOne({ where: { member_id: memberId } });
  res.json({
    ok: true,
    data: toPlain(updated)
  });
}
