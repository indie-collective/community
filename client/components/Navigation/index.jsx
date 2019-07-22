import React, { useState, useEffect } from 'react';
import { A, navigate, usePath } from 'hookrouter';
import { useQuery } from 'urql';

import Logo from 'components/Logo';
import SearchBar from '../SearchBar';

import searchGames from 'gql/searchGames';

const Navigation = () => {
  const path = usePath(true);

  const [menuActive, setMenuActive] = useState(false);

  const [searchString, setSearchString] = useState();
  const [searchResults, setSearchResults] = useState();

  const [search, executeSearch] = useQuery({
    query: searchGames,
    variables: {
      str: searchString,
    },
    pause: true,
  });

  useEffect(() => {
    if (!searchString) {
      setSearchResults([]);
      return;
    }

    if (searchString.length > 2) {
      executeSearch();
    }
  }, [searchString]);

  useEffect(() => {
    if (!search.data) return;
    setSearchResults(
      search.data.searchGames.nodes.map(d => ({
        key: d.id,
        render: () => (
          <div>
            <strong>{d.name}</strong>
            <p style={{ fontSize: 'smaller', fontStyle: 'italic' }}>
              {`${d.about.substr(0, 50)}…`}
            </p>
          </div>
        ),
      }))
    );
  }, [search.data]);

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
          onClick={() => setMenuActive(!menuActive)}
        >
          <span aria-hidden="true" />
          <span aria-hidden="true" />
          <span aria-hidden="true" />
        </a>
      </div>

      <div className={menuActive ? 'navbar-menu is-active' : 'navbar-menu'}>
        <div className="navbar-start"></div>
        <div className="navbar-item is-expanded">
          <SearchBar
            results={searchResults}
            loading={search.fetching}
            onSearch={str => setSearchString(str)}
            onSelect={id => {
              navigate(`/game/${id}`);
              setSearchResults([]);
            }}
          />
        </div>

        <div className="navbar-end">
          <div className="navbar-item">
            <div className="tabs is-toggle">
              <ul>
                <li className={path === '/games' ? 'is-active' : ''}>
                  <A href="/games">Games</A>
                </li>
                <li className={path === '/events' ? 'is-active' : ''}>
                  <A href="/events">Events</A>
                </li>
                <li className={path === '/entities' ? 'is-active' : ''}>
                  <A href="/entities">Entities</A>
                </li>
              </ul>
            </div>
          </div>

          <span className="navbar-item">
            <a className="button is-success">
              <span>Connect</span>
            </a>
          </span>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
