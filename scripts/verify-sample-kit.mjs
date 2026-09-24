// Round-trips public/sample-monogram-kit.zip through the package to catch
// a broken sample kit before it ships. Exits non-zero on any check failure
// so this is safe to wire into CI.
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import opentype from 'opentype.js';

const require = createRequire(import.meta.url);
const { generateMonogramFontFromZip } = require('@richardmcquiston01/monogram-font-maker');

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const zipBytes = readFileSync(new URL('../public/sample-monogram-kit.zip', import.meta.url));
const fontBytes = await generateMonogramFontFromZip(
  zipBytes.buffer.slice(zipBytes.byteOffset, zipBytes.byteOffset + zipBytes.byteLength),
  { familyName: 'Sample Check' },
);

const font = opentype.parse(fontBytes);
console.log('glyphs:', font.numGlyphs);

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
for (const letter of LETTERS) {
  const glyph = font.charToGlyph(letter);
  assert(
    glyph.unicode === letter.codePointAt(0),
    `Glyph "${letter}" is missing or mismapped.`,
  );
  assert(
    glyph.path.commands.length > 0,
    `Glyph "${letter}" has an empty outline.`,
  );
}

console.log(`Verified outlines for all ${LETTERS.length} letters.`);
console.log('Sample kit verified successfully.');
