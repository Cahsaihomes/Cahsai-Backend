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

/**
 * Send email with support for both HTML and plain text
 * @param {string} to - Recipient email address
 * @param {string} htmlContent - HTML content or plain text
 * @param {string} subject - Email subject line
 * @param {boolean} isHtml - Whether content is HTML (default: true if contains HTML tags)
 */
export default async function sendEmail(to, htmlContent, subject = "Notification", isHtml = true) {
  try {
    // Detect if content is HTML
    const contentIsHtml = isHtml || (typeof htmlContent === 'string' && htmlContent.includes('<'));
    
    const mailOptions = {
      from: `CAHSAI <${process.env.EMAIL_USER}>`,
      to,
      subject: subject || "Notification",
      ...(contentIsHtml 
        ? { html: htmlContent }
        : { text: htmlContent }
      ),
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${to} with subject: ${subject}`);
    return true;
  } catch (error) {
    console.error("❌ Email sending failed:", error.message);
    // Do NOT crash backend
    return false;
  }
}