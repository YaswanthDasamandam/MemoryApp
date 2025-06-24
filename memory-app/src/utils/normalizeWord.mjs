// Utility: Normalize a word to capitalized form
export function normalizeWord(word) {
  if (!word) return word;
  if (typeof word !== 'string') return undefined;
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
} 