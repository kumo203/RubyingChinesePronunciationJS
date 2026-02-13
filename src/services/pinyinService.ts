import { pinyin } from 'pinyin-pro';
import type { RubyToken } from '../types';
import { PINYIN_TO_ZHUYIN_MAP } from '../data/zhuyinMap';

// Tone mark removal mapping (from PinyinService.cs lines 161-177)
const TONE_MARK_MAP: Record<string, string> = {
  // á à ǎ ā
  'á': 'a', 'à': 'a', 'ǎ': 'a', 'ā': 'a',
  // é è ě ē
  'é': 'e', 'è': 'e', 'ě': 'e', 'ē': 'e',
  // í ì ǐ ī
  'í': 'i', 'ì': 'i', 'ǐ': 'i', 'ī': 'i',
  // ó ò ǒ ō
  'ó': 'o', 'ò': 'o', 'ǒ': 'o', 'ō': 'o',
  // ú ù ǔ ū
  'ú': 'u', 'ù': 'u', 'ǔ': 'u', 'ū': 'u',
  // ü with tone marks
  'ǖ': 'ü', 'ǘ': 'ü', 'ǚ': 'ü', 'ǜ': 'ü',
  // ń ň ǹ
  'ń': 'n', 'ň': 'n', 'ǹ': 'n',
};

// Maps toned vowels to their tone number (1-4); unmarked = tone 5 (neutral)
const TONE_NUMBER_MAP: Record<string, [string, number]> = {
  'ā': ['a', 1], 'á': ['a', 2], 'ǎ': ['a', 3], 'à': ['a', 4],
  'ē': ['e', 1], 'é': ['e', 2], 'ě': ['e', 3], 'è': ['e', 4],
  'ī': ['i', 1], 'í': ['i', 2], 'ǐ': ['i', 3], 'ì': ['i', 4],
  'ō': ['o', 1], 'ó': ['o', 2], 'ǒ': ['o', 3], 'ò': ['o', 4],
  'ū': ['u', 1], 'ú': ['u', 2], 'ǔ': ['u', 3], 'ù': ['u', 4],
  'ǖ': ['ü', 1], 'ǘ': ['ü', 2], 'ǚ': ['ü', 3], 'ǜ': ['ü', 4],
  'ń': ['n', 2], 'ň': ['n', 3], 'ǹ': ['n', 4],
};

/**
 * Converts pinyin with tone marks to pinyin with tone number suffix
 * Example: nǐ → ni3, hǎo → hao3, māo → mao1, ma → ma5
 */
export function pinyinToToneNumber(pinyinText: string): string {
  if (!pinyinText) return pinyinText;
  let tone = 5; // neutral tone default
  const base = pinyinText
    .split('')
    .map(char => {
      if (char in TONE_NUMBER_MAP) {
        const [replacement, t] = TONE_NUMBER_MAP[char];
        tone = t;
        return replacement;
      }
      return char;
    })
    .join('');
  return base + tone;
}

// Zhuyin tone mark suffixes: tone 1 has no mark, 2-4 have diacritics, 5 (neutral) = ˙
const ZHUYIN_TONE_MARKS = ['', '', 'ˊ', 'ˇ', 'ˋ', '˙'] as const;

/**
 * Extracts the tone number (1-5) from a pinyin string with tone marks.
 * Returns 5 for neutral/unmarked syllables.
 */
export function getToneFromPinyin(pinyinText: string): number {
  for (const char of pinyinText) {
    if (char in TONE_NUMBER_MAP) return TONE_NUMBER_MAP[char][1];
  }
  return 5;
}

/**
 * Applies tone display to a zhuyin string based on the pinyin tone.
 * 'mark': appends standard Zhuyin tone diacritic (tone 1 = no mark)
 * 'number': appends tone number 1-5
 */
export function applyToneToZhuyin(zhuyinText: string, pinyinText: string, toneDisplay: 'mark' | 'number'): string {
  if (!zhuyinText) return zhuyinText;
  const tone = getToneFromPinyin(pinyinText);
  if (toneDisplay === 'number') return zhuyinText + tone;
  return zhuyinText + ZHUYIN_TONE_MARKS[tone];
}

/**
 * Removes tone marks from pinyin text
 * Example: nǐ → ni, hǎo → hao
 */
export function removeToneMarks(pinyinText: string): string {
  return pinyinText
    .split('')
    .map(char => TONE_MARK_MAP[char] || char)
    .join('');
}

/**
 * Converts pinyin to zhuyin using the mapping dictionary
 * Example: ni → ㄋㄧ, hao → ㄏㄠ
 */
export function convertPinyinToZhuyin(pinyinText: string): string {
  if (!pinyinText) return '';

  // Remove tone marks before dictionary lookup
  const basePinyin = removeToneMarks(pinyinText).toLowerCase();

  // Try to find mapping in dictionary
  if (basePinyin in PINYIN_TO_ZHUYIN_MAP) {
    return PINYIN_TO_ZHUYIN_MAP[basePinyin];
  }

  // Return base pinyin if no mapping found
  return basePinyin;
}

/**
 * Checks if a character is Chinese (Unicode range 0x4e00-0x9fbb)
 */
export function isChineseCharacter(char: string): boolean {
  if (!char || char.length === 0) return false;
  const code = char.charCodeAt(0);
  return code >= 0x4e00 && code <= 0x9fbb;
}

/**
 * Checks if text contains any Chinese characters
 */
export function isChinese(text: string): boolean {
  return Array.from(text).some(isChineseCharacter);
}

/**
 * Main conversion function: converts Chinese text to RubyToken array
 * This replicates the behavior of C# PinyinService.GetPinyin()
 */
export function getPinyin(text: string): RubyToken[] {
  if (!text) return [];

  const tokens: RubyToken[] = [];

  // Process character by character
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const isChinese = isChineseCharacter(char);

    if (isChinese) {
      // Get pinyin with tone marks using pinyin-pro
      // toneType: 'symbol' is equivalent to PinyinFormat.WithToneMark
      const pinyinText = pinyin(char, {
        toneType: 'symbol',
        type: 'array'
      })[0] || '';

      tokens.push({
        text: char,
        pinyin: pinyinText,
        zhuyin: convertPinyinToZhuyin(pinyinText),
        isRuby: true
      });
    } else {
      // Group consecutive non-Chinese characters
      let nonChineseText = char;
      while (i + 1 < text.length && !isChineseCharacter(text[i + 1])) {
        i++;
        nonChineseText += text[i];
      }

      tokens.push({
        text: nonChineseText,
        pinyin: '',
        zhuyin: '',
        isRuby: false
      });
    }
  }

  return tokens;
}
