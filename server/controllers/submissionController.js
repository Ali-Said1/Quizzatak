import asyncHandler from "../middleware/asyncHandler.js";
import * as submissionService from "../services/submissionService.js";

export const createSubmission = asyncHandler(async (req, res) => {
  const submission = await submissionService.submitAnswers(req.user, req.body);
  res.status(201).json({ submission });
});

export const listSubmissions = asyncHandler(async (req, res) => {
  const { gameSessionId, studentId } = req.query;
  if (!gameSessionId) {
    res.status(400).json({ message: "gameSessionId query is required" });
    return;
  }
  if (studentId) {
    const submission = await submissionService.getSubmissionForStudent(
      req.user,
      gameSessionId,
      studentId
    );
    res.json(submission ? { submission } : null);
    return;
  }
  const submissions = await submissionService.getLeaderboard(
    req.user,
    gameSessionId
  );
  res.json({ submissions });
});
