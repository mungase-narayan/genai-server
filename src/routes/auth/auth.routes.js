import express from 'express'

import { logger } from '../../logger/index.js'
import { UserModel } from '../../models/index.js'
import { asyncHandler } from '../../utils/index.js'
import { AuthController } from '../../controllers/index.js'
import {
  HashService,
  MailgenService,
  NotificationService,
  TokenService,
  UploadService,
  UserService,
} from '../../services/index.js'
import {
  userLoginValidator,
  verifyEmailAndCreatePassowordValidator,
  userRegisterValidator,
  userEmailValidator,
  tokenValidator,
  fullNameValidator,
} from '../../validators/auth/user.validators.js'
import {
  uploader,
  validate,
  verifyJWT,
  verifyPermission,
} from '../../middlewares/index.js'

const authRoutes = express.Router()
const userService = new UserService(UserModel)
const tokenService = new TokenService()
const hashService = new HashService()
const notificationService = new NotificationService()
const mailgenService = new MailgenService()
const uploadService = new UploadService()

const authController = new AuthController(
  userService,
  tokenService,
  hashService,
  notificationService,
  mailgenService,
  uploadService,
  logger
)

authRoutes.post(
  '/register',
  userRegisterValidator,
  validate,
  asyncHandler((req, res, next) => authController.register(req, res, next))
)

authRoutes.post(
  '/verifyEmailAndCreatePassword',
  verifyEmailAndCreatePassowordValidator,
  validate,
  asyncHandler((req, res, next) =>
    authController.verifyEmailAndCreatePassword(req, res, next)
  )
)

authRoutes.post(
  '/login',
  userLoginValidator,
  validate,
  asyncHandler((req, res, next) => authController.login(req, res, next))
)

authRoutes.post(
  '/forgotPassword',
  userEmailValidator,
  validate,
  asyncHandler((req, res, next) =>
    authController.forgotPassword(req, res, next)
  )
)

authRoutes.post(
  '/resetPassword',
  verifyEmailAndCreatePassowordValidator,
  validate,
  asyncHandler((req, res, next) => authController.resetPassword(req, res, next))
)

authRoutes.post(
  '/self',
  tokenValidator,
  validate,
  asyncHandler((req, res, next) => authController.self(req, res, next))
)

authRoutes.patch(
  '/uploadProfilePicture',
  verifyJWT,
  uploader.single('avatar'),
  asyncHandler((req, res) => authController.uploadProfilePicture(req, res))
)

authRoutes.patch(
  '/updateFullName',
  verifyJWT,
  fullNameValidator,
  asyncHandler((req, res) => authController.updateFullName(req, res))
)

authRoutes.post(
  '/invitation',
  // verifyJWT,
  // verifyPermission(['Admin']),
  asyncHandler((req, res) => authController.invitation(req, res))
)

authRoutes.get(
  '/users',
  verifyJWT,
  verifyPermission(['Admin']),
  asyncHandler((req, res) => authController.getAllUsers(req, res))
)

export default authRoutes
