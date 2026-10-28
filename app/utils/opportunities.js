// Opportunities (#345): what each kind is called, and what a posted one
// must be.
export const OPPORTUNITY_KINDS = [
  ['job', 'Job or internship'],
  ['freelance', 'Freelance or contract'],
  ['playtest', 'Playtest'],
  ['team_up', 'Team-up'],
  ['pitches', 'Open to pitches'],
  ['submissions', 'Call for submissions'],
];

export const opportunityKindLabel = (kind) => OPPORTUNITY_KINDS.find(([value]) => value === kind)?.[1] ?? kind;

// They end within three months: then they're posted again if still open.
export const MAX_DAYS = 92;
export const MAX_TITLE = 120;

/**
 * A posted opportunity's fields from its form, or `{ error }`. `now` is
 * when it's posted; the end date is a day ("2026-12-01"), kept to its end.
 */
export function parseOpportunity(form, now = new Date()) {
  const kind = form.get('kind');
  const title = form.get('title')?.trim() ?? '';
  const ends = form.get('ends_at');
  if (!OPPORTUNITY_KINDS.some(([value]) => value === kind)) return { error: 'Choose what it is.' };
  if (!title) return { error: 'Give it a title.' };
  if (title.length > MAX_TITLE) return { error: `Keep the title to ${MAX_TITLE} characters.` };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(ends ?? '')) return { error: 'Choose when it ends.' };
  const endsAt = new Date(`${ends}T23:59:59Z`);
  if (Number.isNaN(endsAt.getTime()) || endsAt < now) return { error: 'It must end in the future.' };
  if (endsAt - now > (MAX_DAYS + 1) * 86400000) return { error: `It can stay up for ${MAX_DAYS} days at most.` };
  const country = form.get('country_code')?.trim().toUpperCase() || null;
  return {
    kind,
    title,
    about: form.get('about')?.trim() || null,
    remote: form.get('remote') === 'on',
    city: form.get('city')?.trim() || null,
    countryCode: country && /^[A-Z]{2}$/.test(country) ? country : null,
    endsAt,
  };
}
