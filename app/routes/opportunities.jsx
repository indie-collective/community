import { Checkbox, NativeSelect, Text } from '@chakra-ui/react';
import { Form, useLoaderData, useSubmit } from 'react-router';

import CountryCombobox from '../components/CountryCombobox';
import OpportunityList from '../components/OpportunityList';
import { FilterBar, Page, PageHeader } from '../components/Page';
import { listOpportunities, listOpportunityCountries } from '../data/opportunities.server';
import { requireFeature } from '../data/featureFlags.server';
import isAuthenticated from '../utils/isAuthenticated.server';
import { pageMeta } from '../utils/meta';
import { OPPORTUNITY_KINDS } from '../utils/opportunities';

// Every current opportunity (#345), filtered by kind, country and remote.
export const loader = async ({ request }) => {
  const params = new URL(request.url).searchParams;
  const kind = OPPORTUNITY_KINDS.some(([value]) => value === params.get('kind')) ? params.get('kind') : null;
  const country = params.get('country')?.toUpperCase() || null;
  const remote = params.get('remote') === 'on';
  const currentUser = await isAuthenticated(request);
  // Behind their feature flag (/admin/flags).
  await requireFeature('opportunities', currentUser);
  const [opportunities, countries] = await Promise.all([
    listOpportunities({ kind, country, remote }),
    listOpportunityCountries(),
  ]);
  return { currentUser, opportunities, facets: { countries }, selected: { kind, country, remote } };
};

export const meta = ({ matches, location }) =>
  pageMeta(matches, {
    title: 'Opportunities',
    description: 'Jobs, playtests, team-ups and publishers open to pitches, from the indie scene.',
    path: location.pathname,
  });

const Opportunities = () => {
  const { opportunities, currentUser, facets, selected } = useLoaderData();
  const submit = useSubmit();
  const change = (event) => submit(event.currentTarget.form);
  return (
    <Page>
      <PageHeader
        title="Opportunities"
        description="Jobs, playtests, team-ups, calls for submissions and publishers taking pitches. Post one from your studio's, game's or event's page."
      />
      <Form method="get">
        <FilterBar>
          <CountryCombobox countries={facets.countries} defaultValue={selected.country} onChange={(form) => submit(form)} />
          <NativeSelect.Root size="sm" width="auto">
            <NativeSelect.Field name="kind" aria-label="Kind" defaultValue={selected.kind ?? ''} onChange={change} borderRadius="md" width="auto">
              <option value="">Every kind</option>
              {OPPORTUNITY_KINDS.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </NativeSelect.Field>
            <NativeSelect.Indicator />
          </NativeSelect.Root>
          <Checkbox.Root name="remote" value="on" defaultChecked={selected.remote} colorPalette="green">
            <Checkbox.HiddenInput onChange={change} />
            <Checkbox.Control>
              <Checkbox.Indicator />
            </Checkbox.Control>
            <Checkbox.Label>Remote</Checkbox.Label>
          </Checkbox.Root>
        </FilterBar>
      </Form>
      {opportunities.length > 0 ? (
        <OpportunityList opportunities={opportunities} currentUser={currentUser} />
      ) : (
        <Text color="muted" py={10} textAlign="center">
          No opportunities like this right now.
        </Text>
      )}
    </Page>
  );
};

export default Opportunities;
