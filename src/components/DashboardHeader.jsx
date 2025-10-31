import React from 'react';
import { Container, Button } from 'react-bootstrap';

const DashboardHeader = ({ theme, toggleTheme }) => {
  return (
    <header className="py-3 dashboard-header-border">
      <Container>
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0 fw-bold">Teacher Dashboard</h5>
          <div className="d-flex align-items-center gap-2">
            <Button variant="primary" size="sm">
              Profile
            </Button>
            <Button
              variant={theme === 'dark' ? 'light' : 'dark'}
              size="sm"
              onClick={toggleTheme}
            >
              {theme === 'dark' ? 'Light' : 'Dark'}
            </Button>
          </div>
        </div>
      </Container>
    </header>
  );
};

export default DashboardHeader;