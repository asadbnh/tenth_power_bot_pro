/**
 * Manages Gemini API keys with multi-key rotation and failover.
 * Supports:
 * - Comma-separated keys: GOOGLE_AI_API_KEY=key1,key2,key3
 * - Multiple env variables: GOOGLE_AI_API_KEY_1, GOOGLE_AI_API_KEY_2, etc.
 * - Alternative names: GEMINI_API_KEY, GOOGLE_AI_API_KEYS
 */

const exhaustedKeysCooldown = new Map<string, number>();
const COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes cooldown for exhausted keys

export function getGeminiApiKeys(): string[] {
  const rawKeys: string[] = [];

  // 1. Check primary GOOGLE_AI_API_KEY
  if (process.env.GOOGLE_AI_API_KEY) {
    rawKeys.push(...process.env.GOOGLE_AI_API_KEY.split(","));
  }

  // 2. Check GOOGLE_AI_API_KEYS
  if (process.env.GOOGLE_AI_API_KEYS) {
    rawKeys.push(...process.env.GOOGLE_AI_API_KEYS.split(","));
  }

  // 3. Check GEMINI_API_KEY
  if (process.env.GEMINI_API_KEY) {
    rawKeys.push(...process.env.GEMINI_API_KEY.split(","));
  }

  // 4. Check numbered keys: GOOGLE_AI_API_KEY_1, GOOGLE_AI_API_KEY_2, etc.
  for (let i = 1; i <= 10; i++) {
    const key = process.env[`GOOGLE_AI_API_KEY_${i}`] || process.env[`GEMINI_API_KEY_${i}`];
    if (key) {
      rawKeys.push(...key.split(","));
    }
  }

  const now = Date.now();
  const cleanedKeys = Array.from(
    new Set(
      rawKeys
        .map((k) => k.trim())
        .filter((k) => k && !k.startsWith("your_") && k !== "AIzaSyCr0yaaE8_v6Mxs0QIxJ1mqnUscaNiePPY")
    )
  );

  // Sort keys so active ones come first, then cooled down ones
  const validKeys = cleanedKeys.filter((key) => {
    const exhaustedUntil = exhaustedKeysCooldown.get(key);
    if (exhaustedUntil && now < exhaustedUntil) {
      return false; // currently in cooldown
    }
    return true;
  });

  // If all keys are in cooldown, reset and try all cleaned keys as fallback
  if (validKeys.length === 0 && cleanedKeys.length > 0) {
    exhaustedKeysCooldown.clear();
    return cleanedKeys;
  }

  return validKeys;
}

/**
 * Mark a key as temporarily exhausted/rate-limited
 */
export function markKeyExhausted(key: string, reason = "quota_or_error"): void {
  console.warn(`[AI Key Manager] Marking key (...${key.slice(-6)}) as exhausted due to: ${reason}`);
  exhaustedKeysCooldown.set(key, Date.now() + COOLDOWN_MS);
}

/**
 * Mark a key as healthy
 */
export function markKeyHealthy(key: string): void {
  exhaustedKeysCooldown.delete(key);
}
