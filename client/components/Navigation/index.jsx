import React, { useState } from "react";
import { Connect, query } from 'urql';
import { Pane, TabNavigation, Tab, Avatar, Button, Spinner } from "evergreen-ui";
import { Location } from '@reach/router';

import Logo from '../Logo';
import LoginDialog from '../LoginDialog';

const me = `
  {
    me {
      email
    }
  }
`;

const Navigation = () => {

  const [loginVisible, setLoginVisible] = useState(false);

  return (
    <Location>
      {({ location, navigate }) => (
        <Pane
          display="flex"
          position="fixed"
          top={0}
          left={0}
          right={0}
          alignItems="center"
          padding={10}
        >
          <Logo />

          <TabNavigation style={{ marginLeft: 10 }}>
            {['structures', 'events', 'games', 'people'].map(tab => (
              <Tab
                key={tab}
                id={tab}
                isSelected={`/${tab}` === location.pathname}
                onSelect={() => navigate(tab)}
                style={{ textTransform: 'capitalize' }}
              >
                {tab}
              </Tab>
            ))}
          </TabNavigation>

          <div style={{ flex: 'auto' }} />

          <Connect query={query(me)}>
            {({ loaded, fetching, error, data }) => {
              if (loaded && !fetching) {
                if (data.me && data.me.email) {
                  return (
                    <Button
                      appearance="primary"
                      intent="danger"
                      onClick={() => {
                        localStorage.removeItem('token');
                      }}
                    >
                      Logout
                    </Button>
                  );
                } else {
                  return (
                    <Button
                      appearance="primary"
                      onClick={() => setLoginVisible(true)}
                    >
                      Login
                    </Button>
                  );
                }
              }

              return (
                <Spinner size={24} />
              );
            }}
          </Connect>

          <LoginDialog visible={loginVisible} onClose={() => setLoginVisible(false)}/>
        </Pane>
      )}
    </Location>
  );
}

export default Navigation;
