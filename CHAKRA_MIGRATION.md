# Chakra UI v2 → v3 Migration Audit

This document is the result of a static scan of `app/` against the Chakra
UI v2.x → v3.x changeset. It enumerates every breaking-change site that
will need to be touched. Treat it as an audit, not a step-by-step
plan — the actual migration is broken into M2.2 (deps) → M2.3 (root +
theme) → M2.4 (per-file).

The scan was performed by `grep` against `app/**/*.{js,jsx,ts,tsx}`. The
codemod published by Chakra (`npx @chakra-ui/cli@3 codemod`) couldn't be
run in this sandbox (no npm registry access), so this audit was produced
by hand from the v3 release notes and the public migration guide.

## Surface area at a glance

| Metric | Count |
|---|---|
| Files importing `@chakra-ui/*` | 95 |
| Distinct Chakra components used | 86 |
| `is*` boolean props (renamed in v3) | 69 |
| `colorScheme=` props (renamed `colorPalette`) | 77 |
| `spacing=` props on Stack/Wrap (renamed `gap`) | 39 |
| `<Modal>` / `<MenuList>` / `<Popover>` / `<Drawer>` (compound API) | 13 |
| `<Avatar>` / `<AvatarBadge>` / `<AvatarGroup>` (compound API) | 7 |
| `useColorModeValue` / `useColorMode` call sites | ~15 |
| `useToast` call sites | 18 |
| `extendTheme` + `withDefault*` (in `app/theme.js`) | 1 file |

## Breaking changes by category

### 1. Package layout — `@chakra-ui/react` is now batteries-included

**v2 (current):**
```json
"@chakra-ui/react": "^2.2.1",
"@chakra-ui/icons": "^2.0.2",
"@emotion/react": "^11",
"@emotion/styled": "^11",
"framer-motion": "^6"
```

**v3:**
- `@chakra-ui/icons` is **gone**. Replace every icon import with
  `react-icons/lu` (Lucide) or copy the SVGs into the repo. Affects
  40 import sites in `app/`.
- `@chakra-ui/theme-tools` is **gone** (`mode()` helper used in
  `app/theme.js` is now expressed via `_dark` style props or the
  `colorPalette` token system). 1 use in `theme.js`.
- `framer-motion` is no longer a Chakra peer dep — but we still need
  it directly (used by `<AnimatePresence>` in `root.jsx` and several
  components), so keep it.
- `@emotion/styled` is no longer required.

### 2. `ChakraProvider` API change

**v2:**
```jsx
<ChakraProvider theme={theme}>{children}</ChakraProvider>
```

**v3:**
```jsx
import { ChakraProvider, defaultSystem } from '@chakra-ui/react';
<ChakraProvider value={defaultSystem}>{children}</ChakraProvider>
```

Affected: `app/root.jsx` (3 sites: `App`, `ErrorBoundary` route-error
branch, `ErrorBoundary` catch-all branch).

### 3. Theme rewrite — `extendTheme` → `createSystem`

`app/theme.js` uses three APIs that are all gone in v3:
- `extendTheme(...)` → `createSystem(defaultConfig, customConfig)`
- `withDefaultColorScheme({ colorScheme: 'green' })` → token-level
  `globalCss` + per-recipe `defaultVariants` in the config object.
- `withDefaultVariant({ variant: 'filled', components: ['Input', 'Textarea'] })`
  → recipe `defaultVariants` on each component recipe.
- `mode('a', 'b')(props)` global style → `globalCss` with `_dark` selector.

Custom palettes (`discord`, `github`) carry over, but the shape changes:
v3 expects `{ value: '#xxxxxx' }` token objects, not raw hex strings.

### 4. Color mode hooks

**v2:** `useColorModeValue('white', 'gray.900')`
**v3:** Use `_light` / `_dark` style props directly, OR call
`useColorMode()` from `next-themes` (Chakra v3 ships its own
`useColorMode`/`useColorModeValue` shims that wrap next-themes).

For minimal-diff migration: keep `useColorModeValue` — Chakra v3 still
exports a compat helper at `@chakra-ui/react`. Estimated 15 call sites
across `Footer.jsx`, `GameCard.jsx`, `Logo.jsx`, `OrgCard.jsx`,
`AvatarButton.jsx`, etc.

### 5. Boolean prop rename: `is*` → unprefixed

The `is`-prefix was dropped throughout v3. Mechanical rename:

