# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A client-side React application that converts Chinese text into Pinyin/Zhuyin with HTML `<ruby>` annotations. This is a JavaScript/TypeScript port of an original C# Blazor WebAssembly application, maintaining identical behavior and features.

## Development Commands

### Essential Commands
```bash
npm run dev          # Start development server on http://localhost:5173
npm run build        # Build for production (compiles TS + builds with Vite)
npm run lint         # Run ESLint
npm run preview      # Preview production build locally
npm run deploy       # Build and deploy to GitHub Pages
```

### Development Workflow
- The dev server uses Vite with HMR (Hot Module Replacement)
- TypeScript compilation happens automatically during build
- Build output goes to `dist/` directory

## Architecture

The whole app is three source files, with no external state management:

- **`src/pinyin.ts`** — pure logic and data
  - Types: `RubyToken`, `PinyinVariant`, `ConversionItem`, `RubyMode`, `ToneDisplay`
  - `ZHUYIN` dictionary (412 toneless pinyin → zhuyin pairs, stored as a compact `pinyin:zhuyin` string)
  - `getPinyin(text)` — one token per Chinese character (Unicode `0x4e00-0x9fbb`), one token per run of other characters; all readings from `pinyin-pro` (`toneType: 'symbol'`, `multiple: true`) kept in `variants`
  - `formatReading(variant, mode, toneDisplay)` — ruby text (nǐ / ni3 / ㄋㄧˇ / ㄋㄧ3). Tones are read via NFD normalization of the combining diacritics (macron=1, acute=2, caron=3, grave=4, none=5)
  - History: `loadHistory`, `saveHistory`, `addToHistory` (SHA-256 dedup), plus `formatTime`
- **`src/main.tsx`** — entry point and all UI: `App` (state, input, mode radios, result, history panel), `useKeyboardNavigation`, `RadioRow`, `PinyinPicker`, `getTokenLines`
- **`src/index.css`** — ruby / picker / fade-in styles

### Data Flow

1. User enters text; "Convert" calls `getPinyin()` and stores `RubyToken[]` (both pinyin and zhuyin), then `addToHistory()`
2. Mode / tone / show-hide toggles only change how tokens are rendered — no re-conversion
3. Clicking a polyphonic character (dotted underline) opens `PinyinPicker` to choose another reading

### localStorage Schema

Key `pinyinRubyHistory`: `ConversionItem[]` = `{ id, inputText, timestamp (ISO string), hash (SHA-256 hex) }`, newest first, max 20; a conversion whose hash already exists is not added and its id is shown as "Already in history as #id".

## Important Behaviors

### Character Selection
- Only Chinese characters are selectable (not punctuation)
- Click or keyboard navigation sets `selectedIndex`
- Selected characters get red highlight + bold styling
- Selection resets to -1 on new conversion

### Keyboard Navigation
- **Left/Right arrows, <, >, comma, period**: Move to adjacent Chinese character
- **Up/Down arrows**: Jump to previous/next phrase
- Phrase boundaries defined by: `。！？,.!?\n\r，、；;：:`
- Navigation stops at boundaries (no wraparound)

### Line Break Handling
Line breaks in input (`\n`) create separate output boxes in `RubyDisplay.tsx`. Each box contains one line of ruby-annotated text.

## Configuration Points

### Default Input Text
Initial `inputText` state in `App` (`src/main.tsx`).

### History Limit
Edit `src/pinyin.ts`:
```typescript
const MAX_HISTORY_ITEMS = 20; // Change as needed
```

### History Text Display Length
Edit `src/main.tsx`:
```typescript
const HISTORY_TEXT_LENGTH = 20; // Max chars before truncation with '...'
```

### Deployment Base Path
Edit `vite.config.ts`:
```typescript
base: './',  // For static file deployment (open index.html directly)
// OR
base: '/RubyingChinesePronunciationJS/', // For GitHub Pages deployment
```

### Zhuyin Dictionary
The Pinyin-to-Zhuyin mapping is the `ZHUYIN` string in `src/pinyin.ts` (copied from original C# version). Add `pinyin:zhuyin` pairs there if needed.

## Key Technical Details

### Pinyin Library Behavior
- Uses `pinyin-pro` with `toneType: 'symbol'` for tone marks (á, è, ǐ, ò, ū)
- Processes character-by-character (not word segmentation)
- Returns empty string for non-Chinese characters
- Equivalent to C# PinyinFormat.WithToneMark

### Styling Architecture
- Tailwind CSS for utility classes
- Tailwind v4 via PostCSS (configured inline in `vite.config.ts`). `src/index.css` uses the v3-style `@tailwind utilities;` directive, which under v4 emits only theme-independent utilities (no colors/spacing/font sizes) — this matches the original build's appearance
- Custom CSS in `index.css` for ruby-specific styling:
  - Ruby base font size: 1.5rem, line-height: 2.5
  - Selection: red text + `#ffe6e6` background
  - Hover: `#f0f0f0` background
  - Ruby text size: 60% of base
- Fade-in animation via `.fade-in` class (0.5s)

## Testing Strategy

When modifying core functionality, verify:
1. Pinyin mode shows correct tone marks
2. Zhuyin mode shows correct bopomofo characters
3. Mode toggle switches without re-conversion
4. Character selection (click + keyboard) works
5. Phrase jumping respects punctuation boundaries
6. History saves/loads/deduplicates correctly
7. Line breaks create separate boxes
8. Time formatting matches expected output ("Just now", "5m ago", etc.)

## Deployment

### Static File Deployment (Current Configuration)
The project is configured for **single-file deployment** using `vite-plugin-singlefile`:
- Build creates **one HTML file** with all CSS/JS inlined: `dist/index.html` (~500KB)
- Works when opened directly via `file://` protocol (no web server needed)
- No CORS issues - everything is embedded in the HTML
- Base path is `'./'` for relative path resolution
- Perfect for offline use or sharing as a single file

To deploy:
```bash
npm run build
# dist/index.html can now be double-clicked to open in browser
```

### GitHub Pages Deployment
The `/docs` folder contains the latest build for GitHub Pages:
- After building, copy `dist/index.html` to `docs/index.html`
- GitHub Pages serves from the `/docs` folder
- If switching to GitHub Pages-only deployment, change `base: './'` to `base: '/RubyingChinesePronunciationJS/'` in `vite.config.ts`

**IMPORTANT: `docs/` must always be updated when committing code changes.**
Always run the following before committing:

```bash
npm run build
cp dist/index.html docs/index.html
cp dist/manifest.json docs/manifest.json
cp dist/sw.js docs/sw.js
cp dist/icon-192.png docs/icon-192.png
cp dist/icon-512.png docs/icon-512.png
cp dist/icon.svg docs/icon.svg
git add docs/
```

Include the `docs/` update in the same commit as the code changes.

### PWA Support
The app has PWA (Progressive Web App) support for the GitHub Pages deployment:
- `public/manifest.json` — web app manifest (name, icons, display mode)
- `public/sw.js` — cache-first service worker (enables offline use after first visit)
- `public/icon-192.png` / `public/icon-512.png` — app icons
- `public/icon.svg` — SVG source for icons (also used as the favicon)
- PWA install prompt appears on GitHub Pages (HTTPS) only — **not** when opening via `file://`

### Build Output Details
Production build generates:
- **Single HTML file**: `dist/index.html` (~500KB, includes all JS/CSS inlined)
- PWA files: `dist/manifest.json`, `dist/sw.js`, `dist/icon-192.png`, `dist/icon-512.png`, `dist/icon.svg`
- ~208KB gzipped
- Uses `vite-plugin-singlefile` to inline all JS/CSS assets
