import mongoose from 'mongoose'
import { ENV } from '../config/index.js'

export const connectDB = async () => {
  const MONGODB_URL = `${ENV.MONGODB_URL}/${ENV.DB_COLLECTION_NAME}`
  console.log(MONGODB_URL)
  if (!MONGODB_URL) throw Error('DB URL not specified')
  console.log('MONGODB_URL', MONGODB_URL)
  await mongoose.connect(MONGODB_URL)
}