| v2 | v3 |
|---|---|
| `isOpen` | `open` |
| `isDisabled` | `disabled` |
| `isInvalid` | `invalid` |
| `isLoading` | `loading` |
| `isRound` | `rounded` (or remove — many components default round) |
| `isIndeterminate` | `indeterminate` |
| `isReadOnly` | `readOnly` |
| `isRequired` | `required` |
| `isExternal` | `external` |
| `isActive` | `active` (NB: kept in `<MenuItem>` and `<Tabs>`) |
| `isChecked` | `checked` |
| `isFocusable` | `focusable` |
| `isCentered` | `centered` |

69 sites in `app/`. Concentrated in form components
(`SignupForm.jsx`, `SigninForm.jsx`, `PasswordChangeForm.jsx`,
`PasswordResetForm.jsx`, `ForgotForm.jsx`, `ProfileForm.jsx`,
`OrgForm.jsx`, `GameForm.jsx`, `EventForm.jsx`) and on submit Buttons.

### 6. `colorScheme` → `colorPalette`

77 sites. Mechanical rename across the entire app.

### 7. `spacing` → `gap` on Stack / HStack / VStack / Wrap

39 sites. Mechanical rename.

### 8. Compound-component ergonomics

Several components were restructured into namespaced compounds:

**Modal** (5 sites — referenced via `<Modal>`, `<ModalOverlay>`,
`<ModalContent>`, `<ModalHeader>`, `<ModalBody>`, `<ModalCloseButton>`):

```jsx
// v2
<Modal isOpen={isOpen} onClose={onClose}>
  <ModalOverlay />
  <ModalContent><ModalHeader>...</ModalHeader>...</ModalContent>
</Modal>

// v3 (renamed Dialog)
<Dialog.Root open={open} onOpenChange={(d) => setOpen(d.open)}>
  <Dialog.Backdrop />
  <Dialog.Positioner>
    <Dialog.Content>
      <Dialog.Header>...</Dialog.Header>
    </Dialog.Content>
  </Dialog.Positioner>
</Dialog.Root>
```

**Menu** (5 sites):
- `<Menu>` → `<Menu.Root>`
- `<MenuButton>` → `<Menu.Trigger>`
- `<MenuList>` → `<Menu.Content>`
- `<MenuItem>` → `<Menu.Item>`
- `<MenuDivider>` → `<Menu.Separator>`

**Avatar** (7 sites):
- `<Avatar src="..." name="..." />` → `<Avatar.Root><Avatar.Image src=".." /><Avatar.Fallback>..</Avatar.Fallback></Avatar.Root>`

**Tabs / Accordion** (1 site combined): same Root/Item/Trigger pattern.

**Wrap** (3 sites): `<Wrap>` → `<Flex wrap="wrap" gap=".." />`. Wrap is
gone in v3.

**Alert** (Alert/AlertIcon/AlertTitle/AlertDescription): now
`<Alert.Root>` + `<Alert.Indicator>` + `<Alert.Title>` +
`<Alert.Description>`.

**Stat** (StatGroup/Stat/StatLabel/StatNumber): `<Stat.Root>` +
`<Stat.Label>` + `<Stat.ValueText>`.

**InputGroup** (InputGroup / InputLeftElement / InputRightElement):
`<InputGroup>` is gone. Use `<Group>` from v3, or just `<Input>` with
`startElement` / `endElement` props.

**Tooltip**: now requires `<Tooltip.Root>` + `<Tooltip.Trigger>` +
`<Tooltip.Content>` (no more bare `<Tooltip label>`).

### 9. `useToast` → `toaster.create`

v3 replaced the `useToast` hook with a top-level `toaster` API:

```jsx
// v2
const toast = useToast();
toast({ title: 'Saved', status: 'success' });

// v3
import { toaster } from './toaster'; // local file that wraps createToaster
toaster.create({ title: 'Saved', type: 'success' });
```

18 call sites. Status names also shifted: `error|warning|info|success`
→ `error|warning|info|success` (mostly the same, but `loading` was
added).

### 10. Form composability

`<FormControl>` + `<FormLabel>` + `<FormErrorMessage>` are out.
Replacement is the `<Field>` namespaced compound:

```jsx
// v2
<FormControl isInvalid={errors.email} isRequired>
  <FormLabel>Email</FormLabel>
  <Input {...register('email')} />
  <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
</FormControl>

// v3
<Field.Root invalid={!!errors.email} required>
  <Field.Label>Email</Field.Label>
  <Input {...register('email')} />
  <Field.ErrorText>{errors.email?.message}</Field.ErrorText>
</Field.Root>
```

11 `<FormControl>` sites, all in form components.

### 11. `Button` size tokens narrowed

v2 sizes `xs|sm|md|lg` are kept; v3 also adds `2xs|2xl`. **No rename
needed** — but check any hard-coded `size="xs"` on icon buttons since
the visual scale shifted slightly.

