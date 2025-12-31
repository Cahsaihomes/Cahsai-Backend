// import nodemailer from "nodemailer";

// const transporter = nodemailer.createTransport({
//   service: "Gmail",
//   auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
// });

// export default async function sendEmail(to, subject) {
//   await transporter.sendMail({
//     from: process.env.EMAIL_USER,
//     to,
//     subject: "OTP Verification",
//     text: subject,
//   });
// }
import nodemailer from "nodemailer";
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
export default async function sendEmail(to, otp) {
  try {
    await transporter.sendMail({
      from: `Auth System <${process.env.EMAIL_USER}>`, // :white_check_mark: ALWAYS GMAIL
      to, // can be yopmail, gmail, anything
      subject: "OTP Verification",
      text: `Your OTP is: ${otp}`,
    });
  } catch (error) {
    console.error("Email sending failed:", error.message);
    // Do NOT crash backend
    return false;
  }
  return true;
}