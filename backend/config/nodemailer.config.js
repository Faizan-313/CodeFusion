import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    family: 4, // force IPv4 
    connectionTimeout: 30000,
    greetingTimeout: 30000,
    socketTimeout: 60000,
    tls: {
        rejectUnauthorized: false
    }
});

// Verify connection (for logging only)
transporter.verify((error) => {
    if (error) {
        console.error("Nodemailer verification warning:", error);
    } else {
        console.log("Nodemailer transport ready");
    }
});

export const sendEmail = async ({ to, subject, text, html }) => {
    try {
        const fromEmail = `Assessify Support <${process.env.EMAIL_USER}>`;
        const mailOptions = {
            from: fromEmail,
            to,
            subject,
            text,
            html
        };
        
        await transporter.sendMail(mailOptions);
        return { success: true };
    } catch (error) {
        console.error("Error sending email:", error);
        return { success: false, error: error.message };
    }
};