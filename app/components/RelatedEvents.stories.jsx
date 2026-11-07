import RelatedEvents from './RelatedEvents';
import { events } from '../stories/fixtures';

export default { title: 'Events/RelatedEvents', component: RelatedEvents };

export const Default = { args: { events: events.slice(0, 3) } };
export const None = { args: { events: [] } };
