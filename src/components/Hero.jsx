import React from 'react';
import { Button } from 'react-bootstrap';
// Import Link from react-router-dom
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <div className="text-center py-5 mt-5">

      <h1 className="display-3 fw-bold mb-3">Quizzatak</h1>
      <p className="lead mb-4 subtitle">
        Quiz. Compete. Dominate. A real-time quiz battle platform.
      </p>
      <div className="d-flex gap-3 justify-content-center flex-wrap">
        {/* Wrap the "Host a Game" button in a Link component */}
        <Link to="/host">
          <Button variant="secondary" size="lg">Host a Game</Button>
        </Link>
        <Link to="/join">
          <Button variant="outline-light" size="lg" className="outline-btn">
            Join a Game
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default Hero;