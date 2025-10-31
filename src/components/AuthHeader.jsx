import React from 'react';
import { Container, Button } from 'react-bootstrap';

const AuthHeader = ({ theme, toggleTheme }) => {
  return (
    <header className="py-3">
      <Container>
        <div className="d-flex justify-content-end align-items-center">
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

export default AuthHeader;