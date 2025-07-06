import Mailgen from 'mailgen'

import { ENV } from '../../config/index.js'

class MailgenService {
  constructor() {
    this.mailGenerator = new Mailgen({
      theme: 'default',
      product: {
        name: ENV.PROJECT_NAME,
        link: ENV.FRONTEND_URL,
        logo: ENV.LOGO,
      },
    })
  }

  verificationEmailHTML({ name, link }) {
    var email = {
      body: {
        name,
        intro: `Welcome to ${ENV.PROJECT_NAME} We're very excited to have you on board.`,
        action: {
          instructions: `We are happy you signed up for ${ENV.PROJECT_NAME}. To start exploring the ${ENV.PROJECT_NAME} App, please confirm your email address and create password by clicking below link:`,
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
        intro: `We received a request to reset your password on ${ENV.PROJECT_NAME}.`,
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

  contactEmailHTML({ contact }) {
    const { firstName, lastName, email, message, interestArea } = contact

    const emailContent = {
      body: {
        intro: `A new contact submission was received on ${ENV.PROJECT_NAME}.`,
        table: {
          data: [
            {
              ['First Name']: firstName || 'N/A',
              ['Last Name']: lastName || 'N/A',
              Email: email || 'N/A',
              Message: message || 'No message provided',
              ['Interest Area']: interestArea,
            },
          ],
          columns: {
            customWidth: {
              ['First Name']: '10%',
              ['Last Name']: '10%',
              Email: '20%',
              ['Interest Area']: '20%',
              Message: '40%',
            },
            customAlignment: {
              ['First Name']: 'left',
              ['Last Name']: 'left',
              Email: 'left',
              ['Interest Area']: 'left',
              Message: 'left',
            },
          },
        },
        outro:
          'You can follow up with the user directly if needed. This is an automated message.',
      },
    }

    const emailHTML = this.mailGenerator.generate(emailContent)
    const emailText = this.mailGenerator.generatePlaintext(emailContent)

    return { emailHTML, emailText }
  }
}

export default MailgenService
