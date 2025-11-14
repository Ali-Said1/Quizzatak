import React, { useContext, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Container, Card, Button, ProgressBar } from "react-bootstrap";
import Swal from "sweetalert2";
import Header from "../../components/Header/Header";
import Spinner from "../../components/Spinner";
import { ThemeContext } from "../../contexts/ThemeContext";
import quizService from "../../services/quizService";
import "./Quiz.css";

const Quiz = () => {
  const { theme } = useContext(ThemeContext);
  const { gameSessionId } = useParams();
  const [loading, setLoading] = useState(true);
  const [quiz, setQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [questionStart, setQuestionStart] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [submission, setSubmission] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
  const sessionData = await quizService.getGameSessionById(gameSessionId);
        const quizData = await quizService.getQuizById(sessionData.quizId);
        setQuiz(quizData);
        setCurrentQuestionIndex(0);
        setAnswers([]);
      } catch (error) {
        Swal.fire({ icon: "error", title: "Unable to load quiz", text: error.message });
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [gameSessionId]);

  const question = useMemo(() => quiz?.questions?.[currentQuestionIndex], [quiz, currentQuestionIndex]);

  useEffect(() => {
    if (!question) return;
    setSelectedOption(null);
    setTimeLeft(question.timer || 10);
    setQuestionStart(Date.now());
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [question]);

  useEffect(() => {
    if (question && timeLeft === 0 && !showResults && !submitting) {
      handleNext(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft]);

  const computeElapsed = () => {
    if (!question || !questionStart) return 0;
    const elapsed = Date.now() - questionStart;
    const max = (question.timer || 10) * 1000;
    return Math.min(elapsed, max);
  };

  const handleNext = async (skipped = false) => {
    if (!question) return;
    const answerIndex = skipped || selectedOption === null ? -1 : selectedOption;
    const entry = {
      questionId: question.id,
      answerIndex,
      timeSpent: computeElapsed(),
    };
    const updatedAnswers = [...answers, entry];
    setAnswers(updatedAnswers);
    const isLast = currentQuestionIndex + 1 >= (quiz?.questions?.length || 0);
    if (isLast) {
      await submitAnswers(updatedAnswers);
    } else {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const submitAnswers = async (payload) => {
    setSubmitting(true);
    try {
      const submissionResult = await quizService.submitSubmission({
        gameSessionId,
        answers: payload,
      });
      setSubmission(submissionResult);
      setShowResults(true);
    } catch (error) {
      Swal.fire({ icon: "error", title: "Failed to submit", text: error.message });
    } finally {
      setSubmitting(false);
    }
  };

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

  if (showResults) {
    const score = submission?.totalScore ?? 0;
    return (
      <div className={`main-wrapper ${theme}`}>
        <Header />
        <Container className="quiz-container">
          <Card className="quiz-card results-card p-4">
            <h2 className="text-center mb-4">{quiz.title} - Results</h2>
            <p className="text-center fw-bold">Total Score: {score} pts</p>
            {quiz.questions.map((q, idx) => {
              const answer = submission?.answers?.find((a) => a.questionId === q.id) || answers[idx];
              return (
                <div key={q.id} className="result-question">
                  <p><strong>Q{idx + 1}:</strong> {q.text}</p>
                  <ul className="options-list">
                    {q.options.map((opt, i) => {
                      const userSelected = answer?.answerIndex === i;
                      const isCorrect = q.correct === i;
                      return (
                        <li
                          key={i}
                          className={`option-item ${
                            isCorrect ? "correct" : userSelected ? "wrong" : ""
                          }`}
                        >
                          {opt}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </Card>
        </Container>
      </div>
    );
  }

  return (
    <div className={`main-wrapper ${theme}`}>
      <Header />
      <Container className="quiz-container">
        <Card className="quiz-card p-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0">{quiz.title}</h5>
            <span>
              Question {currentQuestionIndex + 1} / {quiz.questions.length}
            </span>
          </div>
          <ProgressBar now={((question?.timer || 10) - timeLeft) / (question?.timer || 10) * 100} className="mb-3" />
          <div className="text-end text-muted small mb-3">Time left: {timeLeft}s</div>
          <p className="question-text">{question?.text}</p>
          <ul className="options-list">
            {question?.options?.map((opt, i) => (
              <li
                key={i}
                className={`option-item ${selectedOption === i ? "selected" : ""}`}
                onClick={() => setSelectedOption(i)}
              >
                {opt}
              </li>
            ))}
          </ul>
          <Button
            className="mt-3 w-100"
            variant="secondary"
            onClick={() => handleNext(false)}
            disabled={selectedOption === null || submitting}
          >
            {currentQuestionIndex + 1 === quiz.questions.length ? "Submit" : "Next"}
          </Button>
        </Card>
      </Container>
    </div>
  );
};

export default Quiz;
