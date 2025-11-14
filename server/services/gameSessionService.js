import mongoose from "mongoose";
import GameSession from "../models/gameSessionModel.js";
import Classroom from "../models/classroomModel.js";
import Quiz from "../models/quizModel.js";
import { generateGamePin, generateJoinCode } from "../utils/index.js";
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

const generateUniqueShareCode = async () => {
  let code;
  let exists = true;
  while (exists) {
    code = generateJoinCode();
    exists = await GameSession.exists({ shareCode: code });
  }
  return code;
};

export const updateQuizLifecycle = async (quizId, updates = {}) => {
  if (!quizId) return null;
  const payload = Object.entries(updates).reduce((acc, [key, value]) => {
    if (value !== undefined) {
      acc[key] = value;
    }
    return acc;
  }, {});
  if (!Object.keys(payload).length) {
    return null;
  }
  return Quiz.findByIdAndUpdate(quizId, payload, { new: true });
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
  if (quiz.status && quiz.status !== "draft") {
    throw createHttpError(400, "This quiz has already been run");
  }
  // Prefer a pending session stored on the quiz if one exists and is still waiting.
  if (quiz.pendingSessionId) {
    const pending = await GameSession.findById(quiz.pendingSessionId);
    if (pending && pending.state === "waiting") {
      return pending.toJSON();
    }
    await updateQuizLifecycle(quiz._id, { pendingSessionId: null });
  }
  // Fall back to the most recent waiting session for this quiz/classroom pair.
  const existingWaiting = await GameSession.findOne({
    quizId,
    classroomId,
    state: "waiting",
  })
    .sort({ createdAt: -1 })
    .exec();
  if (existingWaiting) {
    await updateQuizLifecycle(quiz._id, {
      pendingSessionId: existingWaiting._id,
      activeSessionId: null,
    });
    return existingWaiting.toJSON();
  }
  const gamePin = pin || (await generateUniqueGamePin());
  const shareCode = await generateUniqueShareCode();
  const session = await GameSession.create({
    quizId,
    classroomId,
    hostId: teacher.id,
    pin: gamePin,
    shareCode,
    state: "waiting",
    currentQuestionIndex: 0,
    connectedStudents: [],
  });
  await updateQuizLifecycle(quiz._id, {
    pendingSessionId: session._id,
    activeSessionId: null,
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
  const session = await GameSession.findById(sessionId).populate(
    "connectedStudents",
    "username email role"
  );
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
      await updateQuizLifecycle(session.quizId, {
        status: "live",
        pendingSessionId: null,
        activeSessionId: session._id,
      });
    }
    if (updates.state === "ended") {
      session.endedAt = new Date();
      await updateQuizLifecycle(session.quizId, {
        status: "completed",
        activeSessionId: null,
      });
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
  const session = await GameSession.findByIdAndUpdate(
    sessionId,
    { state: "ended", endedAt: new Date() },
    { new: true }
  );
  if (session) {
    await updateQuizLifecycle(session.quizId, {
      status: "completed",
      activeSessionId: null,
    });
    return session.toJSON();
  }
  return null;
};

export const publicLookupSession = async ({
  gameSessionId,
  pin,
  shareCode,
}) => {
  if (gameSessionId && mongoose.Types.ObjectId.isValid(gameSessionId)) {
    const session = await GameSession.findById(gameSessionId);
    if (session && (!pin || session.pin === pin)) {
      return session.toJSON();
    }
  }
  if (shareCode) {
    const session = await GameSession.findOne({
      shareCode: shareCode.trim().toUpperCase(),
    });
    if (session && (!pin || session.pin === pin)) {
      return session.toJSON();
    }
  }
  if (pin) {
    const session = await GameSession.findOne({ pin });
    return session?.toJSON() ?? null;
  }
  return null;
};
