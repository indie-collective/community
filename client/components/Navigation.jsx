import { Box, Flex, Tabs, TabList, Tab } from '@chakra-ui/core';
import { useRouter } from 'next/router';

import Logo from './Logo';

const tabs = [
  { label: 'Games', url: '/games' },
  { label: 'Orgs', url: '/orgs' },
  { label: 'Events', url: '/events' },
];

const Navigation = () => {
  const { pathname, push } = useRouter();

  return (
    <Flex pl={5} pt={5} alignItems="end">
      <Logo />

      <Box flex="auto" />

      <Tabs
        variant="solid-rounded"
        onChange={i => push(tabs[i].url)}
        index={tabs.findIndex(tab => tab.url === pathname)}
      >
        <TabList>
          {tabs.map(tab => (
            <Tab key={tab.index}>{tab.label}</Tab>
          ))}
        </TabList>
      </Tabs>
    </Flex>
  );
};

export default Navigation;
