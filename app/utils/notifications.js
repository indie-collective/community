// What a change tells the people following what it touches (#343): from a
// change log entry, the audiences (a followed game, organisation, event or
// country) and what to tell them, by IDs. data/notifications.server names
// them and writes the notifications.

const added = (before = [], after = [], key = (x) => JSON.stringify(x)) => {
  const had = new Set((before ?? []).map(key));
  return (after ?? []).filter((item) => !had.has(key(item)));
};

const PLACE_FIELDS = ['starts_at', 'ends_at', 'time_zone', 'status', 'city', 'street', 'country_code', 'attendance', 'online_url'];

/**
 * The notices a change makes: `[{ audience: { type, id }, kind, refs }]`.
 * `change` is `{ operation, kind, recordId, before, after }`, `before` and
 * `after` the fields that changed (all of them, after, for a create).
 */
export function noticesFor({ operation, kind, recordId, before = {}, after = {} }) {
  const notices = [];
  const tell = (type, id, notice, refs) => id && notices.push({ audience: { type, id }, kind: notice, refs });
  if (operation === 'delete') return notices;

  if (kind === 'organization') {
    if (operation === 'create') tell('country', after.country_code, 'new_org', { organization: recordId });
    if (operation === 'update' && 'status' in after) {
      tell('organization', recordId, 'org_status', { organization: recordId, status: after.status });
    }
  }

  if (kind === 'game') {
    for (const { organization_id: organization, role } of added(before.organizations, after.organizations)) {
      tell('organization', organization, 'org_game', { organization, game: recordId, role });
      if (role === 'publisher') tell('game', recordId, 'game_publisher', { game: recordId, organization });
    }
    for (const milestone of added(before.milestones, after.milestones)) {
      tell('game', recordId, 'game_milestone', { game: recordId, milestone });
    }
    for (const event of added(before.event_ids, after.event_ids)) {
      tell('game', recordId, 'game_event', { game: recordId, event });
      tell('event', event, 'event_game', { event, game: recordId });
    }
  }

  if (kind === 'event') {
    if (operation === 'create') tell('country', after.country_code, 'new_event', { event: recordId });
    for (const organization of added(before.organization_ids, after.organization_ids)) {
      tell('organization', organization, 'org_event', { organization, event: recordId });
    }
    for (const game of added(before.game_ids, after.game_ids)) {
      tell('game', game, 'game_event', { game, event: recordId });
    }
    const changed = PLACE_FIELDS.filter((field) => field in after);
    if (operation === 'update' && changed.length > 0) {
      tell('event', recordId, 'event_changed', {
        event: recordId,
        canceled: after.status === 'canceled',
        fields: changed,
      });
    }
  }

  if (kind === 'opportunity' && operation === 'create') {
    const target = after.organization_id
      ? ['organization', after.organization_id]
      : after.game_id
        ? ['game', after.game_id]
        : after.event_id
          ? ['event', after.event_id]
          : null;
    if (target) tell(target[0], target[1], 'opportunity', { opportunity: recordId, [target[0]]: target[1] });
  }
  return notices;
}
