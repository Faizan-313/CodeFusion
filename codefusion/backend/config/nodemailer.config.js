import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
    service: 'gmail',  
    auth: {
        user: process.env.EMAIL_USER,      
        pass: process.env.EMAIL_PASS      
    }
});

transporter.verify((error, success) => {
    if (error) {
        console.error("Nodemailer transporter error:", error);
    }else{
        console.log("Nodemailer Connected")
    }
});

export const sendEmail = async ({ to, subject, text, html }) => {
    try {
        const mailOptions = {
            from: "CodeFusion",
            to,
            subject,
            text,
            html
        };
        const info = await transporter.sendMail(mailOptions);
        // console.log("Email sent:", info.response);
        return { success: true };
    } catch (error) {
        console.error("Error sending email:", error);
        return { success: false, error: error.message };
    }
};