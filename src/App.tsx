import { usePinyinConversion } from './hooks/usePinyinConversion';
import { useHistory } from './hooks/useHistory';
import PinyinConverter from './components/PinyinConverter';
import HistoryPanel from './components/HistoryPanel';
import './App.css';

/**
 * Root application component
 * Replicates overall structure from C# Home.razor
 */
function App() {
  const conversion = usePinyinConversion();
  const history = useHistory();

  const handleConvert = () => {
    const tokens = conversion.convert();
    if (tokens) {
      history.addItem(conversion.inputText);
    }
  };

  const handleLoadFromHistory = (text: string) => {
    conversion.setInputText(text);
    // Auto-convert when loading from history
    setTimeout(() => {
      conversion.convert();
    }, 0);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-2">Pinyin Ruby Tool</h1>
          <p className="text-xl text-gray-600">
            Adding Pinyin/Zhuyin ruby to Chinese text instantly.
          </p>
        </header>

        <PinyinConverter
          conversion={conversion}
          onConvert={handleConvert}
        />

        <HistoryPanel
          history={history.history}
          onLoad={handleLoadFromHistory}
          onRemove={history.removeItem}
          onClearAll={history.clearAll}
        />
      </div>
    </div>
  );
}

export default App;
