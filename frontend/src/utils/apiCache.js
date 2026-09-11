import api from "../api/axios";

// In-memory cache store: key -> { data, timestamp, ttl }
const cacheStore = new Map();

// In-flight request deduplication store: key -> Promise
const inflightRequests = new Map();

const DEFAULT_TTL = 1000 * 60 * 3; // 3 minutes

export function serializeCacheKey(url, params = {}) {
  const cleanParams = Object.entries(params || {})
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .sort(([a], [b]) => a.localeCompare(b));

  const qs = new URLSearchParams(cleanParams).toString();
  return `${url}${qs ? `?${qs}` : ""}`;
}

export function getCached(url, params = {}, ttl = DEFAULT_TTL) {
  const key = serializeCacheKey(url, params);
  const entry = cacheStore.get(key);
  if (!entry) return null;

  const isStale = Date.now() - entry.timestamp > (entry.ttl || ttl);
  return { data: entry.data, isStale, key };
}

export function setCached(url, params = {}, data, ttl = DEFAULT_TTL) {
  const key = serializeCacheKey(url, params);
  cacheStore.set(key, {
    data,
    timestamp: Date.now(),
    ttl,
  });
}

export function invalidateCache(pattern) {
  if (!pattern) {
    cacheStore.clear();
    return;
  }

  for (const key of cacheStore.keys()) {
    if (key.includes(pattern)) {
      cacheStore.delete(key);
    }
  }
}

/**
 * Fetch with Stale-While-Revalidate (SWR):
 * 1. Returns cached data immediately if fresh (0ms).
 * 2. If stale or forceRevalidate, revalidates in background.
 * 3. Deduplicates identical concurrent requests.
 */
export async function fetchWithCache(url, params = {}, options = {}) {
  const {
    ttl = DEFAULT_TTL,
    forceRevalidate = false,
    onBackgroundUpdate = null,
    signal = null,
  } = options;

  const key = serializeCacheKey(url, params);
  const cached = getCached(url, params, ttl);

  // If cache exists and is fresh, return immediately
  if (cached && !cached.isStale && !forceRevalidate) {
    return cached.data;
  }

  // Deduplicate in-flight requests
  let reqPromise = inflightRequests.get(key);
  if (!reqPromise) {
    reqPromise = api
      .get(url, { params, signal })
      .then((res) => {
        const payload = res.data;
        setCached(url, params, payload, ttl);
        if (cached && onBackgroundUpdate) {
          onBackgroundUpdate(payload);
        }
        return payload;
      })
      .finally(() => {
        inflightRequests.delete(key);
      });

    inflightRequests.set(key, reqPromise);
  }

  // If we had stale cached data, return it immediately while the request finishes in background
  if (cached && !forceRevalidate) {
    return cached.data;
  }

  return reqPromise;
}

/**
 * Silently prefetch an API endpoint into cache ahead of user click
 */
export function prefetchApi(url, params = {}, ttl = DEFAULT_TTL) {
  const cached = getCached(url, params, ttl);
  if (cached && !cached.isStale) return; // already fresh

  const key = serializeCacheKey(url, params);
  if (inflightRequests.has(key)) return; // already fetching

  const promise = api
    .get(url, { params })
    .then((res) => {
      setCached(url, params, res.data, ttl);
    })
    .catch(() => {
      // ignore prefetch errors silently
    })
    .finally(() => {
      inflightRequests.delete(key);
    });

  inflightRequests.set(key, promise);
}
