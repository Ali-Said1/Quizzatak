import asyncHandler from "../middleware/asyncHandler.js";
import * as gameSessionService from "../services/gameSessionService.js";

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
