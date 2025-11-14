import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Button, Card, Container, ListGroup } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";

import Header from "../../components/Header/Header";
import Spinner from "../../components/Spinner";
import { ThemeContext } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import quizService from "../../services/quizService";
import classroomService from "../../services/classroomService";
import { connectSocket, disconnectSocket, getSocket } from "../../services/socketClient";

import "./HostLive.css";

const HostLive = () => {
  const { gameSessionId } = useParams();
  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);
  const { user } = useAuth();
  const [session, setSession] = useState(null);
  const [classroom, setClassroom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [connectedCount, setConnectedCount] = useState(0);
  const [studentRoster, setStudentRoster] = useState([]);
  const [eventLog, setEventLog] = useState([]);
  const [busy, setBusy] = useState(false);
  const [phase, setPhase] = useState("waiting");
  const [questionPayload, setQuestionPayload] = useState(null);
  const [, setResultQuestion] = useState(null);
  const [, setCorrectAnswer] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [finalLeaderboard, setFinalLeaderboard] = useState([]);
  const [, setTimeLeft] = useState(0);
  const timerRef = useRef(null);
  const sessionRef = useRef(null);
  const questionPayloadRef = useRef(null);

  useEffect(() => {
    sessionRef.current = session;
  }, [session]);

  useEffect(() => {
    questionPayloadRef.current = questionPayload;
  }, [questionPayload]);

  const copyValue = (value, label) => {
    if (!value) return;
    if (typeof navigator !== "undefined" && navigator?.clipboard?.writeText) {
      navigator.clipboard
        .writeText(value)
        .then(() =>
          Swal.fire({
            toast: true,
            position: "top",
            timer: 1500,
            showConfirmButton: false,
            icon: "success",
            title: `${label} copied`,
          })
        )
        .catch(() =>
          Swal.fire({
            icon: "info",
            title: label,
            text: value,
          })
        );
      return;
    }
    Swal.fire({
      icon: "info",
      title: label,
      text: value,
    });
  };

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const sessionData = await quizService.getGameSessionById(gameSessionId);
        const quizData = await quizService.getQuizById(sessionData.quizId);
        setSession({ ...sessionData, quizTitle: quizData?.title });
        if (sessionData.state === "ended") {
          setPhase("ended");
        }
        const initialRoster =
          sessionData.connectedStudents?.map((student) => ({
            id: student.id,
            username: student.username,
            email: student.email,
          })) || [];
        setStudentRoster(initialRoster);
        setConnectedCount(initialRoster.length);
  const classroomData = await classroomService.getClassroomById(sessionData.classroomId);
        setClassroom(classroomData);
      } catch (error) {
        Swal.fire({ icon: "error", title: "Unable to load session", text: error.message });
        navigate("/dashboard");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [gameSessionId, navigate]);

  const sessionId = session?.id;
  const userId = user?.id;
  const hostName = user?.username || "Host";

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback(
    (seconds) => {
      stopTimer();
      const initial = Math.max(0, seconds || 0);
      setTimeLeft(initial);
      if (initial <= 0) return;
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            timerRef.current = null;
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    },
    [stopTimer]
  );

  useEffect(() => () => stopTimer(), [stopTimer]);

  useEffect(() => {
    if (!sessionId || !userId) return undefined;
    const socket = connectSocket();
    socket.emit("joinGame", {
      gameSessionId: sessionId,
      studentId: userId,
      studentName: hostName,
      isHost: true,
    });

    const handleStudentJoined = ({ totalStudents, roster }) => {
      setConnectedCount(totalStudents);
      if (Array.isArray(roster)) {
        setStudentRoster(roster);
      }
    };

    const handleGameStateUpdated = (payload) => {
      setSession((prev) => ({ ...prev, ...payload }));
      if (payload.state === "active") {
        setPhase("answering");
      }
      if (payload.state === "ended") {
        setPhase("ended");
        setQuestionPayload(null);
        setCorrectAnswer(null);
        stopTimer();
      }
      setEventLog((prev) => [
        { type: "state", message: `Game state: ${payload.state}` },
        ...prev,
      ]);
    };

    const handleQuestionStarted = (payload) => {
      setPhase("answering");
  setQuestionPayload(payload);
  setResultQuestion(payload);
      setCorrectAnswer(null);
      setFinalLeaderboard([]);
      const seconds =
        payload.remainingSeconds ?? payload.question?.timer ?? 10;
      startTimer(seconds);
      setEventLog((prev) => [
        {
          type: "question",
          message: `Question ${
            (payload.questionIndex ?? 0) + 1
          } started`,
        },
        ...prev,
      ]);
    };

    const handleQuestionEnded = ({ correctAnswer: correct, leaderboard: board, question }) => {
      stopTimer();
      setPhase("results");
  setCorrectAnswer(typeof correct === "number" ? correct : null);
      setLeaderboard(board || []);
      const latestQuestionPayload = questionPayloadRef.current;
      const latestSession = sessionRef.current;
      setResultQuestion((prev) => {
        if (latestQuestionPayload) return latestQuestionPayload;
        if (question) {
          return {
            question,
            questionIndex: prev?.questionIndex ?? latestSession?.currentQuestionIndex ?? 0,
            totalQuestions:
              prev?.totalQuestions ?? latestQuestionPayload?.totalQuestions ?? latestSession?.totalQuestions ?? 0,
          };
        }
        return prev;
      });
      setEventLog((prev) => [
        {
          type: "question",
          message: `Question ended. Correct option ${
            typeof correct === "number" ? correct + 1 : "?"
          }`,
        },
        ...prev,
      ]);
    };

    const handleSessionLocked = ({ reason }) => {
      Swal.fire({
        icon: "info",
        title: "Session locked",
        text: reason || "This quiz already ran. Create a new session to play again.",
      });
    };

    const handleGameEnded = ({ finalLeaderboard: board }) => {
      stopTimer();
      setPhase("ended");
      setFinalLeaderboard(board || []);
      setLeaderboard(board || []);
      setQuestionPayload(null);
      setCorrectAnswer(null);
      setEventLog((prev) => [
        { type: "state", message: "Game ended" },
        ...prev,
      ]);
    };

    socket.on("studentJoined", handleStudentJoined);
    socket.on("gameStateUpdated", handleGameStateUpdated);
    socket.on("questionStarted", handleQuestionStarted);
    socket.on("questionEnded", handleQuestionEnded);
    socket.on("gameEnded", handleGameEnded);
    socket.on("sessionLocked", handleSessionLocked);

    return () => {
      socket.off("studentJoined", handleStudentJoined);
      socket.off("gameStateUpdated", handleGameStateUpdated);
      socket.off("questionStarted", handleQuestionStarted);
      socket.off("questionEnded", handleQuestionEnded);
      socket.off("gameEnded", handleGameEnded);
      socket.off("sessionLocked", handleSessionLocked);
      disconnectSocket();
      stopTimer();
    };
  }, [sessionId, userId, hostName, startTimer, stopTimer]);

  const isHost = useMemo(() => {
    if (!session || !user) return false;
    return session.hostId?.toString?.() === user.id;
  }, [session, user]);

  const sendSocketCommand = (eventName) => {
    const socket = getSocket() || connectSocket();
    socket.emit(eventName, { gameSessionId: session.id });
  };

  const handleStart = () => {
    if (session?.state !== "waiting" || session?.hasStarted) return;
    setBusy(true);
    try {
      sendSocketCommand("startGame");
    } finally {
      setBusy(false);
    }
  };

  const handleNext = () => {
    setBusy(true);
    try {
      sendSocketCommand("nextQuestion");
    } finally {
      setBusy(false);
    }
  };

  const handleEnd = () => {
    setBusy(true);
    try {
      sendSocketCommand("endGame");
    } finally {
      setBusy(false);
    }
  };

  // const renderQuestionCard = () => {
  //   const activeQuestion = phase === "results" ? resultQuestion : questionPayload;
  //   if (phase === "waiting") {
  //     return (
  //       <div className="text-center py-4">
  //         <p className="mb-0">Waiting to start. Students will see the question here once you begin.</p>
  //       </div>
  //     );
  //   }
  //   if (!activeQuestion && phase !== "ended") {
  //     return (
  //       <div className="text-center py-4">
  //         <Spinner />
  //       </div>
  //     );
  //   }
  //   if (phase === "ended") {
  //     return (
  //       <div className="text-center py-4">
  //         <h5 className="mb-2">Quiz complete</h5>
  //         <p className="mb-0">Share the final leaderboard below and wrap up the session.</p>
  //       </div>
  //     );
  //   }

  // const total = activeQuestion?.question?.timer || 10;
  //   const progress = total ? ((total - timeLeft) / total) * 100 : 0;

  //   return (
  //     <div>
  //       <div className="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-2">
  //         <strong>
  //           Question { (activeQuestion?.questionIndex ?? 0) + 1 } / { activeQuestion?.totalQuestions }
  //         </strong>
  //         {phase === "answering" && (
  //           <span className="text-muted small">Time left: {timeLeft}s</span>
  //         )}
  //       </div>
  //       {phase === "answering" && (
  //         <ProgressBar now={progress} className="mb-3" />
  //       )}
  //       <p className="question-text">{activeQuestion?.question?.text}</p>
  //       <ul className="options-list">
  //         {activeQuestion?.question?.options?.map((opt, idx) => {
  //           const optionClasses = ["option-item"];
  //           if (phase === "results" && idx === correctAnswer) {
  //             optionClasses.push("correct");
  //           }
  //           return (
  //             <li key={idx} className={optionClasses.join(" ")}>
  //               {opt}
  //             </li>
  //           );
  //         })}
  //       </ul>
  //       {phase === "results" && typeof correctAnswer === "number" && (
  //         <p className="text-success mt-3 mb-0">
  //           Correct option: {correctAnswer + 1}
  //         </p>
  //       )}
  //     </div>
  //   );
  // };

  const lobbyLink = useMemo(() => {
    if (!session?.id) return "";
    try {
      const current = new URL(window.location.href);
      current.pathname = `/lobby/${session.id}`;
      current.search = "";
      current.hash = "";
      return current.toString();
    } catch {
      return `${window?.location?.origin || ""}/lobby/${session.id}`;
    }
  }, [session?.id]);

  if (loading) {
    return (
      <div className={`main-wrapper ${theme}`}>
        <Header />
        <Container className="py-5">
          <Spinner text="Loading live session..." />
        </Container>
      </div>
    );
  }

  if (!isHost) {
    return (
      <div className={`main-wrapper ${theme}`}>
        <Header />
        <Container className="py-5">
          <Card className="quiz-card p-4 text-center">
            <h4>You do not have permission to control this session.</h4>
            <Button className="mt-3" onClick={() => navigate(`/lobby/${gameSessionId}`)}>
              Go to student lobby
            </Button>
          </Card>
        </Container>
      </div>
    );
  }

  return (
    <div className={`main-wrapper host-live ${theme}`}>
      <Header />
      <Container fluid className="py-4 host-live-container">
        <Card className="quiz-card p-4 mb-4 host-controls-card">
          <Card.Body>
            <div className="host-live-main">
              <div className="host-live-left">
                <div className="host-primary-panel">
                  <div>
                    <h4 className="mb-3">Live Session Controls</h4>
                    <p className="mb-1"><strong>Quiz:</strong> {session.quizTitle || session.quizId}</p>
                    <p className="mb-4"><strong>Classroom:</strong> {classroom?.name}</p>

                    <div className="share-chips mb-3">
                      <div className="share-chip">
                        <div className="label">Game Code</div>
                        <div className="value">{session.shareCode}</div>
                        <Button
                          size="sm"
                          variant="outline-light"
                          onClick={() => copyValue(session.shareCode, "Game Code")}
                        >
                          <i className="bi bi-clipboard" /> Copy
                        </Button>
                      </div>
                      <div className="share-chip">
                        <div className="label">PIN</div>
                        <div className="value">{session.pin}</div>
                        <Button
                          size="sm"
                          variant="outline-light"
                          onClick={() => copyValue(session.pin, "PIN")}
                        >
                          <i className="bi bi-clipboard" /> Copy
                        </Button>
                      </div>
                    </div>

                    <Button
                      className="lobby-link-btn mb-4"
                      variant="outline-info"
                      onClick={() => copyValue(lobbyLink, "Game Link")}
                      disabled={!lobbyLink}
                    >
                      <div className="d-flex align-items-center gap-3 text-start">
                        <span className="lobby-link-icon">🔗</span>
                        <div>
                          <div className="fw-bold">Share Lobby Link</div>
                          <small className="d-block text-muted">
                            Copies the lobby URL for students
                          </small>
                        </div>
                      </div>
                    </Button>
                  </div>

                  <div>
                    <div className="host-cta-grid">
                      <Button
                        className="host-cta start"
                        variant="success"
                        disabled={session.state !== "waiting" || session.hasStarted || busy}
                        onClick={handleStart}
                      >
                        <span className="cta-icon">▶</span>
                        <div>
                          <div className="cta-title">Start Game</div>
                          <small>Push question 1 to players</small>
                        </div>
                      </Button>
                      <Button
                        className="host-cta next"
                        variant="warning"
                        disabled={session.state !== "active" || busy}
                        onClick={handleNext}
                      >
                        <span className="cta-icon">⏭</span>
                        <div>
                          <div className="cta-title">Next Question</div>
                          <small>Advance to the next slide</small>
                        </div>
                      </Button>
                      <Button
                        className="host-cta end"
                        variant="danger"
                        disabled={session.state === "ended" || busy}
                        onClick={handleEnd}
                      >
                        <span className="cta-icon">■</span>
                        <div>
                          <div className="cta-title">End Game</div>
                          <small>Publish final leaderboard</small>
                        </div>
                      </Button>
                    </div>
                    {session.hasStarted && session.state === "ended" && (
                      <p className="text-warning small mt-2 mb-0">
                        This live session has finished. Create a new session from the quiz builder to run it again.
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <div className="host-live-right">
                <div className="status-panel">
                  <div className="status-panel-header">
                    <div>
                      <p className="status-title text-uppercase mb-1">Connected Students</p>
                      <small className="status-subtitle">Live lobby presence</small>
                    </div>
                    <span className={`status-chip ${session.state}`}>
                      {session.state}
                    </span>
                  </div>
                  <div className="status-panel-body">
                    <span className="status-count">{connectedCount}</span>
                    <div className="status-details">
                      {/* <span className="status-details-label">students online</span> */}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card.Body>
        </Card>

        {/* <Card className="quiz-card p-4 mb-4">
          <Card.Body>
            <h5 className="mb-3">Project View</h5>
            {renderQuestionCard()}
          </Card.Body>
        </Card> */}

        <Card className="quiz-card p-4 mb-4">
          <Card.Body>
            <h5 className="mb-3">Students</h5>
            {studentRoster.length === 0 ? (
              <p className="text-muted mb-0">No students have joined yet.</p>
            ) : (
              <ListGroup variant="flush">
                {studentRoster.map((student) => (
                  <ListGroup.Item key={student.id} className="bg-transparent text-light d-flex justify-content-between">
                    <span>{student.username}</span>
                    <small className="text-muted">{student.email}</small>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            )}
          </Card.Body>
        </Card>

        <Card className="quiz-card p-4 mb-4">
          <Card.Body>
            <h5 className="mb-3">Leaderboard</h5>
            {phase === "waiting" && (
              <p className="text-muted mb-0">Leaderboard appears once the first question ends.</p>
            )}
            {phase !== "waiting" && (
              <ListGroup variant="flush">
                {(phase === "ended" ? finalLeaderboard : leaderboard).map((entry) => (
                  <ListGroup.Item
                    key={entry.id}
                    className="bg-transparent text-light d-flex justify-content-between"
                  >
                    <span>
                      {entry.rank ? `#${entry.rank} ` : ""}
                      {entry.studentName}
                    </span>
                    <strong>{entry.totalScore} pts</strong>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            )}
            {phase !== "waiting" && (phase === "ended"
              ? finalLeaderboard.length === 0
              : leaderboard.length === 0) && (
              <p className="text-muted mb-0">Waiting for submissions…</p>
            )}
          </Card.Body>
        </Card>

        <Card className="quiz-card p-4">
          <Card.Body>
            <h5 className="mb-3">Event Log</h5>
            {eventLog.length === 0 ? (
              <p className="text-muted">Actions will appear here once the game starts.</p>
            ) : (
              <ListGroup variant="flush">
                {eventLog.map((entry, index) => (
                  <ListGroup.Item key={index} className="bg-transparent text-light">
                    {entry.message}
                  </ListGroup.Item>
                ))}
              </ListGroup>
            )}
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default HostLive;
