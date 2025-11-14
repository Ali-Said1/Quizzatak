import { Router } from "express";
import {
  listQuizzes,
  getQuiz,
  createQuiz,
  updateQuiz,
  deleteQuiz,
} from "../controllers/quizController.js";
import { authenticate, requireTeacher } from "../middleware/authMiddleware.js";

const router = Router();

router.use(authenticate);

router.get("/", listQuizzes);
router.get("/:id", getQuiz);
router.post("/", requireTeacher, createQuiz);
router.patch("/:id", requireTeacher, updateQuiz);
router.delete("/:id", requireTeacher, deleteQuiz);

export default router;
