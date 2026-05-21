import express from "express"
import multer from "multer";
import { sendPromt, sendPromtStream } from "../controller/promt.controller.js";
import userMiddleware from "../middleware/promt.middleware.js";
import { validatePromt, validateAIParams } from "../middleware/validation.middleware.js";

const router = express.Router();

// Multer setup - store files in backend/uploads with original name prefixed by timestamp
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, 'uploads');
	},
	filename: function (req, file, cb) {
		const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
		const safeName = file.originalname.replace(/[^a-zA-Z0-9.\-\_]/g, '_');
		cb(null, uniqueSuffix + '-' + safeName);
	}
});

const upload = multer({ storage });

// Accept optional multiple images named 'images' (max 6)
router.post("/promt", upload.array('images', 6), userMiddleware, validatePromt, validateAIParams, sendPromt)
router.post("/promt/stream", upload.array('images', 6), userMiddleware, validatePromt, validateAIParams, sendPromtStream)

export default router;