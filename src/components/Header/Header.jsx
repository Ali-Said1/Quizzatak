import React, { useContext } from "react";
import { Navbar, Container, Nav, Button, NavDropdown } from "react-bootstrap";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ThemeContext } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import logo from "../../assets/quizzatak.png";
import "./Header.css"
import ThemeToggle from "../ThemeToggle/ThemeToggle";
const Header = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <Navbar
      expand="lg"
      fixed="top"
      variant={theme === "dark" ? "dark" : "light"}
      className={`app-navbar ${theme} shadow-sm`}
    >
      <Container>
        {/* Logo + Brand */}
        <Navbar.Brand
          as={Link}
          to="/"
          className="d-flex align-items-center fw-bold text-light"
        >
          <img
            src={logo}
            alt="Quizzatak Logo"
            className="navbar-logo me-2"
          />
          Quizzatak
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="main-navbar" />

        <Navbar.Collapse id="main-navbar">
          <Nav className="ms-auto align-items-center">
            <Nav.Link
              as={Link}
              to="/"
              active={location.pathname === "/"}
              className="text-light"
            >
              Home
            </Nav.Link>

            {!user && (
              <>
                <Nav.Link
                  as={Link}
                  to="/login"
                  active={location.pathname === "/login"}
                  className="text-light"
                >
                  Sign In
                </Nav.Link>
                <Nav.Link
                  as={Link}
                  to="/signup"
                  active={location.pathname === "/signup"}
                  className="text-light"
                >
                  Sign Up
                </Nav.Link>
              </>
            )}

            {user && (
               <NavDropdown
                title={<span className="text-light">{user.username}</span>}
                id="user-dropdown"
                align="end"
                menuVariant={theme}
              >
                <NavDropdown.Item as={Link} to="/profile">
                  Profile
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item as={Link} to="/dashboard">Dashboard</NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={handleLogout}>Logout</NavDropdown.Item>
              </NavDropdown>

            )}

            <ThemeToggle
              onClick={toggleTheme}
              className="ms-2"
            />
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;
