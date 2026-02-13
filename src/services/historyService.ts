import type { ConversionItem } from '../types';

const STORAGE_KEY = 'pinyinRubyHistory';
const MAX_HISTORY_ITEMS = 20;

/**
 * Computes SHA-256 hash of a string using the Web Crypto API.
 * Returns a hex string.
 */
async function sha256(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

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
 * - Computes SHA-256 hash of the trimmed input text using the browser Web Crypto API
 * - Skips if any existing item has the same hash (full deduplication, not just most recent)
 * - Inserts at index 0 (newest first)
 * - Auto-increments ID
 * - Limits to MAX_HISTORY_ITEMS
 */
export type AddToHistoryResult = {
  history: ConversionItem[];
  duplicateId: number | null; // ID of existing item if duplicate was detected
};

export async function addToHistory(
  currentHistory: ConversionItem[],
  inputText: string
): Promise<AddToHistoryResult> {
  const trimmed = inputText.trim();
  if (!trimmed) return { history: currentHistory, duplicateId: null };

  const hash = await sha256(trimmed);

  // Skip if any existing item has the same hash, return its ID
  const existing = currentHistory.find(h => h.hash === hash);
  if (existing) {
    return { history: currentHistory, duplicateId: existing.id };
  }

  const newItem: ConversionItem = {
    inputText: trimmed,
    timestamp: new Date(),
    hash,
    id: currentHistory.length > 0
      ? Math.max(...currentHistory.map(h => h.id)) + 1
      : 1
  };

  const newHistory = [newItem, ...currentHistory].slice(0, MAX_HISTORY_ITEMS);
  saveHistory(newHistory);
  return { history: newHistory, duplicateId: null };
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
