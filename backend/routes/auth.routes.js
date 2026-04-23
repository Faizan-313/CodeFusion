import express from "express"
import {
    login,
    register,
    logout,
    refreshAccessToken
} from "../controllers/auth.controller.js"
import authenticateToken from "../middlewares/auth.middleware.js"

const router = express.Router();

router.post('/login', login)
router.post('/register', register)


router.post('/logout', authenticateToken, logout);

router.post('/refresh-token', refreshAccessToken)

export default router;