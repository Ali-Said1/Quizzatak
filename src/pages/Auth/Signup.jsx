import React, { useState, useContext } from 'react';
import { Container, Card, Form, Button, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import Header from '../../components/Header/Header';
import './Auth.css';
import { ThemeContext } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import { validateSignup } from "../../utils/validation.js";
import Swal from 'sweetalert2';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student'
  });
  // const {register} = useAuth()
  const [errors, setErrors] = useState({});
  const { theme } = useContext(ThemeContext);

  const handleChange = (field, value) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);

    // validate only that field
    const fieldError = validateSignup(updated)[field];
    setErrors(prev => ({ ...prev, [field]: fieldError }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateSignup(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;
      
    try {
      await register({
        username: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role
      });

      Swal.fire({
        icon: 'success',
        title: 'Account created!',
        text: 'Your account has been registered successfully.',
        confirmButtonColor: '#6c63ff'
      });

    } catch (err) {
      console.error(err);

      Swal.fire({
        icon: 'error',
        title: 'Signup failed',
        text: err.message || 'Please try again later.',
        confirmButtonColor: '#6c63ff'
      });
    }
  };

  return (
    <div className={`main-wrapper ${theme}`}>
      <Header />

      <Container className="auth-container">
        <Card className="quiz-card p-4" style={{ maxWidth: '480px', width: '100%' }}>
          <Card.Body>
            <h3 className="text-center fw-bold mb-4">Create your account</h3>

            <Form onSubmit={handleSubmit}>
              {/* Name */}
              <Form.Group className="mb-3">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  isInvalid={!!errors.name}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.name}
                </Form.Control.Feedback>
              </Form.Group>

              {/* Email */}
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  isInvalid={!!errors.email}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.email}
                </Form.Control.Feedback>
              </Form.Group>

              {/* Password */}
              <Form.Group className="mb-4">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Enter a password"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  isInvalid={!!errors.password}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.password}
                </Form.Control.Feedback>
              </Form.Group>

              {/* Role selection cards */}
              <Form.Group className="mb-4">
                <Form.Label>Select account type</Form.Label>
                <Row className="g-3">
                  {['student', 'teacher'].map((type) => (
                    <Col xs={6} key={type}>
                      <Card
                        onClick={() => handleChange('role', type)}
                        className={`role-card text-center py-3 ${formData.role === type ? 'selected-role' : ''}`}
                        style={{ cursor: 'pointer' }}
                      >
                        <Card.Body>
                          <h6 className="fw-bold mb-0">
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </h6>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </Form.Group>

              <Button
                variant="secondary"
                className="w-100 btn-add-question"
                size="lg"
                type="submit"
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
