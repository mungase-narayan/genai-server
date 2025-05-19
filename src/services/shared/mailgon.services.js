import Mailgen from 'mailgen'

import { ENV } from '../../config/index.js'

class MailgenService {
  constructor() {
    this.mailGenerator = new Mailgen({
      theme: 'default',
      product: {
        name: 'WorkableAI',
        link: ENV.FRONTEND_URL,
        logo: ENV.LOGO,
      },
    })
  }

  verificationEmailHTML({ name, link }) {
    var email = {
      body: {
        name,
        intro: "Welcome to WorkableAI We're very excited to have you on board.",
        action: {
          instructions:
            'We are happy you signed up for WorkableAI. To start exploring the WorkableAI App, please confirm your email address and create password by clicking below link:',
          button: {
            color: 'blue',
            text: 'Verify Email',
            link,
          },
        },
        outro:
          "Need help, or have questions? Just reply to this email, we'd love to help.",
      },
    }

    var emailHTML = this.mailGenerator.generate(email)
    var emailText = this.mailGenerator.generatePlaintext(email)

    return { emailHTML, emailText }
  }

  resetPasswordEmailHTML({ name, link }) {
    var email = {
      body: {
        name,
        intro: 'We received a request to reset your password on WorkableAI.',
        action: {
          instructions:
            "Click the button below to reset your password. If you didn't make this request, please ignore this email. The link below remain active for 1 hours.",
          button: {
            color: 'blue',
            text: 'Reset Password',
            link,
          },
        },
        outro:
          "If you have any questions, please don't hesitate to contact us.",
      },
    }

    var emailHTML = this.mailGenerator.generate(email)
    var emailText = this.mailGenerator.generatePlaintext(email)

    return { emailHTML, emailText }
  }
}

export default MailgenService
