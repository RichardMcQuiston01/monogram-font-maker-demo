#!/usr/bin/env node
// Generates public/sample-monogram-kit.zip: a ready-to-try ZIP of A-Z
// monogram SVGs, so demo visitors without their own artwork can still try
// the generator. Each letter is traced from a system serif font into a
// single <path>, since that's the only shape monogram-font-maker reads.
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import opentype from 'opentype.js';
import JSZip from 'jszip';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DEFAULT_SOURCE_FONT_PATH =
  '/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf';
const SOURCE_FONT_PATH =
  process.env.SAMPLE_KIT_FONT_PATH ?? DEFAULT_SOURCE_FONT_PATH;
const OUTPUT_ZIP_PATH = join(__dirname, '..', 'public', 'sample-monogram-kit.zip');
const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

function buildLetterSvg(font, letter) {
  const unitsPerEm = font.unitsPerEm;
  const ascender = font.ascender;
  const descender = font.descender;
  const glyph = font.charToGlyph(letter);
  const glyphHeight = ascender - descender;

  const path = glyph.getPath(0, ascender, unitsPerEm);
  const pathData = path.toPathData(2);

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" ` +
    `viewBox="0 0 ${glyph.advanceWidth} ${glyphHeight}">` +
    `<path d="${pathData}"/>` +
    `</svg>\n`
  );
}

async function main() {
  let fontBuffer;
  try {
    fontBuffer = readFileSync(SOURCE_FONT_PATH);
  } catch (error) {
    throw new Error(
      `Could not read source font at "${SOURCE_FONT_PATH}". Install a ` +
        `TrueType/OpenType font there, or set SAMPLE_KIT_FONT_PATH to an ` +
        `existing font file. (${error.message})`,
    );
  }
  const font = opentype.parse(
    fontBuffer.buffer.slice(
      fontBuffer.byteOffset,
      fontBuffer.byteOffset + fontBuffer.byteLength,
    ),
  );

  const zip = new JSZip();
  for (const letter of LETTERS) {
    zip.file(`${letter}.svg`, buildLetterSvg(font, letter));
  }

  const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });
  mkdirSync(dirname(OUTPUT_ZIP_PATH), { recursive: true });
  writeFileSync(OUTPUT_ZIP_PATH, zipBuffer);
  console.log(`Wrote ${OUTPUT_ZIP_PATH} (${LETTERS.length} letters).`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
