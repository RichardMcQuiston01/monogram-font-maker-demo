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

const glyphA = font.charToGlyph('A');
const glyphZ = font.charToGlyph('Z');
assert(glyphA.unicode === 65, 'Glyph "A" is missing or mismapped.');
assert(glyphA.path.commands.length > 0, 'Glyph "A" has an empty outline.');
assert(glyphZ.unicode === 90, 'Glyph "Z" is missing or mismapped.');
assert(glyphZ.path.commands.length > 0, 'Glyph "Z" has an empty outline.');

console.log('has A:', true, glyphA.path.commands.length);
console.log('has Z:', true, glyphZ.path.commands.length);
console.log('Sample kit verified successfully.');
