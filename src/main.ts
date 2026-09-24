import { generateMonogramFontFromZip } from '@richardmcquiston01/monogram-font-maker';

const PREVIEW_FONT_FAMILY = 'GeneratedMonogramPreview';
const DEFAULT_FAMILY_NAME = 'My Monogram';
const DEFAULT_PREVIEW_TEXT = 'AaBbCc';

const appRoot = document.querySelector<HTMLDivElement>('#app');
if (!appRoot) {
  throw new Error('Missing #app root element.');
}

appRoot.innerHTML = `
  <header class="mb-10">
    <h1 class="text-3xl font-bold tracking-tight">Monogram Font Maker</h1>
    <p class="mt-2 text-slate-400">
      Upload a ZIP of monogram letter SVGs and get back an installable OTF
      font &mdash; built entirely in your browser, no upload to a server.
    </p>
    <p class="mt-2 text-sm text-slate-500">
      <a class="text-indigo-400 hover:underline" href="https://www.npmjs.com/package/@richardmcquiston01/monogram-font-maker" target="_blank" rel="noopener noreferrer">npm package</a>
      &middot;
      <a class="text-indigo-400 hover:underline" href="https://github.com/RichardMcQuiston01/monogram-font-maker" target="_blank" rel="noopener noreferrer">source on GitHub</a>
    </p>
  </header>

  <section class="space-y-5 rounded-xl border border-slate-800 bg-slate-900/60 p-6">
    <div>
      <label for="familyNameInput" class="block text-sm font-medium text-slate-300">Font family name</label>
      <input
        id="familyNameInput"
        type="text"
        value="${DEFAULT_FAMILY_NAME}"
        class="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 focus:border-indigo-500 focus:outline-none"
      />
    </div>

    <div>
      <label for="zipInput" class="block text-sm font-medium text-slate-300">Monogram ZIP</label>
      <input
        id="zipInput"
        type="file"
        accept=".zip,application/zip"
        class="mt-1 block w-full text-sm text-slate-300 file:mr-4 file:rounded-md file:border-0 file:bg-indigo-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-indigo-500"
      />
      <p class="mt-2 text-sm text-slate-500">
        Don't have monogram artwork handy?
        <a id="sampleKitLink" class="text-indigo-400 hover:underline" href="/sample-monogram-kit.zip" download>Download a sample A&ndash;Z kit</a>
        to try the demo.
      </p>
    </div>

    <button
      id="generateButton"
      type="button"
      disabled
      class="w-full rounded-md bg-indigo-600 px-4 py-2 font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-40 enabled:hover:bg-indigo-500"
    >
      Generate font
    </button>

    <p id="statusMessage" role="status" class="min-h-5 text-sm"></p>
  </section>

  <section id="previewPanel" hidden class="mt-8 space-y-5 rounded-xl border border-slate-800 bg-slate-900/60 p-6">
    <div>
      <label for="previewTextInput" class="block text-sm font-medium text-slate-300">Preview text</label>
      <input
        id="previewTextInput"
        type="text"
        value="${DEFAULT_PREVIEW_TEXT}"
        class="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 focus:border-indigo-500 focus:outline-none"
      />
    </div>

    <div
      id="previewText"
      class="rounded-md border border-slate-800 bg-slate-950 px-4 py-8 text-center text-6xl leading-none text-slate-100"
    ></div>

    <a
      id="downloadLink"
      class="block w-full rounded-md border border-indigo-500 px-4 py-2 text-center font-semibold text-indigo-400 transition hover:bg-indigo-500 hover:text-white"
      download
    >
      Download .otf
    </a>
  </section>
`;

const familyNameInput = requireElement<HTMLInputElement>('#familyNameInput');
const zipInput = requireElement<HTMLInputElement>('#zipInput');
const generateButton = requireElement<HTMLButtonElement>('#generateButton');
const statusMessage = requireElement<HTMLParagraphElement>('#statusMessage');
const previewPanel = requireElement<HTMLElement>('#previewPanel');
const previewTextInput = requireElement<HTMLInputElement>(
  '#previewTextInput',
);
const previewText = requireElement<HTMLDivElement>('#previewText');
const downloadLink = requireElement<HTMLAnchorElement>('#downloadLink');

const MAX_ZIP_FILE_SIZE_BYTES = 25 * 1024 * 1024;

let selectedZipFile: File | null = null;
let activeFontFace: FontFace | null = null;
let activeDownloadUrl: string | null = null;
let activeGenerationId = 0;

