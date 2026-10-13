const pug = require('pug');
const nodemailer = require('nodemailer');
const htmlToText = require('html-to-text');

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = process.env.MAIL_FROM || `rideAlong <${process.env.EMAIL_FROM}>`;
  }

  //create a transporter
  newTransport() {
    if (process.env.RESEND_API_KEY) {
      return nodemailer.createTransport({
        host: process.env.RESEND_EMAIL_HOST || 'smtp.resend.com',
        port: Number(process.env.RESEND_EMAIL_PORT) || 465,
        secure: true,
        auth: {
          user: process.env.RESEND_EMAIL_USERNAME || 'resend',
          pass: process.env.RESEND_API_KEY,
        },
      });
    }
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async send(template, subject) {
    //render email
    const html = pug.renderFile(`${__dirname}/../views/emails/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject,
    });
    // Define the email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.convert(html),
    };
    //send email
    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to RideAlong!');
  }

  async sendPasswordReset() {
    await this.send('passwordReset', `Your password reset token (valid for 10 min)`);
  }
};
