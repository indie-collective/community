import { redirect, useLoaderData, Form  } from 'react-router';
import {
    Box,
  Heading,
  Table,
  TableCaption,
  Input,
  Button,
  NativeSelect,
} from '@chakra-ui/react';

import isAuthenticated from '../../utils/isAuthenticated.server'
import { db } from '../../utils/db.server';

export const loader = async ({ request }) => {
  const currentUser = await isAuthenticated(request, {
    failureRedirect: '/signin',
  });

  if (!currentUser.isAdmin) {
    throw new Response('Not Found', { status: 404 });
  }

  const tags = await db.tag.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { game_tag: true } } },
  });

  return { tags };
};

export const action = async ({ request }) => {
  const currentUser = await isAuthenticated(request, {
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

export const meta = () => [{
  title: 'Tags - Community Administration'
}];

const TagsAdmin = () => {
  const { tags } = useLoaderData();

  return (
    <Box mb={5} pl={5} pr={5} mt={5}>
      <Heading as="h2" mb={5} size="2xl">
        Tags
      </Heading>
      <Box method="post" mb={5} display="flex" gap={2} asChild><Form>
          <Input name="name" placeholder="New tag name" />
          <input type="hidden" name="intent" value="add" />
          <Button type="submit" colorPalette="green">
            Add
          </Button>
        </Form></Box>
      <Box method="post" mb={10} display="flex" gap={2} asChild><Form>
          <NativeSelect.Root>
            <NativeSelect.Field name="fromId" placeholder="Merge from" flex="1">
              {tags.map((tag) => (
                <option key={tag.id} value={tag.id}>
                  {tag.name}
                </option>
              ))}
            </NativeSelect.Field>
            <NativeSelect.Indicator />
          </NativeSelect.Root>
          <NativeSelect.Root>
            <NativeSelect.Field name="toId" placeholder="Merge into" flex="1">
              {tags.map((tag) => (
                <option key={tag.id} value={tag.id}>
                  {tag.name}
                </option>
              ))}
            </NativeSelect.Field>
            <NativeSelect.Indicator />
          </NativeSelect.Root>
          <input type="hidden" name="intent" value="merge" />
          <Button type="submit" colorPalette="green">
            Merge
          </Button>
        </Form></Box>
      <Table.ScrollArea>
        <Table.Root variant="simple">
          <Table.Caption>Existing tags ({tags.length})</Table.Caption>
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader>Name</Table.ColumnHeader>
              <Table.ColumnHeader textAlign='end'>Used by games</Table.ColumnHeader>
              <Table.ColumnHeader></Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {tags.map((tag) => (
              <Table.Row key={tag.id}>
                <Table.Cell>{tag.name}</Table.Cell>
                <Table.Cell textAlign='end'>{tag._count.game_tag}</Table.Cell>
                <Table.Cell>
                  <Form method="post">
                    <input type="hidden" name="tagId" value={tag.id} />
                    <input type="hidden" name="intent" value="delete" />
                    <Button size="sm" colorPalette="red" type="submit">
                      Delete
                    </Button>
                  </Form>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Table.ScrollArea>
    </Box>
  );
};

export default TagsAdmin;
