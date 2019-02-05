import React from "react";
import { Menu, Input } from "semantic-ui-react";
import { Location } from '@reach/router';

import Logo from "../Logo";

const Navigation = () => (
  <Location>
    {({ location, navigate }) => (
      <Menu fixed="top" secondary>
        <Menu.Item>
          <Logo />
        </Menu.Item>

        <Menu.Item
          name="structures"
          active={location === '/structures'}
          onClick={() => navigate('/structures')}
        />
        <Menu.Item
          name="events"
          active={location === '/structures'}
          onClick={() => navigate('/events')}
        />
        <Menu.Item
          name="games"
          active={location === '/structures'}
          onClick={() => navigate('/games')}
        />
        <Menu.Item
          name="people"
          active={location === '/structures'}
          onClick={() => navigate('/people')}
        />

        <Menu.Menu position="right">
          <Menu.Item>
            <Input icon="search" placeholder="Search..." />
          </Menu.Item>
          <Menu.Item
            name="logout"
            onClick={() => alert('logout')}
          />
        </Menu.Menu>
      </Menu>
    )}
  </Location>
);

export default Navigation;
