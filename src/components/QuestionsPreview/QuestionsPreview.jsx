import React from 'react';
import { Col, Card, Button } from 'react-bootstrap';
import QuestionCard from './QuestionCard';

function QuestionsPreview({ questions, onGeneratePin }) {
  return (
    <Col md={5}>
      <Card className="quiz-card p-4">
        <Card.Body>
          <h5 className="mb-3">Preview</h5>

          {questions.length === 0 ? (
            <p className="text-muted small">
              Add at least one question to create your quiz.
            </p>
          ) : (
            <>
              <p className="text-muted small">
                {`You have added ${questions.length} question(s).`}
              </p>

              {questions.map((question, index) => (
                <div key={index}>
                  <p className="fw-bolder">Question {index + 1}:</p>
                  <QuestionCard question={question} />
                </div>
              ))}
            </>
          )}

          <Button
            variant="success"
            className="w-100 mt-4"
            disabled={questions.length === 0}
            onClick={onGeneratePin}
          >
            Generate Game PIN & Go to Lobby
          </Button>
        </Card.Body>
      </Card>
    </Col>
  );
}

export default QuestionsPreview;
