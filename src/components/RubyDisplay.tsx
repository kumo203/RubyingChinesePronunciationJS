import React from 'react';
import type { RubyToken, LineInfo, LineToken, ToneDisplay } from '../types';
import { pinyinToToneNumber, applyToneToZhuyin } from '../services/pinyinService';
import PinyinPicker from './PinyinPicker';

interface Props {
  tokens: RubyToken[];
  mode: 'pinyin' | 'zhuyin';
  toneDisplay: ToneDisplay;
  selectedIndex: number;
  onSelectToken: (index: number) => void;
  openPickerIndex: number;
  onOpenPicker: (index: number) => void;
  onClosePicker: () => void;
  onSelectVariant: (tokenIndex: number, variantIndex: number) => void;
}

/**
 * Splits tokens into lines based on line breaks (\n, \r)
 * Replicates GetTokenLines method from C# Home.razor (lines 136-176)
 */
function getTokenLines(tokens: RubyToken[]): LineInfo[] {
  const lines: LineInfo[] = [];
  let currentLine: LineToken[] = [];
  let currentLineHasBreakBefore = false;

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];

    // Handle line breaks in non-Chinese text
    if (!token.isRuby && (token.text.includes('\n') || token.text.includes('\r'))) {
      const parts = token.text.split(/\r\n|\n/);

      for (let j = 0; j < parts.length; j++) {
        if (parts[j].length > 0) {
          currentLine.push({
            index: i,
            token: { ...token, text: parts[j] }
          });
        }

        // Create new line after each split (except the last one)
        if (j < parts.length - 1) {
          lines.push({ tokens: currentLine, hasLineBreakBefore: currentLineHasBreakBefore });
          currentLine = [];
          currentLineHasBreakBefore = true;
        }
      }
    } else {
      currentLine.push({ index: i, token });
    }
  }

  if (currentLine.length > 0) {
    lines.push({ tokens: currentLine, hasLineBreakBefore: currentLineHasBreakBefore });
  }

  return lines;
}

/**
 * Displays ruby annotations with line break handling
 * Replicates ruby display from C# Home.razor
 */
export default function RubyDisplay({
  tokens, mode, toneDisplay, selectedIndex, onSelectToken,
  openPickerIndex, onOpenPicker, onClosePicker, onSelectVariant
}: Props) {
  const lines = getTokenLines(tokens);

  return (
    <div className="flex flex-col gap-2" tabIndex={0}>
      {lines.map((lineInfo, lineIdx) => (
        <React.Fragment key={lineIdx}>
          {lineInfo.hasLineBreakBefore && <br />}
          <div className="preview-box p-4 border border-gray-200 rounded-md bg-gray-50">
            <div className="ruby-line">
              {lineInfo.tokens.map((item) => {
                const { index, token } = item;
                const isSelected = index === selectedIndex;

                if (token.isRuby) {
                  let rubyText: string;
                  if (mode === 'zhuyin') {
                    rubyText = toneDisplay === 'mark'
                      ? applyToneToZhuyin(token.zhuyin, token.pinyin, 'mark')
                      : applyToneToZhuyin(token.zhuyin, token.pinyin, 'number');
                  } else {
                    rubyText = toneDisplay === 'number'
                      ? pinyinToToneNumber(token.pinyin)
                      : token.pinyin;
                  }

                  const isPolyphonic = token.variants.length > 1;
                  const isPickerOpen = index === openPickerIndex;

                  const rubyClasses = [
                    'ruby-text',
                    isSelected ? 'selected' : '',
                    isPolyphonic ? 'polyphonic' : ''
                  ].filter(Boolean).join(' ');

                  return (
                    <span key={index} style={{ position: 'relative', display: 'inline' }}>
                      <ruby
                        className={rubyClasses}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectToken(index);
                          if (isPolyphonic) {
                            isPickerOpen ? onClosePicker() : onOpenPicker(index);
                          }
                        }}
                      >
                        {token.text}
                        <rt>{rubyText}</rt>
                      </ruby>
                      {isPolyphonic && isPickerOpen && (
                        <PinyinPicker
                          tokenIndex={index}
                          variants={token.variants}
                          activeVariantIndex={token.activeVariantIndex}
                          mode={mode}
                          toneDisplay={toneDisplay}
                          onSelect={onSelectVariant}
                          onClose={onClosePicker}
                        />
                      )}
                    </span>
                  );
                } else {
                  return (
                    <span key={index} className="plain-text">
                      {token.text}
                    </span>
                  );
                }
              })}
            </div>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}
