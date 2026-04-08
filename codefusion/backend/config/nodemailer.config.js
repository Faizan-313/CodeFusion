import nodemailer from "nodemailer"

let transporter;
let transporterError = null;

const transporter_instance = nodemailer.createTransport({
    service: 'gmail',  
    auth: {
        user: process.env.EMAIL_USER,      
        pass: process.env.EMAIL_PASS      
    },
});

transporter_instance.verify((error) => {
    if (error) {
        console.error("Nodemailer transporter error:", error);
        transporterError = error;
        transporter = null;
    } else {
        console.log("Nodemailer Connected");
        transporter = transporter_instance;
    }
});

export const sendEmail = async ({ to, subject, text, html }) => {
    try {
        if (!transporter || transporterError) {
            console.error("Transporter not initialized:", transporterError?.message);
            return { 
                success: false, 
                error: "Email service is not available." + (transporterError ? ` ${transporterError.message}` : "")
            };
        }
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