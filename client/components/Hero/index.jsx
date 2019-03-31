import React from 'react';
import { Jumbotron, Container } from 'react-bootstrap';

const Hero = ({ title, tagline }) => (
  <Jumbotron fluid>
    <Container>
      <h1>{title}</h1>
      <p>
        {tagline}
      </p>
    </Container>
  </Jumbotron>
);

export default Hero;
