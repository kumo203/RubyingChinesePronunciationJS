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
