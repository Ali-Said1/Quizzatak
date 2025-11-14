import React from 'react';
import { useNavigate , Link } from 'react-router-dom';
import { ThemeContext } from "../../contexts/ThemeContext";
import { useContext, useMemo, useState } from "react";
import { Container, Card, Form, Button } from 'react-bootstrap';
import Header from "../../components/Header/Header";
import Swal from 'sweetalert2';
import quizService from '../../services/quizService';
import { useAuth } from "../../contexts/AuthContext";
function JoinGame() {
  const { theme } = useContext(ThemeContext);
    const [gamePin, setGamePin] = useState('');
  const [gameCode, setGameCode] = useState('');
  const { user } = useAuth();
  const participantName = useMemo(
    () => user?.username || localStorage.getItem("displayName") || "Participant",
    [user]
  );
    const navigate = useNavigate();
    const handleJoin = async (e) => {
    e.preventDefault();
    if (!gamePin.trim() || !gameCode.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Missing info",
        text: "Please enter the game code and PIN.",
      });
      return;
    }

    try {
      const lookupPayload = {
        shareCode: gameCode.trim().toUpperCase(),
        pin: gamePin.trim(),
      };
      const session = await quizService.lookupGameSession(lookupPayload);
      if (!session) {
        Swal.fire({
          icon: "error",
          title: "Game not found",
          text: `No active game found for code ${gameCode}`,
        });
        return;
      }

      // Save resolved participant name locally so lobby can display it when unauthenticated
      localStorage.setItem("displayName", participantName);

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
                <Form.Label>Game Code</Form.Label>
                <Form.Control 
                  type="text" 
                  placeholder="e.g. ABC123"
                  value={gameCode}
                  onChange={(e) => setGameCode(e.target.value.toUpperCase())}
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
                      if (/^\d*$/.test(val) && val.length <= 6) {
                        setGamePin(val);
                      }
                    }}
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