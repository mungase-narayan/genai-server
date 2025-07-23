import express from 'express'

import { logger } from '../../logger/index.js'
import { ContactModel, UserModel } from '../../models/index.js'
import { asyncHandler } from '../../utils/index.js'
import { AuthController } from '../../controllers/index.js'
import {
  ContactService,
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
const contactService = new ContactService(ContactModel)

const authController = new AuthController(
  userService,
  contactService,
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
  '/contact',
  asyncHandler((req, res) => authController.contact(req, res))
)

authRoutes.get(
  '/admin/users',
  verifyJWT,
  verifyPermission(['Admin']),
  asyncHandler((req, res) => authController.getAllUsers(req, res))
)

authRoutes.get(
  '/admin/contact',
  verifyJWT,
  verifyPermission(['Admin']),
  asyncHandler((req, res) => authController.getAllContact(req, res))
)

authRoutes.post(
  '/admin/invitation',
  verifyJWT,
  verifyPermission(['Admin']),
  asyncHandler((req, res) => authController.invitation(req, res))
)

export default authRoutes
