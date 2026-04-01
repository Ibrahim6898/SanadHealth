import { Router } from "express";
import {
  createAssessment,
  getAssessments,
  getAssessmentById,
} from "../controllers/assessment.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

// Require auth for all endpoints
router.use(authenticate);

router.post("/", createAssessment);
router.get("/", getAssessments);
router.get("/:id", getAssessmentById);

export default router;
