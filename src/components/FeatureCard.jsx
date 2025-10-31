import React from 'react';
import { Card } from 'react-bootstrap';

const FeatureCard = ({ title, description }) => {
  return (
    <Card className="feature-card h-100">
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