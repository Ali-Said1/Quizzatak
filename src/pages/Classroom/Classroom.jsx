import React, { useState, useEffect, useContext, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ThemeContext } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import {
  Container,
  Card,
  Button,
  Badge,
} from "react-bootstrap";
import Header from "../../components/Header/Header";
import Spinner from "../../components/Spinner";
import classroomService from "../../services/classroomService";
import quizService from "../../services/quizService";
import "./Classroom.css";

const Classroom = () => {
  const { theme } = useContext(ThemeContext);
  const { user } = useAuth();
  const { classroomId } = useParams();
  const navigate = useNavigate();

  const [classroom, setClassroom] = useState(null);
  const [students, setStudents] = useState([]);
  const [gradebook, setGradebook] = useState({});
  const [loading, setLoading] = useState(true);
  const [gradebookLoading, setGradebookLoading] = useState(true);
  const [error, setError] = useState(null);
  const [gradebookError, setGradebookError] = useState(null);

  useEffect(() => {
    const fetchClassroom = async () => {
      setLoading(true);
      setError(null);
      try {
        const [classData, classStudents] = await Promise.all([
          classroomService.getClassroomById(classroomId),
          classroomService.getStudentsFromClassroom(classroomId),
        ]);
        setClassroom(classData);
        setStudents(classStudents);
      } catch (err) {
        setError(err.message || "Unable to load classroom");
      } finally {
        setLoading(false);
      }
    };
    fetchClassroom();
  }, [classroomId]);

  useEffect(() => {
    const fetchGradebook = async () => {
      if (!classroom?.quizzes?.length) {
        setGradebook({});
        setGradebookLoading(false);
        return;
      }
      setGradebookLoading(true);
      setGradebookError(null);
      try {
        const entries = await Promise.all(
          classroom.quizzes.map(async (quiz) => {
            try {
              const sessionResponse = await quizService.getGameSessionsForQuiz(quiz.id);
              const sessionListRaw = Array.isArray(sessionResponse)
                ? sessionResponse
                : sessionResponse?.gameSessions ?? [];
              const sessionList = sessionListRaw.filter(
                (session) => session.classroomId === classroom.id || session.classroomId === classroomId
              );
              if (!sessionList.length) {
                return [quiz.id, {}];
              }
              const latestSession = sessionList[0];
              const submissionsResponse = await quizService.getSubmissionsForGame(latestSession.id);
              const submissionList = Array.isArray(submissionsResponse)
                ? submissionsResponse
                : submissionsResponse?.submissions ?? [];
              const scores = submissionList.reduce((acc, submission) => {
                acc[submission.studentId] = submission.totalScore;
                return acc;
              }, {});
              return [quiz.id, { scores, session: latestSession }];
            } catch (err) {
              console.error("Failed to load submissions", err);
              return [quiz.id, { error: err.message }];
            }
          })
        );
        setGradebook(Object.fromEntries(entries));
      } catch (err) {
        setGradebookError(err.message || "Unable to build gradebook");
      } finally {
        setGradebookLoading(false);
      }
    };
    if (classroom) {
      fetchGradebook();
    }
  }, [classroom, classroomId]);

  const isTeacher = user?.role === "teacher";

  const quizColumns = useMemo(() => classroom?.quizzes ?? [], [classroom]);

  const renderCell = (quizId, studentId) => {
    const quizEntry = gradebook[quizId];
    if (!quizEntry || quizEntry.error) {
      return <span className="text-muted">—</span>;
    }
    const score = quizEntry.scores?.[studentId];
    if (score === undefined) {
      return <span className="text-muted">—</span>;
    }
    return <span>{score} pts</span>;
  };

  if (!isTeacher) {
    return (
      <div className={`main-wrapper ${theme}`}>
        <Header />
        <Container className="py-5 text-center">
          <Card className={`classroom-card ${theme}`}>
            <Card.Body>
              <h4>Teacher access required</h4>
              <p className="mb-0">Only teachers can view classroom gradebooks.</p>
            </Card.Body>
          </Card>
        </Container>
      </div>
    );
  }

  return (
    <div className={`main-wrapper ${theme}`}>
      <Header />
      <Container className="py-4">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
          <div>
            <h2 className="fw-bold text-light mb-0">{classroom?.name || "Classroom"}</h2>
            <small className="text-muted-custom">Join code: {classroom?.joinCode}</small>
          </div>
          <Button variant="outline-light" onClick={() => navigate(-1)}>
            Back
          </Button>
        </div>

        {loading ? (
          <div className="d-flex justify-content-center py-5">
            <Spinner />
          </div>
        ) : error ? (
          <Card className={`classroom-card ${theme}`}>
            <Card.Body>
              <p className="mb-0 text-danger">{error}</p>
            </Card.Body>
          </Card>
        ) : (
          <Card className={`classroom-card ${theme}`}>
            <Card.Body>
              <div className="d-flex flex-wrap gap-3 mb-4">
                <Badge bg="secondary">{students.length} students</Badge>
                <Badge bg="info">{quizColumns.length} quizzes</Badge>
              </div>

              {gradebookError && (
                <div className="alert alert-warning" role="alert">
                  {gradebookError}
                </div>
              )}

              {!quizColumns.length ? (
                <p className="mb-0">No quizzes have been created for this classroom yet.</p>
              ) : (
                <div className="table-responsive gradebook-table-wrapper">
                  <table className="table table-dark table-striped align-middle gradebook-table">
                    <thead>
                      <tr>
                        <th scope="col">Student</th>
                        {quizColumns.map((quiz) => (
                          <th scope="col" key={quiz.id}>
                            <div className="gradebook-header">
                              <span>{quiz.title}</span>
                              {gradebook[quiz.id]?.session && (
                                <small className="text-muted">Session #{gradebook[quiz.id].session.pin || gradebook[quiz.id].session.id}</small>
                              )}
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {students.length ? (
                        students.map((student) => (
                          <tr key={student.id}>
                            <td>
                              <div className="student-cell">
                                <span className="avatar-chip">{student.name?.charAt(0)?.toUpperCase() || "?"}</span>
                                <div>
                                  <div className="fw-semibold">{student.name}</div>
                                  <small className="text-muted">Overall {student.score ?? 0} pts</small>
                                </div>
                              </div>
                            </td>
                            {quizColumns.map((quiz) => (
                              <td key={`${student.id}-${quiz.id}`}>
                                {gradebookLoading ? (
                                  <span className="text-muted">Loading…</span>
                                ) : (
                                  renderCell(quiz.id, student.id)
                                )}
                              </td>
                            ))}
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={1 + quizColumns.length} className="text-center text-muted">
                            No students enrolled yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </Card.Body>
          </Card>
        )}
      </Container>
    </div>
  );
};

export default Classroom;
