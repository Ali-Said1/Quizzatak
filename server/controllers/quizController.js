import asyncHandler from "../middleware/asyncHandler.js";
import * as quizService from "../services/quizService.js";

export const listQuizzes = asyncHandler(async (req, res) => {
  const quizzes = await quizService.listQuizzes(req.user, req.query);
  res.json({ quizzes });
});

export const getQuiz = asyncHandler(async (req, res) => {
  const quiz = await quizService.getQuizForUser(req.user, req.params.id);
  res.json({ quiz });
});

export const createQuiz = asyncHandler(async (req, res) => {
  const quiz = await quizService.createQuiz(req.user, req.body);
  res.status(201).json({ quiz });
});

export const updateQuiz = asyncHandler(async (req, res) => {
  const quiz = await quizService.updateQuiz(req.user, req.params.id, req.body);
  res.json({ quiz });
});

export const deleteQuiz = asyncHandler(async (req, res) => {
  await quizService.deleteQuiz(req.user, req.params.id);
  res.json({ message: "Quiz deleted" });
});
