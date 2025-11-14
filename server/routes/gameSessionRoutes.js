import { Router } from "express";
import {
  createSession,
  listSessions,
  getSession,
  updateSession,
} from "../controllers/gameSessionController.js";
import { authenticate, requireTeacher } from "../middleware/authMiddleware.js";

const router = Router();

router.use(authenticate);

router.post("/", requireTeacher, createSession);
router.get("/", listSessions);
router.get("/:id", getSession);
router.patch("/:id", requireTeacher, updateSession);

export default router;
