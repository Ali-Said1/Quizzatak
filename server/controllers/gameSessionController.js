import asyncHandler from "../middleware/asyncHandler.js";
import * as gameSessionService from "../services/gameSessionService.js";
import { createHttpError } from "../utils/error.js";

export const createSession = asyncHandler(async (req, res) => {
  const gameSession = await gameSessionService.createGameSession(
    req.user,
    req.body
  );
  res.status(201).json({ gameSession });
});

export const listSessions = asyncHandler(async (req, res) => {
  const gameSessions = await gameSessionService.listGameSessions(
    req.user,
    req.query
  );
  res.json({ gameSessions });
});

export const getSession = asyncHandler(async (req, res) => {
  const gameSession = await gameSessionService.getSessionForUser(
    req.user,
    req.params.id
  );
  res.json({ gameSession });
});

export const updateSession = asyncHandler(async (req, res) => {
  const gameSession = await gameSessionService.updateSessionState(
    req.user,
    req.params.id,
    req.body
  );
  res.json({ gameSession });
});

export const publicLookupSession = asyncHandler(async (req, res) => {
  const { gameSessionId, pin, shareCode } = req.query;
  if (!gameSessionId && !pin && !shareCode) {
    throw createHttpError(400, "Provide gameSessionId, pin, or shareCode");
  }
  const session = await gameSessionService.publicLookupSession({
    gameSessionId,
    pin,
    shareCode,
  });
  if (!session) {
    throw createHttpError(404, "Game session not found");
  }
  res.json({
    gameSession: {
      id: session.id,
      pin: session.pin,
      state: session.state,
      quizId: session.quizId,
      classroomId: session.classroomId,
      shareCode: session.shareCode,
    },
  });
});
