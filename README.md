# Monogram Font Maker Demo

- Author:  Richard McQuiston
- Website:  https://richardmcquiston.com/

## Overview

TypeScript based Single Page Application (SPA) demo site demonstrating features of the @richardmcquiston01/monogram-font-maker NPM package.  Demo to be deployed from 'main' branch to Vercel.

## Getting Started

### Prerequisites

- Node.js `^20.19.0` or `>=22.12.0` (required by Vite 8 / Rolldown)
- npm

To regenerate `public/sample-monogram-kit.zip` via `npm run generate:sample-kit`,
you'll also need a TrueType/OpenType font on disk (DejaVu Serif Bold by
default, commonly at `/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf`
on Linux). If you don't have that font, point `SAMPLE_KIT_FONT_PATH` at any
other `.ttf`/`.otf` file, e.g.:

```bash
SAMPLE_KIT_FONT_PATH=/path/to/Some-Font.ttf npm run generate:sample-kit
```

This is only needed to regenerate the kit — the committed ZIP works out of
the box.

### Installation

```bash
npm install
```

### Usage

```bash
npm run dev        # start the Vite dev server
npm run build      # typecheck and build the static site to dist/
npm run preview    # preview the production build locally
npm run typecheck  # tsc --noEmit
npm run lint       # eslint .
```

### Examples

1. Run `npm run dev` and open the printed local URL.
2. Upload a ZIP of monogram letter SVGs (or click "Download a sample A–Z kit"
   to grab one first, then re-upload it).
3. Enter a font family name and click **Generate font**. The font is built
   entirely in the browser via
   [`@richardmcquiston01/monogram-font-maker`](https://www.npmjs.com/package/@richardmcquiston01/monogram-font-maker) —
   nothing is uploaded to a server.
4. Preview the generated font live and download the `.otf` file.

See the package's
[README](https://github.com/RichardMcQuiston01/monogram-font-maker#readme) for
the expected ZIP structure and SVG filename conventions.

## Buy Me a Coffee

If this app, code, or repository has helped you or someone you know, please consider donating. I appreciate any help to offset the costs of development and/or AI Credits.

[**Donate via Stripe**](https://donate.stripe.com/00w5kD3Gj1Xo9v7gVOcs800), or scan:

[![Donate via Stripe](./donate.svg)](https://donate.stripe.com/00w5kD3Gj1Xo9v7gVOcs800)

## License

Apache 2

## Copyright

(c)2026 Richard McQuiston.  All rights reserved.
