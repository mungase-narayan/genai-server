import Groq from 'groq-sdk'
import { ENV } from '../../config/index.js'
import { TAB_NAME_SYSTEM_PROMPT } from '../../constants/prompts.js'

class TabNameGenerationService {
  constructor() {
    this.groq = new Groq({ apiKey: ENV.GROQ_API_KEY })
  }

  async generate(model, chat) {
    const response = await this.groq.chat.completions.create({
      model,
      messages: [{ role: 'system', content: TAB_NAME_SYSTEM_PROMPT }, ...chat],
    })
    return response?.choices?.[0]?.message?.content
  }
}

export default TabNameGenerationService
