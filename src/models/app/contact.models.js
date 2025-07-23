import { model, Schema } from 'mongoose'

const contactShecma = new Schema(
  {
    email: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    interestArea: { type: String, required: true },
    message: { type: String, required: true },
    captcha: { type: String, required: true },
  },

  { timestamps: true }
)

export const ContactModel = model('Contact', contactShecma)
