import { Button } from '@chakra-ui/react';
import { LuBell, LuBellOff } from 'react-icons/lu';
import { useFetcher } from 'react-router';

/**
 * Follow a game, organisation, event or country (#343), to be told on the
 * site when something happens there. Members only.
 */
const FollowButton = ({ type, id, following }) => {
  const fetcher = useFetcher();
  // As soon as it's clicked, before the server answers.
  const now = fetcher.formData ? fetcher.formData.get('follow') === 'on' : (fetcher.data?.following ?? following);
  return (
    <fetcher.Form method="post" action="/follow">
      <input type="hidden" name="type" value={type} />
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="follow" value={now ? 'off' : 'on'} />
      <Button type="submit" size="sm" variant={now ? 'subtle' : 'outline'} aria-pressed={now}>
        {now ? <LuBellOff /> : <LuBell />}
        {now ? 'Following' : 'Follow'}
      </Button>
    </fetcher.Form>
  );
};

export default FollowButton;
