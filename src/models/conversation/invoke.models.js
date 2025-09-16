import { model, Schema } from 'mongoose'
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2'

const chatMessageSchema = new Schema(
  {
    role: {
      type: String,
      enum: ['user', 'assistant', 'system'],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
  },
  { _id: false }
)

const invokeSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    chat: {
      type: [chatMessageSchema],
      default: [],
    },
    model: {
      type: String,
      required: true,
    },
    generateImage: {
      type: Boolean,
      default: false,
    },
    webSearch: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
)

invokeSchema.plugin(mongooseAggregatePaginate)

const InvokeModel = model('Invoke', invokeSchema)

export default InvokeModel
