import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import ProfilePage from './pages/ProfilePage/ProfilePage.jsx';
import TeacherDashboard from './pages/teacherDashboard/teacherDashboard.jsx';
import GameLobby from './pages/GameLobby/GameLobby.jsx';
import Quiz from './pages/Quiz/Quiz.jsx';
import Landing from './pages/Landing/Landing';
import HostQuiz from './pages/HostQuiz/HostQuiz';
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';
import JoinGame from './pages/JoinGame/JoinGame.jsx';
import Spinner from './components/Spinner.jsx';

import { ThemeProvider } from './contexts/ThemeContext.jsx';
import { AuthProvider } from './contexts/AuthContext.jsx';

import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

export default function App() {

  return (
    <AuthProvider>
    <ThemeProvider>
      <Router>
        <Routes>
          <Route 
            path="/" 
            element={<Landing/>} 
          />
          <Route 
            path="/host" 
            element={<HostQuiz/>} 
          />
          <Route 
            path="/login" 
            element={<Login/>} 
          />
          <Route 
            path="/signup" 
            element={<Signup/>} 
          />
          <Route
          path="/dashboard"
          element={<TeacherDashboard/>}
          />
          <Route
          path="/join"
          element={<JoinGame/>}
          />
          <Route
          path="/profile"
          element={<ProfilePage />}
          />
          <Route path="/lobby/:gameSessionId" element={<GameLobby />} />
          <Route path="/quiz/:gameSessionId" element={<Quiz />} />
          <Route path="/spinner" element={<Spinner />}/>
          
        </Routes>
      </Router>
    </ThemeProvider>
     </AuthProvider>
  );
}