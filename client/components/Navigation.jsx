import {
  Box,
  Flex,
  Tabs,
  TabList,
  Tab,
} from '@chakra-ui/core';
import { useRouter } from 'next/router';
import Link from 'next/link';

import Logo from './Logo';
import AvatarButton from './AvatarButton';

const tabs = [
  { label: 'Games', url: '/games' },
  { label: 'Orgs', url: '/orgs' },
  { label: 'Events', url: '/events' },
];

const Navigation = () => {
  const { pathname, push } = useRouter();

  return (
    <Flex pl={5} pr={2} pt={5} alignItems="center">
      <Link href="/">
        <a><Logo /></a>
      </Link>

      <Tabs
        ml={5}
        variant="solid-rounded"
        onChange={i => push(tabs[i].url)}
        index={tabs.findIndex(tab => tab.url === pathname)}
      >
        <TabList>
          {tabs.map(tab => (
            <Tab key={tab.url}>{tab.label}</Tab>
          ))}
        </TabList>
      </Tabs>

      <Box flex="auto" />

      <AvatarButton />
    </Flex>
  );
};

export default Navigation;
