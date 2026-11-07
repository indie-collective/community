# Components: what each one is for

In November 2026 the site's look-alike components were merged, one family at
a time, each compared in Storybook before and after. These are the choices
made, and what the site's components follow since. Storybook shows each one
(`npm run storybook`).

## 1. Buttons

Four kinds, from the theme's button recipe:

- **Primary**: green fill, white text, one per screen. The fill is `#0f7d6d`
  (white on it is 5:1; on the logo green `#149c88` it would be 3.4:1), deepening
  to `brandDeep` on hover. Dark mode: the light `brand` green with dark text.
- **Secondary**: ink outline (today's `popOutline`), for every other action:
  Share, Website, Add to calendar, Subscribe, Load more, Edit.
- **Toggle**: one component for Going and Follow. Off is secondary; on is sun
  yellow with an ink border.
- **Quiet**: ink text, no border, a surface step on hover: More actions,
  Show all, Delete (with its icon; the confirmation does the warning).

Chakra's green outline and solid buttons go.

## 2. Section headings

One `Section`: a rule, the title, an optional muted count beside it (read as
"8 games"), an optional "All →" link, an optional line above the title.
`big` is the homepage's (2px ink rule, large title); every other page has a
hairline rule. Replaces `Department`, `PageSection`, `SectionHeading` and the
hand-written h2s on the event, search and merge pages.

## 3. Event cards

- The ticket in every list of events. The picture card goes.
- With a picture, in lists: the picture fills the stub, square, edge to edge;
  no date over it (the date is in the line under the name).
- With a picture, in grids: a strip of the picture on top, torn along a
  perforation, the stub and name below.
- Without a picture: the plain ticket.
- The atlas's list: a compact ticket, replacing `EventMapCard`.
- One `EventGrid` (1, 2, then 3 columns, gap 4), replacing `RelatedEvents`,
  the homepage's `TicketGrid` and the events and person pages' own grids.
- The holes are cut out of the ticket with a mask, and the shadow is a drop
  shadow on a wrapper, so it follows the notches.

## 4. Date blocks

- Event page: a calendar tile over the picture, a green month bar
  (`#0f7d6d`, white text) above the day on white. Replaces `DateLabel`.
- Tickets: the stub becomes the same calendar, the green month bar across the
  top of the stub and the day below. Nothing else on the ticket changes.

## 5. Labels and chips

- **Label** (today's `Sticker`): coloured only where the colour means
  something: yours (sun), online (lilac), canceled (coral). Everything else
  (organisation status, opportunity kind, "From IGDB") is a neutral label: no
  fill, a hairline, muted text.
- The timeline's durations ("+1 year 7 months") are plain muted text.
- No type badge over organisation logos; the type is in the card's text.
- **Chip**: tags, sentence case, surface fill and a hairline, fully round.
  Filtering chips (games page, homepage) are toggles with a muted count; picked
  is sun with an ink border. Replaces `TagList`'s grey uppercase tags and both
  filter styles.

## 6. Pickers

One `RecordPicker`, inline: a field that searches as you type; results as rows
with their mark (AtlasMark in a small tile), name and "Studio · Nantes"; the
first highlighted, arrows move, Enter picks; then "Add “…” as a studio / an
association" rows under a rule. Picked: the record as a row with a Change
link. On a record's page it opens in a popover under its button, not a dialog.
Replaces `SearchOrgModal`, `SearchGameModal`, the mission's organisation field,
`PreviousEditionPicker`'s list and `PickerCreate`.

## 7. Place search

One `PlaceField` built on `RecordPicker`: the same menu and keys. Venues on
the site first, under a "Venues" heading, then Mapbox's cities and addresses
under "Places", each a row with an icon tile and "City · Loire-Atlantique,
France". Picked: a row with Change. Replaces `PlacesSearch`,
`MapboxAutocomplete` and `SelectInput`.

## 8. Map markers

One table of marks by kind, used everywhere: studio a green (`brand`) circle,
association a lilac diamond, event a coral triangle, ink outline. Record pages'
pins take the same colours (instead of Chakra yellow, green and purple via
`pinColor`), the logo still in the hole. Clusters: the count in an ink ring at
weight 600. The homepage map shows small marks by kind instead of one coral dot.

## 9. Empty states

One `Empty`: what's missing in a muted sentence, no period, no italics, and
the way to add it (a secondary button, members only) when there is one.
- A whole empty list (homepage events, events page, a country's events): the
  picture above, centred.
- An empty section: a dashed hairline box, the sentence left, the button right.
Replaces `EmptyHint`, `NoEvents` and the inline texts (related events, search
dialogs, rewind, country, admin lists).

## 10. Colours and corners

- Every Chakra grey becomes a theme neutral: `canvas` (the page), `surface`
  (cards, fields), `rule` (hairlines), `muted` (secondary text), `ink`.
- `colorPalette="green"` goes; green comes from `brand` (links, marks), a new
  `primary` token `#0f7d6d` (button fill, calendar bar) and `brandDeep` (hover,
  small green text).
- `sun`, `coral` and `lilac` only for what they mean.
- The countries table's continents: seven soft paper tints (EU `#dfe8f3`, NA
  `#f6e3d3`, SA `#dcefe4`, AS `#f4dcdc`, OC `#d9eef0`, AF `#f5ecd0`, AN
  `#e7e9e8`) instead of Chakra's solid hues; CityList, ImageUploader and the
  rewind's gradient text lose their one-off colours.
- Five radius tokens: `label` 6px, `control` 10px, `card` 14px, `panel` 20px,
  `round`. Every corner on the site is one of them.

## 11. Removed

`MultiSelect`, which nothing imported; `EventMapCard`, the same.
