# Contributing

Thanks for helping improve the Proxy Management Extension. Bug reports, fixes and focused feature work are all welcome. For larger changes, open an issue first so the approach can be agreed before you write the code.

## Prerequisites

- Node.js 22 (see `.nvmrc`) and npm
- A Chromium-based browser (Chrome, Brave, Edge) version 116 or later for loading the extension
- Internet access for `npm test`: the end-to-end suite downloads Chrome for Testing on its first run and reaches a few public hosts

## Setup

```bash
npm install
cp .env.example .env   # optional: VITE_FP_WEB defaults to https://www.flashproxy.com
npm run dev
```

The dev server serves the pages in a normal browser tab, outside the extension:

- `http://localhost:5173/popup.html`
- `http://localhost:5173/dashboard.html?page=proxies&tab=own` (`page` = `proxies | rules | settings`)
- `http://localhost:5173/welcome.html`

Outside the extension the pages fall back to empty data, so use a real build to test anything that talks to the service worker.

## Build and load unpacked

```bash
npm run build
```

Open `chrome://extensions` (or `brave://extensions`, `edge://extensions`), enable **Developer mode**, choose **Load unpacked** and select `dist/`. After each rebuild, press the reload button on the extension's card.

## Project structure

- `src/background/`: the MV3 service worker (API key storage, FlashProxy API client, plans, connecting, `chrome.proxy`, PAC generation, proxy auth).
- `src/popup/`, `src/dashboard/`, `src/welcome/`: the three extension pages. Each is its own [Feature-Sliced Design](https://fsd.how/) tree (`app`, `pages`, `widgets`, `entities`, `shared`), checked by steiger.
- `src/shared/`: code used by every page and the worker: domain types (`model`), the page-to-worker client (`api`), helpers (`lib`), config, the UI kit (`ui`, shadcn/ui on Radix) and styles.
- `scripts/`: the build, the PAC check and the screenshot script (`npm run shots`). `e2e/`: the headless browser tests.

## Code style

- Formatting is Prettier (`.prettierrc`: single quotes, semicolons, 100 columns, Tailwind class sorting). Run `npm run format`.
- `npm run lint` runs ESLint with TypeScript, React Hooks, import ordering (alphabetized groups, `@/` imports as internal) and unused-import rules. `npm run lint:fix` fixes most of it.
- The React Compiler handles memoization: do not use `useMemo`, `useCallback` or `memo` (ESLint rejects them).
- `npm run lint:fsd` checks the FSD layer rules: a layer only imports from layers below it, and slices are imported through their public `index.ts`.
- `npm run typecheck` must pass with no errors.

## Tests

```bash
npm test
```

This runs, in order:

1. `npm run pac-check`: runs the generated PAC script against the TypeScript rule matcher, including hosts and rules that try to break out of their strings.
2. `npm run build`.
3. `npm run e2e`: loads `dist/` in headless Chrome for Testing (cached in `.cache/browsers`) with two local test proxies. Results and screenshots are written to `e2e/out/`.

Add or update a test when you change routing, PAC generation, connecting or credential handling.

## Commit messages

Use [Conventional Commits](https://www.conventionalcommits.org/): `feat:`, `fix:`, `refactor:`, `test:`, `docs:`, `build:`, `ci:`, `chore:`, with an optional scope, for example `fix(pac): escape hosts in site rules`. Keep the subject short and in the imperative.

## Pull requests

1. Fork the repository and create a branch from `main`.
2. Keep each pull request to one change. Describe what it does, why, and how you tested it.
3. Run `npm run typecheck`, `npm run lint`, `npm run lint:fsd` and `npm test`. CI runs the same checks.
4. Attach screenshots for UI changes.
5. Never commit API keys, proxy credentials or `.env` files.

A maintainer will review the pull request and may ask for changes before merging.

## Security issues

Do not report vulnerabilities in public issues. See [SECURITY.md](SECURITY.md).

## License

By contributing, you agree that your contributions are licensed under the [GNU General Public License v3.0 only](LICENSE) (`GPL-3.0-only`), the license of this project.
