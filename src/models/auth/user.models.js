import { model, Schema } from 'mongoose'

import {
  AvailablePricingModels,
  AvailableUserRoles,
  PricingModel,
  UserRoles,
} from '../../constants/index.js'

const userShecma = new Schema(
  {
    fullName: {
      type: String,
      require: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    role: {
      type: String,
      enum: AvailableUserRoles,
      default: UserRoles.USER,
    },

    password: {
      type: String,
      required: false,
    },

    pricingModel: {
      type: String,
      enum: AvailablePricingModels,
      default: PricingModel.FREE,
    },

    avatar: {
      type: {
        url: String,
      },
      required: false,
    },

    userLoginType: {
      type: String,
      required: true,
    },
  },

  { timestamps: true }
)

const UserModel = model('User', userShecma)

export default UserModel
