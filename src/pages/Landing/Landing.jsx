import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import Header from '../../components/Header';
import Hero from '../../components/Hero';
import FeatureCard from '../../components/FeatureCard';

const Landing = ({ theme, toggleTheme }) => {
  const features = [
    {
      title: 'Live Leaderboards',
      description: 'Race against the clock. Faster answers earn more points.'
    },
    {
      title: 'Room PIN',
      description: 'Join with a unique 6-digit code. No accounts required for players.'
    },
    {
      title: 'Quiz Builder',
      description: 'Create questions, options, and timers in seconds.'
    }
  ];

  return (
    <div className={`main-wrapper ${theme}`}>
      <Header theme={theme} toggleTheme={toggleTheme} />
      <Container>
        <Hero />
        <Row className="mt-5 g-4">
          {features.map((feature, index) => (
            <Col key={index} md={4}>
              <FeatureCard 
                title={feature.title} 
                description={feature.description} 
              />
            </Col>
          ))}
        </Row>
      </Container>
    </div>
  );
};

export default Landing;