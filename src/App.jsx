import React, { useState } from 'react';
import TeacherDashboard from './pages/teacherDashboard/teacherDashboard.jsx';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing/Landing';
import HostQuiz from './pages/HostQuiz/HostQuiz';
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { ThemeProvider } from './contexts/ThemeContext.jsx';

export default function App() {
  const [theme, setTheme] = useState('dark');

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route 
            path="/" 
            element={<Landing theme={theme} toggleTheme={toggleTheme} />} 
          />
          <Route 
            path="/host" 
            element={<HostQuiz theme={theme} toggleTheme={toggleTheme} />} 
          />
          <Route 
            path="/login" 
            element={<Login theme={theme} toggleTheme={toggleTheme} />} 
          />
          <Route 
            path="/signup" 
            element={<Signup theme={theme} toggleTheme={toggleTheme} />} 
          />
          <Route
          path="/dashboard"
          element={<TeacherDashboard theme={theme} toggleTheme={toggleTheme} />}
        />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}