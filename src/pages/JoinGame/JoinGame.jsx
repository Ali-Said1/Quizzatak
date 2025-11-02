import { ThemeContext } from "../../contexts/ThemeContext";
import { useContext, useState } from "react";
import { Container, Card, Form, Button } from 'react-bootstrap';
import './JoinGame.css';
import Header from "../../components/Header";
import { Link } from "react-router-dom";
function JoinGame() {
    const {theme, toggleTheme} = useContext(ThemeContext);
    const [displayName, setDisplayName] = useState('');
    const [gamePin, setGamePin] = useState('');
    const [gameId, setGameId] = useState('');
    return ( <>
    <div className={`main-wrapper ${theme}`}>
        <Header />
        <Container className="join-container">
        <Card className="quiz-card p-4" style={{ maxWidth: '450px', width: '100%' }}>
          <Card.Body>
            <h3 className="text-center fw-bold mb-4">Join Game</h3>
            
            <Form>

              <Form.Group className="mb-3">
                <Form.Label>Game ID</Form.Label>
                <Form.Control 
                  type="text" 
                  placeholder="Game ID"
                  value={gameId}
                  onChange={(e) => setGameId(e.target.value)}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Game PIN</Form.Label>
                <Form.Control 
                  type="text" 
                  placeholder="6-digit PIN"
                  value={gamePin}
                  onChange={(e) => setGamePin(e.target.value)}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Display Name</Form.Label>
                <Form.Control 
                  type="text" 
                  placeholder="Your display name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
              </Form.Group>

            <Button 
            variant="secondary" 
            className="w-100 mb-3" 
            size="lg"
            >
            Join
            </Button>
            <Link to="/">
                <Button 
                variant="secondary" 
                className="w-100" 
                size="lg"
                >
                Back
                </Button>
            </Link>
                </Form>
            

          </Card.Body>
        </Card>
      </Container>
    </div>
    </> );
}

export default JoinGame;