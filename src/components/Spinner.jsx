import React, { useContext } from 'react';
import { Spinner as BootstrapSpinner } from 'react-bootstrap';
import { ThemeContext } from '../contexts/ThemeContext';

const Spinner = ({ size = 'lg', text = '' }) => {
  const { theme } = useContext(ThemeContext);

  const sizeMap = {
    sm: 'sm',
    md: undefined,
    lg: 'lg',
  };

  const textColor = theme === 'dark' ? '#eee' : '#222';

  return (
    <div className="d-flex flex-column align-items-center justify-content-center">
      <BootstrapSpinner
        animation="border"
        role="status"
        variant={theme === 'dark' ? 'light' : 'dark'}
        size={sizeMap[size]}
      >
        <span className="visually-hidden">{text}</span>
      </BootstrapSpinner>
      {text && (
        <span
          className="mt-2 fw-bold"
          style={{ color: textColor }}
        >
          {text}
        </span>
      )}
    </div>
  );
};

export default Spinner;
