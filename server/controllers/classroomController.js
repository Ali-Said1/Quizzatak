import asyncHandler from "../middleware/asyncHandler.js";
import * as classroomService from "../services/classroomService.js";

export const listClassrooms = asyncHandler(async (req, res) => {
  const classrooms = await classroomService.listClassroomsForUser(req.user);
  res.json(classrooms);
});

export const getClassroom = asyncHandler(async (req, res) => {
  const classroom = await classroomService.getClassroomForUser(
    req.user,
    req.params.id
  );
  res.json(classroom);
});

export const createClassroom = asyncHandler(async (req, res) => {
  const classroom = await classroomService.createClassroom(
    req.user,
    req.body.name
  );
  res.status(201).json(classroom);
});

export const joinClassroom = asyncHandler(async (req, res) => {
  const classroom = await classroomService.joinClassroom(
    req.user,
    req.body.joinCode
  );
  res.json(classroom);
});

export const updateClassroom = asyncHandler(async (req, res) => {
  const classroom = await classroomService.updateClassroom(
    req.user,
    req.params.id,
    req.body
  );
  res.json(classroom);
});

export const deleteClassroom = asyncHandler(async (req, res) => {
  await classroomService.deleteClassroom(req.user, req.params.id);
  res.json({ message: "Classroom deleted" });
});

export const listStudents = asyncHandler(async (req, res) => {
  const students = await classroomService.listStudents(req.user, req.params.id);
  res.json({ students });
});

export const removeStudent = asyncHandler(async (req, res) => {
  await classroomService.removeStudent(
    req.user,
    req.params.id,
    req.params.studentId
  );
  res.json({ message: "Student removed" });
});

export const leaveClassroom = asyncHandler(async (req, res) => {
  await classroomService.leaveClassroom(req.user, req.params.id);
  res.json({ message: "Left classroom" });
});

export const getStudentProgress = asyncHandler(async (req, res) => {
  const progress = await classroomService.getStudentProgress(
    req.user,
    req.params.id
  );
  res.json({ history: progress });
});
