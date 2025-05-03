import { ApiResponse } from '../../utils/index.js'
import { MSG } from '../../constants/index.js'

class ChatBotController {
  constructor(chatBotService, logger) {
    this.chatBotService = chatBotService
    this.logger = logger
  }

  async getChatBots(req, res) {
    const email = req.user?.email
    const { page, limit, isCompleted } = req.query
    this.logger.info({ msg: MSG.CHAT_BOT.GET_CHAT_BOTS, data: { email } })
    const bots = await this.chatBotService.getChatBots(email, {
      page,
      limit,
      isCompleted,
    })
    return res
      .status(200)
      .json(new ApiResponse(200, bots, 'Chat bots fetched successfully'))
  }

  async getChatBot(req, res) {
    const userId = req.user?._id
    const { chatBotId } = req.query
    this.logger.info({
      msg: MSG.CHAT_BOT.GET_CHAT_BOT,
      data: { userId, chatBotId },
    })
    const bot = await this.chatBotService.getChatBot(chatBotId)
    return res
      .status(200)
      .json(new ApiResponse(200, bot, 'Chat bot fetched successfully'))
  }

  async deleteChatBot(req, res) {
    const userId = req.user?._id
    const { chatBotId } = req.body
    this.logger.info({
      msg: MSG.CHAT_BOT.DELET_CHAT_BOT,
      data: { userId, chatBotId },
    })
    await this.chatBotService.deleteChatBot(userId, chatBotId)
    return res
      .status(200)
      .json(
        new ApiResponse(200, { chatBotId }, 'Chat bot deleted successfully')
      )
  }

  async getUsersChatBots(req, res) {
    const { userId } = req.user?._id
    const { page, limit, isCompleted } = req.query
    this.logger.info({
      msg: MSG.CHAT_BOT.GET_ADMIN_CHAT_BOTS,
      data: { userId },
    })
    const bots = await this.chatBotService.getAdminChatBots({
      page,
      limit,
      isCompleted,
    })
    return res
      .status(200)
      .json(new ApiResponse(200, bots, 'Chat bots fetched successfully'))
  }

  async getAdminChatBot(req, res) {
    const userId = req.user?._id
    const { chatBotId } = req.query
    this.logger.info({
      msg: MSG.CHAT_BOT.GET_ADMIN_CHAT_BOT,
      data: { userId, chatBotId },
    })
    const bot = await this.chatBotService.getAdminChatBot(chatBotId)
    return res
      .status(200)
      .json(new ApiResponse(200, bot, 'Chat bot fetched successfully'))
  }
}

export default ChatBotController
