import { Button } from '@chakra-ui/react';
import { LuPlus } from 'react-icons/lu';
import { useLocation, useRouteLoaderData } from 'react-router';
import Link from './Link';

import Filters from './Filters';
import OrgList from './OrgList';
import { Page, PageHeader } from './Page';

const COPY = {
  studio: {
    title: 'Studios',
    description: 'Indie game studios around the world',
    add: 'Add a studio',
  },
  association: {
    title: 'Associations',
    description:
      'Associations and collectives that bring indie game makers together',
    add: 'Add an association',
  },
};

/** The studios or associations list (design pass: one page for both). */
const OrgListPage = ({ type, data }) => {
  const { search } = useLocation();
  const { currentUser } = useRouteLoaderData('root') ?? {};
  const { title, description, add } = COPY[type];

  return (
    <Page>
      <PageHeader
        title={title}
        description={`${description}: ${data.total.toLocaleString('en')} so far.`}
        actions={
          currentUser && (
            <Button asChild size="sm">
              <Link to="/orgs/create">
                <LuPlus />
                {add}
              </Link>
            </Button>
          )
        }
      />
      <Filters type={type} facets={data.facets} selected={data.selected} />
      <OrgList key={search} {...data} />
    </Page>
  );
};

export default OrgListPage;
