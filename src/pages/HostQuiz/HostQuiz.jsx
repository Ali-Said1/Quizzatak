import React, { useState } from 'react';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Form, 
  Button, 
  InputGroup 
} from 'react-bootstrap';
import QuizHeader from '../../components/QuizHeader';
import './HostQuiz.css'

const HostQuiz = ({ theme, toggleTheme }) => {
  // State for the form fields
  const [title, setTitle] = useState('');
  const [question, setQuestion] = useState('');
  const [option1, setOption1] = useState('');
  const [option2, setOption2] = useState('');
  const [option3, setOption3] = useState('');
  const [option4, setOption4] = useState('');
  const [correctOption, setCorrectOption] = useState(1); // Default to option 1
  const [timer, setTimer] = useState(20);

  // Simple state for preview
  const [questions, setQuestions] = useState([]);

  const handleAddQuestion = () => {
    // Basic validation
    if (!question || !option1 || !option2 || !option3 || !option4) {
      console.error("Please fill out all question and option fields.");
      return;
    }
    
    // Add question to the list for preview
    const newQuestion = {
      text: question,
      options: [option1, option2, option3, option4],
      correct: correctOption,
      timer: timer
    };
    setQuestions([...questions, newQuestion]);

    // Clear form fields after adding
    setQuestion('');
    setOption1('');
    setOption2('');
    setOption3('');
    setOption4('');
    setCorrectOption(1);
    setTimer(20);
  };

  return (
    // This wrapper applies your theme from App.css
    <div className={`main-wrapper ${theme}`}>
      <QuizHeader theme={theme} toggleTheme={toggleTheme} />
      <Container className="mt-4">
        <Row className="g-4">
          
          {/* Left Column: Quiz Builder */}
          <Col md={7}>
            <Card className="quiz-card p-4">
              <Card.Body>
                {/* Quiz Details Section */}
                <h5>Quiz Details</h5>
                <Form.Group className="mb-3">
                  <Form.Label>Title</Form.Label>
                  <Form.Control 
                    type="text" 
                    placeholder="e.g. JavaScript Fundamentals"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </Form.Group>

                <hr className="my-4" />

                {/* Add Question Section */}
                <h5>Add Question</h5>
                <Form.Group className="mb-3">
                  <Form.Label>Question</Form.Label>
                  <Form.Control 
                    as="textarea" 
                    rows={3} 
                    placeholder="Type your question..."
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                  />
                </Form.Group>

                <Form.Label>Options</Form.Label>
                {/* We use InputGroup to add the radio button inside */}
                <InputGroup className="mb-3">
                  <InputGroup.Radio 
                    name="correctOption" 
                    aria-label="Correct option 1"
                    checked={correctOption === 1}
                    onChange={() => setCorrectOption(1)}
                  />
                  <Form.Control 
                    placeholder="Option 1" 
                    value={option1}
                    onChange={(e) => setOption1(e.target.value)}
                  />
                </InputGroup>
                
                <InputGroup className="mb-3">
                  <InputGroup.Radio 
                    name="correctOption" 
                    aria-label="Correct option 2"
                    checked={correctOption === 2}
                    onChange={() => setCorrectOption(2)}
                  />
                  <Form.Control 
                    placeholder="Option 2" 
                    value={option2}
                    onChange={(e) => setOption2(e.target.value)}
                  />
                </InputGroup>

                <InputGroup className="mb-3">
                  <InputGroup.Radio 
                    name="correctOption" 
                    aria-label="Correct option 3"
                    checked={correctOption === 3}
                    onChange={() => setCorrectOption(3)}
                  />
                  <Form.Control 
                    placeholder="Option 3" 
                    value={option3}
                    onChange={(e) => setOption3(e.target.value)}
                  />
                </InputGroup>

                <InputGroup className="mb-3">
                  <InputGroup.Radio 
                    name="correctOption" 
                    aria-label="Correct option 4"
                    checked={correctOption === 4}
                    onChange={() => setCorrectOption(4)}
                  />
                  <Form.Control 
                    placeholder="Option 4" 
                    value={option4}
                    onChange={(e) => setOption4(e.target.value)}
                  />
                </InputGroup>
                
                <Form.Group className="mb-3" style={{ maxWidth: '150px' }}>
                  <Form.Label>Timer (seconds)</Form.Label>
                  <Form.Control 
                    type="number" 
                    value={timer}
                    onChange={(e) => setTimer(Number(e.target.value))}
                  />
                </Form.Group>

                <Button variant="secondary" className="btn-add-question" onClick={handleAddQuestion}>
                  Add Question
                </Button>

              </Card.Body>
            </Card>
          </Col>

          {/* Right Column: Preview */}
          <Col md={5}>
            <Card className="quiz-card p-4">
              <Card.Body>
                <h5 className="mb-3">Preview</h5>
                {questions.length === 0 ? (
                  <p className="text-muted small">
                    Add at least one question to create your quiz.
                  </p>
                ) : (
                  <p className="text-muted small">
                    {`You have added ${questions.length} question(s).`}
                  </p>
                )}
                
                <Button 
                  variant="success" 
                  className="w-100 mt-4" 
                  disabled={questions.length === 0}
                >
                  Generate Game PIN & Go to Lobby
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default HostQuiz;