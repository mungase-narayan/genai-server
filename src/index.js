import cors from 'cors'
import express from 'express'
import passport from 'passport'
import session from 'express-session'
import { Strategy } from 'passport-google-oauth20'

import { ENV } from './config/index.js'
import { connectDB } from './db/index.js'
import { MSG, UserLoginType } from './constants/index.js'
import { logger } from './logger/index.js'
import { asyncHandler } from './utils/index.js'
import { ApiResponse } from './utils/index.js'
import { errorHandler, morganMiddleware } from './middlewares/index.js'

import { authRoutes } from './routes/index.js'
import { UserModel } from './models/index.js'
import { TokenService } from './services/index.js'

const tokenService = new TokenService()

const app = express()

const corsOption = {
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}

app.use(morganMiddleware)
app.use(cors(corsOption))
app.options('*', cors(corsOption))
app.use(express.json())
app.use(express.static('public'))

app.use(
  session({
    secret: ENV.SESSION_SECRET_KEY,
    resave: false,
    saveUninitialized: true,
  })
)
app.use(passport.initialize())
app.use(passport.session())

passport.use(
  new Strategy(
    {
      clientID: ENV.GOOGLE_CLIENT_ID,
      clientSecret: ENV.GOOGLE_CLIENT_SECRET,
      callbackURL: '/auth/google/callback',
      scope: ['profile', 'email'],
    },
    async (_, __, profile, done) => {
      try {
        let user = await UserModel.findOne({
          email: profile?.emails[0]?.value,
        })

        if (!user) {
          const userData = {
            email: profile?.emails[0]?.value,
            fullName: profile?.displayName,
            avatar: {
              url: profile?.photos[0]?.value,
            },
            password: '',
            userLoginType: UserLoginType.GOOGLE,
          }
          user = await UserModel.create(userData)
        }

        const accessToken = await tokenService.signToken({
          user: {
            _id: user._id,
            email: user.email,
            fullName: user.fullName,
          },
        })
        return done(null, { ...user, accessToken })
      } catch (error) {
        return done(error, null)
      }
    }
  )
)

passport.serializeUser((user, done) => {
  done(null, user)
})

passport.deserializeUser((user, done) => {
  done(null, user)
})

app.get(
  '/',
  asyncHandler((req, res, next) => {
    return res
      .status(200)
      .json(new ApiResponse(200, { msg: 'Hello from server!' }))
  })
)

app.use('/api/v1/auth', authRoutes)

app.get(
  '/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
)

app.get(
  '/auth/google/callback',
  passport.authenticate('google', { session: false }),
  (req, res) => {
    if (!req.user) return res.redirect(`${ENV.FRONTEND_URL}/auth/sign-up`)
    const token = req.user?.accessToken
    res.redirect(`${ENV.FRONTEND_URL}/auth/verify?token=${token}`)
  }
)

const startServer = async () => {
  const PORT = ENV.PORT || 5500
  try {
    connectDB()
    logger.info({ msg: MSG.DB_CONNECTED })
    app.listen(PORT, () =>
      logger.info({ msg: `Server listening on http://localhost:${PORT}` })
    )
  } catch (error) {
    if (error instanceof Error) {
      logger.error({ error: error.message })
      process.exit(1)
    }
  }
}

startServer()

app.use(errorHandler)

export default app
