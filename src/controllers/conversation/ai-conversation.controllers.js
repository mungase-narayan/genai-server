import Groq from 'groq-sdk'

import ENV from '../../config/env.js'
import MSG from '../../constants/msg.js'
import ApiResponse from '../../utils/api-response.js'

import { webSearch } from '../../services/shared/tool-calling.services.js'
import { TAB_NAME_SYSTEM_PROMPT } from '../../constants/index.js'

class AIConversationController {
  constructor(authService, invokeService, aiConversationService, logger) {
    this.groq = new Groq({ apiKey: ENV.GROQ_API_KEY })
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

    const tabNameContent = [
      { role: 'system', content: TAB_NAME_SYSTEM_PROMPT },
      { role: 'user', content: chat[0].content },
    ]
    const tabName = await this.invokeService.create({
      model,
      chat: tabNameContent,
    })

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
        name: tabName.content,
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
          name: tabName.content,
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

  async toolCalling(req, res) {
    const userId = req?.user?._id
    const tollCallingBody = req.body
    const { chats } = tollCallingBody

    this.logger.info({
      msg: MSG.TOOL_CALLING.USE_TOOL_CALLING,
      data: { userId, tollCallingBody },
    })

    const response = await this.groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: chats,
      tools: [
        {
          type: 'function',
          function: {
            name: 'webSearch',
            description:
              'Fetch real-time data, news, and updates from the internet by performing web searches. ' +
              'Always return only valid JSON in { "query": string } format.',
            parameters: {
              type: 'object',
              properties: {
                query: {
                  type: 'string',
                  description: 'The search query string.',
                },
              },
              required: ['query'],
            },
          },
        },
      ],
      tool_choice: 'auto',
    })

    const message = response?.choices?.[0]?.message

    if (!message) {
      return res
        .status(500)
        .json(new ApiResponse(500, null, 'No response from AI model'))
    }

    const toolCalls = message.tool_calls

    if (!toolCalls || toolCalls.length === 0) {
      this.logger.info({ msg: 'No tool calls detected', data: message })
      return res
        .status(200)
        .json(new ApiResponse(200, message, 'AI response without tool calls'))
    }

    for (const tool of toolCalls) {
      this.logger.info({ msg: 'Tool call detected', data: tool })

      const functionName = tool.function?.name
      let rawArgs = tool.function?.arguments || '{}'
      const functionParams = JSON.parse(rawArgs)

      if (functionName === 'webSearch') {
        const toolResult = await webSearch(functionParams.query)
        return res
          .status(200)
          .json(
            new ApiResponse(
              200,
              { aiMessage: message, toolResult },
              'Tool calling executed successfully'
            )
          )
      }
    }

    return res
      .status(200)
      .json(new ApiResponse(200, message, 'Tool calling executed successfully'))
  }
}

export default AIConversationController
