// Simple in‑memory AI cache
const aiCache = new Map<string, unknown>();

export function getCached<T = unknown>(key: string): T | undefined {
  return aiCache.get(key) as T | undefined;
}

export function setCached<T = unknown>(key: string, value: T): void {
  aiCache.set(key, value);
}
