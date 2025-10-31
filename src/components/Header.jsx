import React from 'react';
import { Container, Button, Stack } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Header = ({ theme, toggleTheme }) => {
  return (
    <header className="py-3">
      <Container>
        <div className="d-flex justify-content-between align-items-center">
          <div className="text-muted small">Realtime - Quiz</div>
          
          {/* Group for buttons on the right */}
          <Stack direction="horizontal" gap={2}>
            <Link to="/login">
              <Button 
                variant={theme === 'dark' ? 'outline-light' : 'outline-dark'} 
                size="sm"
                className="outline-btn"
              >
                Login
              </Button>
            </Link>
            
            <Link to="/signup">
              <Button variant="secondary" size="sm">
                Signup
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

export default Header;