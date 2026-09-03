/**
 * Content Safety Filter Utility
 * Protects Wallverse app from displaying inappropriate or explicit wallpapers (e.g., bikini, NSFW, adult content).
 */

const BLOCKED_KEYWORDS = [
  // Swimwear & revealing clothing
  'bikini',
  'bikinis',
  'swimsuit',
  'swimwear',
  'monokini',
  'cleavage',
  'topless',
  'bottomless',
  'undergarment',
  'underwear',
  'lingerie',
  'bra',
  'panty',
  'panties',
  'thong',
  'microbikini',
  'beachwear',
  'revealing',
  'provocative',
  'scantily',
  'shirtless',

  // Nudity & Erotic / NSFW
  'nude',
  'nudity',
  'naked',
  'erotic',
  'erotica',
  'nsfw',
  'adult',
  '18+',
  'xxx',
  'porn',
  'porno',
  'sex',
  'sexy',
  'sensual',
  'seductive',
  'fetish',
  'striptease',
  'pinup',
  'playboy',
  'playmate',
  'boobs',
  'booty',
  'babe',
  'babes',
  'hottie',
  'boudoir',
  'glamour',
  'intimate',
  'naughty',
  'lust',

  // Explicit anatomy
  'nipple',
  'nipples',
  'areola',
  'breast',
  'breasts',
  'vagina',
  'vulva',
  'labia',
  'clitoris',
  'penis',
  'genital',
  'genitals',
  'genitalia',
  'testicle',
  'testicles',
  'scrotum',
  'anus',
  'buttocks',
  'pussy',
  'cock',
  'dick',
  'vulgar',

  // Explicit acts / sexual content
  'masturbation',
  'masturbating',
  'orgasm',
  'ejaculation',
  'semen',
  'cum',
  'fellatio',
  'blowjob',
  'intercourse',
  'penetration',
  'threesome',
  'orgy',
  'bdsm',
  'bondage',
  'hentai',
  'ecchi',
  'onlyfans',
  'camgirl',
  'incest',
  'bestiality',
];

// Compile regex pattern for word boundary matching
const BLOCKED_REGEX = new RegExp(
  `\\b(${BLOCKED_KEYWORDS.join('|')})\\b`,
  'i'
);

// Short keywords that collide with common innocent words as substrings
// (e.g. "cock" in "peacock"/"cockpit", "bare" in "barefoot", "lust" in "illustration",
// "anus" in unrelated words). These stay in BLOCKED_REGEX for exact standalone-word
// matches, but are excluded from the space-stripped evasion check below.
const SUBSTRING_CHECK_EXCLUDE = new Set(['lust', 'cock', 'dick', 'anus', 'cum']);

/**
 * Checks if a string contains any restricted/inappropriate terms.
 * Also checks normalized text to catch space-separated or symbol-separated attempts (e.g. b i k i n i).
 * @param {string} text
 * @returns {boolean} true if safe, false if inappropriate content detected
 */
function isSafeText(text) {
  if (!text || typeof text !== 'string') return true;
  if (BLOCKED_REGEX.test(text)) return false;

  // Normalized check (remove spaces/special chars) to prevent evasion
  const normalized = text.toLowerCase().replace(/[^a-z0-9]/g, '');
  for (const word of BLOCKED_KEYWORDS) {
    if (word.length >= 4 && !SUBSTRING_CHECK_EXCLUDE.has(word) && normalized.includes(word)) {
      return false;
    }
  }

  return true;
}

/**
 * Checks metadata of a wallpaper object (title, description, tags).
 * @param {Object} item - { title, description, tags }
 * @returns {boolean} true if safe, false if any field contains restricted terms
 */
function isSafeContent(item) {
  if (!item) return true;

  if (item.title && !isSafeText(item.title)) {
    return false;
  }

  if (item.description && !isSafeText(item.description)) {
    return false;
  }

  if (Array.isArray(item.tags)) {
    for (const tag of item.tags) {
      if (!isSafeText(tag)) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Validates a user search query.
 * @param {string} query 
 * @returns {boolean} true if query is safe, false if blocked
 */
function isSafeQuery(query) {
  return isSafeText(query);
}

/**
 * Sanitizes a user query. If explicit terms are detected, returns a safe fallback.
 * @param {string} query 
 * @param {string} fallback 
 * @returns {string}
 */
function sanitizeQuery(query, fallback = 'wallpaper') {
  if (!isSafeQuery(query)) {
    return fallback;
  }
  return query;
}

const DEFAULT_NEGATIVE_PROMPT =
  'bikini, bikinis, swimsuit, swimwear, monokini, lingerie, underwear, bra, panty, panties, thong, microbikini, cleavage, nude, nudity, naked, erotic, nsfw, adult, explicit, suggestive, revealing clothing, beachwear, boudoir, provocative, shirtless, topless, bare skin, exposed chest, intimate attire, sensual pose, unbuttoned, non-clothed, nipples, areola, breasts, genitals, vagina, penis, buttocks, pornographic, sexual content';

/**
 * Validates an AI image generation prompt.
 * @param {string} prompt 
 * @returns {Object} { isValid: boolean, error?: string, negativePrompt: string }
 */
function validateAiPrompt(prompt) {
  if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
    return {
      isValid: false,
      error: 'Prompt is required.',
      negativePrompt: DEFAULT_NEGATIVE_PROMPT,
    };
  }

  if (!isSafeText(prompt)) {
    return {
      isValid: false,
      error: 'Prompt contains restricted or inappropriate keywords (e.g. bikinis, swimwear, adult or revealing content). Please describe a family-safe wallpaper.',
      negativePrompt: DEFAULT_NEGATIVE_PROMPT,
    };
  }

  return {
    isValid: true,
    negativePrompt: DEFAULT_NEGATIVE_PROMPT,
  };
}

module.exports = {
  BLOCKED_KEYWORDS,
  DEFAULT_NEGATIVE_PROMPT,
  isSafeText,
  isSafeContent,
  isSafeQuery,
  sanitizeQuery,
  validateAiPrompt,
};

