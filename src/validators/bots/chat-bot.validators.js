import { checkSchema, query } from 'express-validator'

export const getBotsQueryValidator = checkSchema(
  {
    title: {
      customSanitizer: {
        options: (value) => {
          if (!value) return ''
          return value
        },
      },
    },

    isCompleted: {
      customSanitizer: {
        options: (value) => {
          if (value === 'false') return false
          return true
        },
      },
    },

    page: {
      customSanitizer: {
        options: (value) => {
          const parsedValue = Number(value)
          return isNaN(parsedValue) ? 1 : parsedValue
        },
      },
    },

    limit: {
      customSanitizer: {
        options: (value) => {
          const parsedValue = Number(value)
          return isNaN(parsedValue) ? 6 : parsedValue
        },
      },
    },
  },
  ['query']
)

export const getChatBotValidator = [
  query('chatBotId')
    .trim()
    .notEmpty()
    .withMessage('Bot ID is required')
    .isMongoId()
    .withMessage('Bot ID is invalid'),
]
