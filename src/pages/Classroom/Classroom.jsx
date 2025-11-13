import React, { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import { ThemeContext } from "../../contexts/ThemeContext";
import { Container, Card, Button, ListGroup, Collapse } from "react-bootstrap";
import Header from "../../components/Header/Header";
import classroomService from "../../services/classroomService"; // fetch classroom data
import "./Classroom.css";

const Classroom = () => {
  const { theme } = useContext(ThemeContext);
  const { classroomId } = useParams();
  const [classroom, setClassroom] = useState(null);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  useEffect(() => {
    const fetchClassroom = async () => {
      try {
        const data = await classroomService.getClassroomById(classroomId);
        setClassroom(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchClassroom();
  }, [classroomId]);

  if (!classroom) return <p className={`text-${theme === "dark" ? "light" : "dark"} text-center mt-5`}>Loading classroom...</p>;

  return (
    <div className={`main-wrapper ${theme}`}>
      <Header />
      <Container className="py-4">
        <Card className={`classroom-card mb-4 ${theme}`}>
          <Card.Body>
            <Card.Title className="mb-2 fw-bold">{classroom.name}</Card.Title>
            <Card.Subtitle className="mb-3 text-muted">
              Join code: {classroom.joinCode}
            </Card.Subtitle>

            {/* Quizzes */}
            <h6 className="fw-bold mb-2">Quizzes</h6>
            {classroom.quizzes.length > 0 ? (
              <ListGroup className="mb-3">
                {classroom.quizzes.map((quiz) => (
                  <ListGroup.Item key={quiz.id} className={`${theme} quiz-item`}>
                    {quiz.title}
                  </ListGroup.Item>
                ))}
              </ListGroup>
            ) : (
              <p>No quizzes assigned yet.</p>
            )}

            {/* Leaderboard toggle button */}
            <Button
              variant={theme === "dark" ? "outline-light" : "outline-dark"}
              className="w-100 mt-3"
              onClick={() => setShowLeaderboard(!showLeaderboard)}
            >
              {showLeaderboard ? "Hide Leaderboard" : "Show Leaderboard"}
            </Button>

            <Collapse in={showLeaderboard}>
              <div className="mt-3">
                <h6 className="fw-bold">Leaderboard</h6>
                {classroom.studentIds.length > 0 ? (
                  <ListGroup>
                    {classroom.studentIds
                      .sort((a, b) => b.score - a.score)
                      .map((s, idx) => (
                        <ListGroup.Item
                          key={s.id}
                          className={`${theme} leaderboard-item d-flex justify-content-between`}
                        >
                          <span>{idx + 1}. {s.name}</span>
                          <span>{s.score} pts</span>
                        </ListGroup.Item>
                      ))}
                  </ListGroup>
                ) : (
                  <p>No students yet.</p>
                )}
              </div>
            </Collapse>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default Classroom;
