import React from 'react';
import { Button } from 'react-bootstrap';

const Hero = () => {
  return (
    <div className="text-center py-5 mt-5">
      <h1 className="display-3 fw-bold mb-3">Quizzatak</h1>
      <p className="lead mb-4 subtitle">
        Quiz. Compete. Dominate. A real-time quiz battle platform.
      </p>
      <div className="d-flex gap-3 justify-content-center flex-wrap">
        <Button variant="secondary" size="lg">Host a Game</Button>
        <Button variant="outline-light" size="lg" className="outline-btn">
          Join a Game
        </Button>
      </div>
    </div>
  );
};

export default Hero;