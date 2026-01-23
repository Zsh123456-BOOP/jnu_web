import { Op } from 'sequelize';
import { Asset, Content, Member, MemberPiInfo, Module, Settings } from '../models/index.js';
import { safeJsonParse } from '../utils/json.js';
import { getPagination } from '../utils/pagination.js';
import { toAbsoluteUrl } from '../utils/url.js';
import {
  getSiteSettings as getSiteSettingsService,
  getSiteMetaSettings
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

const mapMember = (req, row) => {
  const data = toPlain(row);
  const image = data.image || null;
  const piInfo = data.pi_info || null;
  return {
    id: data.id,
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
        : null,
    pi_info: piInfo ? {
      content_md: piInfo.content_md,
      content_html: piInfo.content_html,
      content_format: piInfo.content_format
    } : null
  };
};

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

export async function getPublicSiteSettings(_req, res) {
  const [footerSettings, metaSettings] = await Promise.all([
    getSiteSettingsService(),
    getSiteMetaSettings()
  ]);
  const data = {
    ...metaSettings,
    ...footerSettings
  };
  res.json({
    ok: true,
    data
  });
}

export async function listMembers(req, res) {
  const where = { enabled: 1 };
  if (req.query.is_pi !== undefined) {
    const raw = String(req.query.is_pi).trim().toLowerCase();
    if (['1', '0', 'true', 'false'].includes(raw)) {
      where.is_pi = raw === '1' || raw === 'true' ? 1 : 0;
    }
  }

  if (req.query.type) {
    where.type = req.query.type;
  }

  const rows = await Member.findAll({
    where,
    include: [
      {
        model: Asset,
        as: 'image',
        attributes: ['id', 'relative_path', 'mime', 'original_name']
      },
      {
        model: MemberPiInfo,
        as: 'pi_info',
        required: false
      }
    ],
    order: [
      ['is_pi', 'DESC'],
      ['sort_order', 'ASC'],
      ['id', 'ASC']
    ]
  });

  res.json({
    ok: true,
    data: rows.map((row) => mapMember(req, row))
  });
}

export async function listModules(req, res) {
  const navOnly = String(req.query.nav || '') === '1';
  const where = navOnly ? { enabled: 1, nav_visible: 1 } : { enabled: 1 };

  const rows = await Module.findAll({
    where,
    order: [
      ['sort_order', 'ASC'],
      ['id', 'ASC']
    ]
  });

  res.json({
    ok: true,
    data: rows.map(mapModule)
  });
}

export async function getModule(req, res) {
  const row = await Module.findOne({
    where: { slug: req.params.slug, enabled: 1 }
  });

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
}

export async function listContents(req, res) {
  const { page, pageSize, offset } = getPagination(req.query);
  const where = { status: 'published' };
  const moduleInclude = {
    model: Module,
    attributes: ['slug', 'name'],
    required: true,
    where: { enabled: 1 }
  };

  if (req.query.moduleSlug) {
    moduleInclude.where.slug = req.query.moduleSlug;
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
      ['published_at', 'DESC'],
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

export async function getContent(req, res) {
  const row = await Content.findOne({
    where: { id: req.params.id, status: 'published' },
    include: [
      {
        model: Module,
        attributes: ['slug', 'name'],
        required: true,
        where: { enabled: 1 }
      }
    ]
  });

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
}

export async function getPageContent(req, res) {
  const row = await Content.findOne({
    where: { slug: req.params.pageSlug, status: 'published' },
    include: [
      {
        model: Module,
        attributes: ['slug', 'name'],
        required: true,
        where: { slug: req.params.moduleSlug, enabled: 1 }
      }
    ]
  });

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
}

export async function getMemberPiInfo(req, res) {
  const info = await MemberPiInfo.findOne({ where: { member_id: req.params.id } });
  res.json({
    ok: true,
    data: info ? toPlain(info) : null
  });
}
