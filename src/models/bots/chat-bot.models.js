import { model, Schema } from 'mongoose'
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2'

const chatBotShema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },

    email: {
      type: String,
      required: false,
    },

    questions: {
      type: Array,
      required: false,
      default: [],
    },
  },

  { timestamps: true }
)

chatBotShema.plugin(mongooseAggregatePaginate)
const ChatBotModel = model('ai_model_response', chatBotShema)

export default ChatBotModel
