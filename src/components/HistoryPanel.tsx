import type { ConversionItem } from '../types';
import { formatTime } from '../utils/dateFormatter';

const HISTORY_TEXT_LENGTH = 20;

interface Props {
  history: ConversionItem[];
  onLoad: (text: string) => void;
  onRemove: (id: number) => void;
  onClearAll: () => void;
}

/**
 * Truncates text to specified length and adds "..." if needed
 */
function truncateText(text: string, maxLength: number = HISTORY_TEXT_LENGTH): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * History panel component displaying recent conversions
 * Replicates history section from C# Home.razor
 */
export default function HistoryPanel({ history, onLoad, onRemove, onClearAll }: Props) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden mt-6">
      <div className="bg-blue-500 text-white px-6 py-4">
        <h5 className="text-xl font-semibold">History</h5>
      </div>

      <div className="p-0">
        {history.length > 0 ? (
          <>
            <div className="divide-y divide-gray-200">
              {history.map((item) => (
                <div key={item.id} className="flex justify-between items-center p-4 hover:bg-gray-50 transition-colors">
                  <button
                    type="button"
                    className="flex-grow text-left hover:text-blue-600 transition-colors"
                    onClick={() => onLoad(item.inputText)}
                  >
                    <div className="font-semibold" title={item.inputText}>
                      {truncateText(item.inputText)}
                    </div>
                    <small className="text-gray-500">{formatTime(item.timestamp)}</small>
                  </button>
                  <button
                    type="button"
                    className="ml-4 text-gray-400 hover:text-red-600 transition-colors"
                    onClick={() => onRemove(item.id)}
                    title="Delete this history item"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-gray-200 flex justify-center">
              <button
                className="bg-red-600 hover:bg-red-700 text-white font-bold text-3xl py-5 px-16 rounded-lg transition-colors"
                onClick={onClearAll}
              >
                Clear All
              </button>
            </div>
          </>
        ) : (
          <div className="p-6 text-center text-gray-500">
            <p>No history yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
