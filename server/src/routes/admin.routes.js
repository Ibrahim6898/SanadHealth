import express from "express";
import { authenticate, authorize } from "../middleware/auth.middleware.js";
import { getAllUsers, assignPatient, removeAssignment } from "../controllers/admin.controller.js";

const router = express.Router();

router.use(authenticate);
router.use(authorize("ADMIN"));

router.get("/users", getAllUsers);
router.post("/assign", assignPatient);
router.post("/unassign", removeAssignment);

export default router;
