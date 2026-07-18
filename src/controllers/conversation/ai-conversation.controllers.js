import ApiResponse from '../../utils/api-response.js'

class AIConversationController {
  constructor(
    authService,
    invokeService,
    aiConversationService,
    tabNameGenerationService,
    logger
  ) {
    this.tabNameGenerationService = tabNameGenerationService
    this.aiConversationService = aiConversationService
    this.invokeService = invokeService
    this.authService = authService
    this.logger = logger
  }

  getLastUserMessage(chat) {
    if (!Array.isArray(chat) || chat.length === 0) return null
    return chat[chat.length - 1]
  }

  getHistoryMessages(chat) {
    return chat.slice(0, -1)
  }

  async create(req, res) {
    const userId = req.user._id
    const invokeData = req.body
    const { model, chat = [], aiConversationId } = invokeData

    const lastMessage = chat[chat.length - 1]

    let llmChat = chat
    let summary = null

    if (chat.length > 40) {
      const history = chat.slice(0, -1)

      const summaryResponse = await this.invokeService.create({
        model: model || 'gpt-4o-mini',
        chat: [
          {
            role: 'system',
            content:
              'Summarize the conversation briefly. Preserve important context, facts, and decisions.',
          },
          {
            role: 'user',
            content: JSON.stringify(history),
          },
        ],
      })

      summary = summaryResponse?.content || ''

      llmChat = [
        { role: 'system', content: `Conversation Summary:\n${summary}` },
        lastMessage,
      ]
    }

    const assistantReply = await this.invokeService.create({
      ...invokeData,
      chat: llmChat,
    })

    const finalChats = [...chat, assistantReply]

    const tabName = await this.tabNameGenerationService.generate(
      model,
      finalChats
    )

    const savedConversation = aiConversationId
      ? await this.aiConversationService.update(aiConversationId, {
          userId,
          chats: finalChats,
          name: tabName,
          model,
          webSearch: invokeData.webSearch,
          task: invokeData.task,
          isPinned: invokeData.isPinned,
        })
      : await this.aiConversationService.create({
          userId,
          chats: finalChats,
          name: tabName,
          model,
          webSearch: invokeData.webSearch,
          task: invokeData.task,
          isPinned: invokeData.isPinned,
        })

    return res
      .status(201)
      .json(
        new ApiResponse(201, savedConversation, 'Invoke created successfully')
      )
  }
}

export default AIConversationController
