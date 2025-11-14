import React, { useCallback, useContext, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Container, Card, Button, ProgressBar, ListGroup } from "react-bootstrap";
import Swal from "sweetalert2";
import Header from "../../components/Header/Header";
import Spinner from "../../components/Spinner";
import { ThemeContext } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import quizService from "../../services/quizService";
import { connectSocket, disconnectSocket } from "../../services/socketClient";
import "./Quiz.css";

const Quiz = () => {
  const { theme } = useContext(ThemeContext);
  const { user } = useAuth();
  const { gameSessionId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [phase, setPhase] = useState("waiting");
  const [questionPayload, setQuestionPayload] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [answerSubmitted, setAnswerSubmitted] = useState(false);
  const [answerStats, setAnswerStats] = useState({ totalAnswered: 0, totalStudents: 0 });
  const [leaderboard, setLeaderboard] = useState([]);
  const [finalLeaderboard, setFinalLeaderboard] = useState([]);

  const intervalRef = useRef(null);
  const questionStartRef = useRef(null);
  const sessionRef = useRef(null);

  useEffect(() => {
    sessionRef.current = session;
  }, [session]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const sessionData = await quizService.getGameSessionById(gameSessionId);
        if (
          sessionData?.classroomId &&
          user?.role === "student" &&
          !user.classrooms?.includes(sessionData.classroomId)
        ) {
          await Swal.fire({
            icon: "warning",
            title: "Join the classroom first",
            text: "You need to be enrolled in this classroom before joining the quiz.",
          });
          navigate("/dashboard#join-classroom");
          return;
        }
        setSession(sessionData);
        const quizData = await quizService.getQuizById(sessionData.quizId);
        setQuiz(quizData);
        if (sessionData.state === "ended") {
          setPhase("ended");
        }
      } catch (error) {
        Swal.fire({ icon: "error", title: "Unable to load quiz", text: error.message }).then(() =>
          navigate("/dashboard")
        );
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [gameSessionId, navigate, user?.role, user?.classrooms]);

  const stopTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startTimer = useCallback(
    (seconds) => {
      stopTimer();
      setTimeLeft(seconds);
      questionStartRef.current = Date.now();
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    },
    [stopTimer]
  );

  const sessionId = session?.id;
  const userId = user?.id;
  const studentName = user?.username;

  useEffect(() => {
    if (!sessionId || !userId || !studentName) return undefined;
    const socket = connectSocket();
    socket.emit("joinGame", {
      gameSessionId: sessionId,
      studentId: userId,
      studentName,
    });

    const handleGameStateUpdated = (payload) => {
      setSession((prev) => ({ ...prev, ...payload }));
      if (payload.state === "active") {
        setPhase("answering");
      }
      if (payload.state === "ended") {
        setPhase("ended");
      }
    };

    const handleQuestionStarted = (payload) => {
      setPhase("answering");
      setQuestionPayload(payload);
      setSelectedOption(null);
      setAnswerSubmitted(false);
      setLeaderboard([]);
      const connected = sessionRef.current?.connectedStudents?.length || 0;
      setAnswerStats({ totalAnswered: 0, totalStudents: connected });
      const seconds = payload.remainingSeconds ?? payload.question.timer ?? 10;
      startTimer(seconds);
    };

    const handleQuestionEnded = ({ leaderboard: board }) => {
      stopTimer();
      setPhase("results");
      setQuestionPayload(null);
      setLeaderboard(board || []);
      setAnswerSubmitted(true);
    };

    const handleGameEnded = ({ finalLeaderboard: board }) => {
      stopTimer();
      setPhase("ended");
      setFinalLeaderboard(board || []);
    };

    const handleAnswerReceived = ({ totalAnswered, totalStudents }) => {
      setAnswerStats({ totalAnswered, totalStudents });
    };

    socket.on("gameStateUpdated", handleGameStateUpdated);
    socket.on("questionStarted", handleQuestionStarted);
    socket.on("questionEnded", handleQuestionEnded);
    socket.on("gameEnded", handleGameEnded);
    socket.on("answerReceived", handleAnswerReceived);

    return () => {
      socket.off("gameStateUpdated", handleGameStateUpdated);
      socket.off("questionStarted", handleQuestionStarted);
      socket.off("questionEnded", handleQuestionEnded);
      socket.off("gameEnded", handleGameEnded);
      socket.off("answerReceived", handleAnswerReceived);
      stopTimer();
      disconnectSocket();
    };
  }, [sessionId, userId, studentName, startTimer, stopTimer]);

  const handleSubmitAnswer = () => {
    if (selectedOption === null || !questionPayload || !userId || !sessionId) {
      return;
    }
    if (answerSubmitted) return;
    const socket = connectSocket();
    const timeSpent = questionStartRef.current
      ? Date.now() - questionStartRef.current
      : 0;
    socket.emit("submitAnswer", {
      gameSessionId: sessionId,
      questionId: questionPayload.question.id,
      answerIndex: selectedOption,
      timeSpent,
      studentId: userId,
      studentName,
    });
    setAnswerSubmitted(true);
  };

  const renderWaiting = () => (
    <Card className="quiz-card p-4 text-center">
      <h4 className="mb-3">Waiting for your teacher to start…</h4>
      <p>Stay on this screen. Questions will appear automatically.</p>
      <Spinner />
    </Card>
  );

  const renderQuestion = () => {
  if (!questionPayload) return renderWaiting();
  const total = questionPayload.question.timer || 10;
    const progress = total ? ((total - timeLeft) / total) * 100 : 0;

    return (
      <Card className="quiz-card p-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="mb-0">{quiz?.title}</h5>
          <span>
            Question {questionPayload.questionIndex + 1} / {questionPayload.totalQuestions}
          </span>
        </div>
        <ProgressBar now={progress} className="mb-2" />
        <div className="text-end text-muted small mb-3">Time left: {timeLeft}s</div>
        <p className="question-text">{questionPayload.question.text}</p>
        <ul className="options-list">
          {questionPayload.question.options.map((opt, idx) => (
            <li
              key={idx}
              className={`option-item ${selectedOption === idx ? "selected" : ""}`}
              onClick={() => !answerSubmitted && setSelectedOption(idx)}
            >
              {opt}
            </li>
          ))}
        </ul>
        <Button
          className="mt-3 w-100"
          variant="secondary"
          disabled={selectedOption === null || answerSubmitted}
          onClick={handleSubmitAnswer}
        >
          {answerSubmitted ? "Answer submitted" : "Submit answer"}
        </Button>
        {answerSubmitted && (
          <p className="text-center text-success mt-3 mb-0">
            Answer locked in! Waiting for the timer or instructor…
          </p>
        )}
        <p className="text-center text-muted small mt-3 mb-0">
          {answerStats.totalAnswered} / {answerStats.totalStudents || "?"} students answered
        </p>
      </Card>
    );
  };

  const renderResults = () => (
    <Card className="quiz-card p-4">
      <h4 className="mb-2">Next question starting soon…</h4>
      <p className="text-muted mb-4">
        Keep an eye on the leaderboard while your teacher gets the next question ready.
      </p>
      <h5 className="mb-3">Live Leaderboard</h5>
      {leaderboard.length === 0 ? (
        <p className="text-muted">Waiting for submissions…</p>
      ) : (
        <ListGroup variant="flush">
          {leaderboard.map((entry) => (
            <ListGroup.Item key={entry.id} className="bg-transparent text-light d-flex justify-content-between">
              <span>{entry.rank}. {entry.studentName}</span>
              <strong>{entry.totalScore} pts</strong>
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}
    </Card>
  );

  const renderFinal = () => (
    <Card className="quiz-card p-4">
      <h3 className="mb-4 text-center">Quiz Complete</h3>
      <p className="text-center text-muted">Great work! Final standings are in.</p>
      {finalLeaderboard.length === 0 ? (
        <p className="text-center">No submissions recorded.</p>
      ) : (
        <ListGroup variant="flush">
          {finalLeaderboard.map((entry) => (
            <ListGroup.Item key={entry.id} className="bg-transparent text-light d-flex justify-content-between">
              <span>
                #{entry.rank} {entry.studentName}
              </span>
              <strong>{entry.totalScore} pts</strong>
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}
      <Button className="mt-4" variant="secondary" onClick={() => navigate("/dashboard")}>Back to dashboard</Button>
    </Card>
  );

  if (!user) {
    return (
      <div className={`main-wrapper ${theme}`}>
        <Header />
        <Container className="quiz-container">
          <Card className="quiz-card p-4 text-center">
            <h4>You must be signed in to participate in a live quiz.</h4>
          </Card>
        </Container>
      </div>
    );
  }

  if (loading || !quiz) {
    return (
      <div className={`main-wrapper ${theme}`}>
        <Header />
        <Container className="quiz-container">
          <Spinner text="Loading quiz..." />
        </Container>
      </div>
    );
  }

  return (
    <div className={`main-wrapper ${theme}`}>
      <Header />
      <Container className="quiz-container">
        {phase === "waiting" && renderWaiting()}
        {phase === "answering" && renderQuestion()}
        {phase === "results" && renderResults()}
        {phase === "ended" && renderFinal()}
      </Container>
    </div>
  );
};

export default Quiz;
