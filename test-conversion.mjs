// Test script for Pinyin conversion functionality
import { pinyin } from 'pinyin-pro';

console.log('=== Testing Pinyin Conversion ===\n');

// Test 1: Basic Chinese characters
const test1 = '你好';
const result1 = pinyin(test1, { toneType: 'symbol', type: 'array' });
console.log('Test 1: Basic characters');
console.log('Input:', test1);
console.log('Output:', result1);
console.log('Expected: ["nǐ", "hǎo"]');
console.log('Pass:', JSON.stringify(result1) === JSON.stringify(["nǐ", "hǎo"]));
console.log();

// Test 2: More complex characters
const test2 = '世界';
const result2 = pinyin(test2, { toneType: 'symbol', type: 'array' });
console.log('Test 2: Complex characters');
console.log('Input:', test2);
console.log('Output:', result2);
console.log('Expected: ["shì", "jiè"]');
console.log('Pass:', JSON.stringify(result2) === JSON.stringify(["shì", "jiè"]));
console.log();

// Test 3: Mixed Chinese and punctuation
const test3 = '你好，世界！';
console.log('Test 3: Mixed with punctuation');
console.log('Input:', test3);
for (let i = 0; i < test3.length; i++) {
  const char = test3[i];
  const code = char.charCodeAt(0);
  const isChinese = code >= 0x4e00 && code <= 0x9fbb;

  if (isChinese) {
    const py = pinyin(char, { toneType: 'symbol', type: 'array' })[0];
    console.log(`  '${char}' → ${py} (Chinese)`);
  } else {
    console.log(`  '${char}' → (Punctuation/non-Chinese)`);
  }
}
console.log();

// Test 4: Tone mark removal
const toneMarkMap = {
  'á': 'a', 'à': 'a', 'ǎ': 'a', 'ā': 'a',
  'é': 'e', 'è': 'e', 'ě': 'e', 'ē': 'e',
  'í': 'i', 'ì': 'i', 'ǐ': 'i', 'ī': 'i',
  'ó': 'o', 'ò': 'o', 'ǒ': 'o', 'ō': 'o',
  'ú': 'u', 'ù': 'u', 'ǔ': 'u', 'ū': 'u',
};

function removeToneMarks(text) {
  return text.split('').map(char => toneMarkMap[char] || char).join('');
}

console.log('Test 4: Tone mark removal');
const toneTests = ['nǐ', 'hǎo', 'shì', 'jiè'];
toneTests.forEach(word => {
  const removed = removeToneMarks(word);
  console.log(`  ${word} → ${removed}`);
});
console.log();

console.log('=== All Core Tests Complete ===');
