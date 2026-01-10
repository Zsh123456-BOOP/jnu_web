import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import multer from 'multer';
import { config } from '../config.js';
import { ApiError } from '../middleware/error.js';

const allowedImageMimes = new Set(['image/png', 'image/jpeg', 'image/webp']);

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

export const createAssetUploadMiddleware = () =>
  multer({
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

export const getSafeStoragePath = (relativePath) => {
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
