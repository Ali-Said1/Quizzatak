import React, { useState, useContext } from 'react';
import { Container, Card, Form, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import AuthHeader from '../../components/AuthHeader';
import './Auth.css';
import { ThemeContext } from "../../contexts/ThemeContext";

const Signup = () => {

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student'); // 'student' or 'teacher'
  const {theme, toggleTheme} = useContext(ThemeContext);
  
  return (
    <div className={`main-wrapper ${theme}`}>
      <AuthHeader theme={theme} toggleTheme={toggleTheme} />
      
      {/* This new 'auth-container' class will center the card */}
      <Container className="auth-container">
        <Card className="quiz-card p-4" style={{ maxWidth: '450px', width: '100%' }}>
          <Card.Body>
            <h3 className="text-center fw-bold mb-4">Create your account</h3>
            
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Name</Form.Label>
                <Form.Control 
                  type="text" 
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control 
                  type="email" 
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Password</Form.Label>
                <Form.Control 
                  type="password" 
                  placeholder="Enter a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label>Role</Form.Label>
                <div>
                  <Form.Check
                    inline
                    type="radio"
                    label="Student"
                    id="role-student"
                    name="role"
                    checked={role === 'student'}
                    onChange={() => setRole('student')}
                  />
                  <Form.Check
                    inline
                    type="radio"
                    label="Teacher"
                    id="role-teacher"
                    name="role"
                    checked={role === 'teacher'}
                    onChange={() => setRole('teacher')}
                  />
                </div>
              </Form.Group>

              <Button 
                variant="secondary" 
                className="w-100 btn-add-question" 
                size="lg"
              >
                Create account
              </Button>
            </Form>

            <p className="text-center text-muted small mt-3 mb-0">
              Already have an account?{' '}
              <Link to="/login" className="fw-bold text-white">
                Sign in
              </Link>
            </p>

          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default Signup;