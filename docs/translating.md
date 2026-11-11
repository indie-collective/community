# Translating

The interface is translated on [Hosted Weblate](https://hosted.weblate.org/engage/indieco-community/) (#400), under its gratis plan for libre projects: anyone can sign in there and translate, without touching the code.

## How it fits together

- The messages are flat JSON files in `app/i18n/locales/`, one per language (`en.json`, `fr.json`, `br.json`). English is the source: Weblate shows its text to translators.
- Weblate commits translations to its own copy of the repo and opens a pull request against `main`. Review and rebase-merge it like any other; CI runs `app/i18n/i18n.test.js`, which checks the files.
- A message that isn't translated yet (missing, or `""`) shows in English.
- English and French are offered to everyone, so they must stay complete: whoever adds a key adds it to `en.json` and `fr.json` in the same change. Other languages fill in on Weblate at their own pace.
- `{name}` placeholders must be kept as they are; the test checks every translation has the same ones as English.

## Setting up the Weblate project

Done once, by a maintainer, on <https://hosted.weblate.org>:

1. Create the project `indieco-community`, with the website `https://community.indieco.xyz` and the instructions URL pointing at this file.
2. Add a component, `Interface`, from the GitHub repository `https://github.com/indie-collective/community`, branch `main`:
   - File format: **JSON file** (flat keys, not nested), with an indentation of 2 spaces.
   - File mask: `app/i18n/locales/*.json`
   - Monolingual base language file: `app/i18n/locales/en.json`
   - Template for new translations: `app/i18n/locales/en.json`
   - Source language: English
   - Translation license: GNU Affero General Public License v3.0 or later (the repo's `LICENSE`)
   - Translation flags: `placeholders:r"\{\w+\}"`, so Weblate highlights the `{name}` placeholders and flags a translation that drops one.
3. Under Version control: push to a fork and open pull requests (the GitHub push method), so translations go through review and CI.
4. Add a webhook on the GitHub repo to `https://hosted.weblate.org/hooks/github/` (push events), so Weblate picks up new English keys as soon as they land on `main`.
5. Apply for the Libre plan from the project's billing page.

## Adding a language

Translators can start a new language on Weblate; it adds `app/i18n/locales/<code>.json`. Showing it on the site is a small code change:

1. Import the file in `app/i18n/index.js` and add it to `MESSAGES` and `LANGUAGES` (with the language's own name for itself).
2. Add its code to `CODES` in `app/i18n/language.js`.
3. Until it's complete and reviewed by a native speaker, keep it behind a feature flag, as Breton is (`breton` in `/admin/flags`).
