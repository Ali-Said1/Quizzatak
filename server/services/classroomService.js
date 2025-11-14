import mongoose from "mongoose";
import Classroom from "../models/classroomModel.js";
import Quiz from "../models/quizModel.js";
import GameSession from "../models/gameSessionModel.js";
import Submission from "../models/submissionModel.js";
import User from "../models/userModel.js";
import { generateJoinCode } from "../utils/index.js";
import { createHttpError } from "../utils/error.js";

const toObjectId = (value) => new mongoose.Types.ObjectId(value);

const withQuizzes = async (classroomDoc) => {
  if (!classroomDoc) return null;
  const classroom = classroomDoc.toJSON();
  const quizzes = await Quiz.find({ _id: { $in: classroom.quizIds } })
    .select(["title", "questions", "status"])
    .lean();
  return {
    ...classroom,
    quizzes: quizzes.map((quiz) => ({
      id: quiz._id.toString(),
      title: quiz.title,
      questionCount: quiz.questions.length,
      status: quiz.status || "draft",
    })),
  };
};

const userCanAccessClassroomDoc = (user, classroom) => {
  if (!user || !classroom) return false;
  if (user.role === "teacher") {
    return classroom.teacherId?.toString() === user.id?.toString();
  }
  return classroom.studentIds?.some(
    (student) => student.id?.toString() === user.id?.toString()
  );
};

const generateUniqueJoinCode = async () => {
  let code;
  let exists = true;
  while (exists) {
    code = generateJoinCode().toUpperCase();
    exists = await Classroom.exists({ joinCode: code });
  }
  return code;
};

export const listClassroomsForUser = async (user) => {
  const filter =
    user.role === "teacher"
      ? { teacherId: user.id }
      : { "studentIds.id": user.id };
  const classrooms = await Classroom.find(filter).sort({ createdAt: -1 });
  return Promise.all(classrooms.map(withQuizzes));
};

export const getClassroomForUser = async (user, classroomId) => {
  const classroom = await Classroom.findById(classroomId);
  if (!userCanAccessClassroomDoc(user, classroom)) {
    throw createHttpError(404, "Classroom not found");
  }
  return withQuizzes(classroom);
};

export const createClassroom = async (teacher, name) => {
  if (teacher.role !== "teacher") {
    throw createHttpError(403, "Teachers only");
  }
  if (!name) {
    throw createHttpError(400, "Classroom name is required");
  }
  const trimmedName = name.trim();
  const existingClassroom = await Classroom.findOne({
    teacherId: teacher.id,
    name: trimmedName,
  });
  if (existingClassroom) {
    throw createHttpError(409, "You already have a classroom with this name");
  }
  const joinCode = (await generateUniqueJoinCode()).toUpperCase();
  const classroom = await Classroom.create({
    name: trimmedName,
    joinCode,
    teacherId: teacher.id,
    studentIds: [],
    quizIds: [],
  });
  await User.findByIdAndUpdate(teacher.id, {
    $addToSet: { classrooms: classroom._id },
  });
  return withQuizzes(classroom);
};

export const joinClassroom = async (student, joinCode) => {
  if (!joinCode) {
    throw createHttpError(400, "joinCode is required");
  }
  const classroom = await Classroom.findOne({
    joinCode: joinCode.trim().toUpperCase(),
  });
  if (!classroom) {
    throw createHttpError(404, "Classroom not found");
  }
  const studentId = toObjectId(student.id);
  const exists = classroom.studentIds?.some(
    (s) => s.id.toString() === studentId.toString()
  );
  if (!exists) {
    classroom.studentIds.push({
      id: studentId,
      name: student.username,
      score: 0,
      submissions: [],
    });
    await classroom.save();
  }
  await User.findByIdAndUpdate(studentId, {
    $addToSet: { classrooms: classroom._id },
  });
  return withQuizzes(classroom);
};

export const updateClassroom = async (teacher, classroomId, payload) => {
  const classroom = await Classroom.findById(classroomId);
  if (!classroom || classroom.teacherId.toString() !== teacher.id.toString()) {
    throw createHttpError(404, "Classroom not found");
  }
  if (payload.name) {
    classroom.name = payload.name.trim();
  }
  await classroom.save();
  return withQuizzes(classroom);
};

