import React from 'react';
import PropTypes from 'prop-types';

const propTypes = {
  title: PropTypes.string.isRequired,
  tagline: PropTypes.string.isRequired,
};

const Hero = ({ title, tagline }) => (
  <section className="hero">
    <div className="hero-body">
      <div className="container">
        <h1 className="title">
          {title}
        </h1>
        <h2 className="subtitle">
          {tagline}
        </h2>
      </div>
    </div>
  </section>
);

Hero.propTypes = propTypes;

export default Hero;
