import React, { useState } from 'react';
import TeacherDashboard from './pages/teacherDashboard/teacherDashboard.jsx';
import 'bootstrap/dist/css/bootstrap.min.css';

import './App.css';

export default function App() {
  const [theme, setTheme] = useState('dark');

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return <TeacherDashboard theme={theme} toggleTheme={toggleTheme} />;
}