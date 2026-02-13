import { useState, useEffect } from 'react';
import type { ConversionItem } from '../types';
import * as historyService from '../services/historyService';

/**
 * Hook for managing conversion history
 * Replicates HistoryService functionality from C#
 */
export function useHistory() {
  const [history, setHistory] = useState<ConversionItem[]>([]);
  const [duplicateId, setDuplicateId] = useState<number | null>(null);

  // Load history from localStorage on mount
  useEffect(() => {
    setHistory(historyService.loadHistory());
  }, []);

  const addItem = async (text: string) => {
    const result = await historyService.addToHistory(history, text);
    setHistory(result.history);
    setDuplicateId(result.duplicateId);
  };

  const removeItem = (id: number) => {
    if (window.confirm('Delete this history item?')) {
      setHistory(prev => historyService.removeFromHistory(prev, id));
    }
  };

  const clearAll = () => {
    if (window.confirm('Clear all history? This cannot be undone.')) {
      setHistory(historyService.clearHistory());
    }
  };

  return { history, addItem, removeItem, clearAll, duplicateId };
}
