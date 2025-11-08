import React from 'react';
import { Card, Badge, ListGroup } from "react-bootstrap";
import "./QuestionCard.css"

function QuestionCard({ question }) {

  return (
    <Card className="quiz-card mb-3 shadow-sm border-0">
      <Card.Body>

        <Card.Title className="h5 mb-3">{question.text}</Card.Title>

       <ListGroup variant="flush">
        {question.options.map((option, index) => {
            const isCorrect = index + 1 === question.correct;
            return (
            <ListGroup.Item
                key={index}
                className={`question-choice p-2 mb-2 d-flex justify-content-between align-items-center ${isCorrect ? "correct" : ""}`}
            >
                <span>
                Choice {index + 1}: {option}
                </span>
                {isCorrect && <Badge bg="light" text="dark">Correct</Badge>}
            </ListGroup.Item>
            );
        })}
        </ListGroup>

        <div className="mt-2 text-muted small">Timer: {question.timer} seconds</div>

      </Card.Body>
    </Card>
  );
}

export default QuestionCard;
