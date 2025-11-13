import React, { useContext } from "react";
import { ThemeContext } from "../../contexts/ThemeContext";
import 'bootstrap-icons/font/bootstrap-icons.css';
import './ThemeToggle.css';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <div className="d-flex align-items-center gap-2">
      {/* Light icon */}
      <i className="bi bi-sun-fill text-warning"></i>
      
      {/* Slider */}
      <label className="switch m-0">
        <input 
          type="checkbox" 
          checked={theme === "dark"} 
          onChange={toggleTheme} 
        />
        <span className="slider round"></span>
      </label>

      {/* Dark icon */}
      <i className="bi bi-moon-fill text-info"></i>
    </div>
  );
};

export default ThemeToggle;
