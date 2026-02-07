import type { ConversionItem } from '../types';

const STORAGE_KEY = 'pinyinRubyHistory';
const MAX_HISTORY_ITEMS = 50;

/**
 * Loads history from localStorage
 * Returns empty array if not found or on error
 */
export function loadHistory(): ConversionItem[] {
  try {
    const json = localStorage.getItem(STORAGE_KEY);
    if (!json) return [];

    const items = JSON.parse(json);
    // Convert ISO date strings back to Date objects
    return items.map((item: any) => ({
      ...item,
      timestamp: new Date(item.timestamp)
    }));
  } catch {
    return [];
  }
}

/**
 * Saves history to localStorage
 * Silently handles errors
 */
export function saveHistory(history: ConversionItem[]): void {
  try {
    const json = JSON.stringify(history);
    localStorage.setItem(STORAGE_KEY, json);
  } catch {
    // Silently handle localStorage errors
  }
}

/**
 * Adds a new item to history
 * - Skips if identical to most recent item (line 49 of C# HistoryService)
 * - Inserts at index 0 (newest first)
 * - Auto-increments ID
 * - Limits to MAX_HISTORY_ITEMS
 */
export function addToHistory(
  currentHistory: ConversionItem[],
  inputText: string
): ConversionItem[] {
  const trimmed = inputText.trim();
  if (!trimmed) return currentHistory;

  // Check if identical to most recent item (prevents duplicates)
  if (currentHistory.length > 0 && currentHistory[0].inputText === trimmed) {
    return currentHistory;
  }

  const newItem: ConversionItem = {
    inputText: trimmed,
    timestamp: new Date(),
    id: currentHistory.length > 0
      ? Math.max(...currentHistory.map(h => h.id)) + 1
      : 1
  };

  const newHistory = [newItem, ...currentHistory].slice(0, MAX_HISTORY_ITEMS);
  saveHistory(newHistory);
  return newHistory;
}

/**
 * Removes an item from history by ID
 */
export function removeFromHistory(
  currentHistory: ConversionItem[],
  id: number
): ConversionItem[] {
  const newHistory = currentHistory.filter(h => h.id !== id);
  saveHistory(newHistory);
  return newHistory;
}

/**
 * Clears all history
 */
export function clearHistory(): ConversionItem[] {
  saveHistory([]);
  return [];
}
