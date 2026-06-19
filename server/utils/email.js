import nodemailer from 'nodemailer';

const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

export const sendEmail = async ({ to, subject, html }) => {
  try {
    // If credentials are not set, we bypass sending to prevent app crashes
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn("WARNING: EMAIL_USER or EMAIL_PASS is not set in .env. Email was not sent.");
      return false;
    }

    const transporter = createTransporter();

    const mailOptions = {
      from: `"CricAcademy OS" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully: ", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
};
