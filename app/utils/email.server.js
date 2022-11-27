const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export async function sendEmail({ to, subject, text, html }) {
  return sgMail
    .send({
      from: 'jmj@indieco.xyz',
      to,
      subject,
      text,
      html,
    })
}