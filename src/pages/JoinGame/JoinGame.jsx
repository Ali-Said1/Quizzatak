import React from 'react';
import { useNavigate , Link } from 'react-router-dom';
import { ThemeContext } from "../../contexts/ThemeContext";
import { useContext, useState } from "react";
import { Container, Card, Form, Button } from 'react-bootstrap';
import Header from "../../components/Header/Header";
import Swal from 'sweetalert2';
import quizService from '../../services/quizService';
function JoinGame() {
    const {theme, toggleTheme} = useContext(ThemeContext);
    const [displayName, setDisplayName] = useState('');
    const [gamePin, setGamePin] = useState('');
    const [gameId, setGameId] = useState('');
    const navigate = useNavigate();
    const handleJoin = async (e) => {
    e.preventDefault();
    if (!gameId.trim() || !displayName.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Missing info",
        text: "Please enter both Game ID and Display Name",
      });
      return;
    }

    try {
      const session = await quizService.getGameSessionById(gameId);
      if (!session) {
        Swal.fire({
          icon: "error",
          title: "Game not found",
          text: `No active game found with ID ${gameId}`,
        });
        return;
      }

      // Optional PIN check
      if (gamePin && session.pin !== gamePin) {
        Swal.fire({
          icon: "error",
          title: "Invalid PIN",
          text: "The game PIN you entered is incorrect.",
        });
        return;
      }

      // Save display name locally so we can show it in the lobby
      localStorage.setItem("displayName", displayName);

      // Navigate to lobby
      navigate(`/lobby/${session.id}`);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Join failed",
        text: error.message || "Unable to join the game.",
      });
    }
  };
    return ( <>
    <div className={`main-wrapper ${theme}`}>

        <Header />
        <Container className="join-container d-flex justify-content-center align-items-center flex-col" style={{height:"90vh"}}>
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
                  onChange={(e) => {
                    const val = e.target.value;
                    // Only allow digits, and max length 6
                    if (/^\d*$/.test(val) && val.length <= 6) {
                      setGamePin(val);
                    }
                  }}
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
            onClick={handleJoin}
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