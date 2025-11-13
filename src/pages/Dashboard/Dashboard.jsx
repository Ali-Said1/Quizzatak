import React, { useContext } from "react";
import {  
  Row,
  Col,
  Card,
  Form,
  Button,
  InputGroup,
} from "react-bootstrap";
import { ThemeContext } from "../../contexts/ThemeContext.jsx";
import { useAuth } from "../../contexts/AuthContext.jsx";
import Header from "../../components/Header/Header.jsx";
import "./Dashboard.css";
import Swal from "sweetalert2";
import classroomService from "../../services/classroomService.js";
const TeacherDashboard = () => {
  const { theme } = useContext(ThemeContext);
  const { user } = useAuth(); // assume user.role is "teacher" or "student"

  const isTeacher = user?.role === "teacher";
  const handleJoin = async (e) => {
          e.preventDefault();
          const code = e.target.elements["join-code"].value.trim();
          if (!code) return;

          try {
            const classrooms = await classroomService.getAllClassrooms(); 
            const classroom = classrooms.find((c) => c.joinCode === code);

            if (!classroom) {
              Swal.fire({
                icon: "error",
                title: "Classroom not found",
                text: `No classroom found with code ${code}`,
              });
              return;
            }

            // Add student to classroom locally (session storage)
            const user = JSON.parse(sessionStorage.getItem("user")) || {};
            if (!user.classrooms) user.classrooms = [];
            if (!user.classrooms.includes(classroom.id)) {
              user.classrooms.push(classroom.id);
              sessionStorage.setItem("user", JSON.stringify(user));
            }

            // Optionally update classroom's student list in session too
            if (!classroom.students) classroom.students = [];
            if (!classroom.students.some((s) => s.id === user.id)) {
              classroom.students.push({ id: user.id, name: user.username, score: 0 });
            }

            Swal.fire({
              icon: "success",
              title: "Joined classroom!",
              text: `You have successfully joined ${classroom.name}`,
            });

          } catch (err) {
            Swal.fire({
              icon: "error",
              title: "Error",
              text: err.message || "Failed to join classroom",
            });
          }
        }
  return (
    <div className={`main-wrapper ${theme}`}>
      <Header />
      <div className="py-4">
        {/* --- TEACHER: Create Classroom --- */}
        {isTeacher && (
          <Card className="dashboard-card mb-4">
            <Card.Body className="p-4">
              <Form>
                <Form.Label
                  htmlFor="classroom-name"
                  className="fw-medium text-light mb-2"
                >
                  New classroom name
                </Form.Label>
                <InputGroup>
                  <Form.Control
                    id="classroom-name"
                    className="dark-input"
                    placeholder="e.g., Grade 10 Physics"
                  />
                  <Button
                    variant="secondary"
                    type="submit"
                    className="btn-create"
                  >
                    Create
                  </Button>
                </InputGroup>
              </Form>
            </Card.Body>
          </Card>
        )}

        {/* --- TEACHER: Manage Classrooms --- */}
        {isTeacher && (
          <Card className="dashboard-card mb-4">
            <Card.Body className="p-4">
              <h5 className="mb-4 fw-bold text-light">Manage Classrooms</h5>
              <Form.Group controlId="select-classroom" className="mb-4">
                <Form.Label className="text-light mb-2">
                  Select classroom
                </Form.Label>
                <Form.Select className="dark-select">
                  <option>Select a classroom...</option>
                  {/* Map classrooms here */}
                </Form.Select>
              </Form.Group>

              <Row className="g-3">
                <Col md={6}>
                  <Form.Label
                    htmlFor="add-student-email"
                    className="text-light mb-2"
                  >
                    Add student by email
                  </Form.Label>
                  <InputGroup>
                    <Form.Control
                      id="add-student-email"
                      className="dark-input"
                      placeholder="student@email.com"
                    />
                    <Button
                      variant="secondary"
                      id="add-student-btn"
                      className="btn-add"
                    >
                      Add
                    </Button>
                  </InputGroup>
                </Col>

                <Col md={6}>
                  <Form.Label
                    htmlFor="assign-quiz-select"
                    className="text-light mb-2"
                  >
                    Assign quiz
                  </Form.Label>
                  <InputGroup>
                    <Form.Select
                      id="assign-quiz-select"
                      className="dark-select"
                    >
                      <option>Select a quiz...</option>
                      {/* Map quizzes here */}
                    </Form.Select>
                    <Button variant="success" className="btn-assign">
                      Assign
                    </Button>
                  </InputGroup>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        )}

        {/* --- STUDENT: Join Classroom --- */}
        {!isTeacher && (
        <Card className="dashboard-card mb-4 quiz-card">
          <Card.Body className="p-4">
            <h5 className="mb-3 fw-bold text-light">Join a Classroom</h5>
            <Form
              onSubmit={handleJoin}
            >
              <Form.Label
                htmlFor="join-code"
                className="fw-medium text-light mb-2"
              >
                Classroom Code
              </Form.Label>
              <InputGroup>
                <Form.Control
                  id="join-code"
                  className="dark-input"
                  placeholder="Enter classroom code"
                />
                <Button variant="secondary" type="submit" className="btn-join">
                  Join
                </Button>
              </InputGroup>
            </Form>
          </Card.Body>
        </Card>
      )}


        {/* --- UNIVERSAL: Your Classrooms --- */}
        <Card className="dashboard-card quiz-card">
          <Card.Body className="p-4">
            <h5 className="mb-3 fw-bold text-light">Your Classrooms</h5>
            <p className="text-muted-custom mb-0">
              No classrooms yet. {isTeacher ? "Create one above." : "Join one above."}
            </p>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
};

export default TeacherDashboard;
