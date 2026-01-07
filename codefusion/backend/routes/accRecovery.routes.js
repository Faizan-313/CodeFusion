import express from "express"
import {
    verifyEmail,
    verifyResetCode,
    resetPassword
} from "../controllers/accRecovery.controller.js"
import authenticateTempToken from "../middlewares/authReset.middleware.js";

const router = express.Router();

router.post('/verify-email', verifyEmail)
router.post('/verify-reset-code', authenticateTempToken, verifyResetCode)
router.post('/reset-password', authenticateTempToken, resetPassword)

export default router;