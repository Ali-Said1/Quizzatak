import React from 'react';
import { Container, Button } from 'react-bootstrap';

const Header = ({ theme, toggleTheme }) => {
  return (
    <header className="py-3">
      <Container>
        <div className="d-flex justify-content-between align-items-center">
          <div className="text-muted small">Realtime - Quiz</div>
          <Button 
            variant={theme === 'dark' ? 'light' : 'dark'} 
            size="sm"
            onClick={toggleTheme}
          >
            {theme === 'dark' ? 'Light' : 'Dark'}
          </Button>
        </div>
      </Container>
    </header>
  );
};

export default Header;