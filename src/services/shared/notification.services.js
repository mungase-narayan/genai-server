import nodemailer from 'nodemailer'

import { ENV } from '../../config/index.js'

class NotificationService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: ENV.MAIL_HOST,
      port: ENV.MAIL_PORT,
      secure: false,
      auth: {
        user: ENV.MAIL_USERNAME,
        pass: ENV.MAIL_PASSWORD,
      },
    })
  }

  async send(message) {
    await this.transporter.sendMail({
      from: message?.from
        ? `${message.from} <${ENV.MAIL_USERNAME}>`
        : ENV.MAIL_FROM,
      to: message.to,
      subject: message.subject,
      text: message.text,
      html: message.html,
    })
  }
}

export default NotificationService
