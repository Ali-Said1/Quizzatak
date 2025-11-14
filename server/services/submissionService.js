import mongoose from "mongoose";
import Submission from "../models/submissionModel.js";
import GameSession from "../models/gameSessionModel.js";
import Quiz from "../models/quizModel.js";
import Classroom from "../models/classroomModel.js";
import { createHttpError } from "../utils/error.js";

const { ObjectId } = mongoose.Types;

const calculatePoints = (question, timeSpentMs = 0) => {
  if (!question) return 0;
  const base = 1000;
  const maxTime = (question.timer || 10) * 1000;
  const timeSafe = Math.max(0, Math.min(timeSpentMs, maxTime));
  const speedBonus = Math.round(((maxTime - timeSafe) / maxTime) * 200);
  return base + speedBonus;
};

const toObjectId = (value) => {
  if (value instanceof ObjectId) return value;
  return new ObjectId(value);
};

const getOrCreateSubmission = async (gameSessionId, studentId, studentName) => {
  let submission = await Submission.findOne({ gameSessionId, studentId });
  if (!submission) {
    submission = await Submission.create({
      gameSessionId,
      studentId,
      studentName,
      answers: [],
      totalScore: 0,
      submittedAt: null,
    });
  }
  return submission;
};

const updateClassroomScoreboard = async (
  classroomId,
  studentId,
  studentName
) => {
  const sessions = await GameSession.find({ classroomId }).select("_id");
  const sessionIds = sessions.map((session) => session._id);
  if (!sessionIds.length) return;
  const totals = await Submission.aggregate([
    {
      $match: {
        gameSessionId: { $in: sessionIds },
        studentId: toObjectId(studentId),
      },
    },
    {
      $group: {
        _id: null,
        totalScore: { $sum: "$totalScore" },
      },
    },
  ]);
  const score = totals[0]?.totalScore || 0;
  const result = await Classroom.updateOne(
    { _id: classroomId, "studentIds.id": toObjectId(studentId) },
    {
      $set: {
        "studentIds.$.score": score,
        "studentIds.$.name": studentName,
      },
    }
  );
  if (!result.modifiedCount) {
    await Classroom.updateOne(
      { _id: classroomId },
      {
        $addToSet: {
          studentIds: {
            id: toObjectId(studentId),
            name: studentName,
            score,
            submissions: [],
          },
        },
      }
    );
  }
};

const ensureSessionAndAccess = async (user, gameSessionId) => {
  const session = await GameSession.findById(gameSessionId);
  if (!session) {
    throw createHttpError(404, "Game session not found");
  }
  const classroom = await Classroom.findById(session.classroomId);
  if (!classroom) {
    throw createHttpError(404, "Classroom not found");
  }
  const userId = user.id?.toString();
  if (user.role === "teacher" && classroom.teacherId.toString() === userId) {
    return { session, classroom };
  }
  const isStudent = classroom.studentIds.some(
    (student) => student.id.toString() === userId
  );
  if (!isStudent) {
    throw createHttpError(403, "Not enrolled in this classroom");
  }
  return { session, classroom };
};

export const submitAnswers = async (user, { gameSessionId, answers = [] }) => {
  if (!gameSessionId) {
    throw createHttpError(400, "gameSessionId is required");
  }
  const { session, classroom } = await ensureSessionAndAccess(
    user,
    gameSessionId
  );
  const quiz = await Quiz.findById(session.quizId);
  if (!quiz) {
    throw createHttpError(404, "Quiz not found");
  }

  const submission = await getOrCreateSubmission(
    session._id,
    toObjectId(user.id),
    user.username
  );

  answers.forEach((answer) => {
    const question = quiz.questions.find((q) => q.id === answer.questionId);
    const isCorrect = question?.correct === answer.answerIndex;
    const points = isCorrect ? calculatePoints(question, answer.timeSpent) : 0;
    const existing = submission.answers.find(
      (entry) => entry.questionId === answer.questionId
    );
    if (existing) {
      submission.totalScore -= existing.points;
      Object.assign(existing, {
        answerIndex: answer.answerIndex,
        isCorrect,
        timeSpent: answer.timeSpent,
        points,
      });
    } else {
      submission.answers.push({
        questionId: answer.questionId,
        answerIndex: answer.answerIndex,
        isCorrect,
        timeSpent: answer.timeSpent,
        points,
      });
    }
    submission.totalScore += points;
  });
  submission.studentName = user.username;
  submission.submittedAt = new Date();
  await submission.save();

  await updateClassroomScoreboard(classroom._id, user.id, user.username);

  return submission.toJSON();
};

export const getSubmissionForStudent = async (
  user,
  gameSessionId,
  studentId
) => {
  const { session } = await ensureSessionAndAccess(user, gameSessionId);
  if (user.role === "student" && user.id !== studentId) {
    throw createHttpError(403, "Students can only view their submissions");
  }
  const submission = await Submission.findOne({
    gameSessionId: session._id,
    studentId: toObjectId(studentId),
  });
  return submission ? submission.toJSON() : null;
};

export const getLeaderboard = async (user, gameSessionId) => {
  const { session } = await ensureSessionAndAccess(user, gameSessionId);
  const submissions = await Submission.find({ gameSessionId: session._id })
    .sort({ totalScore: -1 })
    .lean();
  return submissions.map((submission, index) => ({
    rank: index + 1,
    id: submission._id.toString(),
    studentId: submission.studentId.toString(),
    studentName: submission.studentName,
    totalScore: submission.totalScore,
    answers: submission.answers,
  }));
};

export const getLeaderboardForSocket = async (gameSessionId) => {
  const submissions = await Submission.find({ gameSessionId })
    .sort({ totalScore: -1 })
    .lean();
  return submissions.map((submission, index) => ({
    rank: index + 1,
    id: submission._id.toString(),
    studentId: submission.studentId.toString(),
    studentName: submission.studentName,
    totalScore: submission.totalScore,
    answers: submission.answers,
  }));
};

export const recordRealtimeAnswer = async ({
  gameSessionId,
  studentId,
  studentName,
  questionId,
  answerIndex,
  timeSpent,
}) => {
  const session = await GameSession.findById(gameSessionId);
  if (!session) {
    throw createHttpError(404, "Game session not found");
  }
  const quiz = await Quiz.findById(session.quizId);
  if (!quiz) {
    throw createHttpError(404, "Quiz not found");
  }
  const submission = await getOrCreateSubmission(
    session._id,
    toObjectId(studentId),
    studentName
  );
  const question = quiz.questions.find((q) => q.id === questionId);
  const isCorrect = question?.correct === answerIndex;
  const points = isCorrect ? calculatePoints(question, timeSpent) : 0;
  const existing = submission.answers.find(
    (entry) => entry.questionId === questionId
  );
  if (existing) {
    submission.totalScore -= existing.points;
    Object.assign(existing, { answerIndex, isCorrect, timeSpent, points });
  } else {
    submission.answers.push({
      questionId,
      answerIndex,
      isCorrect,
      timeSpent,
      points,
    });
  }
  submission.totalScore += points;
  submission.studentName = studentName;
  submission.submittedAt = new Date();
  await submission.save();
  await updateClassroomScoreboard(
    session.classroomId,
    toObjectId(studentId),
    studentName
  );
  return submission;
};
