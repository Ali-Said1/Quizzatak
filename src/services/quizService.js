import api from "./api.js";

const quizService = {
  // Get all quizzes (optionally server-side filters can be applied)
  async getAllQuizzes() {
    try {
      const { data } = await api.get("/quizzes");
      // backend may return { quizzes: [...] } or just an array
      return data.quizzes ?? data;
    } catch (error) {
      throw new Error(error.message || "Failed to fetch quizzes");
    }
  },

  // Get quizzes for a specific classroom
  async getQuizzesByClassroom(classroomId) {
    try {
      const { data } = await api.get(`/quizzes?classroomId=${classroomId}`);
      return data.quizzes ?? data;
    } catch (error) {
      throw new Error(error.message || "Failed to fetch quizzes for classroom");
    }
  },

  // Get a single quiz by ID (returns quiz template)
  async getQuizById(quizId) {
    try {
      const { data } = await api.get(`/quizzes/${quizId}`);
      return data.quiz ?? data;
    } catch (error) {
      throw new Error(error.message || "Failed to fetch quiz");
    }
  },

  // Create a new quiz (teacher only)
  // quizData = { title, classroomId, questions: [...] }
  async createQuiz(quizData) {
    try {
      const { data } = await api.post("/quizzes", quizData);
      return data.quiz ?? data;
    } catch (error) {
      throw new Error(error.message || "Failed to create quiz");
    }
  },

  // Update quiz metadata or questions (teacher only)
  async updateQuiz(quizId, updateData) {
    try {
      const { data } = await api.patch(`/quizzes/${quizId}`, updateData);
      return data.quiz ?? data;
    } catch (error) {
      throw new Error(error.message || "Failed to update quiz");
    }
  },

  // Delete quiz (teacher only)
  async deleteQuiz(quizId) {
    try {
      const { data } = await api.delete(`/quizzes/${quizId}`);
      return data;
    } catch (error) {
      throw new Error(error.message || "Failed to delete quiz");
    }
  },

  // Create a new game session (live instance) for a quiz
  async createGameSession(payload) {
    try {
      const { data } = await api.post("/game-sessions", payload);
      return data.gameSession ?? data;
    } catch (error) {
      throw new Error(error.message || "Failed to create game session");
    }
  },

  // Get all game sessions for a quiz
  async getGameSessionsForQuiz(quizId) {
    try {
      const { data } = await api.get(`/game-sessions?quizId=${quizId}`);
      return data.gameSessions ?? data;
    } catch (error) {
      throw new Error(error.message || "Failed to fetch game sessions");
    }
  },

  // Get a single game session by ID
  async getGameSessionById(gameSessionId) {
    try {
      const { data } = await api.get(`/game-sessions/${gameSessionId}`);
      return data.gameSession ?? data;
    } catch (error) {
      throw new Error(error.message || "Failed to fetch game session by ID");
    }
  },

  async lookupGameSession({ gameSessionId, pin, shareCode }) {
    try {
      const { data } = await api.get("/game-sessions/lookup", {
        params: { gameSessionId, pin, shareCode },
      });
      return data.gameSession ?? data;
    } catch (error) {
      throw new Error(error.message || "Failed to find game session");
    }
  },

  // Update a game session (e.g., change state or current question)
  async updateGameSession(gameSessionId, updateData) {
    try {
      const { data } = await api.patch(
        `/game-sessions/${gameSessionId}`,
        updateData
      );
      return data.gameSession ?? data;
    } catch (error) {
      throw new Error(error.message || "Failed to update game session");
    }
  },

  // Submit a student's submission (server should validate and compute score)
  async submitSubmission(submission) {
    try {
      const { data } = await api.post("/submissions", submission);
      return data.submission ?? data;
    } catch (error) {
      throw new Error(error.message || "Failed to submit answers");
    }
  },

  // Get all submissions for a game session (leaderboard)
  async getSubmissionsForGame(gameSessionId) {
    try {
      const { data } = await api.get(
        `/submissions?gameSessionId=${gameSessionId}`
      );
      return data.submissions ?? data;
    } catch (error) {
      throw new Error(error.message || "Failed to fetch submissions for game");
    }
  },

  // Get a single student's submission for a game session
  async getSubmissionForStudent(gameSessionId, studentId) {
    try {
      const { data } = await api.get(
        `/submissions?gameSessionId=${gameSessionId}&studentId=${studentId}`
      );
      // if array returned, return first
      if (Array.isArray(data)) return data[0] ?? null;
      return data.submission ?? data;
    } catch (error) {
      throw new Error(error.message || "Failed to fetch student submission");
    }
  },

  // Utility: check if student already answered a specific question
  async hasAnsweredQuestion(gameSessionId, studentId, questionId) {
    try {
      const { data } = await api.get(
        `/submissions?gameSessionId=${gameSessionId}&studentId=${studentId}`
      );
      const submission = Array.isArray(data)
        ? data[0]
        : data.submission ?? data;
      if (!submission) return false;
      return (
        submission.answers?.some((a) => a.questionId === questionId) ?? false
      );
    } catch (error) {
      throw new Error(error.message || "Failed to check answer status");
    }
  },
};

export default quizService;
