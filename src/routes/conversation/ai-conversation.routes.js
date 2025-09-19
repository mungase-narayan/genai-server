import express from 'express'

import {
  UserService,
  InvokeService,
  AIConversationService,
  TabNameGenerationService,
} from '../../services/index.js'

import {
  AIConversationModel,
  InvokeModel,
  UserModel,
} from '../../models/index.js'

import { logger } from '../../logger/index.js'
import { verifyJWT } from '../../middlewares/index.js'
import { asyncHandler } from '../../utils/index.js'
import { AIConversationController } from '../../controllers/index.js'

const aiConversationRoutes = express.Router()

const authService = new UserService(UserModel)
const invokeService = new InvokeService(InvokeModel)
const tabNameGenerationService = new TabNameGenerationService()
const aiConversationService = new AIConversationService(AIConversationModel)

const aiConversationController = new AIConversationController(
  authService,
  invokeService,
  aiConversationService,
  tabNameGenerationService,
  logger
)

aiConversationRoutes.post(
  '/',
  verifyJWT,
  asyncHandler((req, res) => aiConversationController.create(req, res))
)

export default aiConversationRoutes
