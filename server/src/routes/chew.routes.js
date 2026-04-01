import { Router } from "express";
import {
  getAssignedPatients,
  getAlerts,
  getPatientProfile,
} from "../controllers/chew.controller.js";
import { authenticate, authorize } from "../middleware/auth.middleware.js";

const router = Router();

// Only CHEWs (and admins) can access these routes
router.use(authenticate, authorize("CHEW", "ADMIN"));

router.get("/patients", getAssignedPatients);
router.get("/alerts", getAlerts);
router.get("/patients/:id", getPatientProfile);

export default router;
