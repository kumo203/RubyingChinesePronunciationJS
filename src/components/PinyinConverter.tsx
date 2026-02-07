import { useKeyboardNavigation } from '../hooks/useKeyboardNavigation';
import { usePinyinConversion } from '../hooks/usePinyinConversion';
import RubyDisplay from './RubyDisplay';
import ModeToggle from './ModeToggle';

interface Props {
  conversion: ReturnType<typeof usePinyinConversion>;
  onConvert: () => void;
}

/**
 * Main conversion UI component with input, mode toggle, and ruby display
 * Replicates conversion functionality from C# Home.razor
 */
export default function PinyinConverter({ conversion, onConvert }: Props) {
  const { inputText, setInputText, rubyTokens, rubyMode, setRubyMode, selectedIndex, setSelectedIndex } = conversion;

  // Enable keyboard navigation
  useKeyboardNavigation(rubyTokens, selectedIndex, setSelectedIndex);

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <label htmlFor="textInput" className="block text-lg font-semibold mb-2">
          Input Chinese Text:
        </label>
        <textarea
          id="textInput"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={6}
          placeholder="Enter Chinese characters here (e.g., 你好世界)..."
        />
        <div className="flex justify-end mt-4">
          <button
            onClick={onConvert}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Convert
          </button>
        </div>
      </div>

      {/* Output Section */}
      {rubyTokens && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden fade-in">
          <div className="bg-green-600 text-white px-6 py-4 flex justify-between items-center">
            <h3 className="text-xl font-semibold">Result</h3>
            <ModeToggle mode={rubyMode} onChange={setRubyMode} />
          </div>
          <div className="p-6">
            <RubyDisplay
              tokens={rubyTokens}
              mode={rubyMode}
              selectedIndex={selectedIndex}
              onSelectToken={setSelectedIndex}
            />
          </div>
        </div>
      )}
    </div>
  );
}
