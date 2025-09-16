import { model, Schema } from 'mongoose'
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2'

const chatSchema = new Schema(
  {
    role: {
      type: String,
      enum: ['system', 'user', 'assistant'],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
  },
  { _id: false }
)

const aiConversationSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    chats: {
      type: [chatSchema],
      default: [],
    },
    name: {
      type: String,
      default: null,
    },
    model: {
      type: String,
      default: 'openai/chatgpt-4o-latest',
    },
    webSearch: {
      type: Boolean,
      default: false,
    },
    task: {
      type: String,
      default: 'Basic Tasks',
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      default: null,
    },
    assignee: {
      type: [Schema.Types.ObjectId],
      ref: 'User',
      default: [],
    },
  },
  { timestamps: true }
)

aiConversationSchema.plugin(mongooseAggregatePaginate)

const AIConversationModel = model('aiConversation', aiConversationSchema)

export default AIConversationModel
