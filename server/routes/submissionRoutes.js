import { Router } from "express";
import {
  createSubmission,
  listSubmissions,
} from "../controllers/submissionController.js";
import { authenticate, requireStudent } from "../middleware/authMiddleware.js";

const router = Router();

router.use(authenticate);

router.post("/", requireStudent, createSubmission);
router.get("/", listSubmissions);

export default router;
