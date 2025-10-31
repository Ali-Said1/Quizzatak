import React, { useState } from 'react';
import Landing from './pages/Landing';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

export default function App() {
  const [theme, setTheme] = useState('dark');

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return <Landing theme={theme} toggleTheme={toggleTheme} />;
}