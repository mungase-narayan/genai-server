import { ENV } from '../../config/index.js'
import { tavily } from '@tavily/core'

const tvly = tavily({ apiKey: ENV.TAVILY_API_KEY })

export const webSearch = async (query) => {
  const response = await tvly.search(query)
  return response
}
