import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import quizService from "../../services/quizService";
import classroomService from "../../services/classroomService";
import Header from "../../components/Header/Header";
import Spinner from "../../components/Spinner";
import Swal from "sweetalert2";
import { ThemeContext } from "../../contexts/ThemeContext";
import { Container, Card, Row, Col, Button } from "react-bootstrap";
import "./GameLobby.css";

const GameLobby = () => {
  const { theme } = useContext(ThemeContext);
  const { gameSessionId } = useParams();
  const [session, setSession] = useState(null);
  const [classroom, setClassroom] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGameDetails = async () => {
      try {
        const sessionData = await quizService.getGameSessionById(gameSessionId);
        if (!sessionData) throw new Error("Game session not found.");
        setSession(sessionData);

        const classroomData = await classroomService.getClassroomById(sessionData.classroomId);
        setClassroom(classroomData);
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Failed to load lobby",
          text: error.message,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchGameDetails();
  }, [gameSessionId]);

  if (loading) return <div className={`vh-100 w-100 main-wrapper ${theme}`}> <Spinner text="Loading game lobby..." /> </div>;


  return (
    <div className={`main-wrapper ${theme} game-lobby-wrapper`}>
      <Header />
      <Container className="d-flex justify-content-center align-items-center py-5">
        <Card className={`game-lobby-card ${theme}`}>
          <Card.Body className="text-center">
            <h2 className="mb-4">Game Lobby</h2>

            <Row className="mb-3">
              <Col><strong>Game ID:</strong> {session.id}</Col>
              <Col><strong>PIN:</strong> {session.pin}</Col>
            </Row>
            <Row className="mb-3">
              <Col><strong>State:</strong> {session.state}</Col>
              <Col>
                <strong>Connected Students:</strong>{" "}
                {session.connectedStudents?.length ?? 0}
              </Col>
            </Row>
            {classroom && (
              <>
                <Row className="mb-3">
                  <Col><strong>Classroom:</strong> {classroom.name}</Col>
                  <Col><strong>Teacher ID:</strong> {classroom.teacherId}</Col>
                </Row>
              </>
            )}

            <div className="text-center my-4">
              <h4 className="mb-3 fw-bold">Waiting for the game to start...</h4>
              <Spinner size="lg" />
            </div>

            <div className="d-flex justify-content-center mt-3">
              <Button variant="secondary" href="/" className="me-2">
                Back
              </Button>
            </div>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default GameLobby;
