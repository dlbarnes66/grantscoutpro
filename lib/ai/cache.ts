const aiCache = new Map();

export function getCached(key) {
  return aiCache.get(key);
}

export function setCached(key, value) {
  aiCache.set(key, value);
}
