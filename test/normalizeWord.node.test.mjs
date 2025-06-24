import { normalizeWord } from '../memory-app/src/utils/normalizeWord.mjs';

function testNormalizeWord() {
  const tests = [
    { input: 'hello', expected: 'Hello' },
    { input: 'WORLD', expected: 'World' },
    { input: 'tEsT', expected: 'Test' },
    { input: '', expected: '' },
    { input: undefined, expected: undefined },
    { input: null, expected: null },
    { input: 'a', expected: 'A' },
    { input: 'B', expected: 'B' },
    { input: 123, expected: undefined },
    { input: {}, expected: undefined },
  ];
  let passed = 0;
  for (const { input, expected } of tests) {
    let result;
    try {
      result = normalizeWord(input);
    } catch (e) {
      result = `Error: ${e.message}`;
    }
    const ok = result === expected;
    if (ok) passed++;
    console.log(`normalizeWord(${JSON.stringify(input)}) => ${JSON.stringify(result)} | Expected: ${JSON.stringify(expected)} | ${ok ? 'PASS' : 'FAIL'}`);
  }
  console.log(`\n${passed}/${tests.length} tests passed.`);
}

testNormalizeWord(); 