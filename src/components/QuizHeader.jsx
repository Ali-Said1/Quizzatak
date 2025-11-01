import React, {useContext} from 'react';
import { Container, Button, Stack } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { ThemeContext } from '../contexts/ThemeContext';
const QuizHeader = () => {
  const {theme, toggleTheme} = useContext(ThemeContext)
  return (
    <header className="py-3">
      <Container>
        <div className="d-flex justify-content-between align-items-center">
          {/* Title from the screenshot */}
          <h5 className="mb-0 fw-bold">Host: Build a Quiz</h5>
          
          {/* Buttons on the right */}
          <Stack direction="horizontal" gap={2}>
            <Link to="/">
              <Button variant="secondary" size="sm" className="btn-add-question">
                Home
              </Button>
            </Link>
            <Button
              variant={theme === 'dark' ? 'light' : 'dark'}
              size="sm"
              onClick={toggleTheme}
            >
              {theme === 'dark' ? 'Light' : 'Dark'}
            </Button>
          </Stack>
        </div>
      </Container>
    </header>
  );
};

export default QuizHeader;