import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
    service: 'gmail',  
    auth: {
        user: process.env.EMAIL_USER,      
        pass: process.env.EMAIL_PASS      
    },
});

// Verify connection (non-blocking - for logging purposes only)
transporter.verify((error) => {
    if (error) {
        console.error("Nodemailer verification warning:", error);
    } else {
        console.log("Nodemailer transport ready");
    }
});

export const sendEmail = async ({ to, subject, text, html }) => {
    try {
        const fromEmail = `CodeFusion Support <${process.env.EMAIL_USER}>`;
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