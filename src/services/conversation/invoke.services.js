import Groq from 'groq-sdk'

import ENV from '../../config/env.js'
import { webSearch } from '../shared/tool-calling.services.js'
import { WEB_SEARCH_SYSTEM_PROMPT } from '../../constants/prompts.js'

class InvokeService {
  constructor(invokeModel) {
    this.invokeModel = invokeModel
    this.groq = new Groq({ apiKey: ENV.GROQ_API_KEY })
  }

  async create(invokeData) {
    const { model, chat } = invokeData
    const updatedChat = [
      { role: 'system', content: WEB_SEARCH_SYSTEM_PROMPT },
      ...chat,
    ]

    let finalMessage = null

    while (true) {
      const response = await this.groq.chat.completions.create({
        model,
        messages: updatedChat,
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
      if (!message) return null

      updatedChat.push(message)
      finalMessage = message

      const toolCalls = message.tool_calls
      if (!toolCalls || toolCalls.length === 0) {
        break
      }

      for (const tool of toolCalls) {
        const functionName = tool.function?.name
        const rawArgs = tool.function?.arguments || '{}'
        const functionParams = JSON.parse(rawArgs)

        if (functionName === 'webSearch') {
          const toolResult = await webSearch(functionParams.query)

          const toolContent = toolResult.results
            ? toolResult.results
                .map((r) => `${r.title}: ${r.content}`)
                .join('\n\n')
            : JSON.stringify(toolResult)

          updatedChat.push({
            tool_call_id: tool.id,
            role: 'tool',
            name: functionName,
            content: toolContent,
          })
        }
      }
    }

    return finalMessage
  }
}

export default InvokeService
