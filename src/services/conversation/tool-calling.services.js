import { tavily } from '@tavily/core'
import { ENV } from '../../config'

const tvly = tavily({ apiKey: ENV.TAVILY_API_KEY })

class ToolCallingService {
  constructor() {}

  async webSearch(query) {
    return await tvly.search(query)
  }
}

export default ToolCallingService
