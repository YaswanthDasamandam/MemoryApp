// Major System utility functions

export const MAJOR_SYSTEM = [
  { digit: 0, sounds: ['S', 'Z'] },
  { digit: 1, sounds: ['T', 'D'] },
  { digit: 2, sounds: ['N'] },
  { digit: 3, sounds: ['M'] },
  { digit: 4, sounds: ['R'] },
  { digit: 5, sounds: ['L'] },
  { digit: 6, sounds: ['J', 'SH', 'CH', 'G (soft)'] },
  { digit: 7, sounds: ['K', 'G (hard)', 'C (hard)'] },
  { digit: 8, sounds: ['F', 'V'] },
  { digit: 9, sounds: ['P', 'B'] },
];

// Returns all possible digit encodings for a word
export function getMajorSystemDigits(word) {
  // Build a map from letter to possible digits
  const soundToDigits = {};
  MAJOR_SYSTEM.forEach(({ digit, sounds }) => {
    sounds.forEach(sound => {
      const base = sound[0].toUpperCase();
      if (!soundToDigits[base]) soundToDigits[base] = new Set();
      soundToDigits[base].add(digit);
    });
  });
  const ignored = /[AEIOUWHY]/i;
  // For each letter, get possible digits (or null if ignored)
  let digitOptions = [];
  for (let i = 0; i < word.length; i++) {
    const ch = word[i].toUpperCase();
    if (ignored.test(ch)) continue;
    if (soundToDigits[ch]) {
      digitOptions.push(Array.from(soundToDigits[ch]));
    }
  }
  // Generate all combinations
  function combine(arr, prefix = [], out = []) {
    if (arr.length === 0) {
      out.push(prefix.join(''));
      return out;
    }
    for (let d of arr[0]) {
      combine(arr.slice(1), [...prefix, d], out);
    }
    return out;
  }
  if (digitOptions.length === 0) return [''];
  return combine(digitOptions);
}

// Returns an array of { letter, mapped, digit, ignored }
export function getMajorSystemMappingDetails(word) {
  // Build a map from letter to digit
  const soundToDigits = {};
  MAJOR_SYSTEM.forEach(({ digit, sounds }) => {
    sounds.forEach(sound => {
      const base = sound[0].toUpperCase();
      if (!soundToDigits[base]) soundToDigits[base] = digit;
    });
  });
  const ignored = /[AEIOUWHY]/i;
  const details = [];
  for (let i = 0; i < word.length; i++) {
    const ch = word[i];
    const upper = ch.toUpperCase();
    if (ignored.test(upper)) {
      details.push({ letter: ch, mapped: false, ignored: true });
    } else if (soundToDigits[upper] !== undefined) {
      details.push({ letter: ch, mapped: true, digit: soundToDigits[upper], ignored: false });
    } else {
      details.push({ letter: ch, mapped: false, ignored: false });
    }
  }
  return details;
} 