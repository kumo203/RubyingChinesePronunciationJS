import type { RubyMode } from '../types';

interface Props {
  mode: RubyMode;
  onChange: (mode: RubyMode) => void;
}

/**
 * Radio button group for toggling between Pinyin and Zhuyin modes
 * Replicates mode toggle functionality from C# Home.razor
 */
export default function ModeToggle({ mode, onChange }: Props) {
  return (
    <div className="flex gap-2">
      <label className="flex items-center cursor-pointer">
        <input
          type="radio"
          name="rubyMode"
          value="pinyin"
          checked={mode === 'pinyin'}
          onChange={() => onChange('pinyin')}
          className="mr-2"
        />
        <span className="text-white">Pinyin</span>
      </label>
      <label className="flex items-center cursor-pointer">
        <input
          type="radio"
          name="rubyMode"
          value="zhuyin"
          checked={mode === 'zhuyin'}
          onChange={() => onChange('zhuyin')}
          className="mr-2"
        />
        <span className="text-white">Zhuyin (注音)</span>
      </label>
    </div>
  );
}
