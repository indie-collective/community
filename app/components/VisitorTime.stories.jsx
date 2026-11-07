import VisitorTime from './VisitorTime';

export default {
  title: 'Events/VisitorTime',
  component: VisitorTime,
  // The event's time in the visitor's own zone, when it differs.
  args: { startsAt: '2026-11-21T17:30:00.000Z', endsAt: '2026-11-21T20:00:00.000Z', timeZone: 'America/Montreal' },
};

export const Default = {};
