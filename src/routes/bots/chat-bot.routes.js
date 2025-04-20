import express from 'express'

import { logger } from '../../logger/index.js'
import { asyncHandler } from '../../utils/index.js'
import { ChatBotController } from '../../controllers/index.js'
import { ChatBotService } from '../../services/index.js'
import { ChatBotModel } from '../../models/index.js'
import {
  validate,
  verifyJWT,
  verifyPermission,
} from '../../middlewares/index.js'
import {
  chatBotIdValidator,
  getBotsQueryValidator,
  getChatBotValidator,
} from '../../validators/bots/chat-bot.validators.js'

const chatBotRoutes = express.Router()
const chatBotService = new ChatBotService(ChatBotModel)
const chatBotController = new ChatBotController(chatBotService, logger)

chatBotRoutes
  .route('/')
  .get(
    verifyJWT,
    getBotsQueryValidator,
    validate,
    asyncHandler((req, res) => chatBotController.getChatBots(req, res))
  )
  .delete(
    verifyJWT,
    chatBotIdValidator,
    validate,
    asyncHandler((req, res) => chatBotController.deleteChatBot(req, res))
  )

chatBotRoutes.get(
  '/getChatBot',
  verifyJWT,
  getChatBotValidator,
  validate,
  asyncHandler((req, res) => chatBotController.getChatBot(req, res))
)

chatBotRoutes.route('/admin').get(
  verifyJWT,
  verifyPermission(['Admin']),
  getBotsQueryValidator,
  validate,
  asyncHandler((req, res) => chatBotController.getUsersChatBots(req, res))
)

chatBotRoutes.get(
  '/getChatBotForAdmin',
  verifyJWT,
  verifyPermission(['Admin']),
  getChatBotValidator,
  validate,
  asyncHandler((req, res) => chatBotController.getAdminChatBot(req, res))
)

export default chatBotRoutes
