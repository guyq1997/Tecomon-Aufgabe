const cacheStore = new Map();

/**
 * Sets a value in the cache with a time-to-live.
 * @param {string} key
 * @param {unknown} value
 * @param {number} ttlMs
 */
export function setCache(key, value, ttlMs) {
  const expiresAt = Date.now() + ttlMs;
  cacheStore.set(key, { value, expiresAt });
}

/**
 * Gets a value if not expired; otherwise evicts and returns undefined.
 * @param {string} key
 */
export function getCache(key) {
  const entry = cacheStore.get(key);
  if (!entry) return undefined;
  if (Date.now() > entry.expiresAt) {
    cacheStore.delete(key);
    return undefined;
  }
  return entry.value;
}

/**
 * Clears the cache. Intended for tests or manual resets.
 */
export function clearCache() {
  cacheStore.clear();
}


