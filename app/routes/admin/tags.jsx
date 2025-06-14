import { json, redirect } from '@remix-run/node';
import { useLoaderData, Form } from '@remix-run/react';
import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableCaption,
  TableContainer,
  Input,
  Button,
  Select,
} from '@chakra-ui/react';

import { authenticator } from '../../utils/auth.server';
import { db } from '../../utils/db.server';

export const loader = async ({ request }) => {
  const currentUser = await authenticator.isAuthenticated(request, {
    failureRedirect: '/signin',
  });

  if (!currentUser.isAdmin) {
    throw new Response('Not Found', { status: 404 });
  }

  const tags = await db.tag.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { game_tag: true } } },
  });

  return json({ tags });
};

export const action = async ({ request }) => {
  const currentUser = await authenticator.isAuthenticated(request, {
    failureRedirect: '/signin',
  });

  if (!currentUser.isAdmin) {
    throw new Response('Forbidden', { status: 403 });
  }

  const data = await request.formData();
  const intent = data.get('intent');

  if (intent === 'add') {
    const name = data.get('name');
    if (name) {
      await db.tag.upsert({
        where: { name: name.trim().toLowerCase() },
        update: {},
        create: { name: name.trim().toLowerCase() },
      });
    }
  } else if (intent === 'delete') {
    const id = data.get('tagId');
    if (id) {
      await db.tag.delete({ where: { id } });
    }
  } else if (intent === 'merge') {
    const fromId = data.get('fromId');
    const toId = data.get('toId');
    if (fromId && toId && fromId !== toId) {
      await db.$transaction([
        db.game_tag.updateMany({
          where: { tag_id: fromId },
          data: { tag_id: toId },
        }),
        db.tag.delete({ where: { id: fromId } }),
      ]);
    }
  }

  return redirect('/admin/tags');
};

export const meta = () => ({
  title: 'Tags - Community Administration',
});

const TagsAdmin = () => {
  const { tags } = useLoaderData();

  return (
    <Box mb={5} pl={5} pr={5} mt={5}>
      <Heading as="h2" mb={5} size="2xl">
        Tags
      </Heading>

      <Box as={Form} method="post" mb={5} display="flex" gap={2}>
        <Input name="name" placeholder="New tag name" />
        <input type="hidden" name="intent" value="add" />
        <Button type="submit" colorScheme="teal">
          Add
        </Button>
      </Box>

      <Box as={Form} method="post" mb={10} display="flex" gap={2}>
        <Select name="fromId" placeholder="Merge from" flex="1">
          {tags.map((tag) => (
            <option key={tag.id} value={tag.id}>
              {tag.name}
            </option>
          ))}
        </Select>
        <Select name="toId" placeholder="Merge into" flex="1">
          {tags.map((tag) => (
            <option key={tag.id} value={tag.id}>
              {tag.name}
            </option>
          ))}
        </Select>
        <input type="hidden" name="intent" value="merge" />
        <Button type="submit" colorScheme="teal">
          Merge
        </Button>
      </Box>

      <TableContainer>
        <Table variant="simple">
          <TableCaption>Existing tags ({tags.length})</TableCaption>
          <Thead>
            <Tr>
              <Th>Name</Th>
              <Th isNumeric>Used by games</Th>
              <Th></Th>
            </Tr>
          </Thead>
          <Tbody>
            {tags.map((tag) => (
              <Tr key={tag.id}>
                <Td>{tag.name}</Td>
                <Td isNumeric>{tag._count.game_tag}</Td>
                <Td>
                  <Form method="post">
                    <input type="hidden" name="tagId" value={tag.id} />
                    <input type="hidden" name="intent" value="delete" />
                    <Button size="sm" colorScheme="red" type="submit">
                      Delete
                    </Button>
                  </Form>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default TagsAdmin;
