import express from "express";
import { processVoiceCommand } from "../controllers/aiController.js";

const router = express.Router();

router.post("/assistant", processVoiceCommand);

export default router;