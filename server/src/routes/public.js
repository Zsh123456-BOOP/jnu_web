import { Router } from 'express';
import { param, query } from 'express-validator';
import { validateRequest } from '../middleware/validate.js';
import { asyncHandler } from '../utils/async-handler.js';
import * as publicController from '../controllers/public.controller.js';

const router = Router();

router.get('/settings/site', asyncHandler(publicController.getSiteSettings));

router.get('/public/site-settings', asyncHandler(publicController.getPublicSiteSettings));

router.get('/members', asyncHandler(publicController.listMembers));

router.get(
  '/modules',
  [query('nav').optional().isIn(['1'])],
  validateRequest,
  asyncHandler(publicController.listModules)
);

router.get(
  '/modules/:slug',
  [param('slug').isString().trim().notEmpty()],
  validateRequest,
  asyncHandler(publicController.getModule)
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
  asyncHandler(publicController.listContents)
);

router.get(
  '/contents/:id',
  [param('id').isInt({ min: 1 })],
  validateRequest,
  asyncHandler(publicController.getContent)
);

router.get(
  '/pages/:moduleSlug/:pageSlug',
  [param('moduleSlug').isString().trim().notEmpty(), param('pageSlug').isString().trim().notEmpty()],
  validateRequest,
  asyncHandler(publicController.getPageContent)
);

export default router;
