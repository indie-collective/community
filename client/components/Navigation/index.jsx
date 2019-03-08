import React, { useState } from "react";
import { useQuery } from 'urql';
import { Pane, TabNavigation, Tab, Button, Spinner, toaster } from "evergreen-ui";

import Logo from '../Logo';
import LoginDialog from '../LoginDialog';
import useLocation from '../../hooks/useLocation';

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
    <Pane
      display="flex"
      position="fixed"
      top={0}
      left={0}
      right={0}
      alignItems="center"
      padding={10}
      maxWidth={820}
      margin="auto"
    >
      <Logo />

      <TabNavigation style={{ marginLeft: 10 }}>
        {['structures', 'events'].map(tab => (
          <Tab
            key={tab}
            id={tab}
            isSelected={`/${tab}` === location.pathname}
            onSelect={() => navigate(`/${tab}`)}
            style={{ textTransform: 'capitalize' }}
          >
            {tab}
          </Tab>
        ))}
      </TabNavigation>

      <div style={{ flex: 'auto' }} />

      {me.fetching ? (
        <Spinner size={24} />
      ) : (
        (me.data && me.data.me && me.data.me.email) ? (
          <Button
            appearance="primary"
            intent="danger"
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
            appearance="primary"
            onClick={() => setLoginVisible(true)}
          >
            Login
          </Button>
        )
      )}

      <LoginDialog visible={loginVisible} onClose={() => setLoginVisible(false)}/>
    </Pane>
  );
}

export default Navigation;
