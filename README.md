# Pinyin Ruby Tool (React Version)

A client-side React application that converts Chinese text into Pinyin/Zhuyin with HTML `<ruby>` annotations. This is a JavaScript/TypeScript port of the original C# Blazor WebAssembly application.

## 🚀 Current Status: Fully Functional

This React version replicates all features from the original Blazor application with identical behavior.

### ✨ Features

- **Chinese to Pinyin Conversion**: Uses `pinyin-pro` library for high-performance, client-side conversion
- **Chinese to Zhuyin Conversion**: Custom Pinyin-to-Zhuyin mapping (400+ syllables) for Taiwanese Bopomofo system
- **Ruby Annotation Display**: Renders Pinyin or Zhuyin above characters using standard `<ruby>` tags
- **Mode Selector**: Toggle between Pinyin and Zhuyin (注音) display modes
- **Line Break Support**: Multi-line input creates separate output boxes for visual clarity
- **Interactive Selection**:
  - **Click**: Select individual Chinese characters (highlighted in red)
  - **Keyboard Navigation**:
    - `Left` / `<` / `,`: Move to previous character
    - `Right` / `>` / `.`: Move to next character
    - `Up`: Jump to previous phrase (after punctuation)
    - `Down`: Jump to next phrase
- **Persistent History**: Stores up to 20 recent conversions in localStorage
- **Fade-in Animations**: Smooth transitions for result display
- **Static Deployment**: No backend server required, runs entirely in the browser

### 🛠 Tech Stack

- **React 18+** with TypeScript
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **pinyin-pro** (v3.28.0) - Chinese-to-Pinyin conversion
- **gh-pages** - Deployment to GitHub Pages

## 📦 Installation & Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```
Then open `http://localhost:5173` in your browser.

### 3. Build for Production
```bash
npm run build
```
Output will be in the `dist/` directory.

### 4. Preview Production Build
```bash
npm run preview
```

## 🚀 Deployment to GitHub Pages

### Option 1: Automated Deployment
```bash
npm run deploy
```
This command:
1. Builds the production bundle
2. Deploys to `gh-pages` branch automatically

### Option 2: Manual Deployment
1. Update `base` in `vite.config.ts` with your repository name:
   ```typescript
   base: '/your-repo-name/',
   ```
2. Build: `npm run build`
3. Deploy: `npx gh-pages -d dist`

### Configure GitHub Pages
1. Go to repository Settings → Pages
2. Set source to `gh-pages` branch
3. Save

Your app will be available at: `https://yourusername.github.io/RubyingChinesePronunciationJS/`

## 📂 Project Structure

```
src/
├── main.tsx     # Entry point + all UI (App, keyboard navigation, pronunciation picker)
├── pinyin.ts    # Conversion logic, Pinyin→Zhuyin dictionary, history storage, time formatting
└── index.css    # Ruby / picker styles
```

## 🎯 Key Behaviors (Identical to C# Version)

### Pinyin Conversion
- Character-by-character processing with tone marks (á, è, ǐ, ò, ū)
- Groups consecutive non-Chinese characters
- Unicode range detection (0x4e00-0x9fbb)

### Zhuyin Mapping
- Removes tone marks before dictionary lookup
- 400+ exact Pinyin→Zhuyin mappings from original C# version
- Example: `ni3` → `nǐ` → `ㄋㄧ`

### Selection Navigation
- Only Chinese characters selectable (skips punctuation)
- Arrow keys stop at boundaries (no wraparound)
- Phrase jumping based on punctuation: 。！？,.!?\n\r，、；;：:

### History Management
- Max 20 items, newest first
- Skips duplicates (SHA-256 of the text, compared against all items)
- Auto-increments IDs
- Persists to localStorage as JSON

### Time Formatting
- "Just now" (< 60s)
- "5m ago" (< 1h)
- "3h ago" (< 24h)
- "2d ago" (< 7d)
- "Jan 15" (≥ 7d)

## 🎨 Styling

### Ruby Annotations
- Font size: 1.5rem, line-height: 2.5
- Hover: light gray background (#f0f0f0)
- Selected: red text, bold, light red background (#ffe6e6)
- Ruby text (`<rt>`): 60% size, gray (#555), red when selected

### Animations
- Fade-in effect on result display (0.5s ease-in)
- Smooth transitions on hover/selection (0.2s)

## 🔧 Configuration

### Customize Default Text
Edit `usePinyinConversion.ts`:
```typescript
export function usePinyinConversion(defaultText: string = '你的文字') {
  // ...
}
```

### Adjust History Limit
Edit `historyService.ts`:
```typescript
const MAX_HISTORY_ITEMS = 20;
```

### Change Deployment Path
Edit `vite.config.ts`:
```typescript
base: '/your-custom-path/',
```

## 🧪 Testing Checklist

- [x] Pinyin mode shows tone marks (你 → nǐ)
- [x] Zhuyin mode shows bopomofo (你 → ㄋㄧ)
- [x] Mode toggle switches display without re-conversion
- [x] Character click selects (red highlight)
- [x] Keyboard navigation: ArrowLeft/Right, <, >, ,, .
- [x] Phrase jumping: ArrowUp/Down
- [x] History saves to localStorage
- [x] History deduplicates consecutive identical items
- [x] History limits to 20 items
- [x] Time formatting matches C# output
- [x] Line breaks create separate boxes
- [x] Fade-in animation appears on results
- [x] Confirm dialogs for delete/clear operations

## 📝 Differences from C# Version

### Advantages
- **Faster Build**: Vite HMR vs Blazor rebuild (~2s vs ~10s)
- **Smaller Bundle**: ~200KB (gzipped) vs ~2MB Blazor WASM
- **Better SEO**: Can add SSR later with Next.js
- **Wider Ecosystem**: More npm packages available

### Implementation Notes
- **pinyin-pro** works character-by-character (different from PinyinM.NET's word segmentation)
- Uses `toneType: 'symbol'` to match `PinyinFormat.WithToneMark`
- Exact same Zhuyin dictionary copied from C# version
- localStorage API directly available (no JSInterop needed)

## 🙏 Credits

- Original C# Blazor version: [RubyingChinesePronunciation](https://github.com/yourusername/RubyingChinesePronunciation)
- Pinyin library: [pinyin-pro](https://github.com/zh-lx/pinyin-pro)
- Build tool: [Vite](https://vitejs.dev/)
- Styling: [Tailwind CSS](https://tailwindcss.com/)

## 📄 License

Same license as the original project.
