import { Button, Stack } from '@chakra-ui/react';
import { LuPlus } from 'react-icons/lu';

/** A name as pickers compare it: case, accents and spacing ignored. */
export const comparableName = (name) =>
  (name ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();

/** Whether `results` has one named exactly `query`, as pickers compare names. */
export const hasExactMatch = (results, query) =>
  results.some(
    (result) => comparableName(result.name) === comparableName(query)
  );

/**
 * "Add …" on top of a picker's results (#374), when what was typed isn't
 * found exactly: one button per option, e.g. "Add studio “Pinewick”" and
 * "Add association “Pinewick”". Shown once the search for the current text
 * has answered, so nothing is offered that's already there.
 *
 * @param {{ query: string, fetcher: object, options: { type?: string, label: (name: string) => string }[], onCreate?: (record: { name: string, type?: string }) => void }} props
 */
const PickerCreate = ({ query, fetcher, options, onCreate }) => {
  const name = query.trim();
  const answered = fetcher.state === 'idle' && Array.isArray(fetcher.data);
  if (
    !onCreate ||
    name.length < 3 ||
    !answered ||
    hasExactMatch(fetcher.data, name)
  ) {
    return null;
  }
  return (
    <Stack gap={1} mb={2}>
      {options.map(({ type, label }) => (
        <Button
          key={type ?? 'add'}
          type="button"
          variant="subtle"
          justifyContent="flex-start"
          onClick={() => onCreate(type ? { name, type } : { name })}
        >
          <LuPlus />
          {label(name)}
        </Button>
      ))}
    </Stack>
  );
};

export default PickerCreate;
