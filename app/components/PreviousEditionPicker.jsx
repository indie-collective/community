import { useState } from 'react';

import RecordPicker, { describeEvent } from './RecordPicker';

/**
 * The event's previous edition (#203), chosen by searching events by name;
 * sent as `previous_edition_id` (empty for none). `eventId` is the event
 * being edited, which can't be its own previous edition.
 */
const PreviousEditionPicker = ({ eventId, defaultValue = null }) => {
  const [chosen, setChosen] = useState(defaultValue);
  return (
    <>
      <input type="hidden" name="previous_edition_id" value={chosen?.id ?? ''} />
      <RecordPicker
        source="/search-event"
        label="Search for the previous edition"
        hideLabel
        placeholder="Stunfest 2025…"
        describe={describeEvent}
        excludedIds={eventId ? [eventId] : []}
        value={chosen}
        onSelect={setChosen}
        onClear={() => setChosen(null)}
      />
    </>
  );
};

export default PreviousEditionPicker;
