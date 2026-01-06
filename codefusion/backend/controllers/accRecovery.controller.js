import { User } from "../models/user.model.js";

// verify email and send the reset code in email
const verifyEmail = async (req, res) => {
    try {
        const  {email} = req.body;
        if(!email || email.trim() == ""){
            return res.status(400).json({ message: "Email is required" });
        }
        const user = await User.findOne({ email: email.toLowerCase() });
        if(!user){
            return res.status(400).json({ message: "We count not find any account linked to this email" })
        }

    } catch (error) {
        console.log("Error in verifying email: ", error)
        return res.status(500).json({ message: "Something went wrong" })
    }
}

//verify the reset code 
const verifyResetCode = async (req, res) =>{
    try {
        
    } catch (error) {
        console.log("Error in verifying reset code: ", error)
        return res.status(500).json({ message: "Something went wrong" })
    }
}

//update db with new password
const resetPassword = async (req, res) => {
    try {
        
    } catch (error) {
        console.log("Error in reseting password: ", error)
        return res.status(500).json({ message: "Something went wrong" })
    }
}

export {
    verifyEmail,
    verifyResetCode,
    resetPassword
}