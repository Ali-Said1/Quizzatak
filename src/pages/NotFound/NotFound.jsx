import React, { useContext } from "react";
import { Container, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { ThemeContext } from "../../contexts/ThemeContext";
import Header from "../../components/Header/Header";
import "./NotFound.css";

const NotFound = () => {
  const { theme } = useContext(ThemeContext);

  return (
    <div className={`notfound-wrapper ${theme} d-flex flex-col`}>
      <Header />
      <Container className="text-center py-5">
        <h1 className="display-1 fw-bold mb-3">404</h1>
        <h3 className="mb-3">Page Not Found</h3>
        <p className="lead mb-4">
          The page you’re looking for doesn’t seem to exist.
        </p>
        <Link to="/">
          <Button size="lg" className="btn-home">
            Home
          </Button>
        </Link>
      </Container>
    </div>
  );
};

export default NotFound;
