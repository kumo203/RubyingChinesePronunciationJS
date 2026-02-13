// One complete pronunciation entry for a character
export interface PinyinVariant {
  pinyin: string; // tone-mark form, e.g. "zhōng"
  zhuyin: string; // base zhuyin, e.g. "ㄓㄨㄥ"
}

// Equivalent to RubyToken.cs
export interface RubyToken {
  text: string;
  pinyin: string;             // active pinyin (= variants[activeVariantIndex].pinyin)
  zhuyin: string;             // active zhuyin (= variants[activeVariantIndex].zhuyin)
  isRuby: boolean;
  variants: PinyinVariant[];  // all readings; length 1 for non-polyphonic
  activeVariantIndex: number; // which variant is displayed (default 0)
}

// Equivalent to ConversionItem.cs
export interface ConversionItem {
  id: number;
  inputText: string;
  timestamp: Date;
  hash: string; // SHA-256 hex of inputText (trimmed) for deduplication
}

// For rendering line breaks
export interface LineToken {
  index: number;
  token: RubyToken;
}

export interface LineInfo {
  tokens: LineToken[];
  hasLineBreakBefore: boolean;
}

export type RubyMode = 'pinyin' | 'zhuyin';
export type ToneDisplay = 'mark' | 'number';
