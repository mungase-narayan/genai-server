import mongoose from 'mongoose'

import { getMongoosePaginationOptions } from '../../utils/helpers.js'

class ChatBotService {
  constructor(chatBotModel) {
    this.chatBotModel = chatBotModel
  }

  async getChatBots(userId, { page, limit }) {
    const pipeline = [
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      { $project: { _id: 1 } },
    ]

    const chatBots = await this.chatBotModel.aggregatePaginate(
      this.chatBotModel.aggregate(pipeline),
      getMongoosePaginationOptions({
        page,
        limit,
        customLabels: {
          totalDocs: 'total',
          docs: 'bots',
        },
      })
    )

    return chatBots
  }

  async getChatBot(userId, chatBotId) {
    return await this.chatBotModel.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      _id: new mongoose.Types.ObjectId(chatBotId),
    })
  }
}

export default ChatBotService
