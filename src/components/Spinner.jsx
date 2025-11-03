// src/components/Spinner.jsx
import React, { useContext } from 'react';
import { Spinner as BootstrapSpinner } from 'react-bootstrap';
import { ThemeContext } from '../contexts/ThemeContext';

const Spinner = ({ size = 'lg', text = 'Loading...' }) => {
  const { theme } = useContext(ThemeContext);

  const sizeMap = {
    sm: 'sm',
    md: undefined,
    lg: 'lg',
  };

  // Match the exact gradients from App.css
  const background =
    theme === 'dark'
      ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
      : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)';

  return (
    <div
      className="d-flex flex-column align-items-center justify-content-center"
      style={{
        height: '100vh',
        background,
        color: 'white',
        transition: 'background 0.3s ease',
      }}
    >
      <BootstrapSpinner
        animation="border"
        role="status"
        variant="light"
        size={sizeMap[size]}
      >
        <span className="visually-hidden">{text}</span>
      </BootstrapSpinner>
      <h4 className="mt-3 text-light fw-bolder">{text}</h4>
    </div>
  );
};

export default Spinner;
