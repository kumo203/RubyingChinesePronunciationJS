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

### State Management Pattern

The application uses a **custom hooks-based architecture** without external state management libraries:

1. **usePinyinConversion** (`src/hooks/usePinyinConversion.ts`) - Core conversion state
   - Manages input text, ruby tokens, display mode (pinyin/zhuyin), and character selection
   - The `convert()` function calls `getPinyin()` service and updates state
   - Returns all state and setters for components to consume

2. **useHistory** (`src/hooks/useHistory.ts`) - History management
   - Wraps `historyService.ts` with React state
   - Handles add/remove/clear operations
   - Automatically syncs with localStorage

3. **useKeyboardNavigation** (`src/hooks/useKeyboardNavigation.ts`) - Keyboard interaction
   - Listens for arrow keys, <, >, comma, period
   - Navigates only through Chinese characters (skips punctuation)
   - Implements phrase jumping based on punctuation marks

### Component Hierarchy

```
App.tsx (root)
├── PinyinConverter.tsx (main UI)
│   ├── ModeToggle.tsx (pinyin/zhuyin switcher)
│   └── RubyDisplay.tsx (renders <ruby> tags)
└── HistoryPanel.tsx (localStorage-backed history)
```

### Data Flow

1. User enters Chinese text in textarea (controlled by `usePinyinConversion`)
2. Click "Convert" → calls `conversion.convert()` → triggers `getPinyin()`
3. `getPinyin()` processes character-by-character:
   - Chinese chars: Get pinyin via `pinyin-pro`, convert to zhuyin via dictionary lookup
   - Non-Chinese: Group consecutive characters together
4. Result stored as `RubyToken[]` array
5. `RubyDisplay` renders tokens with mode-specific annotations
6. History service saves successful conversions to localStorage

### Core Conversion Logic

**Character Processing** (`src/services/pinyinService.ts:73-115`):
- Iterates through input string character-by-character
- Uses `isChineseCharacter()` to detect Unicode range `0x4e00-0x9fbb`
- Chinese characters become individual tokens with pinyin/zhuyin
- Non-Chinese characters are grouped into single tokens

**Pinyin-to-Zhuyin Conversion** (`src/services/pinyinService.ts:38-51`):
1. Remove tone marks from pinyin (á → a, ǐ → i, etc.)
2. Lookup base pinyin in `PINYIN_TO_ZHUYIN_MAP` (400+ mappings)
3. Return zhuyin characters (e.g., "ni" → "ㄋㄧ")

**Mode Switching**:
- Conversion happens once and stores both pinyin AND zhuyin
- Toggling mode only changes which annotation is displayed
- No re-conversion needed when switching modes

### localStorage Schema

**History** (`history` key):
```typescript
ConversionItem[] = [
  {
    id: number,           // Auto-incremented
    inputText: string,    // Original Chinese text
    timestamp: Date       // ISO 8601 string
  }
]
```

**Constraints**:
- Maximum 20 items (newest first)
- Duplicates skipped if identical to most recent item
- Managed by `src/services/historyService.ts`

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
Edit `src/hooks/usePinyinConversion.ts:9`:
```typescript
export function usePinyinConversion(defaultText: string = '你好，世界！') {
```

### History Limit
Edit `src/services/historyService.ts`:
```typescript
const MAX_HISTORY_ITEMS = 20; // Change as needed
```

### History Text Display Length
Edit `src/components/HistoryPanel.tsx`:
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
The complete Pinyin-to-Zhuyin mapping is in `src/data/zhuyinMap.ts` (copied from original C# version). Add new mappings there if needed.

## Key Technical Details

### Pinyin Library Behavior
- Uses `pinyin-pro` with `toneType: 'symbol'` for tone marks (á, è, ǐ, ò, ū)
- Processes character-by-character (not word segmentation)
- Returns empty string for non-Chinese characters
- Equivalent to C# PinyinFormat.WithToneMark

### Styling Architecture
- Tailwind CSS for utility classes
- Custom CSS in `App.css` for ruby-specific styling:
  - Ruby base font size: 1.5rem, line-height: 2.5
  - Selection: red text + `#ffe6e6` background
  - Hover: `#f0f0f0` background
  - Ruby text size: 60% of base
- Fade-in animation via `.fade-in` class (0.5s)

### TypeScript Types
All types defined in `src/types/index.ts`:
- `RubyToken`: Represents one character/group with pinyin/zhuyin
- `ConversionItem`: History entry
- `LineToken`, `LineInfo`: Used by RubyDisplay for multi-line rendering
- `RubyMode`: 'pinyin' | 'zhuyin'

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

**IMPORTANT: `docs/index.html` must always be updated when committing code changes.**
Always run the following before committing:

```bash
npm run build
cp dist/index.html docs/index.html
git add docs/index.html
```

Include the `docs/index.html` update in the same commit as the code changes.

### Build Output Details
Production build generates:
- **Single HTML file**: `dist/index.html` (~500KB, includes all JS/CSS inlined)
- Favicon: `dist/vite.svg`
- ~206KB gzipped
- Uses `vite-plugin-singlefile` to inline all assets
