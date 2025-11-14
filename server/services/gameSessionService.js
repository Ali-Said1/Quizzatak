import GameSession from "../models/gameSessionModel.js";
import Classroom from "../models/classroomModel.js";
import Quiz from "../models/quizModel.js";
import { generateGamePin } from "../utils/index.js";
import { createHttpError } from "../utils/error.js";

const ensureUserCanAccessClassroom = async (user, classroomId) => {
  const classroom = await Classroom.findById(classroomId);
  if (!classroom) {
    throw createHttpError(404, "Classroom not found");
  }
  if (user.role === "teacher" && classroom.teacherId.toString() === user.id) {
    return classroom;
  }
  if (
    user.role === "student" &&
    classroom.studentIds.some((student) => student.id.toString() === user.id)
  ) {
    return classroom;
  }
  throw createHttpError(404, "Classroom not found");
};

const generateUniqueGamePin = async () => {
  let pin;
  let exists = true;
  while (exists) {
    pin = generateGamePin();
    exists = await GameSession.exists({ pin });
  }
  return pin;
};

export const createGameSession = async (teacher, payload) => {
  const { quizId, classroomId, pin } = payload;
  if (!quizId || !classroomId) {
    throw createHttpError(400, "quizId and classroomId are required");
  }
  const [quiz, classroom] = await Promise.all([
    Quiz.findById(quizId),
    Classroom.findById(classroomId),
  ]);
  if (
    !quiz ||
    !classroom ||
    quiz.teacherId.toString() !== teacher.id.toString() ||
    classroom.teacherId.toString() !== teacher.id.toString()
  ) {
    throw createHttpError(404, "Quiz or classroom not found");
  }
  const gamePin = pin || (await generateUniqueGamePin());
  const session = await GameSession.create({
    quizId,
    classroomId,
    hostId: teacher.id,
    pin: gamePin,
    state: "waiting",
    currentQuestionIndex: 0,
    connectedStudents: [],
  });
  return session.toJSON();
};

export const listGameSessions = async (user, filters = {}) => {
  const query = {};
  if (filters.quizId) {
    query.quizId = filters.quizId;
  }
  if (filters.classroomId) {
    query.classroomId = filters.classroomId;
  }
  const sessions = await GameSession.find(query).sort({ createdAt: -1 });
  const accessible = [];
  for (const session of sessions) {
    try {
      await ensureUserCanAccessClassroom(user, session.classroomId);
      accessible.push(session.toJSON());
    } catch {
      // ignore
    }
  }
  return accessible;
};

export const getSessionForUser = async (user, sessionId) => {
  const session = await GameSession.findById(sessionId);
  if (!session) {
    throw createHttpError(404, "Game session not found");
  }
  await ensureUserCanAccessClassroom(user, session.classroomId);
  return session.toJSON();
};

export const updateSessionState = async (teacher, sessionId, updates) => {
  const session = await GameSession.findById(sessionId);
  if (!session || session.hostId.toString() !== teacher.id.toString()) {
    throw createHttpError(404, "Game session not found");
  }
  if (updates.state) {
    session.state = updates.state;
    if (updates.state === "active") {
      session.startedAt = new Date();
      session.endedAt = null;
      session.currentQuestionIndex = 0;
    }
    if (updates.state === "ended") {
      session.endedAt = new Date();
    }
  }
  if (typeof updates.currentQuestionIndex === "number") {
    session.currentQuestionIndex = updates.currentQuestionIndex;
  }
  if (updates.questionStartedAt) {
    session.questionStartedAt = updates.questionStartedAt;
  }
  await session.save();
  return session.toJSON();
};

export const addConnectedStudent = async (sessionId, studentId) => {
  const session = await GameSession.findByIdAndUpdate(
    sessionId,
    { $addToSet: { connectedStudents: studentId } },
    { new: true }
  );
  return session?.toJSON();
};

export const setQuestionStart = async (sessionId) => {
  return GameSession.findByIdAndUpdate(
    sessionId,
    { questionStartedAt: new Date() },
    { new: true }
  );
};

export const endGame = async (sessionId) => {
  return GameSession.findByIdAndUpdate(
    sessionId,
    { state: "ended", endedAt: new Date() },
    { new: true }
  );
};
