import React from 'react';
import { Card } from 'react-bootstrap';
import { useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';
const FeatureCard = ({ title, description }) => {
  const theme = useContext(ThemeContext);
  return (
    <Card className={`feature-card h-100 ${theme}`}>
      <Card.Body>
        <Card.Title className="h5 mb-3">{title}</Card.Title>
        <Card.Text className="small card-text">
          {description}
        </Card.Text>
      </Card.Body>
    </Card>
  );
};

export default FeatureCard;