import MSG from '../../constants/msg.js'
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

  async create(req, res) {
    const userId = req.user._id
    const invokeData = req.body

    this.logger.info({
      msg: MSG.AI_CONVERSATION.CREATE_AI_CONVERSATION,
      data: { ...invokeData, userId },
    })

    const { model, chat, aiConversationId } = invokeData
    const invokeResponse = await this.invokeService.create(invokeData)

    const tabName = await this.tabNameGenerationService.generate(model, chat)

    const conversation = [...chat, invokeResponse]

    let savedConversation
    if (
      !aiConversationId ||
      aiConversationId === 'null' ||
      aiConversationId === ''
    ) {
      savedConversation = await this.aiConversationService.create({
        userId,
        chats: conversation,
        name: tabName,
        ...(invokeData.model && { model: invokeData.model }),
        ...(invokeData.webSearch && { webSearch: invokeData.webSearch }),
        ...(invokeData.task && { task: invokeData.task }),
        ...(invokeData.projectId && { projectId: invokeData.projectId }),
        ...(invokeData.assignee && { assignee: invokeData.assignee }),
      })
    } else {
      savedConversation = await this.aiConversationService.update(
        aiConversationId,
        {
          userId,
          chats: conversation,
          name: tabName,
          ...(invokeData.model && { model: invokeData.model }),
          ...(invokeData.webSearch && { webSearch: invokeData.webSearch }),
          ...(invokeData.task && { task: invokeData.task }),
          ...(invokeData.projectId && { projectId: invokeData.projectId }),
          ...(invokeData.assignee && { assignee: invokeData.assignee }),
        }
      )
    }

    return res
      .status(201)
      .json(
        new ApiResponse(201, savedConversation, 'Invoke created successfully')
      )
  }
}

export default AIConversationController
