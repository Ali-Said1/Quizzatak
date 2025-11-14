import GameSession from "../models/gameSessionModel.js";
import Quiz from "../models/quizModel.js";
import Submission from "../models/submissionModel.js";
import {
  getLeaderboardForSocket,
  recordRealtimeAnswer,
} from "../services/submissionService.js";
import { updateQuizLifecycle } from "../services/gameSessionService.js";

const sessionTimers = new Map();

const clearQuestionTimer = (sessionId) => {
  const entry = sessionTimers.get(sessionId.toString());
  if (entry?.timeoutId) {
    clearTimeout(entry.timeoutId);
  }
  sessionTimers.delete(sessionId.toString());
};

async function advanceQuestion(io, sessionId, expectedIndex) {
  const session = await GameSession.findById(sessionId);
  if (!session || session.state !== "active") return;
  if (
    typeof expectedIndex === "number" &&
    session.currentQuestionIndex !== expectedIndex
  ) {
    return;
  }
  const quiz = await Quiz.findById(session.quizId);
  if (!quiz) return;
  const question = quiz.questions[session.currentQuestionIndex];
  if (!question) return;
  await emitQuestionEnded(io, session, quiz);
  session.currentQuestionIndex += 1;
  await session.save();
  io.to(session.id).emit("gameStateUpdated", session.toJSON());
  if (session.currentQuestionIndex < quiz.questions.length) {
    await emitQuestion(io, session, quiz);
    return;
  }
  session.state = "ended";
  session.endedAt = new Date();
  session.locked = true;
  await session.save();
  clearQuestionTimer(sessionId);
  await updateQuizLifecycle(session.quizId, {
    status: "completed",
    activeSessionId: null,
  });
  await emitGameEnded(io, session);
  io.to(session.id).emit("gameStateUpdated", session.toJSON());
}

const scheduleQuestionTimer = (io, session, question) => {
  clearQuestionTimer(session.id);
  const durationMs = Math.max(1, question.timer || 10) * 1000;
  const sessionId = session.id.toString();
  const questionIndex = session.currentQuestionIndex;
  const timeoutId = setTimeout(async () => {
    sessionTimers.delete(sessionId);
    await advanceQuestion(io, sessionId, questionIndex);
  }, durationMs);
  sessionTimers.set(sessionId, { timeoutId, questionIndex });
};

const buildQuestionPayload = (quiz, session, remainingSeconds) => {
  const question = quiz.questions[session.currentQuestionIndex];
  if (!question) return null;
  return {
    question: {
      id: question.id,
      text: question.text,
      options: question.options,
      timer: question.timer,
    },
    questionIndex: session.currentQuestionIndex,
    totalQuestions: quiz.questions.length,
    remainingSeconds:
      typeof remainingSeconds === "number" ? remainingSeconds : question.timer,
  };
};

const emitQuestion = async (io, session, quizDoc) => {
  const quiz = quizDoc || (await Quiz.findById(session.quizId));
  if (!quiz) return;
  const payload = buildQuestionPayload(quiz, session);
  if (!payload) return;
  session.questionStartedAt = new Date();
  await session.save();
  io.to(session.id).emit("questionStarted", payload);
  const question = quiz.questions[session.currentQuestionIndex];
  scheduleQuestionTimer(io, session, question);
};

const sendCurrentQuestionToSocket = async (socket, session) => {
  if (session.state !== "active") return;
  const quiz = await Quiz.findById(session.quizId);
  if (!quiz) return;
  const question = quiz.questions[session.currentQuestionIndex];
  if (!question) return;
  const startedAt = session.questionStartedAt?.getTime?.() || 0;
  const elapsedMs = Math.max(0, Date.now() - startedAt);
  const durationMs = Math.max(1, question.timer || 10) * 1000;
  const remainingSeconds = Math.max(
    0,
    Math.ceil((durationMs - elapsedMs) / 1000)
  );
  const payload = buildQuestionPayload(quiz, session, remainingSeconds);
  if (!payload) return;
  socket.emit("questionStarted", payload);
};

const resolveCorrectIndex = (question = {}) => {
  if (typeof question.correct === "number" && !Number.isNaN(question.correct)) {
    return question.correct;
  }
  const numericFromCorrect = Number(question.correct);
  if (!Number.isNaN(numericFromCorrect)) {
    return numericFromCorrect;
  }
  if (typeof question.correctOption !== "undefined") {
    const numericFromOption = Number(question.correctOption);
    if (!Number.isNaN(numericFromOption)) {
      return numericFromOption;
    }
  }
  return 0;
};