zipInput.addEventListener('change', () => {
  activeGenerationId += 1;
  selectedZipFile = zipInput.files?.[0] ?? null;
  generateButton.disabled = selectedZipFile === null;
  setStatusMessage('');
});

generateButton.addEventListener('click', () => {
  void generateFontFromSelectedZip();
});

previewTextInput.addEventListener('input', () => {
  previewText.textContent = previewTextInput.value;
});

async function generateFontFromSelectedZip(): Promise<void> {
  if (selectedZipFile === null) {
    return;
  }

  if (selectedZipFile.size > MAX_ZIP_FILE_SIZE_BYTES) {
    setStatusMessage(
      `ZIP is too large (${formatFileSize(selectedZipFile.size)}). ` +
        `Please upload one under ${formatFileSize(MAX_ZIP_FILE_SIZE_BYTES)}.`,
      'error',
    );
    return;
  }

  const generationId = ++activeGenerationId;
  const familyName = familyNameInput.value.trim() || DEFAULT_FAMILY_NAME;

  generateButton.disabled = true;
  setStatusMessage('Generating font…');

  try {
    const zipBytes = await selectedZipFile.arrayBuffer();
    const fontBytes = await generateMonogramFontFromZip(zipBytes, {
      familyName,
    });

    // A newer selection or run started while this one was in flight —
    // its result belongs to a stale request, so it must not overwrite
    // the preview or download link for the latest one.
    if (generationId !== activeGenerationId) {
      return;
    }

    const fontFace = await loadPreviewFont(fontBytes);

    // A newer run may have started (and even finished) while the
    // FontFace above was loading — re-check before publishing anything
    // this run produced. Everything from here on is synchronous, so
    // once this check passes nothing can supersede it mid-update.
    if (generationId !== activeGenerationId) {
      return;
    }

    if (activeFontFace) {
      document.fonts.delete(activeFontFace);
    }
    document.fonts.add(fontFace);
    activeFontFace = fontFace;

    updateDownloadLink(fontBytes, familyName);

    previewText.style.fontFamily = `'${PREVIEW_FONT_FAMILY}'`;
    previewText.textContent =
      previewTextInput.value.trim() || DEFAULT_PREVIEW_TEXT;
    previewPanel.hidden = false;

    setStatusMessage(`Generated "${familyName}" successfully.`, 'success');
  } catch (error) {
    if (generationId !== activeGenerationId) {
      return;
    }
    previewPanel.hidden = true;
    setStatusMessage(toErrorMessage(error), 'error');
  } finally {
    if (generationId === activeGenerationId) {
      generateButton.disabled = false;
    }
  }
}

function formatFileSize(bytes: number): string {
  const megabytes = bytes / (1024 * 1024);
  return `${megabytes.toFixed(1)} MB`;
}

async function loadPreviewFont(fontBytes: ArrayBuffer): Promise<FontFace> {
  const fontFace = new FontFace(PREVIEW_FONT_FAMILY, fontBytes);
  await fontFace.load();
  return fontFace;
}

function updateDownloadLink(fontBytes: ArrayBuffer, familyName: string): void {
  if (activeDownloadUrl) {
    URL.revokeObjectURL(activeDownloadUrl);
  }

  const fontBlob = new Blob([fontBytes], { type: 'font/otf' });
  activeDownloadUrl = URL.createObjectURL(fontBlob);
  downloadLink.href = activeDownloadUrl;
  downloadLink.download = `${sanitizeFilename(familyName)}.otf`;
}

function sanitizeFilename(name: string): string {
  const sanitized = name.trim().replace(/[^a-zA-Z0-9-_]+/g, '-');
  return sanitized.length > 0 ? sanitized : 'monogram-font';
}

function setStatusMessage(
  message: string,
  kind: 'success' | 'error' | 'info' = 'info',
): void {
  statusMessage.textContent = message;
  statusMessage.className =
    kind === 'error'
      ? 'min-h-5 text-sm text-red-400'
      : kind === 'success'
        ? 'min-h-5 text-sm text-emerald-400'
        : 'min-h-5 text-sm text-slate-400';
}

function toErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function requireElement<T extends Element>(selector: string): T {
  const element = appRoot?.querySelector<T>(selector);
  if (!element) {
    throw new Error(`Missing expected element: ${selector}`);
  }
  return element;
}
