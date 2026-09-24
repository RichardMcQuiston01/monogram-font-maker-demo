import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import opentype from 'opentype.js';

const require = createRequire(import.meta.url);
const { generateMonogramFontFromZip } = require('@richardmcquiston01/monogram-font-maker');

const zipBytes = readFileSync(new URL('../public/sample-monogram-kit.zip', import.meta.url));
const fontBytes = await generateMonogramFontFromZip(zipBytes.buffer.slice(zipBytes.byteOffset, zipBytes.byteOffset + zipBytes.byteLength), { familyName: 'Sample Check' });
writeFileSync('/tmp/sample-check.otf', Buffer.from(fontBytes));
const font = opentype.parse(fontBytes);
console.log('glyphs:', font.numGlyphs);
console.log('has A:', font.charToGlyph('A').unicode === 65, font.charToGlyph('A').path.commands.length);
console.log('has Z:', font.charToGlyph('Z').unicode === 90, font.charToGlyph('Z').path.commands.length);
