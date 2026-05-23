// Simple in-memory cache so navigating between pages doesn't re-fetch Firebase
interface CacheEntry<T> {
  data: T;
  at: number;
}

const TTL = 5 * 60 * 1000; // 5 minutes
const store = new Map<string, CacheEntry<unknown>>();

export function cacheGet<T>(key: string): T | null {
  const entry = store.get(key) as CacheEntry<T> | undefined;
  if (!entry) return null;
  if (Date.now() - entry.at > TTL) { store.delete(key); return null; }
  return entry.data;
}

export function cacheSet<T>(key: string, data: T) {
  store.set(key, { data, at: Date.now() });
}

export function cacheInvalidate(pattern?: string) {
  if (!pattern) { store.clear(); return; }
  for (const key of store.keys()) {
    if (key.includes(pattern)) store.delete(key);
  }
}
