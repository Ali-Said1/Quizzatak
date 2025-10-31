import React, { useState } from 'react';
import { Container, Card, Form, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import AuthHeader from '../../components/AuthHeader';
import './Auth.css'; // Reusing the same centering CSS

const Login = ({ theme, toggleTheme }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div className={`main-wrapper ${theme}`}>
      <AuthHeader theme={theme} toggleTheme={toggleTheme} />
      
      <Container className="auth-container">
        <Card className="quiz-card p-4" style={{ maxWidth: '450px', width: '100%' }}>
          <Card.Body>
            <h3 className="text-center fw-bold mb-4">Sign in to your account</h3>
            
            <Form>
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
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Form.Group>

              <Button 
                variant="secondary" 
                className="w-100 btn-add-question" 
                size="lg"
              >
                Sign in
              </Button>
            </Form>

            <p className="text-center text-muted small mt-3 mb-0">
              Don't have an account?{' '}
              <Link to="/signup" className="fw-bold text-white">
                Create one
              </Link>
            </p>

          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default Login;