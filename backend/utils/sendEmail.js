const nodeMailer = require("nodemailer");

const sendEmail = async (options) => {
    try {
        const transporter = nodeMailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false, // true for 465
            auth: {
                user: process.env.SMPT_MAIL,
                pass: process.env.SMPT_PASSWORD, // App Password if 2FA is enabled
            },
        });

        const mailOptions = {
            from: process.env.SMPT_MAIL,
            to: options.email,
            subject: options.subject,
            text: options.message,
        };

        const info = await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error("Error sending email:", error.message);
    }
};

module.exports = sendEmail;
