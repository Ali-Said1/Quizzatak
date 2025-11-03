import React, { useState } from 'react';
import TeacherDashboard from './pages/teacherDashboard/teacherDashboard.jsx';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing/Landing';
import HostQuiz from './pages/HostQuiz/HostQuiz';
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';
import JoinGame from './pages/JoinGame/JoinGame.jsx';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { ThemeProvider } from './contexts/ThemeContext.jsx';
import { AuthProvider } from './contexts/AuthContext.jsx';

export default function App() {

  return (
    //<AuthProvider>
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
        </Routes>
      </Router>
    </ThemeProvider>
    //</AuthProvider>
  );
}