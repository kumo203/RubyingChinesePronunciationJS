import { Fragment, StrictMode, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import {
  addToHistory, formatReading, formatTime, getPinyin, loadHistory, saveHistory,
  type ConversionItem, type RubyMode, type RubyToken, type ToneDisplay,
} from './pinyin';

const PHRASE_DELIMITERS = /[。！？!?.\n\r，,、；;：:]/;
const HISTORY_TEXT_LENGTH = 20;
const BIG_BUTTON = 'text-white font-bold text-3xl py-5 px-16 rounded-lg transition-colors';

const isPhraseStart = (tokens: RubyToken[], i: number) =>
  tokens[i].isRuby && (i === 0 || (!tokens[i - 1].isRuby && PHRASE_DELIMITERS.test(tokens[i - 1].text)));

/**
 * Global shortcuts (ignored while typing in the textarea):
 * Ctrl+→ / . / >  next character      Ctrl+← / , / <  previous character
 * Ctrl+↓ / Ctrl+↑ next / previous phrase start      \  toggle ruby visibility
 */
function useKeyboardNavigation(
  tokens: RubyToken[] | null, selectedIndex: number, setSelectedIndex: (i: number) => void,
  pickerOpen: boolean, toggleShowRuby: () => void,
) {
  useEffect(() => {
    const move = (direction: number, isTarget: (i: number) => boolean) => {
      for (let i = selectedIndex + direction; tokens && i >= 0 && i < tokens.length; i += direction) {
        if (isTarget(i)) return setSelectedIndex(i);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLInputElement) return;
      if (e.key === '\\') { toggleShowRuby(); e.preventDefault(); return; }
      if (!tokens?.length || pickerOpen) return;
      const isChar = (i: number) => tokens[i].isRuby;
      const isPhrase = (i: number) => isPhraseStart(tokens, i);
      const ctrl = e.ctrlKey;
      if ((ctrl && e.key === 'ArrowRight') || e.key === '.' || e.key === '>') move(1, isChar);
      else if ((ctrl && e.key === 'ArrowLeft') || e.key === ',' || e.key === '<') move(-1, isChar);
      else if (ctrl && e.key === 'ArrowDown') move(1, isPhrase);
      else if (ctrl && e.key === 'ArrowUp') move(-1, isPhrase);
      else return;
      e.preventDefault();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [tokens, selectedIndex, setSelectedIndex, pickerOpen, toggleShowRuby]);
}

function RadioRow<T>({ name, value, options, onChange }: {
  name: string; value: T; options: [T, string][]; onChange: (v: T) => void;
}) {
  return (
    <div className="flex gap-4">
      {options.map(([v, label]) => (
        <label key={label} className="flex items-center cursor-pointer">
          <input type="radio" name={name} checked={value === v} onChange={() => onChange(v)} className="mr-2" />
          <span className="text-gray-800 font-medium">{label}</span>
        </label>
      ))}
    </div>
  );
}

function PinyinPicker({ token, mode, toneDisplay, onSelect, onClose }: {
  token: RubyToken; mode: RubyMode; toneDisplay: ToneDisplay;
  onSelect: (variantIndex: number) => void; onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onMouseDown = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) onClose(); };
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, [onClose]);

  return (
    <div ref={ref} className="pinyin-picker" onMouseDown={e => e.stopPropagation()}>
      {token.variants.map((variant, i) => (
        <div key={i} className={`pinyin-picker-item${i === token.activeVariantIndex ? ' active' : ''}`}
          onClick={() => { onSelect(i); onClose(); }}>
          {formatReading(variant, mode, toneDisplay)}
        </div>
      ))}
    </div>
  );
}

/** Splits tokens into lines at line breaks inside non-Chinese tokens, keeping each token's index. */
function getTokenLines(tokens: RubyToken[]) {
  const lines: { index: number; token: RubyToken }[][] = [[]];
  tokens.forEach((token, index) => {
    const parts = token.isRuby ? [token.text] : token.text.split(/\r\n|\n/);
    parts.forEach((text, j) => {
      if (j > 0) lines.push([]);
      if (text) lines[lines.length - 1].push({ index, token: { ...token, text } });
    });
  });
  if (!lines[lines.length - 1].length) lines.pop();
  return lines;
}

function App() {
  const [inputText, setInputText] = useState('你好，世界！');
  const [tokens, setTokens] = useState<RubyToken[] | null>(null);
  const [mode, setMode] = useState<RubyMode>('pinyin');
  const [toneDisplay, setToneDisplay] = useState<ToneDisplay>('mark');
  const [showRuby, setShowRuby] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [pickerIndex, setPickerIndex] = useState(-1);
  const [history, setHistory] = useState<ConversionItem[]>(loadHistory);
  const [duplicateId, setDuplicateId] = useState<number | null>(null);

  const closePicker = () => setPickerIndex(-1);
  const toggleShowRuby = () => setShowRuby(prev => !prev);
  useKeyboardNavigation(tokens, selectedIndex, setSelectedIndex, pickerIndex !== -1, toggleShowRuby);

  const convert = (text: string) => {
    if (!text.trim()) return false;
    setTokens(getPinyin(text.trim()));
    setSelectedIndex(-1);
    return true;
  };

  const handleConvert = async () => {
    closePicker();
    if (!convert(inputText)) return;
    const result = await addToHistory(history, inputText);
    setHistory(result.history);
    setDuplicateId(result.duplicateId);
  };

  const loadFromHistory = (text: string) => { setInputText(text); convert(text); };
  const removeItem = (id: number) => {
    if (window.confirm('Delete this history item?')) setHistory(prev => saveHistory(prev.filter(h => h.id !== id)));
  };
  const clearAll = () => {
    if (window.confirm('Clear all history? This cannot be undone.')) setHistory(saveHistory([]));
  };

  const selectVariant = (tokenIndex: number, variantIndex: number) =>
    setTokens(prev => prev && prev.map((t, i) =>
      i === tokenIndex && t.variants[variantIndex]
        ? { ...t, ...t.variants[variantIndex], activeVariantIndex: variantIndex } : t));

  const renderToken = ({ index, token }: { index: number; token: RubyToken }) => {
    if (!token.isRuby) return <span key={index} className="plain-text">{token.text}</span>;
    const polyphonic = token.variants.length > 1;
    const pickerOpen = polyphonic && index === pickerIndex;
    const classes = ['ruby-text', index === selectedIndex && 'selected', polyphonic && 'polyphonic'];
    return (
      <span key={index} style={{ position: 'relative', display: 'inline' }}>
        <ruby className={classes.filter(Boolean).join(' ')} onClick={e => {
          e.stopPropagation();
          setSelectedIndex(index);
          if (polyphonic) setPickerIndex(pickerOpen ? -1 : index);
        }}>
          {token.text}
          {showRuby && <rt>{formatReading(token, mode, toneDisplay)}</rt>}
        </ruby>
        {pickerOpen && (
          <PinyinPicker token={token} mode={mode} toneDisplay={toneDisplay}
            onSelect={v => selectVariant(index, v)} onClose={closePicker} />
        )}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-2">Pinyin Ruby Tool</h1>
          <p className="text-xl text-gray-600">Adding Pinyin/Zhuyin ruby to Chinese text instantly.</p>
        </header>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <label htmlFor="textInput" className="block text-lg font-semibold mb-2">Input Chinese Text:</label>
            <textarea id="textInput" value={inputText} onChange={e => setInputText(e.target.value)} rows={6}
              className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter Chinese characters here (e.g., 你好世界)..." />
            <div className="mt-4 flex flex-col gap-1">
              <RadioRow name="rubyMode" value={mode} onChange={setMode}
                options={[['pinyin', 'Pinyin'], ['zhuyin', 'Zhuyin (注音)']]} />
              <RadioRow name="toneDisplay" value={toneDisplay} onChange={setToneDisplay}
                options={[['mark', 'Tone Mark'], ['number', 'Tone #']]} />
              <RadioRow name="showRuby" value={showRuby} onChange={setShowRuby}
                options={[[true, 'Show'], [false, 'Hide']]} />
            </div>
            <div className="flex justify-center mt-4">
              <button onClick={handleConvert} className={`bg-blue-600 hover:bg-blue-700 ${BIG_BUTTON}`}>Convert</button>
            </div>
          </div>

          {tokens && (
            <div className="bg-white rounded-lg shadow-md overflow-hidden fade-in">
              <div className="bg-green-600 text-white px-6 py-4">
                <h3 className="text-xl font-semibold">Result</h3>
              </div>
              <div className="px-6 pb-6">
                <div className="flex flex-col gap-2" tabIndex={0}>
                  {getTokenLines(tokens).map((line, lineIdx) => (
                    <Fragment key={lineIdx}>
                      {lineIdx > 0 && <br />}
                      <div className={`preview-box p-4 border border-gray-200 rounded-md bg-gray-50${showRuby ? '' : ' ruby-hidden'}`}>
                        <div className="ruby-line">{line.map(renderToken)}</div>
                      </div>
                    </Fragment>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden mt-6">
          <div className="bg-blue-500 text-white px-6 py-4">
            <h5 className="text-xl font-semibold">History</h5>
          </div>
          {duplicateId !== null && (
            <div className="px-6 py-2 text-sm border-b"
              style={{ backgroundColor: '#fefce8', borderColor: '#fef08a', color: '#854d0e' }}>
              Already in history as <span className="font-bold">#{duplicateId}</span>
            </div>
          )}
          {history.length === 0 ? (
            <div className="p-6 text-center text-gray-500"><p>No history yet</p></div>
          ) : (
            <>
              <div className="divide-y divide-gray-200">
                {history.map(item => (
                  <div key={item.id} className="flex justify-between items-center p-4 hover:bg-gray-50 transition-colors">
                    <button type="button" className="flex-grow text-left hover:text-blue-600 transition-colors"
                      onClick={() => loadFromHistory(item.inputText)}>
                      <div className="font-semibold" title={item.inputText}>
                        <span style={{ color: '#9ca3af', fontWeight: 'normal', fontSize: '0.875rem', marginRight: '0.75rem' }}>
                          #{item.id}
                        </span>
                        {item.inputText.length > HISTORY_TEXT_LENGTH
                          ? item.inputText.substring(0, HISTORY_TEXT_LENGTH) + '...' : item.inputText}
                      </div>
                      <small className="text-gray-500">{formatTime(item.timestamp)}</small>
                    </button>
                    <button type="button" className="ml-4 text-gray-400 hover:text-red-600 transition-colors"
                      onClick={() => removeItem(item.id)} title="Delete this history item">✕</button>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t border-gray-200 flex justify-center">
                <button className={`bg-red-600 hover:bg-red-700 ${BIG_BUTTON}`} onClick={clearAll}>Clear All</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>);
