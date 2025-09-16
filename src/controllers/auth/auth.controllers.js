import { ENV } from '../../config/index.js'
import { ApiError, ApiResponse } from '../../utils/index.js'
import { MSG, URLS, UserLoginType } from '../../constants/index.js'

class AuthController {
  constructor(
    userService,
    contactService,
    tokenService,
    hashService,
    notificationService,
    mailgenService,
    uploadService,
    logger
  ) {
    this.userService = userService
    this.contactService = contactService
    this.tokenService = tokenService
    this.hashService = hashService
    this.notificationService = notificationService
    this.mailgenService = mailgenService
    this.uploadService = uploadService
    this.logger = logger
  }

  async register(req, res) {
    const { email, fullName } = req.body
    this.logger.info({
      msg: MSG.AUTH.USER_REGISTERED,
      data: { email, fullName },
    })

    const existedUser = await this.userService.getUserByEmail(email)
    if (existedUser)
      throw new ApiError(409, 'User with email already exists.', [])

    await this.userService.createUser({
      email,
      fullName,
      userLoginType: UserLoginType.EMAIL_PASSWORD,
      password: null,
    })

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { fullName, email },
          'email han been sent to admin for admin for verification onsce admin verify then you will get email to create password.'
        )
      )

    // Changed Logic

    const EXP = '10m'
    const verifyEmailToken = await this.tokenService.signToken(
      { user: { fullName, email } },
      EXP
    )

    const verificationLink = `${ENV.FRONTEND_URL}${
      URLS.createPasswordUrl
    }?token=${verifyEmailToken}`

    const { emailHTML, emailText } = this.mailgenService.verificationEmailHTML({
      name: fullName,
      link: verificationLink,
    })

    await this.notificationService.send({
      to: email,
      subject: 'Verify Email and Create Password',
      text: emailText,
      html: emailHTML,
    })

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { fullName, email },
          'The verification email has been sent successfully to the provided email address.'
        )
      )
  }

  async invitation(req, res) {
    const { userId } = req.body

    this.logger.info({
      msg: MSG.AUTH.USER_VERIFIED,
      data: { userId },
    })

    const existedUser = await this.userService.getUserById(userId)
    if (!existedUser) throw new ApiError(404, 'User not found!', [])

    await this.userService.updateUser(userId, {
      invitationCount: existedUser?.invitationCount + 1,
    })

    const EXP = '10m'
    const verifyEmailToken = await this.tokenService.signToken(
      {
        user: {
          fullName: existedUser.fullName,
          email: existedUser.email,
          userId: existedUser._id,
        },
      },
      EXP
    )

    const verificationLink = `${ENV.FRONTEND_URL}${
      URLS.createPasswordUrl
    }?token=${verifyEmailToken}`

    const { emailHTML, emailText } = this.mailgenService.verificationEmailHTML({
      name: existedUser.fullName,
      link: verificationLink,
    })

    await this.notificationService.send({
      to: existedUser.email,
      subject: 'Accept Invitation and Create Password',
      text: emailText,
      html: emailHTML,
    })

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { fullName: existedUser.fullName, email: existedUser.email },
          'The verification email has been sent successfully to the provided email address.'
        )
      )
  }

  async verifyEmailAndCreatePassword(req, res) {
    const { password, token } = req.body

    const decodedToken = this.tokenService.verifyToken(token)
    if (
      !decodedToken?.user ||
      !decodedToken?.user?.email ||
      !decodedToken?.user?.fullName
    )
      throw new ApiError(400, 'The token provided is invalid or expired.')

    if ((decodedToken?.exp || 0) * 1000 < Date.now())
      throw new ApiError(
        400,
        'We are sorry, but your token has expired. Please request a new token to proceed.'
      )

    const existedUser = await this.userService.getUserByEmail(
      decodedToken?.user?.email
    )
    if (existedUser.isVerified)
      throw new ApiError(409, 'User with email already exists.', [])

    const hashedPassword = await this.hashService.hashData(password)

    const user = await this.userService.updateUser(existedUser._id, {
      password: hashedPassword,
      isVerified: true,
    })

    this.logger.info({
      msg: MSG.AUTH.USER_VERIFIED,
      data: { userId: user._id, fullName: user.fullName, email: user.fullName },
    })

    const accessToken = await this.tokenService.signToken({
      user: {
        _id: user._id,
        email: user.email,
        fullName: user.fullName,
      },
    })

    return res.status(201).json(
      new ApiResponse(
        201,
        {
          user: {
            _id: user._id,
            email: user.email,
            fullName: user.fullName,
            avatar: user.avatar,
            role: user.role,
            pricingModel: user.pricingModel,
          },
          token: accessToken,
        },
        'Your email has been successfully verified, and your password has been created.'
      )
    )
  }

  async login(req, res) {
    const { email, password } = req.body

    const user = await this.userService.getUserByEmail(email)
    if (!user) throw new ApiError(401, 'User not found with this email.', [])

    if (!user?.isVerified)
      throw new ApiError(
        403,
        'Your account must be verified to access this resource.'
      )

    if (user?.userLoginType !== UserLoginType.EMAIL_PASSWORD) {
      throw new ApiError(404, 'You need to log in using Google to continue.')
    }

    const isMatch = await this.hashService.hashCompare(password, user.password)
    if (!isMatch) throw new ApiError(400, 'Invalid user credentials')

    const accessToken = await this.tokenService.signToken({
      user: { _id: user._id, email: user.email, fullName: user.fullName },
    })

    this.logger.info({
      msg: MSG.AUTH.USER_LOGGED_IN,
      data: { userId: user._id, fullName: user.fullName, email: user.email },
    })

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          user: {
            _id: user._id,
            email: user.email,
            fullName: user.fullName,
            avatar: user.avatar,
            role: user.role,
            pricingModel: user.pricingModel,
          },
          token: accessToken,
        },
        'User logged in successfully.'
      )
    )
  }

  async forgotPassword(req, res) {
    const { email } = req.body
    this.logger.info({ msg: MSG.AUTH.FORGOT_PASSWORD, data: { email } })

    const user = await this.userService.getUserByEmail(email)
    if (!user) throw new ApiError(409, 'User with email not exists.')

    if (!user?.isVerified)
      throw new ApiError(
        403,
        'Your account must be verified to access this resource.'
      )

    const EXP = '2 days'
    const resetPasswordToken = await this.tokenService.signToken(
      { user: { email: user.email, fullName: user.fullName, _id: user._id } },
      EXP
    )

    const resetPasswordLink = `${ENV.FRONTEND_URL}${
      URLS.resetPasswordUrl
    }?token=${resetPasswordToken}`

    const { emailHTML, emailText } = this.mailgenService.resetPasswordEmailHTML(
      {
        name: user.fullName,
        link: resetPasswordLink,
      }
    )

    await this.notificationService.send({
      to: email,
      subject: `Reset Your ${ENV.PROJECT_NAME} Password`,
      text: emailText,
      html: emailHTML,
    })

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { email: user.email },
          'Reset password link has been sent to your email'
        )
      )
  }

  async resetPassword(req, res) {
    const { password, token } = req.body

    const decodedToken = this.tokenService.verifyToken(token)
    if (
      !decodedToken?.user ||
      !decodedToken?.user?.email ||
      !decodedToken?.user?.fullName
    )
      throw new ApiError(400, 'The token provided is invalid or expired.')

    if ((decodedToken?.exp || 0) * 1000 < Date.now())
      throw new ApiError(
        400,
        'We are sorry, but your token has expired. Please request a new token to proceed.'
      )

    const user = await this.userService.getUserByEmail(
      decodedToken?.user?.email
    )
    if (!user) throw new ApiError(409, 'User with email not exists.', [])

    if (!user?.isVerified)
      throw new ApiError(
        403,
        'Your account must be verified to access this resource.'
      )

    this.logger.info({
      msg: MSG.AUTH.RESET_PASSWORD,
      data: { userId: user._id, email: user.email },
    })

    const hashedPassword = await this.hashService.hashData(password)
    await this.userService.updateUser(user._id, {
      password: hashedPassword,
    })

    const accessToken = await this.tokenService.signToken({
      user: {
        _id: user._id,
        email: user.email,
        fullName: user.fullName,
      },
    })

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          user: {
            _id: user._id,
            email: user.email,
            fullName: user.fullName,
            avatar: user.avatar,
            role: user.role,
            pricingModel: user.pricingModel,
          },
          token: accessToken,
        },
        'Your password has been reset successfully'
      )
    )
  }

  async self(req, res) {
    const { token } = req.body

    const decodedToken = this.tokenService.verifyToken(token)
    if (
      !decodedToken?.user ||
      !decodedToken?.user?.email ||
      !decodedToken?.user?.fullName
    )
      throw new ApiError(401, 'The token provided is invalid or expired.')

    if ((decodedToken?.exp || 0) * 1000 < Date.now())
      throw new ApiError(
        401,
        'We are sorry, but your token has expired. Please request a new token to proceed.'
      )

    const user = await this.userService.getUserByEmail(
      decodedToken?.user?.email
    )
    if (!user) throw new ApiError(409, 'User with email not exists.', [])

    if (!user?.isVerified)
      throw new ApiError(
        403,
        'Your account must be verified to access this resource.'
      )

    this.logger.info({
      msg: MSG.AUTH.SELF,
      data: { userId: user?._id, email: user.email },
    })

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          user: {
            _id: user._id,
            email: user.email,
            fullName: user.fullName,
            avatar: user.avatar,
            role: user.role,
            pricingModel: user.pricingModel,
          },
          token,
        },
        'Fetched users details successfully'
      )
    )
  }

  async uploadProfilePicture(req, res) {
    const userId = req?.user?._id

    if (!req?.file?.path) {
      throw new ApiError(400, 'No file uploaded')
    }

    const user = await this.userService.getUserById(userId)
    if (!user) throw new ApiError(401, 'Unauthorized')

    const uploadResult = await this.uploadService.upload(req.file?.path)

    if (!uploadResult)
      throw new ApiError(400, 'Error uploading profile picture')

    await this.userService.updateUser(userId, {
      avatar: {
        url: uploadResult.secure_url,
      },
    })

    return res
      .status(201)
      .json(
        new ApiResponse(
          201,
          { avatar: { url: uploadResult.secure_url } },
          'Profile picture updated successfully.'
        )
      )
  }

  async updateFullName(req, res) {
    const userId = req?.user?._id
    const { fullName } = req.body

    const user = await this.userService.getUserById(userId)
    if (!user) throw new ApiError(401, 'Unauthorized')

    await this.userService.updateUser(userId, { fullName })

    return res
      .status(201)
      .json(
        new ApiResponse(
          201,
          { user: { userId, fullName } },
          'Profile picture updated successfully.'
        )
      )
  }

  async getAllUsers(req, res) {
    const users = await this.userService.getAllUsers()
    return res
      .status(200)
      .json(new ApiResponse(200, users, 'Fetched all users'))
  }

  async contact(req, res) {
    const contact = req.body
    const createdContact = await this.contactService.create(contact)

    const { emailHTML, emailText } = this.mailgenService.contactEmailHTML({
      contact,
    })

    await this.notificationService.send({
      to: ENV.INFO_EMAIL,
      subject: `You've Got a New Message from a User on ${ENV.PROJECT_NAME}`,
      text: emailText,
      html: emailHTML,
    })

    return res
      .status(201)
      .json(
        new ApiResponse(
          200,
          createdContact,
          'Your response stored successfully.'
        )
      )
  }

  async getAllContact(req, res) {
    const contacts = await this.contactService.getContacts()
    return res
      .status(200)
      .json(new ApiResponse(200, contacts, 'Fetched all contacts'))
  }
}

export default AuthController
