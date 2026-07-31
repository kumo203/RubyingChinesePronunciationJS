import type { RubyMode, ToneDisplay } from '../types';

interface Props {
  mode: RubyMode;
  onChange: (mode: RubyMode) => void;
  toneDisplay: ToneDisplay;
  onToneDisplayChange: (tone: ToneDisplay) => void;
  showRuby: boolean;
  onShowRubyChange: (show: boolean) => void;
}

/**
 * Radio button groups for toggling between Pinyin/Zhuyin modes,
 * Tone Mark / Tone # display options, and ruby show/hide.
 */
export default function ModeToggle({
  mode, onChange, toneDisplay, onToneDisplayChange, showRuby, onShowRubyChange
}: Props) {
  return (
    <div className="flex flex-col gap-1">
      {/* Pinyin / Zhuyin row */}
      <div className="flex gap-4">
        <label className="flex items-center cursor-pointer">
          <input
            type="radio"
            name="rubyMode"
            value="pinyin"
            checked={mode === 'pinyin'}
            onChange={() => onChange('pinyin')}
            className="mr-2"
          />
          <span className="text-gray-800 font-medium">Pinyin</span>
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
          <span className="text-gray-800 font-medium">Zhuyin (注音)</span>
        </label>
      </div>

      {/* Tone Mark / Tone # row */}
      <div className="flex gap-4">
        <label className="flex items-center cursor-pointer">
          <input
            type="radio"
            name="toneDisplay"
            value="mark"
            checked={toneDisplay === 'mark'}
            onChange={() => onToneDisplayChange('mark')}
            className="mr-2"
          />
          <span className="text-gray-800 font-medium">Tone Mark</span>
        </label>
        <label className="flex items-center cursor-pointer">
          <input
            type="radio"
            name="toneDisplay"
            value="number"
            checked={toneDisplay === 'number'}
            onChange={() => onToneDisplayChange('number')}
            className="mr-2"
          />
          <span className="text-gray-800 font-medium">Tone #</span>
        </label>
      </div>

      {/* Show / Hide ruby row */}
      <div className="flex gap-4">
        <label className="flex items-center cursor-pointer">
          <input
            type="radio"
            name="showRuby"
            value="show"
            checked={showRuby === true}
            onChange={() => onShowRubyChange(true)}
            className="mr-2"
          />
          <span className="text-gray-800 font-medium">Show</span>
        </label>
        <label className="flex items-center cursor-pointer">
          <input
            type="radio"
            name="showRuby"
            value="hide"
            checked={showRuby === false}
            onChange={() => onShowRubyChange(false)}
            className="mr-2"
          />
          <span className="text-gray-800 font-medium">Hide</span>
        </label>
      </div>
    </div>
  );
}
