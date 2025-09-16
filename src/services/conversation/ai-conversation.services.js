class AIConversationService {
  constructor(aiConversationModel) {
    this.aiConversationModel = aiConversationModel
  }

  async create(aiConversation) {
    return await this.aiConversationModel.create(aiConversation)
  }
}

export default AIConversationService
