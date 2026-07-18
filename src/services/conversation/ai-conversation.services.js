class AIConversationService {
  constructor(aiConversationModel) {
    this.aiConversationModel = aiConversationModel
  }

  async create(aiConversation) {
    return await this.aiConversationModel.create(aiConversation)
  }

  async update(aiConversationId, updateData) {
    const { chats, ...otherFields } = updateData

    const updateQuery = {
      $set: {
        ...otherFields,
      },
    }

    if (Array.isArray(chats)) {
      updateQuery.$set.chats = chats
    }

    return await this.aiConversationModel.findByIdAndUpdate(
      aiConversationId,
      updateQuery,
      { new: true }
    )
  }
}

export default AIConversationService
