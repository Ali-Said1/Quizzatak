import React, { useContext, useEffect, useState, useCallback } from "react";
import {  
  Row,
  Col,
  Card,
  Form,
  Button,
  InputGroup,
} from "react-bootstrap";
import Spinner from "../../components/Spinner.jsx";
import { ThemeContext } from "../../contexts/ThemeContext.jsx";
import { useAuth } from "../../contexts/AuthContext.jsx";
import Header from "../../components/Header/Header.jsx";
import "./Dashboard.css";
import Swal from "sweetalert2";
import classroomService from "../../services/classroomService.js";
const TeacherDashboard = () => {
  const { theme } = useContext(ThemeContext);
  const { user } = useAuth(); // assume user.role is "teacher" or "student"
  const [newClassroom, setNewClassroom] = useState('');
  const [classrooms, setClassrooms] = useState([]);
  const [loadingClassrooms, setLoadingClassrooms] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [joining, setJoining] = useState(false);
  const isTeacher = user?.role === "teacher";

  const loadClassrooms = useCallback(async () => {
    if (!user) return;
    setLoadingClassrooms(true);
    try {
      const data = await classroomService.getAllClassrooms();
      // API may return { classrooms: [...] } or the array directly
      setClassrooms(Array.isArray(data) ? data : data?.classrooms ?? []);
    } catch (err) {
      Swal.fire({ icon: "error", title: "Error", text: err.message || "Failed to load classrooms" });
    } finally {
      setLoadingClassrooms(false);
    }
  }, [user]);

  useEffect(() => {
    loadClassrooms();
  }, [loadClassrooms]);
  const handleJoin = async (event) => {
    event.preventDefault();
    const joinCode = event.target.elements["join-code"].value.trim().toUpperCase();
    if (!joinCode) {
      Swal.fire({ icon: "warning", title: "Missing code", text: "Please enter a classroom code." });
      return;
    }
    setJoining(true);
    try {
      const classroom = await classroomService.joinClassroom(joinCode);
      await loadClassrooms();
      event.target.reset();
      Swal.fire({
        icon: "success",
        title: "Joined classroom!",
        text: `You're now part of ${classroom.name}.`,
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Unable to join",
        text: err.message || "Failed to join classroom",
      });
    } finally {
      setJoining(false);
    }
  };


  const handleCreateClassroom = (event) => {
    event.preventDefault(); 
    (async () => {
      try {
        await classroomService.createClassroom(newClassroom);
        setNewClassroom('');
        await loadClassrooms();
        Swal.fire({ icon: 'success', title: 'Classroom created' });
      } catch (err) {
        Swal.fire({ icon: 'error', title: 'Error', text: err.message || 'Failed to create classroom' });
      }
    })();
  };

  const handleDeleteClassroom = async (classroomId, classroomName) => {
    const result = await Swal.fire({
      icon: 'warning',
      title: 'Delete classroom?',
      text: `This will remove ${classroomName} and all associated sessions/quizzes.`,
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
    });
    if (!result.isConfirmed) return;
    setDeletingId(classroomId);
    try {
      await classroomService.deleteClassroom(classroomId);
      await loadClassrooms();
      Swal.fire({ icon: 'success', title: 'Classroom deleted' });
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.message || 'Failed to delete classroom' });
    } finally {
      setDeletingId(null);
    }
  };
  return (
    <div className={`main-wrapper ${theme}`}>
      <Header />
      <div className="py-4">
        {/* --- TEACHER: Create Classroom --- */}
        {isTeacher && (
          <Card className="dashboard-card mb-4">
            <Card.Body className="p-4">
              <Form onSubmit={handleCreateClassroom}>
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
                    value={newClassroom}
                    onChange={(e) => setNewClassroom(e.target.value)}
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
                <Form.Select className="dark-select" defaultValue="">
                  <option value="" disabled>
                    Select a classroom...
                  </option>
                  {classrooms.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
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
                <Button variant="secondary" type="submit" className="btn-join" disabled={joining}>
                  {joining ? "Joining..." : "Join"}
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
            {loadingClassrooms ? (
              <div className="d-flex justify-content-center py-3">
                <Spinner />
              </div>
            ) : classrooms && classrooms.length ? (
              <div className="list-group">
                {classrooms.map((c) => (
                  <div key={c.id} className="d-flex justify-content-between align-items-center py-2 border-bottom">
                    <div>
                      <div className="fw-semibold text-light">{c.name}</div>
                      <small className="text-muted-custom">Code: {c.joinCode}</small>
                    </div>
                    <div className="d-flex gap-2">
                      {!isTeacher && (
                        <Button variant="outline-light" size="sm">Open</Button>
                      )}
                      {isTeacher && (
                        <Button
                          variant="outline-danger"
                          size="sm"
                          disabled={deletingId === c.id}
                          onClick={() => handleDeleteClassroom(c.id, c.name)}
                        >
                          {deletingId === c.id ? 'Deleting…' : 'Delete'}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-custom mb-0">No classrooms yet. {isTeacher ? "Create one above." : "Join one above."}</p>
            )}
          </Card.Body>
        </Card>
      </div>
    </div>
  );
};

export default TeacherDashboard;
