class AIConversationService {
  constructor(aiConversationModel) {
    this.aiConversationModel = aiConversationModel
  }

  async create(aiConversation) {
    return await this.aiConversationModel.create(aiConversation)
  }

  async update(aiConversationId, updateData) {
    const { chats, ...otherFields } = updateData

    const updateQuery = {}
    if (Object.keys(otherFields).length > 0) {
      updateQuery.$set = otherFields
    }
    if (chats && Array.isArray(chats) && chats.length > 0) {
      updateQuery.$push = { chats: { $each: chats } }
    }

    return await this.aiConversationModel.findByIdAndUpdate(
      aiConversationId,
      updateQuery,
      { new: true }
    )
  }
}

export default AIConversationService
