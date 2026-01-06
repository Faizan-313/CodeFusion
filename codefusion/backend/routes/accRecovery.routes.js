import express from "express"
import {
    verifyEmail,
    verifyResetCode,
    resetPassword
} from "../controllers/accRecovery.controller.js"

const router = express.Router();

router.post('/verify-email', verifyEmail)
router.post('/verify-reset-code', verifyResetCode)
router.post('/reset-password', resetPassword)

export default router;