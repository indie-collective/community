import { Box, Heading, useToast } from '@chakra-ui/react';
import { json, redirect, unstable_parseMultipartFormData } from '@remix-run/node';
import { useActionData, useTransition } from '@remix-run/react';
import { useEffect } from 'react';

import {db} from '../utils/db.server';
import createUploadHandler from '../utils/createUploadHandler.server';
import Navigation from '../components/Navigation';
import OrgForm from '../components/OrgForm';

export async function action({ request }) {
  const data = await unstable_parseMultipartFormData(
    request,
    createUploadHandler(['logo'])
  );

  try {
    const org = await db.entity.create({
      data: {
        name: data.get('name'),
        type: data.get('type').toLowerCase(),
        site: data.get('site'),
        about: data.get('about'),
        // location: {
        //   connectOrCreate: {
        //     where: {
        //       id: data.get('location'),
        //     },
        //     create: {
              
        //     },
        //   },
        // },
        // logo: {
        //   connect: {
        //     id: data.get('logo'),
        //   }
        // }
      },
      select: {
        id: true,
      },
    })

    return redirect(`/org/${org.id}`);
  } catch (err) {
    const values = Object.fromEntries(data);
    return json({ error: err.message, values });
  }
}

export const meta = () => ({
  title: 'Add an organization',
});

const CreateOrg = () => {
  const toast = useToast();
  const transition = useTransition();
  const actionData = useActionData();

  useEffect(() => {
    if (!actionData?.error) return;

    toast({
      title: 'Something went wrong',
      description: actionData?.error,
      status: 'error',
    });
  }, [actionData?.error, transition.state === 'submitting', toast]);

  return (
    <div>
      <Navigation />

      <Box width={{ base: 'auto', sm: 500 }} margin="40px auto" p={5} mb={5}>
        <Heading mb={5}>Create organization</Heading>

        <OrgForm
          method="POST"
          loading={transition.state === 'submitting'}
          defaultData={actionData?.values}
        />
      </Box>
    </div>
  );
};

export default CreateOrg;
