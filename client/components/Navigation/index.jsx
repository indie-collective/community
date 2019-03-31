import React, { useState } from "react";
import { useQuery } from 'urql';
import { Container, Navbar, Nav, Button } from 'react-bootstrap';

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
  const [loginVisible, setLoginVisible] = useState(false);
  const [me, getMe] = useQuery({ query: meQuery, requestPolicy: 'network-only' });
  const { location, navigate } = useLocation();

  return (
    <Container>
      <Navbar>
        <Navbar.Brand href="#home">
          <Logo />
        </Navbar.Brand>
        <Navbar.Collapse>
          <Nav>
            <Nav.Item>
              <Nav.Link
                active={`/structures` === location.pathname}
                onClick={() => navigate(`/structures`)}
              >
                Structures
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link
                active={`/events` === location.pathname}
                onClick={() => navigate(`/events`)}
              >
                Events
              </Nav.Link>
            </Nav.Item>
          </Nav>
        </Navbar.Collapse>
        <form className="form-inline my-2 my-lg-0">
          {me.fetching ? (
            <div className="spinner-grow spinner-grow-sm" role="status">
              <span className="sr-only">Loading…</span>
            </div>
          ) : (
            (me.data && me.data.me && me.data.me.email) ? (
              <Button
                size="sm"
                variant="danger"
                onClick={() => {
                  localStorage.removeItem('token');
                  getMe();
                  toaster.success(
                    'Successfully logged out.'
                    )
                  }}
                  >
                Logout
              </Button>
            ) : (
              <Button
                size="sm"
                variant="success"
                onClick={() => setLoginVisible(true)}
              >
                Login
              </Button>
            )
          )}
          <LoginDialog visible={loginVisible} onClose={() => setLoginVisible(false)}/>
        </form>
      </Navbar>
    </Container>
  );
}

export default Navigation;
