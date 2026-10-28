import { Button } from '@chakra-ui/react';
import { LuPlus } from 'react-icons/lu';
import { useLocation, useRouteLoaderData } from 'react-router';
import Link from './Link';

import Filters from './Filters';
import OrgList from './OrgList';
import { Page, PageHeader } from './Page';
import { useT } from '../i18n';

// What each list is called (#344: in the interface's language).
const HAS_ADD = { studio: true, association: true, publisher: false };

/** The studios, associations or publishers list (design pass: one page for all). */
const OrgListPage = ({ type, data }) => {
  const { search } = useLocation();
  const { currentUser } = useRouteLoaderData('root') ?? {};
  const t = useT();
  const title = t(`lists.${type}.title`);
  const add = HAS_ADD[type] && t(`lists.${type}.add`);

  return (
    <Page>
      <PageHeader
        title={title}
        description={t(`lists.${type}.description`, { count: data.total })}
        actions={
          currentUser &&
          add && (
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
