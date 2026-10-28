import { Alert, Box, Button, Checkbox, Field, Grid, Input, NativeSelect, Text, Textarea } from '@chakra-ui/react';
import { Form, redirect, useActionData, useLoaderData, useNavigation } from 'react-router';

import { PageHeader } from '../components/Page';
import countryNames from '../assets/countries.json';
import { createOpportunity, getOpportunityTarget } from '../data/opportunities.server';
import { actionErrorMessage } from '../utils/actionError.server';
import { authorizer, canWrite } from '../utils/auth.server';
import isAuthenticated from '../utils/isAuthenticated.server';
import { MAX_DAYS, MAX_TITLE, OPPORTUNITY_KINDS, parseOpportunity } from '../utils/opportunities';
import { webUrl } from '../utils/url';

// Posting an opportunity (#345), from an organisation's, game's or event's
// page: ?for=organization:<id>, game:<id> or event:<id>.

async function targetOf(request) {
  const [kind, id] = (new URL(request.url).searchParams.get('for') ?? '').split(':');
  const target = await getOpportunityTarget(kind, id);
  if (!target) throw new Response('Not Found', { status: 404 });
  return target;
}

export const loader = async ({ request }) => {
  await isAuthenticated(request, true);
  return { target: await targetOf(request) };
};

export async function action(args) {
  const currentUser = await authorizer.authorize(args, { rules: [canWrite] });
  const target = await targetOf(args.request);
  const form = await args.request.formData();
  const fields = parseOpportunity(form);
  if (fields.error) return { error: fields.error };
  try {
    const { id } = await createOpportunity({ ...fields, link: webUrl(form.get('link')) }, { for: target, authorId: currentUser.id });
    return redirect(`/opportunities#${id}`);
  } catch (err) {
    return { error: await actionErrorMessage(err) };
  }
}

export const meta = () => [{ title: 'Post an opportunity' }];

const inDays = (days) => new Date(Date.now() + days * 86400000).toISOString().slice(0, 10);

const NewOpportunity = () => {
  const { target } = useLoaderData();
  const actionData = useActionData();
  const navigation = useNavigation();
  return (
    <Box maxW="560px" mx="auto" px={{ base: 4, md: 5 }} pt={{ base: 5, md: 7 }} pb={12}>
      <PageHeader title="Post an opportunity" description={`For ${target.name}. It stays up until its end date, ${MAX_DAYS} days at most.`} />
      {actionData?.error && (
        <Alert.Root status="error" mb={4}>
          <Alert.Indicator />
          <Alert.Title>{actionData.error}</Alert.Title>
        </Alert.Root>
      )}
      <Form method="post">
        <Grid gap={5}>
          <Field.Root required>
            <Field.Label htmlFor="kind">What is it</Field.Label>
            <NativeSelect.Root>
              <NativeSelect.Field id="kind" name="kind" defaultValue="job">
                {OPPORTUNITY_KINDS.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </NativeSelect.Field>
              <NativeSelect.Indicator />
            </NativeSelect.Root>
          </Field.Root>
          <Field.Root required>
            <Field.Label htmlFor="title">Title</Field.Label>
            <Input id="title" name="title" maxLength={MAX_TITLE} required placeholder="Junior Unity developer, Lyon or remote" />
          </Field.Root>
          <Field.Root>
            <Field.Label htmlFor="about">Details</Field.Label>
            <Textarea id="about" name="about" minH="8rem" placeholder="What it is, who you're looking for, how to apply…" />
          </Field.Root>
          <Field.Root>
            <Field.Label htmlFor="link">Where to apply</Field.Label>
            <Input id="link" name="link" inputMode="url" placeholder="https://…" />
          </Field.Root>
          <Grid templateColumns="1fr 1fr" gap={3}>
            <Field.Root>
              <Field.Label htmlFor="city">City</Field.Label>
              <Input id="city" name="city" />
            </Field.Root>
            <Field.Root>
              <Field.Label htmlFor="country_code">Country</Field.Label>
              <NativeSelect.Root>
                <NativeSelect.Field id="country_code" name="country_code" defaultValue={target.countryCode ?? ''}>
                  <option value="">—</option>
                  {Object.entries(countryNames)
                    .sort(([, a], [, b]) => a.localeCompare(b))
                    .map(([code, name]) => (
                      <option key={code} value={code}>
                        {name}
                      </option>
                    ))}
                </NativeSelect.Field>
                <NativeSelect.Indicator />
              </NativeSelect.Root>
            </Field.Root>
          </Grid>
          <Checkbox.Root name="remote" value="on" colorPalette="green">
            <Checkbox.HiddenInput />
            <Checkbox.Control>
              <Checkbox.Indicator />
            </Checkbox.Control>
            <Checkbox.Label>Can be done remotely</Checkbox.Label>
          </Checkbox.Root>
          <Field.Root required>
            <Field.Label htmlFor="ends_at">Ends on</Field.Label>
            <Input id="ends_at" name="ends_at" type="date" required min={inDays(0)} max={inDays(MAX_DAYS)} defaultValue={inDays(30)} />
          </Field.Root>
          <Text fontSize="sm" color="muted">
            It shows on {target.name}&apos;s page and on the opportunities list.
          </Text>
          <Button type="submit" colorPalette="green" loading={navigation.state !== 'idle'}>
            Post it
          </Button>
        </Grid>
      </Form>
    </Box>
  );
};

export default NewOpportunity;
