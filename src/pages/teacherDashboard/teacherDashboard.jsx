import React from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  InputGroup,
} from "react-bootstrap";

import DashboardHeader from "../../components/DashboardHeader.jsx";

const TeacherDashboard = ({ theme, toggleTheme }) => {
  return (
    <div className={`main-wrapper ${theme}`}>
      <DashboardHeader theme={theme} toggleTheme={toggleTheme} />
      <Container className="py-4">
        {/* Section 1: Create Classroom */}
        <Card className="dashboard-card mb-4">
          <Card.Body className="p-4">
            <Form>
              <Form.Label htmlFor="classroom-name" className="fw-medium">
                New classroom name
              </Form.Label>
              <InputGroup>
                <Form.Control
                  id="classroom-name"
                  placeholder="e.g., Grade 10 Physics"
                />
                <Button variant="primary" type="submit">
                  Create
                </Button>
              </InputGroup>
            </Form>
          </Card.Body>
        </Card>

        {/* Section 2: Manage Classrooms */}
        <Card className="dashboard-card mb-4">
          <Card.Body className="p-4">
            <h5 className="mb-3 fw-bold">Manage Classrooms</h5>
            <Form.Group controlId="select-classroom" className="mb-3">
              <Form.Label>Select classroom</Form.Label>
              <Form.Select>
                <option>Select a classroom...</option>
                {/* Classrooms would be mapped here */}
              </Form.Select>
            </Form.Group>

            <Row className="g-3">
              {/* Add Student */}
              <Col md={6}>
                <Form.Label htmlFor="add-student-email">
                  Add student by email
                </Form.Label>
                <InputGroup>
                  <Form.Control
                    id="add-student-email"
                    placeholder="student@email.com"
                  />
                  <Button variant="secondary" id="add-student-btn">
                    Add
                  </Button>
                </InputGroup>
              </Col>

              {/* Assign Quiz */}
              <Col md={6}>
                <Form.Label htmlFor="assign-quiz-select">
                  Assign quiz
                </Form.Label>
                <InputGroup>
                  <Form.Select id="assign-quiz-select">
                    <option>Select a quiz...</option>
                    {/* Quizzes would be mapped here */}
                  </Form.Select>
                  <Button variant="success">Assign</Button>
                </InputGroup>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Section 3: Your Classrooms */}
        <Card className="dashboard-card">
          <Card.Body className="p-4">
            <h5 className="mb-3 fw-bold">Your Classrooms</h5>
            <p className="text-muted mb-0">
              No classrooms yet. Create one above.
            </p>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default TeacherDashboard;
