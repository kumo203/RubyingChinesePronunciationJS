// Equivalent to RubyToken.cs
export interface RubyToken {
  text: string;
  pinyin: string;
  zhuyin: string;
  isRuby: boolean;
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
