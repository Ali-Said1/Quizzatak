import Quiz from "../models/quizModel.js";
import Classroom from "../models/classroomModel.js";
import GameSession from "../models/gameSessionModel.js";
import Submission from "../models/submissionModel.js";
import { ensureQuestionIds } from "../utils/index.js";
import { createHttpError } from "../utils/error.js";

const ensureTeacherOwnsClassroom = async (teacherId, classroomId) => {
  const classroom = await Classroom.findOne({
    _id: classroomId,
    teacherId: teacherId,
  });
  if (!classroom) {
    throw createHttpError(404, "Classroom not found");
  }
  return classroom;
};

export const listQuizzes = async (user, filters = {}) => {
  const query = {};
  if (filters.classroomId) {
    query.classroomId = filters.classroomId;
  }

  if (user.role === "teacher") {
    query.teacherId = user.id;
    return Quiz.find(query).sort({ createdAt: -1 }).lean({ virtuals: true });
  }

  const classroomIds = await Classroom.find({ "studentIds.id": user.id })
    .distinct("_id")
    .exec();
  if (!classroomIds.length) {
    return [];
  }
  query.classroomId = query.classroomId || { $in: classroomIds };
  return Quiz.find(query).sort({ createdAt: -1 }).lean({ virtuals: true });
};

export const getQuizForUser = async (user, quizId) => {
  const quiz = await Quiz.findById(quizId);
  if (!quiz) {
    throw createHttpError(404, "Quiz not found");
  }
  if (user.role === "teacher" && quiz.teacherId.toString() === user.id) {
    return quiz.toJSON();
  }
  const classroom = await Classroom.findOne({
    _id: quiz.classroomId,
    "studentIds.id": user.id,
  });
  if (!classroom) {
    throw createHttpError(404, "Quiz not found");
  }
  return quiz.toJSON();
};

export const createQuiz = async (teacher, payload) => {
  const { title, classroomId, questions = [] } = payload;
  if (!title || !classroomId) {
    throw createHttpError(400, "title and classroomId are required");
  }
  await ensureTeacherOwnsClassroom(teacher.id, classroomId);
  const quiz = await Quiz.create({
    title: title.trim(),
    classroomId,
    teacherId: teacher.id,
    quizSubmissions: [],
    questions: ensureQuestionIds(questions),
  });
  await Classroom.findByIdAndUpdate(classroomId, {
    $addToSet: { quizIds: quiz._id },
  });
  return quiz.toJSON();
};

export const updateQuiz = async (teacher, quizId, payload) => {
  const quiz = await Quiz.findById(quizId);
  if (!quiz || quiz.teacherId.toString() !== teacher.id.toString()) {
    throw createHttpError(404, "Quiz not found");
  }
  if (payload.title) {
    quiz.title = payload.title.trim();
  }
  if (payload.questions) {
    quiz.questions = ensureQuestionIds(payload.questions);
  }
  await quiz.save();
  return quiz.toJSON();
};

export const deleteQuiz = async (teacher, quizId) => {
  const quiz = await Quiz.findById(quizId);
  if (!quiz || quiz.teacherId.toString() !== teacher.id.toString()) {
    throw createHttpError(404, "Quiz not found");
  }
  const sessions = await GameSession.find({ quizId: quiz._id }).select("_id");
  const sessionIds = sessions.map((session) => session._id);
  await Submission.deleteMany({ gameSessionId: { $in: sessionIds } });
  await GameSession.deleteMany({ _id: { $in: sessionIds } });
  await Quiz.findByIdAndDelete(quiz._id);
  await Classroom.updateMany(
    { quizIds: quiz._id },
    { $pull: { quizIds: quiz._id } }
  );
  return true;
};

export const findQuizById = async (quizId) => Quiz.findById(quizId);

export const findQuizLean = async (quizId) => Quiz.findById(quizId).lean();
