import JSZip from 'jszip';
import { generateExportHtml } from './bioPreview';

export interface ZipExportProgress {
  step: 'preparing' | 'creating' | 'done';
  message: string;
}

export async function exportBioSiteZip(
  sourceHtml: string,
  values: Record<string, any>,
  theme: Record<string, string>,
  projectName: string,
  onProgress?: (progress: ZipExportProgress) => void
): Promise<Blob> {
  // Step 1: Preparing
  onProgress?.({
    step: 'preparing',
    message: 'PREPARANDO SEU BIOSITE...',
  });

  // Small delay for UI smoothness
  await new Promise((r) => setTimeout(r, 200));

  // Generate clean, independent static HTML
  let exportedHtml = generateExportHtml(sourceHtml, values, theme);

  // Step 2: Creating files & extracting uploaded assets if any
  onProgress?.({
    step: 'creating',
    message: 'CRIANDO ARQUIVOS ESTÁTICOS...',
  });

  const zip = new JSZip();
  const assetsFolder = zip.folder('assets');
  const imagesFolder = assetsFolder?.folder('images');

  // Parse HTML to extract Base64 data images into real asset files
  const parser = new DOMParser();
  const doc = parser.parseFromString(exportedHtml, 'text/html');
  const imgElements = doc.querySelectorAll('img');

  let imageCounter = 1;
  imgElements.forEach((img) => {
    const src = img.getAttribute('src');
    if (src && src.startsWith('data:image/')) {
      // Extract mime type and base64 payload
      const matches = src.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
      if (matches && matches[2] && imagesFolder) {
        let ext = matches[1];
        if (ext === 'svg+xml') ext = 'svg';
        else if (ext === 'jpeg') ext = 'jpg';

        const filename = `image_${imageCounter}.${ext}`;
        imagesFolder.file(filename, matches[2], { base64: true });

        // Update HTML src to relative asset path
        img.setAttribute('src', `./assets/images/${filename}`);
        imageCounter++;
      }
    }
  });

  // Also check background-images with base64 data URIs
  const styledElements = doc.querySelectorAll('[style*="data:image/"]');
  styledElements.forEach((el) => {
    const style = el.getAttribute('style') || '';
    const match = style.match(/url\(['"]?(data:image\/([a-zA-Z0-9+]+);base64,([^'"]+))['"]?\)/);
    if (match && match[3] && imagesFolder) {
      let ext = match[2];
      if (ext === 'svg+xml') ext = 'svg';
      else if (ext === 'jpeg') ext = 'jpg';

      const filename = `bg_${imageCounter}.${ext}`;
      imagesFolder.file(filename, match[3], { base64: true });
      const newStyle = style.replace(match[0], `url(./assets/images/${filename})`);
      el.setAttribute('style', newStyle);
      imageCounter++;
    }
  });

  // Update exported HTML string
  exportedHtml = `<!DOCTYPE html>\n${doc.documentElement.outerHTML}`;

  // MUST be at the ROOT of the zip: index.html
  zip.file('index.html', exportedHtml);

  // Vercel / Netlify instant static config (makes static deployment 100% plug & play)
  zip.file(
    'vercel.json',
    JSON.stringify(
      {
        version: 2,
        cleanUrls: true,
      },
      null,
      2
    )
  );

  // Simple README for the user
  const sanitizedName = projectName || 'BioSite';
  zip.file(
    'README.md',
    `# ${sanitizedName} — Bio Fácil

Este biosite está 100% pronto para publicação estática!

## 🚀 Como Hospedar na Vercel (Em menos de 1 minuto):
1. Acesse [vercel.com](https://vercel.com) e faça login.
2. Arraste esta pasta descompactada para o painel da Vercel OU envie para um repositório GitHub.
3. Seu biosite estará online imediatamente com certificado SSL gratuito e alta velocidade global!

## 💻 Hospedagem Alternativa:
Você também pode hospedar no Netlify, GitHub Pages, Firebase Hosting ou qualquer servidor web tradicional.
Basta carregar os arquivos desta pasta. O arquivo principal é o \`index.html\`.
`
  );

  // Small delay for UI smoothness
  await new Promise((r) => setTimeout(r, 200));

  // Step 3: Done
  onProgress?.({
    step: 'done',
    message: '✓ BIOSITE PRONTO',
  });

  const blob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });

  return blob;
}

/**
 * Triggers native browser download for the ZIP blob, compatible with desktop and mobile.
 */
export function triggerZipDownload(blob: Blob, projectName: string) {
  const cleanName = (projectName || 'meu-biosite')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  const fileName = `${cleanName || 'biosite'}.zip`;

  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();

  // Allow download to initiate safely before revoking ObjectURL
  setTimeout(() => {
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, 3000);
}
