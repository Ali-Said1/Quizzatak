import { Router } from "express";
import {
  listClassrooms,
  getClassroom,
  createClassroom,
  joinClassroom,
  updateClassroom,
  deleteClassroom,
  listStudents,
  removeStudent,
  leaveClassroom,
} from "../controllers/classroomController.js";
import {
  authenticate,
  requireTeacher,
  requireStudent,
} from "../middleware/authMiddleware.js";

const router = Router();

router.use(authenticate);

router.get("/", listClassrooms);
router.get("/:id", getClassroom);
router.post("/", requireTeacher, createClassroom);
router.post("/join", requireStudent, joinClassroom);
router.patch("/:id", requireTeacher, updateClassroom);
router.delete("/:id", requireTeacher, deleteClassroom);
router.get("/:id/students", requireTeacher, listStudents);
router.delete("/:id/students/:studentId", requireTeacher, removeStudent);
router.post("/:id/leave", requireStudent, leaveClassroom);

export default router;
