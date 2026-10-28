import { Text } from '@chakra-ui/react';
import { useEffect, useState } from 'react';

import { formatEventRange } from '../utils/eventTime';

/**
 * An event's times in the visitor's own time zone, when it isn't the
 * event's (#347): known only in the browser, so shown after hydration.
 */
const VisitorTime = ({ startsAt, endsAt, timeZone }) => {
  const [zone, setZone] = useState(null);
  useEffect(() => setZone(Intl.DateTimeFormat().resolvedOptions().timeZone), []);
  if (!zone || zone === timeZone) return null;
  return (
    <Text fontSize="sm" data-testid="visitor-time">
      Your time ({zone.replaceAll('_', ' ')}): {formatEventRange(startsAt, endsAt, zone)}
    </Text>
  );
};

export default VisitorTime;
