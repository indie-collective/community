import React, { useState } from 'react';
import { useQuery } from 'urql';
import { Link } from '@reach/router'

import Logo from 'components/Logo';
import LoginDialog from 'components/LoginDialog';
import useLocation from '/hooks/useLocation';

const meQuery = `
  {
    me {
      email
    }
  }
`;

const Navigation = () => {
  const token = localStorage.getItem('token');
  const { location, navigate } = useLocation();

  return (
    <nav className="navbar" role="navigation" aria-label="main navigation">
      <div class="navbar-brand">
        <Logo />
      </div>

      <div class="navbar-menu">
        <Link
          class={`navbar-item is-tab ${'/structures' === location.pathname && 'is-active'}`}
          to="/structures"
        >
          Structures
        </Link>
        <Link
          class={`navbar-item is-tab ${'/events' === location.pathname && 'is-active'}`}
          to="/events"
        >
          Events
        </Link>
      </div>

      <div class="navbar-end">
        <div class="navbar-item">
          <div class="buttons">
            <a class="button is-primary">
              <strong>Sign up</strong>
            </a>
            <a class="button is-light">
              Log in
            </a>
          </div>
        </div>
      </div>

    </nav>
  );
}

export default Navigation;
