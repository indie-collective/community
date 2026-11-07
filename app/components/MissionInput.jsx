import { Box, Field, Image, Input, NativeSelect, Stack, Textarea } from '@chakra-ui/react';
import { useEffect, useState } from 'react';

import { GAME_ROLES } from '../utils/gameRoles';
import { MilestoneFields } from './GameTimeline';
import RecordPicker, { ORGANIZATION_CREATE } from './RecordPicker';
import PlaceField from './PlaceField';
import ThumbnailFields from './ThumbnailFields';

// How a mission fills a gap in place (#339, #378), by the gap's `input`
// (utils/missions' GAPS): the fields of the mission's own form, which its
// action hands to data/missions' fillGap.

const TEXT = {
  text: { label: 'Description', placeholder: 'What it is, in a few sentences…' },
  url: { label: 'Address', placeholder: 'https://…' },
  tags: { label: 'Tags', placeholder: 'platformer, co-op, pixel art' },
  igdb: { label: 'IGDB page', placeholder: 'https://www.igdb.com/games/…' },
  bluesky: { label: 'Bluesky handle', placeholder: 'studio.bsky.social' },
};

const TextInput = ({ input }) => (
  <Field.Root>
    <Field.Label htmlFor="value">{TEXT[input].label}</Field.Label>
    {input === 'text' ? (
      <Textarea id="value" name="value" minH="8rem" placeholder={TEXT[input].placeholder} />
    ) : (
      <Input id="value" name="value" placeholder={TEXT[input].placeholder} />
    )}
  </Field.Root>
);

// A studio or association: found by name, or added when it isn't there
// (#374). Sent as `id`, or `name` and `type` for a new one.
const OrganizationInput = ({ kind }) => {
  const [picked, setPicked] = useState(null);
  const label = kind === 'game' ? 'Studio' : 'Organiser';
  return (
    <Stack gap={3}>
      <Box data-testid={picked ? 'mission-picked' : undefined}>
        <RecordPicker
          source="/search-org"
          label={label}
          value={picked && (picked.id ? picked : { ...picked, name: `${picked.name} (new)` })}
          onClear={() => setPicked(null)}
          onSelect={setPicked}
          createOptions={ORGANIZATION_CREATE}
          onCreate={setPicked}
        />
        {picked?.id && <input type="hidden" name="id" value={picked.id} />}
        {picked && !picked.id && (
          <>
            <input type="hidden" name="name" value={picked.name} />
            <input type="hidden" name="type" value={picked.type} />
          </>
        )}
      </Box>
      {kind === 'game' && (
        <Field.Root width="auto">
          <Field.Label htmlFor="role">Its role</Field.Label>
          <NativeSelect.Root width="12rem">
            <NativeSelect.Field id="role" name="role" defaultValue="developer">
              {GAME_ROLES.map(([value, name]) => (
                <option key={value} value={value}>
                  {name}
                </option>
              ))}
            </NativeSelect.Field>
            <NativeSelect.Indicator />
          </NativeSelect.Root>
        </Field.Root>
      )}
    </Stack>
  );
};

// One image, with its thumbnail and size (see ThumbnailFields).
const ImageInput = ({ label }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  useEffect(() => {
    if (!file) return setPreview(null);
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);
  return (
    <Field.Root>
      <Field.Label htmlFor="upload">{label}</Field.Label>
      <Input id="upload" name="upload" type="file" accept="image/*" pt={1.5} onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
      <ThumbnailFields name="upload" file={file} />
      {preview && <Image src={preview} alt="" mt={2} maxH="12rem" borderRadius="control" />}
    </Field.Root>
  );
};

// A place from Mapbox's suggestions, sent as its fields (street, city,
// region, country_code, latitude, longitude), as on the record's form.
const PlaceInput = () => {
  const [place, setPlace] = useState({ label: '', value: null });
  return (
    <Field.Root>
      <Field.Label>Location</Field.Label>
      <PlaceField
        value={place}
        placeholder="Rennes, France"
        onChange={setPlace}
        onClear={() => setPlace({ label: '', value: null })}
      />
    </Field.Root>
  );
};

const IMAGE_LABELS = { images: 'Image', logo: 'Logo', cover: 'Cover' };

/** The fields that fill `gap` on a record of `kind`. */
const MissionInput = ({ kind, gap }) => {
  switch (gap.input) {
    case 'organization':
      return <OrganizationInput kind={kind} />;
    case 'image':
      return <ImageInput label={IMAGE_LABELS[gap.key]} />;
    case 'place':
      return <PlaceInput />;
    case 'milestone':
      return <MilestoneFields />;
    default:
      return <TextInput input={gap.input} />;
  }
};

export default MissionInput;