export const deleteClassroom = async (teacher, classroomId) => {
  const classroom = await Classroom.findById(classroomId);
  if (!classroom || classroom.teacherId.toString() !== teacher.id.toString()) {
    throw createHttpError(404, "Classroom not found");
  }
  const sessions = await GameSession.find({
    classroomId: classroom._id,
  }).select("_id");
  const sessionIds = sessions.map((session) => session._id);
  await Submission.deleteMany({ gameSessionId: { $in: sessionIds } });
  await GameSession.deleteMany({ _id: { $in: sessionIds } });
  await Quiz.deleteMany({ classroomId: classroom._id });
  await Classroom.findByIdAndDelete(classroom._id);
  await User.updateMany(
    { classrooms: classroom._id },
    { $pull: { classrooms: classroom._id } }
  );
  return true;
};

export const listStudents = async (teacher, classroomId) => {
  const classroom = await Classroom.findById(classroomId);
  if (!classroom || classroom.teacherId.toString() !== teacher.id.toString()) {
    throw createHttpError(404, "Classroom not found");
  }
  return classroom.studentIds;
};

export const removeStudent = async (teacher, classroomId, studentId) => {
  const classroom = await Classroom.findById(classroomId);
  if (!classroom || classroom.teacherId.toString() !== teacher.id.toString()) {
    throw createHttpError(404, "Classroom not found");
  }
  const objectId = toObjectId(studentId);
  classroom.studentIds = classroom.studentIds.filter(
    (student) => student.id.toString() !== objectId.toString()
  );
  await classroom.save();
  await User.findByIdAndUpdate(objectId, {
    $pull: { classrooms: classroom._id },
  });
  return true;
};

export const leaveClassroom = async (student, classroomId) => {
  const classroom = await Classroom.findById(classroomId);
  if (!userCanAccessClassroomDoc(student, classroom)) {
    throw createHttpError(404, "Classroom not found");
  }
  classroom.studentIds = classroom.studentIds.filter(
    (member) => member.id.toString() !== student.id.toString()
  );
  await classroom.save();
  await User.findByIdAndUpdate(student.id, {
    $pull: { classrooms: classroom._id },
  });
  return true;
};

export const verifyClassroomAccess = async (user, classroomId) => {
  const classroom = await Classroom.findById(classroomId);
  if (!userCanAccessClassroomDoc(user, classroom)) {
    throw createHttpError(404, "Classroom not found");
  }
  return classroom;
};

export const isTeacherOfClassroom = async (teacherId, classroomId) => {
  const classroom = await Classroom.findOne({
    _id: classroomId,
    teacherId: teacherId,
  });
  return Boolean(classroom);
};

export const getStudentProgress = async (user, classroomId) => {
  if (user.role !== "student") {
    throw createHttpError(403, "Students only");
  }
  const classroom = await verifyClassroomAccess(user, classroomId);
  const sessions = await GameSession.find({ classroomId: classroom._id })
    .select(["_id", "quizId", "state", "endedAt"])
    .lean();
  if (!sessions.length) {
    return [];
  }
  const sessionMap = new Map(
    sessions.map((session) => [session._id.toString(), session])
  );
  const sessionIds = sessions.map((session) => session._id);
  const submissions = await Submission.find({
    studentId: toObjectId(user.id),
    gameSessionId: { $in: sessionIds },
  })
    .sort({ submittedAt: -1, createdAt: -1 })
    .lean();
  if (!submissions.length) {
    return [];
  }
  const quizIds = Array.from(
    new Set(
      sessions.map((session) => session.quizId?.toString()).filter(Boolean)
    )
  );
  const quizzes = await Quiz.find({ _id: { $in: quizIds } })
    .select(["title", "questions"])
    .lean();
  const quizMap = new Map(quizzes.map((quiz) => [quiz._id.toString(), quiz]));
  return submissions.map((submission) => {
    const session = sessionMap.get(submission.gameSessionId.toString());
    const quiz = session ? quizMap.get(session.quizId?.toString()) : null;
    return {
      submissionId: submission._id.toString(),
      gameSessionId: submission.gameSessionId.toString(),
      quizId: session?.quizId?.toString() || null,
      quizTitle: quiz?.title || "Untitled quiz",
      questionCount: quiz?.questions?.length || 0,
      totalScore: submission.totalScore,
      submittedAt: submission.submittedAt,
      sessionState: session?.state || "waiting",
      sessionEndedAt: session?.endedAt || null,
    };
  });
};
