import { useEffect, useRef } from 'react';
import type { PinyinVariant, RubyMode, ToneDisplay } from '../types';
import { pinyinToToneNumber, applyToneToZhuyin } from '../services/pinyinService';

interface Props {
  tokenIndex: number;
  variants: PinyinVariant[];
  activeVariantIndex: number;
  mode: RubyMode;
  toneDisplay: ToneDisplay;
  onSelect: (tokenIndex: number, variantIndex: number) => void;
  onClose: () => void;
}

function formatVariant(variant: PinyinVariant, mode: RubyMode, toneDisplay: ToneDisplay): string {
  if (mode === 'zhuyin') {
    return applyToneToZhuyin(variant.zhuyin, variant.pinyin, toneDisplay);
  }
  return toneDisplay === 'number' ? pinyinToToneNumber(variant.pinyin) : variant.pinyin;
}

export default function PinyinPicker({
  tokenIndex, variants, activeVariantIndex, mode, toneDisplay, onSelect, onClose
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="pinyin-picker"
      onMouseDown={e => e.stopPropagation()}
    >
      {variants.map((variant, i) => (
        <div
          key={i}
          className={`pinyin-picker-item${i === activeVariantIndex ? ' active' : ''}`}
          onClick={() => { onSelect(tokenIndex, i); onClose(); }}
        >
          {formatVariant(variant, mode, toneDisplay)}
        </div>
      ))}
    </div>
  );
}
