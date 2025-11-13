import React, { useContext } from "react";
import { Card } from "react-bootstrap";
import { ThemeContext } from "../../contexts/ThemeContext";
import "./FeatureCard.css";

const FeatureCard = ({ title, description, children }) => {
  const { theme } = useContext(ThemeContext); // must be { theme, toggleTheme }
  return (
    <Card className={`feature-card ${theme} h-100 border-0`}>
      <Card.Body className="p-4 d-flex flex-column">
        <Card.Title className="mb-2">{title}</Card.Title>
        <Card.Text className="mb-3 small">{description}</Card.Text>
        {children && <div className="mt-auto">{children}</div>}
      </Card.Body>
    </Card>
  );
};

export default FeatureCard;
