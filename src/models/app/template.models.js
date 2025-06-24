import { model, Schema } from 'mongoose'

const componentSchema = new Schema(
  {
    type: { type: String, required: true },
    props: { type: Schema.Types.Mixed, default: {} },
    style: { type: Schema.Types.Mixed, default: {} },
    visibility: { visibleIf: { type: String } },
    children: [],
  },
  { timestamps: true }
)

componentSchema.add({
  children: [componentSchema],
})

const templateShecma = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    description: { type: String },
    type: { type: String, required: true },
    component: { type: componentSchema, required: true },
  },

  { timestamps: true }
)

export const ComponentModel = model('Component', componentSchema)
export const TemplateModel = model('Template', templateShecma)
