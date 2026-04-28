import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,      
        pass: process.env.EMAIL_PASS      
    },
    connectionTimeout: 10000, // 10 seconds
    socketTimeout: 10000,   
    pool: {
        maxConnections: 1,
        maxMessages: 5
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