### 12. Variant renames (theme-driven)

`withDefaultVariant({ variant: 'filled', components: ['Input', 'Textarea'] })`
in `theme.js` set `variant="filled"` as the default. In v3, Input
variants are `outline | subtle | flushed | unstyled`. The closest
analog to v2 `filled` is `subtle`. Either:
- Translate the default in the new `createSystem` config to `subtle`, or
- Drop the default entirely and accept the v3 default (`outline`).

### 13. `chakra(...)` factory

Used in `OAuthButtonGroup.jsx` and `CardLink.jsx`. The `chakra()`
factory is kept in v3, but the API shape moved slightly — `baseStyle`
became `base` in the styled-system layer. Both call sites use only the
HTML-element-as-component form (`chakra('button', { ... })`) so the
diff should be tiny.

## Per-step plan (M2.2 → M2.4)

### M2.2 — Dependency swap (one commit)
Pure `package.json` change. No source touched.
- Bump `@chakra-ui/react` to `^3.0.0` (current latest at time of audit).
- Remove `@chakra-ui/icons`.
- Remove `@emotion/styled` (kept by Chakra v2, optional in v3).
- Remove `@emotion/cache` and `@emotion/server` if `<ChakraProvider>`
  no longer needs the emotion-cache shuttle (v3 uses its own
  styling engine; check first).
- Remove `framer-motion` from devDeps if Chakra was the only
  consumer — but it isn't, so keep it.

### M2.3 — root.jsx + theme.js (one commit)
- Replace `<ChakraProvider theme={theme}>` (×3 in root.jsx) with
  `<ChakraProvider value={system}>`.
- Rewrite `app/theme.js` from `extendTheme + withDefault*` to
  `createSystem(defaultConfig, { theme: { tokens, recipes }, globalCss })`.
- Strip the `mode()` global-style call (use `_dark` on `globalCss`).
- Drop `app/createEmotionCache.js`, `app/context.js` (the emotion-cache
  context provider) — Chakra v3 doesn't need a per-request cache. The
  RR7 `entry.client.jsx` and `entry.server.jsx` simplify dramatically.

### M2.4 — Per-file component migration (multiple commits, one per cluster)
Suggested execution order (smallest blast radius first):

1. Mechanical renames (codemod-friendly, can ship as one commit):
   - `colorScheme=` → `colorPalette=` (77 sites)
   - `spacing=` → `gap=` (39 sites)
   - `is{Open,Disabled,Invalid,Loading,…}` → unprefixed (69 sites)
2. Icons swap: `@chakra-ui/icons` → `react-icons/lu` (40 sites,
   1 commit per logical chunk).
3. Form components — `<FormControl>` → `<Field.Root>` (one commit per
   form file, since each is independently testable).
4. Modal/Menu/Avatar/Tooltip/Wrap compound rewrites — one commit per
   compound family.
5. Toaster: `useToast` → `toaster.create` (18 sites, one commit).
6. `chakra(...)` factory tweak (2 sites, one commit).

### M2.5 — Cleanup (one commit)
- Drop dead `app/context.js` / `app/createEmotionCache.js` if not
  already removed in M2.3.
- Strip any `@chakra-ui/theme-tools` import that survived.
- Run `npm run build` (locally — sandbox can't) and fix any
  type/runtime fallout.

## Risk assessment

| Risk | Likelihood | Mitigation |
|---|---|---|
| `useToast` widespread blast radius | high | Wrap in a single `app/utils/toaster.js` shim so call sites change minimally |
| Form rewrite touches every input page | high | Do one form per commit; visual regression-test signin / signup flows |
| Compound API rewrites are tedious + error-prone | high | Use codemods where possible; otherwise convert one component cluster at a time |
| `colorScheme="green"` default disappears | medium | Set `colorPalette: 'green'` in `globalCss` + per-recipe |
| `useColorModeValue` compat shim might disappear in a v3 minor | low | Plan to migrate to `_dark` style props in a follow-up |
| Custom palette token shape change | low | Wrap in `defineTokens({...})`; keep keys identical |

## Out of scope for this branch

- Switching from Emotion to v3's native styling engine beyond what's
  required for `ChakraProvider`.
- Migrating away from `useColorModeValue` to `_dark` style props.
- Adopting v3's slot-recipe system for any custom components.
- Anything in `@mui/material/styles` (used in `theme.js` for
  `muiTheme`). MUI v5 is independent of Chakra v3.

---

Audit produced on the `migration/chakra-v3` branch, branched from
`migration/remix-to-rr7` HEAD (the React Router v7 migration is
already in place). All counts above are from a `grep` pass over
`app/` at that revision.
