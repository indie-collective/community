import React, { useState } from 'react';
import { getWorkingPath, A } from 'hookrouter';

import Logo from 'components/Logo';

const meQuery = `
  {
    me {
      email
    }
  }
`;

const Navigation = () => {
  const workingPath = getWorkingPath();

  return (
    <nav className="navbar" role="navigation" aria-label="main navigation">
      <div className="navbar-brand">
        <A href="/" className="navbar-item">
          <Logo />
        </A>

        <a
          role="button"
          className="navbar-burger burger"
          aria-label="menu"
          aria-expanded="true"
          data-target="navbarBasicExample"
        >
          <span aria-hidden="true" />
          <span aria-hidden="true" />
          <span aria-hidden="true" />
        </a>
      </div>

      <div className="navbar-menu">
        <div className="navbar-start">
          <A
            href="/games"
            className={`navbar-item is-tab ${'/games' === workingPath &&
              'is-active'}`}
          >
            Games
          </A>
          <A
            href="/entities"
            className={`navbar-item is-tab ${'/entities' === workingPath &&
              'is-active'}`}
          >
            Entities
          </A>
          <A
            href="/events"
            className={`navbar-item is-tab ${'/events' === workingPath &&
              'is-active'}`}
          >
            Events
          </A>
        </div>

        <div className="navbar-end">
          <div className="navbar-item">
            <div className="buttons">
              <A href="/signup" className="button is-primary">
                <strong>Sign up</strong>
              </A>
              <A href="/login" className="button is-light">
                Log in
              </A>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
