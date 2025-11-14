import GameSession from "../models/gameSessionModel.js";
import Quiz from "../models/quizModel.js";
import Submission from "../models/submissionModel.js";
import {
  getLeaderboardForSocket,
  recordRealtimeAnswer,
} from "../services/submissionService.js";

const emitQuestion = async (io, session) => {
  const quiz = await Quiz.findById(session.quizId);
  if (!quiz) return;
  const question = quiz.questions[session.currentQuestionIndex];
  if (!question) return;
  session.questionStartedAt = new Date();
  await session.save();
  io.to(session.id).emit("questionStarted", {
    question: {
      id: question.id,
      text: question.text,
      options: question.options,
      timer: question.timer,
    },
    questionIndex: session.currentQuestionIndex,
    totalQuestions: quiz.questions.length,
  });
};

const emitQuestionEnded = async (io, session) => {
  const quiz = await Quiz.findById(session.quizId);
  if (!quiz) return;
  const question = quiz.questions[session.currentQuestionIndex];
  if (!question) return;
  const leaderboard = await getLeaderboardForSocket(session._id);
  io.to(session.id).emit("questionEnded", {
    correctAnswer: question.correct,
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
      async ({ pin, gameSessionId, studentId, studentName }) => {
        const session = await findSession({ pin, gameSessionId });
        if (!session) {
          socket.emit("error", { message: "Game session not found" });
          return;
        }
        socket.join(session.id);
        const updatedSession = await GameSession.findByIdAndUpdate(
          session._id,
          {
            $addToSet: { connectedStudents: studentId },
          },
          { new: true }
        );
        const totalStudents = updatedSession?.connectedStudents.length ?? 0;
        io.to(session.id).emit("studentJoined", {
          studentId,
          studentName,
          totalStudents,
        });
      }
    );

    socket.on("startGame", async ({ gameSessionId }) => {
      const session = await GameSession.findById(gameSessionId);
      if (!session) return;
      session.state = "active";
      session.startedAt = new Date();
      session.endedAt = null;
      session.currentQuestionIndex = 0;
      await session.save();
      io.to(session.id).emit("gameStateUpdated", session.toJSON());
      await emitQuestion(io, session);
    });

    socket.on("nextQuestion", async ({ gameSessionId }) => {
      const session = await GameSession.findById(gameSessionId);
      if (!session) return;
      await emitQuestionEnded(io, session);
      session.currentQuestionIndex += 1;
      const quiz = await Quiz.findById(session.quizId);
      if (quiz && session.currentQuestionIndex < quiz.questions.length) {
        await session.save();
        await emitQuestion(io, session);
      } else {
        session.state = "ended";
        session.endedAt = new Date();
        await session.save();
        await emitGameEnded(io, session);
      }
    });

    socket.on("endGame", async ({ gameSessionId }) => {
      const session = await GameSession.findById(gameSessionId);
      if (!session) return;
      session.state = "ended";
      session.endedAt = new Date();
      await session.save();
      await emitGameEnded(io, session);
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
        if (!session) return;
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
