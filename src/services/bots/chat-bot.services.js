import mongoose from 'mongoose'

import { getMongoosePaginationOptions } from '../../utils/helpers.js'

class ChatBotService {
  constructor(chatBotModel) {
    this.chatBotModel = chatBotModel
  }

  async getChatBots(email, { page, limit, isCompleted }) {
    const pipeline = [
      { $match: { email } },
      ...(isCompleted
        ? [{ $match: { title: { $nin: ['', null] } } }]
        : [{ $match: { title: { $in: ['', null] } } }]),
      { $sort: { createdAt: -1 } },
      { $project: { _id: 1, title: 1, tag: 1, createdAt: 1 } },
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

  async getChatBot(chatBotId) {
    return await this.chatBotModel.findOne({
      _id: new mongoose.Types.ObjectId(chatBotId),
    })
  }

  async deleteChatBot(userId, chatBotId) {
    return await this.chatBotModel.deleteOne({ userId, _id: chatBotId })
  }

  async getAdminChatBots({ page, limit, isCompleted }) {
    const pipeline = [
      ...(isCompleted
        ? [{ $match: { title: { $nin: ['', null] } } }]
        : [{ $match: { title: { $in: ['', null] } } }]),
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
      { $sort: { createdAt: -1 } },
      {
        $project: {
          _id: 1,
          title: 1,
          tag: 1,
          email: 1,
          createdAt: 1,
          user: {
            fullName: 1,
            email: 1,
            avatar: 1,
          },
        },
      },
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

  async getAdminChatBot(chatBotId) {
    const pipeline = [
      { $match: { _id: new mongoose.Types.ObjectId(chatBotId) } },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          title: 1,
          tag: 1,
          email: 1,
          questions: 1,
          createdAt: 1,
          user: {
            fullName: 1,
            email: 1,
            avatar: 1,
          },
        },
      },
    ]

    const result = await this.chatBotModel.aggregate(pipeline)
    if (result.length) return result[0]
    return null
  }
}

export default ChatBotService
