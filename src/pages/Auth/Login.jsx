import React, { useState, useContext } from 'react';
import { Container, Card, Form, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../../components/Header/Header';
import './Auth.css';
import { ThemeContext } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import Swal from 'sweetalert2';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { theme } = useContext(ThemeContext);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await login(email, password);
      await Swal.fire({
        icon: 'success',
        title: 'Welcome back!',
        text: 'You have logged in successfully.',
        confirmButtonColor: '#6c63ff'
      });
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Login failed',
        text: err.message || 'Please check your credentials and try again.',
        confirmButtonColor: '#6c63ff'
      });
    }
  };

  return (
    <div className={`main-wrapper ${theme}`}>
      <Header />

      <Container className="auth-container">
        <Card className="quiz-card p-4" style={{ maxWidth: '450px', width: '100%' }}>
          <Card.Body>
            <h3 className="text-center fw-bold mb-4">Sign in to your account</h3>

            <Form onSubmit={handleSubmit}>
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
                type="submit"
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
