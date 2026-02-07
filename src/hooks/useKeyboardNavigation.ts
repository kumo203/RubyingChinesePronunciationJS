import { useEffect } from 'react';
import type { RubyToken } from '../types';

// Phrase delimiter characters (from C# Home.razor lines 320-324)
const PHRASE_DELIMITERS = ['。', '！', '？', '!', '?', '.', '\n', '\r', '，', ',', '、', '；', ';', '：', ':'];

/**
 * Checks if the token at given index is the start of a phrase
 * Replicates IsPhraseStart method from C# Home.razor (lines 307-330)
 */
function isPhraseStart(tokens: RubyToken[], index: number): boolean {
  if (index < 0 || index >= tokens.length) return false;
  if (!tokens[index].isRuby) return false;
  if (index === 0) return true;

  const prevToken = tokens[index - 1];
  if (prevToken.isRuby) return false;

  const text = prevToken.text;
  return PHRASE_DELIMITERS.some(delimiter => text.includes(delimiter));
}

/**
 * Hook for keyboard navigation in ruby text
 * Replicates HandleKeyDown, MoveSelection, and MoveToPhrase from C# Home.razor (lines 247-330)
 *
 * Keyboard shortcuts:
 * - ArrowRight / . / > : Move to next Chinese character
 * - ArrowLeft / , / < : Move to previous Chinese character
 * - ArrowDown: Jump to next phrase start
 * - ArrowUp: Jump to previous phrase start
 */
export function useKeyboardNavigation(
  rubyTokens: RubyToken[] | null,
  selectedIndex: number,
  setSelectedIndex: (index: number) => void
) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!rubyTokens || rubyTokens.length === 0) return;

      let handled = false;

      // Arrow Right, ., > - Move to next character (lines 251-254)
      if (e.key === 'ArrowRight' || e.key === '.' || e.key === '>') {
        moveSelection(1);
        handled = true;
      }
      // Arrow Left, ,, < - Move to previous character (lines 255-258)
      else if (e.key === 'ArrowLeft' || e.key === ',' || e.key === '<') {
        moveSelection(-1);
        handled = true;
      }
      // Arrow Down - Move to next phrase (lines 259-262)
      else if (e.key === 'ArrowDown') {
        moveToPhrase(1);
        handled = true;
      }
      // Arrow Up - Move to previous phrase (lines 263-266)
      else if (e.key === 'ArrowUp') {
        moveToPhrase(-1);
        handled = true;
      }

      // preventDefault to block default browser behavior
      if (handled) {
        e.preventDefault();
      }
    };

    /**
     * Moves selection to next/previous Chinese character
     * Replicates MoveSelection method (lines 269-286)
     */
    const moveSelection = (direction: number) => {
      if (!rubyTokens) return;
      let newIndex = selectedIndex;

      while (true) {
        newIndex += direction;
        if (newIndex < 0 || newIndex >= rubyTokens.length) break;

        // Only select Chinese characters (IsRuby == true)
        if (rubyTokens[newIndex].isRuby) {
          setSelectedIndex(newIndex);
          break;
        }
      }
    };

    /**
     * Moves selection to next/previous phrase start
     * Replicates MoveToPhrase method (lines 288-305)
     */
    const moveToPhrase = (direction: number) => {
      if (!rubyTokens) return;
      let newIndex = selectedIndex;

      while (true) {
        newIndex += direction;
        if (newIndex < 0 || newIndex >= rubyTokens.length) break;

        if (isPhraseStart(rubyTokens, newIndex)) {
          setSelectedIndex(newIndex);
          break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [rubyTokens, selectedIndex, setSelectedIndex]);
}
