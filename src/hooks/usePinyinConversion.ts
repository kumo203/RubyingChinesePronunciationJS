import { useState } from 'react';
import type { RubyToken, RubyMode, ToneDisplay } from '../types';
import { getPinyin } from '../services/pinyinService';

/**
 * Hook for managing pinyin conversion state
 * Replicates state management from C# Home.razor component
 */
export function usePinyinConversion(defaultText: string = '你好，世界！') {
  const [inputText, setInputText] = useState(defaultText);
  const [rubyTokens, setRubyTokens] = useState<RubyToken[] | null>(null);
  const [rubyMode, setRubyMode] = useState<RubyMode>('pinyin');
  const [toneDisplay, setToneDisplay] = useState<ToneDisplay>('mark');
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const convert = (text?: string) => {
    const source = (text ?? inputText).trim();
    if (source) {
      const tokens = getPinyin(source);
      setRubyTokens(tokens);
      setSelectedIndex(-1); // Reset selection on new conversion
      return tokens;
    }
    return null;
  };

  const selectPronunciationVariant = (tokenIndex: number, variantIndex: number) => {
    if (!rubyTokens) return;
    const updated = rubyTokens.map((token, i) => {
      if (i !== tokenIndex) return token;
      const v = token.variants[variantIndex];
      if (!v) return token;
      return { ...token, pinyin: v.pinyin, zhuyin: v.zhuyin, activeVariantIndex: variantIndex };
    });
    setRubyTokens(updated);
  };

  return {
    inputText,
    setInputText,
    rubyTokens,
    rubyMode,
    setRubyMode,
    toneDisplay,
    setToneDisplay,
    selectedIndex,
    setSelectedIndex,
    convert,
    selectPronunciationVariant
  };
}
