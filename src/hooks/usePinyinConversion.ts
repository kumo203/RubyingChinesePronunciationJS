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

  const convert = () => {
    if (inputText.trim()) {
      const tokens = getPinyin(inputText);
      setRubyTokens(tokens);
      setSelectedIndex(-1); // Reset selection on new conversion
      return tokens;
    }
    return null;
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
    convert
  };
}
