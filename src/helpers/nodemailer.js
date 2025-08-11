const nodemailer = require("nodemailer");
const { customError } = require("./customError");
require("dotenv").config();
 
// Create a test account or replace with real credentials.
const transporter = nodemailer.createTransport({
  service: "gmail",
  secure: process.env.NODE_ENV=="development"? false :true, // true for 465, false for other ports
  auth: {
    user: process.env.HOST_MAIL, // generated ethereal user
    pass:process.env.APP_PASSWORD, // generated ethereal password
  },
});
exports.mailer=async(template,email)=>{
    try {
        const info = await transporter.sendMail({
    from: '"chamok it solutaion" <ch@mok@IT.email>',
    to: email,
    subject: "  Confirmed Registration ✔",
    html: template // HTML body
    })}
    catch (error) {
        throw new customError(501, "Email sending failed", error);
    }
}