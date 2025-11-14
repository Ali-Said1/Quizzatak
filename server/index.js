import http from "http";
import process from "process";
import { Server } from "socket.io";
import app from "./app.js";
import connectDatabase from "./config/database.js";
import { createCorsOptions, env } from "./config/index.js";
import registerSocketHandlers from "./socket/index.js";

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    ...createCorsOptions(),
    methods: ["GET", "POST", "PATCH", "DELETE"],
    transports: ["websocket", "polling"],
  },
});

registerSocketHandlers(io);

const startServer = async () => {
  try {
    await connectDatabase();
    server.listen(env.PORT, () => {
      console.log(`Quizzatak API listening on port ${env.PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server", error);
    process.exit(1);
  }
};

startServer();
/* Legacy in-memory implementation retained for reference
  questionId,
  answerIndex,
  timeSpent,
}) => {
  const session = findGameSession(gameSessionId);
  const quiz = session ? findQuizById(session.quizId) : null;
  const question = quiz?.questions?.find((q) => q.id === questionId);
  const submission = getOrCreateSubmission(
    gameSessionId,
    studentId,
    studentName
  );
  const existing = submission.answers.find(
});

app.post("/auth/logout", (req, res) => {
  const token = getCookie(req, "refreshToken");
  clearRefreshToken(token);
  res.clearCookie("refreshToken", COOKIE_OPTIONS);
  res.json({ message: "Logged out" });
});

app.get("/auth/me", authMiddleware, (req, res) => {
  res.json({ user: sanitizeUser(req.user) });
});

app.post("/auth/refresh", (req, res) => {
  const token = getCookie(req, "refreshToken");
  const userId = verifyRefreshToken(token);
  if (!userId) {
    return res.status(401).json({ message: "Invalid refresh token" });
  }
  const user = db.users.find((u) => u.id === userId);
  if (!user) {
    clearRefreshToken(token);
    return res.status(401).json({ message: "User not found" });
  }
  refreshTokens.delete(token);
  const newRefresh = createRefreshToken(userId);
  setRefreshCookie(res, newRefresh);
  const newAccess = createToken(userId);
  res.json({ token: newAccess });
});

app.patch("/auth/profile", authMiddleware, (req, res) => {
  const { username, email } = req.body || {};
  if (
    email &&
    db.users.some((u) => u.email === email && u.id !== req.user.id)
  ) {
    return res.status(409).json({ message: "Email already in use" });
  }
  if (username) req.user.username = username.trim();
  if (email) req.user.email = email.trim().toLowerCase();
  res.json({ user: sanitizeUser(req.user) });
});

app.post("/auth/change-password", authMiddleware, (req, res) => {
  const { currentPassword, newPassword } = req.body || {};
  if (!currentPassword || !newPassword) {
    return res
      .status(400)
      .json({ message: "currentPassword and newPassword are required" });
  }
  if (!verifyPassword(currentPassword, req.user.passwordHash)) {
    return res.status(400).json({ message: "Current password is incorrect" });
  }
  req.user.passwordHash = hashPassword(newPassword);
  res.json({ message: "Password updated" });
});

// ---------- Classroom Routes ----------
app.get("/classrooms", authMiddleware, (req, res) => {
  let classrooms;
  if (req.user.role === "teacher") {
    classrooms = db.classrooms.filter((c) => c.teacherId === req.user.id);
  } else {
    classrooms = db.classrooms.filter((c) =>
      c.studentIds.some((student) => student.id === req.user.id)
    );
  }
  res.json(classrooms.map(enrichClassroom));
});

app.get("/classrooms/:id", authMiddleware, (req, res) => {
  const classroom = findClassroomById(req.params.id);
  if (!userCanAccessClassroom(req.user, classroom)) {
    return res.status(404).json({ message: "Classroom not found" });
  }
  res.json(enrichClassroom(classroom));
});

app.post("/classrooms", authMiddleware, requireTeacher, (req, res) => {
  const { name } = req.body || {};
  if (!name) {
    return res.status(400).json({ message: "Classroom name is required" });
  }
  const joinCode = ensureUnique(generateJoinCode, (code) =>
    db.classrooms.some((c) => c.joinCode === code)
  );
  const classroom = {
    id: randomId(),
    name: name.trim(),
    joinCode,
    teacherId: req.user.id,
    studentIds: [],
    quizIds: [],
    createdAt: nowISO(),
  };
  db.classrooms.push(classroom);
  req.user.classrooms.push(classroom.id);
  res.status(201).json(enrichClassroom(classroom));
});

app.post("/classrooms/join", authMiddleware, requireStudent, (req, res) => {
  const { joinCode } = req.body || {};
  if (!joinCode) {
    return res.status(400).json({ message: "joinCode is required" });
  }
  const classroom = db.classrooms.find(
    (c) => c.joinCode.toUpperCase() === joinCode.trim().toUpperCase()
  );
  if (!classroom) {
    return res.status(404).json({ message: "Classroom not found" });
  }
  if (!classroom.studentIds.some((s) => s.id === req.user.id)) {
    classroom.studentIds.push({
      id: req.user.id,
      name: req.user.username,
      score: 0,
      submissions: [],
    });
    req.user.classrooms.push(classroom.id);
  }
  res.json(enrichClassroom(classroom));
});

app.patch("/classrooms/:id", authMiddleware, requireTeacher, (req, res) => {
  const classroom = findClassroomById(req.params.id);
  if (!classroom || classroom.teacherId !== req.user.id) {
    return res.status(404).json({ message: "Classroom not found" });
  }
  const { name } = req.body || {};
  if (name) classroom.name = name.trim();
  res.json(enrichClassroom(classroom));
});

app.delete("/classrooms/:id", authMiddleware, requireTeacher, (req, res) => {
  const classroom = findClassroomById(req.params.id);
  if (!classroom || classroom.teacherId !== req.user.id) {
    return res.status(404).json({ message: "Classroom not found" });
  }
  const sessionsToRemove = db.gameSessions
    .filter((session) => session.classroomId === classroom.id)
    .map((session) => session.id);
  db.classrooms = db.classrooms.filter((c) => c.id !== classroom.id);
  db.quizzes = db.quizzes.filter((quiz) => quiz.classroomId !== classroom.id);
  db.gameSessions = db.gameSessions.filter(
    (session) => session.classroomId !== classroom.id
  );
  db.submissions = db.submissions.filter(
    (submission) => !sessionsToRemove.includes(submission.gameSessionId)
  );
  db.users.forEach((user) => {
    user.classrooms = user.classrooms.filter((id) => id !== classroom.id);
  });
  res.json({ message: "Classroom deleted" });
});

app.get(
  "/classrooms/:id/students",
  authMiddleware,
  requireTeacher,
  (req, res) => {
    const classroom = findClassroomById(req.params.id);
    if (!classroom || classroom.teacherId !== req.user.id) {
      return res.status(404).json({ message: "Classroom not found" });
    }
    res.json({ students: classroom.studentIds });
  }
);

app.delete(
  "/classrooms/:id/students/:studentId",
  authMiddleware,
  requireTeacher,
  (req, res) => {
    const classroom = findClassroomById(req.params.id);
    if (!classroom || classroom.teacherId !== req.user.id) {
      return res.status(404).json({ message: "Classroom not found" });
    }
    classroom.studentIds = classroom.studentIds.filter(
      (student) => student.id !== req.params.studentId
    );
    const student = db.users.find((u) => u.id === req.params.studentId);
    if (student) {
      student.classrooms = student.classrooms.filter(
        (id) => id !== classroom.id
      );
    }
    res.json({ message: "Student removed" });
  }
);

app.post(
  "/classrooms/:id/leave",
  authMiddleware,
  requireStudent,
  (req, res) => {
    const classroom = findClassroomById(req.params.id);
    if (!classroom || !userCanAccessClassroom(req.user, classroom)) {
      return res.status(404).json({ message: "Classroom not found" });
    }
    classroom.studentIds = classroom.studentIds.filter(
      (student) => student.id !== req.user.id
    );
    req.user.classrooms = req.user.classrooms.filter(
      (id) => id !== classroom.id
    );
    res.json({ message: "Left classroom" });
  }
);

// ---------- Quiz Routes ----------
app.get("/quizzes", authMiddleware, (req, res) => {
  const { classroomId } = req.query;
  let quizzes = db.quizzes;

  if (classroomId) {
    quizzes = quizzes.filter((quiz) => quiz.classroomId === classroomId);
  }

  if (req.user.role === "teacher") {
    quizzes = quizzes.filter((quiz) => quiz.teacherId === req.user.id);
  } else {
    quizzes = quizzes.filter((quiz) => {
      const classroom = findClassroomById(quiz.classroomId);
      return classroom?.studentIds.some(
        (student) => student.id === req.user.id
      );
    });
  }

  res.json({ quizzes });
});

app.get("/quizzes/:id", authMiddleware, (req, res) => {
  const quiz = findQuizById(req.params.id);
  const classroom = quiz ? findClassroomById(quiz.classroomId) : null;
  if (!quiz || !userCanAccessClassroom(req.user, classroom)) {
    return res.status(404).json({ message: "Quiz not found" });
  }
  res.json({ quiz });
});

app.post("/quizzes", authMiddleware, requireTeacher, (req, res) => {
  const { title, classroomId, questions = [] } = req.body || {};
  if (!title || !classroomId) {
    return res
      .status(400)
      .json({ message: "title and classroomId are required" });
  }
  const classroom = findClassroomById(classroomId);
  if (!classroom || classroom.teacherId !== req.user.id) {
    return res.status(404).json({ message: "Classroom not found" });
  }
  const quiz = {
    id: randomId(),
    title: title.trim(),
    classroomId,
    teacherId: req.user.id,
    quizSubmissions: [],
    questions: ensureQuestionIds(questions),
    createdAt: nowISO(),
  };
  db.quizzes.push(quiz);
  classroom.quizIds.push(quiz.id);
  res.status(201).json({ quiz });
});

app.patch("/quizzes/:id", authMiddleware, requireTeacher, (req, res) => {
  const quiz = findQuizById(req.params.id);
  if (!quiz || quiz.teacherId !== req.user.id) {
    return res.status(404).json({ message: "Quiz not found" });
  }
  const { title, questions } = req.body || {};
  if (title) quiz.title = title.trim();
  if (questions) quiz.questions = ensureQuestionIds(questions);
  res.json({ quiz });
});

app.delete("/quizzes/:id", authMiddleware, requireTeacher, (req, res) => {
  const quiz = findQuizById(req.params.id);
  if (!quiz || quiz.teacherId !== req.user.id) {
    return res.status(404).json({ message: "Quiz not found" });
  }
  const relatedSessionIds = db.gameSessions.filter((session) => session.quizId === quiz.id).map((session) => session.id);
  db.quizzes = db.quizzes.filter((q) => q.id !== quiz.id);
  db.classrooms.forEach((classroom) => {
    classroom.quizIds = classroom.quizIds.filter((id) => id !== quiz.id);
  });
  db.gameSessions = db.gameSessions.filter(
  db.submissions = db.submissions.filter((submission) => !relatedSessionIds.includes(submission.gameSessionId));
  );
  db.submissions = db.submissions.filter(
    (submission) => submission.quizId !== quiz.id
  );
  res.json({ message: "Quiz deleted" });
});

// ---------- Game Sessions ----------
app.post("/game-sessions", authMiddleware, requireTeacher, (req, res) => {
  const { quizId, classroomId, pin } = req.body || {};
  if (!quizId || !classroomId) {
    return res
      .status(400)
      .json({ message: "quizId and classroomId are required" });
  }
  const quiz = findQuizById(quizId);
  const classroom = findClassroomById(classroomId);
  if (
    !quiz ||
    quiz.teacherId !== req.user.id ||
    !classroom ||
    classroom.teacherId !== req.user.id
  ) {
    return res.status(404).json({ message: "Quiz or classroom not found" });
  }
  const gamePin =
    pin ||
    ensureUnique(generateGamePin, (candidate) =>
      db.gameSessions.some((session) => session.pin === candidate)
    );
  const gameSession = {
    id: randomId(),
    quizId,
    classroomId,
    hostId: req.user.id,
    pin: gamePin,
    state: "waiting",
    currentQuestionIndex: 0,
    questionStartedAt: null,
    connectedStudents: [],
    startedAt: null,
    endedAt: null,
  };
  db.gameSessions.push(gameSession);
  res.status(201).json({ gameSession });
});

app.get("/game-sessions", authMiddleware, (req, res) => {
  const { quizId, classroomId } = req.query;
  let sessions = db.gameSessions;
  if (quizId)
    sessions = sessions.filter((session) => session.quizId === quizId);
  if (classroomId)
    sessions = sessions.filter(
      (session) => session.classroomId === classroomId
    );
  sessions = sessions.filter((session) => {
    const classroom = findClassroomById(session.classroomId);
    return userCanAccessClassroom(req.user, classroom);
  });
  res.json({ gameSessions: sessions });
});

app.get("/game-sessions/:id", authMiddleware, (req, res) => {
  const session = findGameSession(req.params.id);
  const classroom = session ? findClassroomById(session.classroomId) : null;
  if (!session || !userCanAccessClassroom(req.user, classroom)) {
    return res.status(404).json({ message: "Game session not found" });
  }
  res.json({ gameSession: session });
});

app.patch("/game-sessions/:id", authMiddleware, requireTeacher, (req, res) => {
  const session = findGameSession(req.params.id);
  if (!session || session.hostId !== req.user.id) {
    return res.status(404).json({ message: "Game session not found" });
  }
  const { state, currentQuestionIndex } = req.body || {};
  if (state) session.state = state;
  if (Number.isInteger(currentQuestionIndex))
    session.currentQuestionIndex = currentQuestionIndex;
  res.json({ gameSession: session });
});

// ---------- Submissions ----------
app.post("/submissions", authMiddleware, requireStudent, (req, res) => {
  const { gameSessionId, answers = [] } = req.body || {};
  if (!gameSessionId) {
    return res.status(400).json({ message: "gameSessionId is required" });
  }
  const session = findGameSession(gameSessionId);
  if (!session) {
    return res.status(404).json({ message: "Game session not found" });
  }
  const classroom = findClassroomById(session.classroomId);
  if (!userCanAccessClassroom(req.user, classroom)) {
    return res.status(403).json({ message: "Not enrolled in this classroom" });
  }
  answers.forEach((answer) => {
    applyAnswer({
      gameSessionId,
      studentId: req.user.id,
      studentName: req.user.username,
      questionId: answer.questionId,
      answerIndex: answer.answerIndex,
      timeSpent: answer.timeSpent,
    });
  });
  const submission = getOrCreateSubmission(
    gameSessionId,
    req.user.id,
    req.user.username
  );
  res.status(201).json({ submission });
});

app.get("/submissions", authMiddleware, (req, res) => {
  const { gameSessionId, studentId } = req.query;
  if (!gameSessionId) {
    return res.status(400).json({ message: "gameSessionId query is required" });
  }
  const session = findGameSession(gameSessionId);
  const classroom = session ? findClassroomById(session.classroomId) : null;
  if (!session || !userCanAccessClassroom(req.user, classroom)) {
    return res.status(404).json({ message: "Game session not found" });
  }
  if (studentId) {
    const submission = db.submissions.find(
      (sub) =>
        sub.gameSessionId === gameSessionId && sub.studentId === studentId
    );
    if (!submission) {
      return res.json(null);
    }
    if (req.user.role === "student" && req.user.id !== studentId) {
      return res
        .status(403)
        .json({ message: "Students can only view their submissions" });
    }
    return res.json({ submission });
  }
  res.json({ submissions: getLeaderboard(gameSessionId) });
});

// ---------- Socket.IO ----------
const emitQuestion = (session) => {
  const quiz = findQuizById(session.quizId);
  if (!quiz) return;
  const question = quiz.questions[session.currentQuestionIndex];
  if (!question) return;
  session.questionStartedAt = nowISO();
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

const emitQuestionEnded = (session) => {
  const quiz = findQuizById(session.quizId);
  if (!quiz) return;
  const question = quiz.questions[session.currentQuestionIndex];
  if (!question) return;
  io.to(session.id).emit("questionEnded", {
    correctAnswer: question.correct,
    leaderboard: getLeaderboard(session.id),
  });
};

const emitGameEnded = (session) => {
  io.to(session.id).emit("gameEnded", {
    finalLeaderboard: getLeaderboard(session.id),
  });
};

io.on("connection", (socket) => {
  socket.on("joinGame", ({ pin, gameSessionId, studentId, studentName }) => {
    const session = pin
      ? db.gameSessions.find((s) => s.pin === pin)
      : findGameSession(gameSessionId);
    if (!session) {
      socket.emit("error", { message: "Game session not found" });
      return;
    }
    socket.join(session.id);
    if (!session.connectedStudents.includes(studentId)) {
      session.connectedStudents.push(studentId);
    }
    io.to(session.id).emit("studentJoined", {
      studentId,
      studentName,
      totalStudents: session.connectedStudents.length,
    });
  });

  socket.on("startGame", ({ gameSessionId }) => {
    const session = findGameSession(gameSessionId);
    if (!session) return;
    session.state = "active";
    session.startedAt = nowISO();
    session.endedAt = null;
    session.currentQuestionIndex = 0;
    io.to(session.id).emit("gameStateUpdated", session);
    emitQuestion(session);
  });

  socket.on("nextQuestion", ({ gameSessionId }) => {
    const session = findGameSession(gameSessionId);
    if (!session) return;
    emitQuestionEnded(session);
    session.currentQuestionIndex += 1;
    const quiz = findQuizById(session.quizId);
    if (quiz && session.currentQuestionIndex < quiz.questions.length) {
      emitQuestion(session);
    } else {
      session.state = "ended";
      session.endedAt = nowISO();
      emitGameEnded(session);
    }
  });

  socket.on("endGame", ({ gameSessionId }) => {
    const session = findGameSession(gameSessionId);
    if (!session) return;
    session.state = "ended";
    session.endedAt = nowISO();
    emitGameEnded(session);
  });

  socket.on(
    "submitAnswer",
    ({
      gameSessionId,
      questionId,
      answerIndex,
      timeSpent,
      studentId,
      studentName,
    }) => {
      const session = findGameSession(gameSessionId);
      if (!session) return;
      applyAnswer({
        gameSessionId,
        studentId,
        studentName,
        questionId,
        answerIndex,
        timeSpent,
      });
      const totalAnswered = db.submissions.filter(
        (submission) => submission.gameSessionId === gameSessionId
      ).length;
      io.to(session.id).emit("answerReceived", {
        studentId,
        totalAnswered,
        totalStudents: session.connectedStudents.length,
      });
    }
  );
});

// Health route
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    timestamp: nowISO(),
    stats: {
      users: db.users.length,
      classrooms: db.classrooms.length,
      quizzes: db.quizzes.length,
      gameSessions: db.gameSessions.length,
    },
  });
});

const PORT = Number(process.env.PORT || 5000);
server.listen(PORT, () => {
  console.log(`Quizzatak API listening on port ${PORT}`);
});
*/
