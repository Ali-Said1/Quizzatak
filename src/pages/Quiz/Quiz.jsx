import React, { useContext, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Container, Card, Button } from "react-bootstrap";
import Header from "../../components/Header/Header";
import Spinner from "../../components/Spinner";
import { ThemeContext } from "../../contexts/ThemeContext";
import "./Quiz.css";

// Mock data for testing without sockets/server
const mockQuiz = {
  title: "Algebra Basics",
  questions: [
    {
      id: "q1",
      text: "What is 4 + 4?",
      options: ["1", "5", "20", "8"],
      correct: 3,
      timer: 10,
    },
    {
      id: "q2",
      text: "What is 2 + 2?",
      options: ["2", "3", "4", "5"],
      correct: 2,
      timer: 10,
    },
  ],
};

const Quiz = () => {
  const { theme } = useContext(ThemeContext);
  const { gameSessionId } = useParams();
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [answers, setAnswers] = useState([]);

  useEffect(() => {
    // Simulate loading quiz data
    setTimeout(() => setLoading(false), 500);
  }, [gameSessionId]);

  const question = mockQuiz.questions[currentQuestionIndex];

  const handleSelect = (index) => {
    setSelectedOption(index);
  };

  const handleNext = () => {
    setAnswers([...answers, { questionId: question.id, selected: selectedOption }]);
    setSelectedOption(null);
    if (currentQuestionIndex + 1 < mockQuiz.questions.length) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setShowResults(true);
    }
  };

  if (loading) return <Spinner />;

  if (showResults) {
    return (
      <div className={`main-wrapper ${theme}`}>
        <Header />
        <Container className="quiz-container">
          <Card className="quiz-card results-card p-4">
            <h2 className="text-center mb-4">{mockQuiz.title} - Results</h2>
            {mockQuiz.questions.map((q, idx) => (
              <div key={q.id} className="result-question">
                <p><strong>Q{idx + 1}:</strong> {q.text}</p>
                <ul className="options-list">
                  {q.options.map((opt, i) => {
                    const userSelected = answers[idx]?.selected === i;
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
            ))}
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
          <h2 className="text-center mb-4">{mockQuiz.title}</h2>
          <p className="question-text">{question.text}</p>
          <ul className="options-list">
            {question.options.map((opt, i) => (
              <li
                key={i}
                className={`option-item ${selectedOption === i ? "selected" : ""}`}
                onClick={() => handleSelect(i)}
              >
                {opt}
              </li>
            ))}
          </ul>
          <Button
            className="mt-3 w-100"
            variant="secondary"
            onClick={handleNext}
            disabled={selectedOption === null}
          >
            {currentQuestionIndex + 1 === mockQuiz.questions.length ? "Finish" : "Next"}
          </Button>
        </Card>
      </Container>
    </div>
  );
};

export default Quiz;
