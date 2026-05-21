import express from "express"
import {signup,login,logout,googleLogin} from "../controller/user.controller.js"
import { validateSignup, validateLogin } from "../middleware/validation.middleware.js"

const router = express.Router();

router.post("/signup", validateSignup, signup)
router.post("/login", validateLogin, login)
router.get("/logout",logout)
router.post("/google-login", googleLogin)


export default router;