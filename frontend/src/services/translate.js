// Lightweight client-side translation service with caching.
// Providers: LibreTranslate (default), MyMemory (fallback, esp. for languages Libre may not support).

const DEFAULT_PROVIDER = process.env.REACT_APP_TRANSLATE_PROVIDER || 'libre';
const LIBRE_URL = process.env.REACT_APP_TRANSLATE_API_URL || 'https://libretranslate.com';
const LIBRE_API_KEY = process.env.REACT_APP_TRANSLATE_API_KEY || '';

// MyMemory has no key requirement for basic usage; email improves limits
const MYMEMORY_EMAIL = process.env.REACT_APP_MYMEMORY_EMAIL || '';

const STORAGE_KEY = 'translationCache_v1';

function loadCache() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveCache(cache) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
  } catch {
    // ignore quota errors
  }
}

const memoryCache = new Map();

function cacheKey(text, target) {
  return `${target}::${text}`;
}

function getCached(text, target) {
  const key = cacheKey(text, target);
  if (memoryCache.has(key)) return memoryCache.get(key);
  const ls = loadCache();
  const val = ls[key];
  if (val) memoryCache.set(key, val);
  return val;
}

function setCached(text, target, translated) {
  const key = cacheKey(text, target);
  memoryCache.set(key, translated);
  const ls = loadCache();
  ls[key] = translated;
  saveCache(ls);
}

function mapLangForProvider(lang) {
  // normalize language codes
  // i18n uses 'en', 'hi', 'pa'. Providers accept these, but Libre may not support 'pa'.
  return lang.toLowerCase();
}

async function translateWithLibre(text, target, source = 'auto') {
  const url = `${LIBRE_URL.replace(/\/$/, '')}/translate`;
  const body = {
    q: text,
    source: source || 'auto',
    target: mapLangForProvider(target),
    format: 'text'
  };
  if (LIBRE_API_KEY) body.api_key = LIBRE_API_KEY;

  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!resp.ok) throw new Error(`LibreTranslate error ${resp.status}`);
  const data = await resp.json();
  if (data && data.translatedText) return data.translatedText;
  throw new Error('LibreTranslate: No translatedText');
}

async function translateWithMyMemory(text, target, source = 'auto') {
  const src = source && source !== 'auto' ? source : 'en';
  const tgt = mapLangForProvider(target);
  const base = 'https://api.mymemory.translated.net/get';
  const params = new URLSearchParams({ q: text, langpair: `${src}|${tgt}` });
  if (MYMEMORY_EMAIL) params.set('de', MYMEMORY_EMAIL);
  const url = `${base}?${params.toString()}`;
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`MyMemory error ${resp.status}`);
  const data = await resp.json();
  const translated = data?.responseData?.translatedText;
  if (translated) return translated;
  throw new Error('MyMemory: No translatedText');
}

export async function translateText(text, targetLang, sourceLang = 'auto') {
  if (!text || !text.trim()) return text;
  const target = mapLangForProvider(targetLang);
  if (!target || target === 'en') return text; // no-op for English

  const cached = getCached(text, target);
  if (cached) return cached;

  // Provider strategy: try configured provider; if it fails (or Punjabi on Libre), fallback to MyMemory
  try {
    if (DEFAULT_PROVIDER === 'mymemory' || (DEFAULT_PROVIDER === 'libre' && target === 'pa')) {
      const t = await translateWithMyMemory(text, target, sourceLang);
      setCached(text, target, t);
      return t;
    }
    const t = await translateWithLibre(text, target, sourceLang);
    setCached(text, target, t);
    return t;
  } catch (e1) {
    try {
      const t2 = await translateWithMyMemory(text, target, sourceLang);
      setCached(text, target, t2);
      return t2;
    } catch (e2) {
      // As last resort, return original text
      return text;
    }
  }
}
