import express from 'express'

import { logger } from '../../logger/index.js'
import { asyncHandler } from '../../utils/index.js'
import { TemplateService } from '../../services/index.js'
import { TemplateController } from '../../controllers/index.js'
import { TemplateModel } from '../../models/app/template.models.js'
import {
  verifyJWT,
  verifyPermission,
} from '../../middlewares/auth.middleware.js'

const templateRoutes = express.Router()

const templateService = new TemplateService(TemplateModel)

const templateController = new TemplateController(templateService, logger)

templateRoutes
  .route('/')
  .post(
    verifyJWT,
    verifyPermission(['Admin']),
    asyncHandler((req, res) => templateController.create(req, res))
  )
  .delete(
    verifyJWT,
    verifyPermission(['Admin']),
    asyncHandler((req, res) => templateController.delete(req, res))
  )
  .get(asyncHandler((req, res) => templateController.get(req, res)))
  .put(
    verifyJWT,
    verifyPermission(['Admin']),
    asyncHandler((req, res) => templateController.update(req, res))
  )

export default templateRoutes
