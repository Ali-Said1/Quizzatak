import React, { useContext, useEffect, useState, useCallback } from "react";
import {
  Row,
  Col,
  Card,
  Form,
  Button,
  InputGroup,
  Badge,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Spinner from "../../components/Spinner.jsx";
import { ThemeContext } from "../../contexts/ThemeContext.jsx";
import { useAuth } from "../../contexts/AuthContext.jsx";
import Header from "../../components/Header/Header.jsx";
import "./Dashboard.css";
import Swal from "sweetalert2";
import classroomService from "../../services/classroomService.js";
import quizService from "../../services/quizService.js";
const TeacherDashboard = () => {
  const { theme } = useContext(ThemeContext);
  const { user } = useAuth(); // assume user.role is "teacher" or "student"
  const [newClassroom, setNewClassroom] = useState('');
  const [classrooms, setClassrooms] = useState([]);
  const [loadingClassrooms, setLoadingClassrooms] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [joining, setJoining] = useState(false);
  const navigate = useNavigate();
  const [expandedClassroomId, setExpandedClassroomId] = useState(null);
  const [classroomDetails, setClassroomDetails] = useState({});
  const [detailsLoadingId, setDetailsLoadingId] = useState(null);
  const [startingQuizId, setStartingQuizId] = useState(null);
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

  const navigateToGradebook = (classroomId) => {
    navigate(`/classroom/${classroomId}`);
  };

  const handleToggleDetails = async (classroomId) => {
    if (!isTeacher) return;
    const isExpanded = expandedClassroomId === classroomId;
    if (isExpanded) {
      setExpandedClassroomId(null);
      return;
    }
    setExpandedClassroomId(classroomId);
    if (classroomDetails[classroomId]) {
      return;
    }
    setDetailsLoadingId(classroomId);
    try {
      const [classroomData, students] = await Promise.all([
        classroomService.getClassroomById(classroomId),
        classroomService.getStudentsFromClassroom(classroomId)
      ]);
      setClassroomDetails((prev) => ({
        ...prev,
        [classroomId]: {
          ...classroomData,
          students,
        },
      }));
    } catch (err) {
      setExpandedClassroomId(null);
      Swal.fire({ icon: "error", title: "Unable to load classroom", text: err.message || "Failed to load classroom details." });
    } finally {
      setDetailsLoadingId(null);
    }
  };

  const handleStartQuiz = async (quiz, classroomId) => {
    const quizStatus = quiz?.status || "draft";
    if (quizStatus !== "draft") {
      Swal.fire({
        icon: "info",
        title: "Quiz already hosted",
        text:
          quizStatus === "completed"
            ? "This quiz has already run to completion. Duplicate it or edit a copy to host again."
            : "This quiz is currently live. End the active session before starting another.",
      });
      return;
    }
    const confirm = await Swal.fire({
      icon: "question",
      title: `Start "${quiz?.title}"?`,
      text: "This will generate a live session PIN for your students.",
      showCancelButton: true,
      confirmButtonText: "Start session",
      cancelButtonText: "Cancel",
      confirmButtonColor: '#6c63ff'
    });
    if (!confirm.isConfirmed) return;
    setStartingQuizId(quiz.id);
    try {
      const session = await quizService.createGameSession({ quizId: quiz.id, classroomId });
      await Swal.fire({
        icon: "success",
        title: "Session started",
        html: `
          <p>Share this info with your students:</p>
          <div class="mb-2"><strong>Game Code:</strong> ${session.shareCode}</div>
          <div class="mb-2"><strong>Game PIN:</strong> ${session.pin}</div>
          <div class="text-muted small">Game ID: ${session.id}</div>
        `,
        confirmButtonColor: '#6c63ff'
      });
      navigate(`/host/live/${session.id}`);
    } catch (err) {
      Swal.fire({ icon: "error", title: "Unable to start quiz", text: err.message || "Failed to create game session." });
    } finally {
      setStartingQuizId(null);
    }
  };
  const getQuizStatusMeta = (status) => {
    switch (status) {
      case "completed":
        return { label: "Completed", variant: "secondary" };
      case "live":
        return { label: "Live", variant: "warning" };
      default:
        return { label: "Ready", variant: "success" };
    }
  };
  return (
    <div className={`main-wrapper ${theme}`}>
      <Header />
      <div className="py-4">
        {/* --- TEACHER: Create Classroom --- */}
        {isTeacher && (
          <Card className="dashboard-card mb-4 mx-auto">
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
                  <div key={c.id} className="py-2 border-bottom">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <div className="fw-semibold text-light">{c.name}</div>
                        <small className="text-muted-custom">Code: {c.joinCode}</small>
                      </div>
                      <div className="d-flex gap-2">
                        {isTeacher ? (
                          <>
                            <Button
                              variant="outline-light"
                              size="sm"
                              onClick={() => handleToggleDetails(c.id)}
                            >
                              {expandedClassroomId === c.id ? 'Close' : 'Open'}
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              disabled={deletingId === c.id}
                              onClick={() => handleDeleteClassroom(c.id, c.name)}
                            >
                              {deletingId === c.id ? 'Deleting…' : 'Delete'}
                            </Button>
                          </>
                        ) : (
                          <Button variant="outline-light" size="sm">Open</Button>
                        )}
                      </div>
                    </div>
                    {isTeacher && expandedClassroomId === c.id && (
                      <div className="mt-3 pt-3 border-top">
                        {detailsLoadingId === c.id && !classroomDetails[c.id] ? (
                          <div className="d-flex justify-content-center py-3">
                            <Spinner />
                          </div>
                        ) : (
                          <>
                            <div className="mb-4">
                              <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                                <div>
                                  <h6 className="mb-0 text-light">Students</h6>
                                  <small className="text-muted-custom">
                                    {classroomDetails[c.id]?.students?.length || 0} enrolled
                                  </small>
                                </div>
                                <Button
                                  variant="outline-light"
                                  size="sm"
                                  onClick={() => navigateToGradebook(c.id)}
                                >
                                  View gradebook
                                </Button>
                              </div>
                              {classroomDetails[c.id]?.students?.length ? (
                                <div className="student-pill-list">
                                  {classroomDetails[c.id].students.map((student) => (
                                    <div key={student.id} className="student-pill">
                                      <div className="student-pill__avatar">
                                        {student.name?.charAt(0)?.toUpperCase() || "?"}
                                      </div>
                                      <div className="student-pill__meta">
                                        <span className="student-pill__name">{student.name}</span>
                                        <small className="text-muted-custom">
                                          Overall score {student.score ?? 0} pts
                                        </small>
                                      </div>
                                      <span className="badge bg-secondary-subtle text-light">
                                        Active
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-muted-custom mb-0">No students yet.</p>
                              )}
                            </div>

                            <div>
                              <div className="d-flex justify-content-between align-items-center mb-2">
                                <h6 className="mb-0 text-light">Quizzes</h6>
                                <small className="text-muted-custom">
                                  {classroomDetails[c.id]?.quizzes?.length || 0} available
                                </small>
                              </div>
                              {classroomDetails[c.id]?.quizzes?.length ? (
                                <div className="d-flex flex-column gap-2">
                                  {classroomDetails[c.id].quizzes.map((quiz) => {
                                    const quizStatus = quiz.status || "draft";
                                    const statusMeta = getQuizStatusMeta(quizStatus);
                                    const isLocked = quizStatus !== "draft";
                                    return (
                                      <div
                                        key={quiz.id}
                                        className="d-flex justify-content-between align-items-center px-3 py-2 rounded border border-secondary flex-wrap gap-3"
                                      >
                                        <div>
                                          <div className="d-flex align-items-center gap-2 text-light fw-semibold">
                                            <span>{quiz.title}</span>
                                            <Badge bg={statusMeta.variant}>{statusMeta.label}</Badge>
                                          </div>
                                          <small className="text-muted-custom d-block">
                                            {quiz.questionCount ?? quiz.questions?.length ?? 0} questions
                                          </small>
                                          {isLocked && (
                                            <small className="text-warning d-block">
                                              Completed or live quizzes can’t be relaunched from here.
                                            </small>
                                          )}
                                        </div>
                                        <Button
                                          variant="success"
                                          size="sm"
                                          disabled={isLocked || startingQuizId === quiz.id}
                                          onClick={() => handleStartQuiz(quiz, c.id)}
                                        >
                                          {startingQuizId === quiz.id ? 'Starting…' : 'Start'}
                                        </Button>
                                      </div>
                                    );
                                  })}
                                </div>
                              ) : (
                                <p className="text-muted-custom mb-0">No quizzes yet.</p>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    )}
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
