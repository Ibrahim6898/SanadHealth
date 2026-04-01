import { Router } from "express";
import { openChat } from "../controllers/ai.controller.js";
import { createAssessment } from "../controllers/assessment.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

router.use(authenticate);

router.post("/chat", openChat);
// As per design, /api/ai/assess is essentially the core assessment endpoint.
// We can just alias or reuse the assessment controller function.
router.post("/assess", createAssessment);

export default router;