const emitQuestionEnded = async (io, session, quizDoc) => {
  const quiz = quizDoc || (await Quiz.findById(session.quizId));
  if (!quiz) return;
  const question = quiz.questions[session.currentQuestionIndex];
  if (!question) return;
  const correctIndex = resolveCorrectIndex(question);
  const leaderboard = await getLeaderboardForSocket(session._id);
  io.to(session.id).emit("questionEnded", {
    correctAnswer: correctIndex,
    question: {
      id: question.id,
      text: question.text,
      options: question.options,
    },
    leaderboard,
  });
};

const emitGameEnded = async (io, session) => {
  const leaderboard = await getLeaderboardForSocket(session._id);
  io.to(session.id).emit("gameEnded", {
    finalLeaderboard: leaderboard,
  });
};

const findSession = async ({ pin, gameSessionId }) => {
  if (pin) {
    const byPin = await GameSession.findOne({ pin });
    if (byPin) return byPin;
  }
  if (gameSessionId) {
    return GameSession.findById(gameSessionId);
  }
  return null;
};

const registerSocketHandlers = (io) => {
  io.on("connection", (socket) => {
    socket.on(
      "joinGame",
      async ({ pin, gameSessionId, studentId, studentName, isHost }) => {
        const session = await findSession({ pin, gameSessionId });
        if (!session) {
          socket.emit("error", { message: "Game session not found" });
          return;
        }
        socket.join(session.id);
        socket.emit("gameStateUpdated", session.toJSON());
        if (!isHost) {
          await GameSession.findByIdAndUpdate(
            session._id,
            {
              $addToSet: { connectedStudents: studentId },
            },
            { new: true }
          );
          const updatedSession = await GameSession.findById(session._id)
            .populate("connectedStudents", "username email")
            .lean();
          const totalStudents = updatedSession?.connectedStudents?.length ?? 0;
          io.to(session.id).emit("studentJoined", {
            studentId,
            studentName,
            totalStudents,
            roster:
              updatedSession?.connectedStudents?.map((student) => ({
                id: student.id,
                username: student.username,
                email: student.email,
              })) ?? [],
          });
        }
        await sendCurrentQuestionToSocket(socket, session);
      }
    );

    socket.on("startGame", async ({ gameSessionId }) => {
      const session = await GameSession.findById(gameSessionId);
      if (!session) return;
      if (session.hasStarted || session.state !== "waiting") {
        socket.emit("sessionLocked", {
          reason: session.hasStarted
            ? "This session already ran. Create a new game session to host again."
            : "Session is not ready to start yet.",
        });
        return;
      }
      clearQuestionTimer(session.id);
      session.state = "active";
      session.startedAt = new Date();
      session.endedAt = null;
      session.currentQuestionIndex = 0;
      session.hasStarted = true;
      session.locked = false;
      await session.save();
      await updateQuizLifecycle(session.quizId, {
        status: "live",
        pendingSessionId: null,
        activeSessionId: session._id,
      });
      io.to(session.id).emit("gameStateUpdated", session.toJSON());
      await emitQuestion(io, session);
    });

    socket.on("nextQuestion", async ({ gameSessionId }) => {
      const session = await GameSession.findById(gameSessionId);
      if (!session || session.state !== "active") return;
      clearQuestionTimer(session.id);
      await advanceQuestion(io, session.id, session.currentQuestionIndex);
    });

    socket.on("endGame", async ({ gameSessionId }) => {
      const session = await GameSession.findById(gameSessionId);
      if (!session) return;
      if (session.state === "ended") return;
      clearQuestionTimer(session.id);
      if (session.state === "active") {
        const quiz = await Quiz.findById(session.quizId);
        if (quiz) {
          await emitQuestionEnded(io, session, quiz);
        }
      }
      session.state = "ended";
      session.endedAt = new Date();
      session.locked = true;
      await session.save();
      await updateQuizLifecycle(session.quizId, {
        status: "completed",
        activeSessionId: null,
      });
      await emitGameEnded(io, session);
      io.to(session.id).emit("gameStateUpdated", session.toJSON());
    });

    socket.on(
      "submitAnswer",
      async ({
        gameSessionId,
        questionId,
        answerIndex,
        timeSpent,
        studentId,
        studentName,
      }) => {
        const session = await GameSession.findById(gameSessionId);
        if (!session || session.state !== "active") return;
        await recordRealtimeAnswer({
          gameSessionId: session._id,
          questionId,
          answerIndex,
          timeSpent,
          studentId,
          studentName,
        });
        const totalAnswered = await Submission.countDocuments({
          gameSessionId: session._id,
        });
        io.to(session.id).emit("answerReceived", {
          studentId,
          totalAnswered,
          totalStudents: session.connectedStudents.length,
        });
      }
    );
  });
};

export default registerSocketHandlers;
