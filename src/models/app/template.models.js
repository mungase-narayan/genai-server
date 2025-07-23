import { model, Schema } from 'mongoose'

const templateShecma = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    component: { type: Object, required: true },
  },

  { timestamps: true }
)

export const TemplateModel = model('Template', templateShecma)
