import React, { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Form, Button, InputGroup } from "react-bootstrap";
import Header from "../../components/Header/Header";
import "./HostQuiz.css";
import { ThemeContext } from "../../contexts/ThemeContext";
import QuestionsPreview from "../../components/QuestionsPreview/QuestionsPreview";
import Swal from "sweetalert2";
import quizService from "../../services/quizService";
import classroomService from "../../services/classroomService";
import { useAuth } from "../../contexts/AuthContext";

const HostQuiz = () => {
  const { theme } = useContext(ThemeContext);
  const { user } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctOption, setCorrectOption] = useState(0);
  const [timer, setTimer] = useState(20);
  const [questions, setQuestions] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [selectedClassroom, setSelectedClassroom] = useState("");
  const [loadingClassrooms, setLoadingClassrooms] = useState(false);
  const [hosting, setHosting] = useState(false);

  useEffect(() => {
    const fetchClassrooms = async () => {
      if (user?.role !== "teacher") return;
      setLoadingClassrooms(true);
      try {
        const response = await classroomService.getAllClassrooms();
        const list = Array.isArray(response) ? response : response?.classrooms ?? [];
        setClassrooms(list);
        if (list.length) {
          setSelectedClassroom(list[0].id);
        }
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Failed to load classrooms",
          text: error.message,
        });
      } finally {
        setLoadingClassrooms(false);
      }
    };

    fetchClassrooms();
  }, [user]);

  const isTeacher = user?.role === "teacher";
  const canSubmit = useMemo(() => questions.length > 0 && title.trim(), [questions.length, title]);

  if (!user || !isTeacher) {
    const message = !user
      ? "Please sign in to host quizzes."
      : "You need a teacher account to host quizzes.";
    return (
      <div className={`main-wrapper ${theme}`}>
        <Header />
        <Container className="py-5">
          <Card className="quiz-card p-4 text-center">
            <h4>{message}</h4>
          </Card>
        </Container>
      </div>
    );
  }

  const handleAddQuestion = () => {
    if (!question.trim() || options.some((opt) => !opt.trim())) {
      Swal.fire({
        icon: "warning",
        title: "Incomplete question",
        text: "Fill out the question and all options",
      });
      return;
    }

    setQuestions((prev) => [
      ...prev,
      {
        text: question.trim(),
        options: options.map((opt) => opt.trim()),
        correct: correctOption,
        timer,
      },
    ]);

    setQuestion("");
    setOptions(["", "", "", ""]);
    setCorrectOption(0);
    setTimer(20);
  };

  const handleGeneratePin = async () => {
    if (!selectedClassroom) {
      Swal.fire({ icon: "warning", title: "Select classroom" });
      return;
    }

    if (!canSubmit) {
      Swal.fire({ icon: "warning", title: "Add quiz details first" });
      return;
    }

    try {
      setHosting(true);
      const quiz = await quizService.createQuiz({
        title,
        classroomId: selectedClassroom,
        questions,
      });

      const session = await quizService.createGameSession({
        quizId: quiz.id,
        classroomId: selectedClassroom,
      });

      await Swal.fire({
        icon: "success",
        title: "Quiz Hosted!",
        html: `
          <p>Share this with your students:</p>
          <div class="mb-2"><strong>Game Code:</strong> ${session.shareCode}</div>
          <div class="mb-2"><strong>PIN:</strong> ${session.pin}</div>
        `,
        confirmButtonColor: "#6c63ff",
      });

      navigate(`/host/live/${session.id}`);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Failed to host quiz",
        text: error.message || "Unable to create quiz",
      });
    } finally {
      setHosting(false);
    }
  };

  const renderOptionInput = (value, idx) => (
    <InputGroup className="mb-3" key={`option-${idx}`}>
      <InputGroup.Radio
        name="correctOption"
        checked={correctOption === idx}
        onChange={() => setCorrectOption(idx)}
      />
      <Form.Control
        placeholder={`Option ${idx + 1}`}
        value={value}
        onChange={(e) => {
          const next = [...options];
          next[idx] = e.target.value;
          setOptions(next);
        }}
      />
    </InputGroup>
  );

  return (
    <div className={`main-wrapper ${theme}`}>
      <Header />
      <Container className="mt-4">
        <Card className="quiz-card p-4 mb-4">
          <Card.Body>
            <h5 className="mb-3">Select Classroom</h5>
            <Form.Select
              value={selectedClassroom}
              onChange={(e) => setSelectedClassroom(e.target.value)}
              disabled={loadingClassrooms || !classrooms.length}
            >
              {!classrooms.length ? (
                <option>No classrooms available</option>
              ) : (
                classrooms.map((room) => (
                  <option key={room.id} value={room.id}>
                    {room.name}
                  </option>
                ))
              )}
            </Form.Select>
          </Card.Body>
        </Card>

        <Row className="g-4">
          <Col md={7}>
            <Card className="quiz-card p-4">
              <Card.Body>
                <h5>Quiz Details</h5>
                <Form.Group className="mb-3">
                  <Form.Label>Title</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g. JavaScript Fundamentals"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </Form.Group>

                <hr className="my-4" />

                <h5>Add Question</h5>
                <Form.Group className="mb-3">
                  <Form.Label>Question</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                  />
                </Form.Group>

                <Form.Label>Options</Form.Label>
                {options.map((value, idx) => renderOptionInput(value, idx))}

                <Form.Group className="mb-3" style={{ maxWidth: "150px" }}>
                  <Form.Label>Timer (seconds)</Form.Label>
                  <Form.Control
                    type="number"
                    min={5}
                    value={timer}
                    onChange={(e) => setTimer(Number(e.target.value) || 10)}
                  />
                </Form.Group>

                <Button variant="secondary" className="btn-add-question" onClick={handleAddQuestion}>
                  Add Question
                </Button>
              </Card.Body>
            </Card>
          </Col>

          <QuestionsPreview
            questions={questions}
            onGeneratePin={handleGeneratePin}
            isGenerating={hosting}
          />
        </Row>
      </Container>
    </div>
  );
};

export default HostQuiz;