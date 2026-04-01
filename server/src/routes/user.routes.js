import { Router } from "express";
import { getMe, updateMe, upsertProfile } from "../controllers/user.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

// All user routes require authentication
router.use(authenticate);

router.get("/me", getMe);
router.put("/me", updateMe);
router.post("/profile", upsertProfile);
router.put("/profile", upsertProfile); // Aliasing put and post for upsert

export default router;
