import { Router } from "express";
import {
  createReading,
  getReadings,
  getReadingTrends,
} from "../controllers/reading.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

router.use(authenticate);

router.post("/", createReading);
router.get("/", getReadings);
router.get("/trends", getReadingTrends);

export default router;
