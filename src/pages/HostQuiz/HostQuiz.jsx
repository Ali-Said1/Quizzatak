import React, { useState, useContext, useEffect } from 'react';
// import { useParams } from 'react-router-dom';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Form, 
  Button, 
  InputGroup 
} from 'react-bootstrap';
import Header from '../../components/Header/Header';
import './HostQuiz.css'
import { ThemeContext } from "../../contexts/ThemeContext";
import QuestionsPreview from '../../components/QuestionsPreview/QuestionsPreview';
import Swal from "sweetalert2";
import quizService from '../../services/quizService';
import classroomService from '../../services/classroomService.js';
import { useAuth } from '../../contexts/AuthContext.jsx';


const HostQuiz = () => {
  // State for the form fields
  const [title, setTitle] = useState('');
  const [question, setQuestion] = useState('');
  const [option1, setOption1] = useState('');
  const [option2, setOption2] = useState('');
  const [option3, setOption3] = useState('');
  const [option4, setOption4] = useState('');
  const [correctOption, setCorrectOption] = useState(1); // Default to option 1
  const [timer, setTimer] = useState(20);
  const {theme} = useContext(ThemeContext)
  const { user } = useAuth();
  const [classrooms, setClassrooms] = useState([]);
  const [selectedClassroom, setSelectedClassroom] = useState('');
  const [loadingClassrooms, setLoadingClassrooms] = useState(false);
  const [hosting, setHosting] = useState(false);

  // Simple state for preview
  const [questions, setQuestions] = useState([]);
  // const { classroomId } = useParams();

  useEffect(() => {
    const fetchClassrooms = async () => {
      if (user?.role !== 'teacher') return;
      setLoadingClassrooms(true);
      try {
        const data = await classroomService.getAllClassrooms();
        const parsed = Array.isArray(data) ? data : data?.classrooms ?? [];
        setClassrooms(parsed);
        if (parsed.length) {
          setSelectedClassroom(parsed[0].id);
        }
      } catch (error) {
        Swal.fire({ icon: 'error', title: 'Failed to load classrooms', text: error.message });
      } finally {
        setLoadingClassrooms(false);
      }
    };
    fetchClassrooms();
  }, [user]);

  if (!user) {
    return (
      <div className={`main-wrapper ${theme}`}>
        <Header />
        <Container className="py-5">
          <Card className="quiz-card p-4">
            <Card.Body className="text-center">
              <h4>Please sign in to host quizzes.</h4>
            </Card.Body>
          </Card>
        </Container>
      </div>
    );
  }

  if (user.role !== 'teacher') {
    return (
      <div className={`main-wrapper ${theme}`}>
        <Header />
        <Container className="py-5">
          <Card className="quiz-card p-4">
            <Card.Body className="text-center">
              <h4>You need a teacher account to host quizzes.</h4>
            </Card.Body>
          </Card>
        </Container>
      </div>
    );
  }

  const handleGeneratePin = async () => {
    if (!title.trim()) {
      return Swal.fire({
        icon: 'warning',
        title: 'Missing Title',
        text: 'Please add a quiz title before generating a PIN.',
        confirmButtonColor: '#6c63ff'
      });
    }

    if (questions.length === 0) {
      return Swal.fire({
        icon: 'warning',
        title: 'No Questions',
        text: 'Add at least one question before hosting a quiz.',
        confirmButtonColor: '#6c63ff'
      });
    }

    if (!selectedClassroom) {
      return Swal.fire({
        icon: 'warning',
        title: 'Select classroom',
        text: 'Choose a classroom to host this quiz.',
      });
    }

    try {
      setHosting(true);
      // Step 1: Create quiz
      const quiz = await quizService.createQuiz({
        title,
        classroomId: selectedClassroom,
        questions,
        createdAt: new Date().toISOString(),
        quizSubmissions: []
      });

      // Step 2: Create game session for that quiz
      const gameSession = await quizService.createGameSession({
        quizId: quiz.id,
        classroomId: selectedClassroom,
        pin: Math.floor(100000 + Math.random() * 900000).toString(), // 6-digit PIN
        state: 'waiting',
        createdAt: new Date().toISOString()
      });

      // Step 3: Success alert with PIN
      Swal.fire({
        icon: 'success',
        title: 'Quiz Hosted!',
        html: `<p>Your quiz PIN is:</p><h2 style="color:#6c63ff">${gameSession.pin}</h2>`,
        confirmButtonColor: '#6c63ff'
      });

      // Optional: reset fields
      setTitle('');
      setQuestions([]);

    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Failed to host quiz',
        text: error.message || 'Unable to create quiz or session.',
        confirmButtonColor: '#6c63ff'
      });
    } finally {
      setHosting(false);
    }
  };

  const handleAddQuestion = () => {
    // Basic validation
    if (!question || !option1 || !option2 || !option3 || !option4) {
      Swal.fire({
        icon: 'warning',
        title: 'Incomplete question',
        text: 'Please fill out the question and all four options before adding.',
        confirmButtonColor: '#6c63ff'
      });
      return;
    }

    // Add question to preview
    const newQuestion = {
      text: question,
      options: [option1, option2, option3, option4],
      correct: correctOption,
      timer
    };
    setQuestions(prev => [...prev, newQuestion]);

    Swal.fire({
      icon: 'success',
      title: 'Question added!',
      text: 'Your question has been added to the quiz preview.',
      confirmButtonColor: '#6c63ff',
      timer: 1500,
      showConfirmButton: false
    });

    // Reset fields
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
      <Header/>
      <Container className="mt-4">
        <Card className="quiz-card p-4 mb-4">
          <Card.Body>
            <h5 className="mb-3">Select Classroom</h5>
            <Form.Select
              value={selectedClassroom}
              onChange={(e) => setSelectedClassroom(e.target.value)}
              disabled={loadingClassrooms || classrooms.length === 0}
            >
              {classrooms.length === 0 ? (
                <option>No classrooms available</option>
              ) : (
                classrooms.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))
              )}
            </Form.Select>
          </Card.Body>
        </Card>
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
          <QuestionsPreview questions={questions} onGeneratePin={handleGeneratePin} isGenerating={hosting} />
        </Row>
      </Container>
    </div>
  );
};

export default HostQuiz;