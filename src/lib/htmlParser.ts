import { EditorField, EditorSchema, ThemeMetadata, ColorItem, ColorRole, FieldType } from '../types';

export interface ParseResult {
  fields: EditorField[];
  colors: ColorItem[];
  theme: ThemeMetadata;
  cleanedHtml: string;
}

export function parseBioSiteHtml(rawHtml: string): ParseResult {
  if (!rawHtml || !rawHtml.trim()) {
    throw new Error('Código HTML vazio');
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(rawHtml, 'text/html');

  const fields: EditorField[] = [];
  const colors: ColorItem[] = [];
  const foundKeys = new Set<string>();

  let idCounter = 1;
  const generateId = (prefix: string) => `bf_${prefix}_${idCounter++}`;

  // 1. EXTRACT & MAP CSS VARIABLES
  const cssVariables: Record<string, string> = {};
  const styleTags = doc.querySelectorAll('style');
  const cssVarRegex = /--([a-zA-Z0-9_-]+)\s*:\s*([^;}\n]+)/g;

  styleTags.forEach((styleTag) => {
    const text = styleTag.textContent || '';
    let match;
    while ((match = cssVarRegex.exec(text)) !== null) {
      const varName = `--${match[1].trim()}`;
      const varValue = match[2].trim();
      cssVariables[varName] = varValue;
    }
  });

  // Check if we found semantic CSS color variables
  const colorMap: Record<ColorRole, { name: string; val: string } | null> = {
    primary: null,
    secondary: null,
    background: null,
    surface: null,
    text: null,
    muted: null,
    accent: null,
    detail: null,
  };

  Object.entries(cssVariables).forEach(([varName, val]) => {
    const lower = varName.toLowerCase();
    if (lower.includes('primary') && !colorMap.primary) colorMap.primary = { name: varName, val };
    else if (lower.includes('secondary') && !colorMap.secondary) colorMap.secondary = { name: varName, val };
    else if ((lower.includes('background') || lower === '--bg' || lower.includes('bg-main')) && !colorMap.background) colorMap.background = { name: varName, val };
    else if ((lower.includes('surface') || lower.includes('card')) && !colorMap.surface) colorMap.surface = { name: varName, val };
    else if ((lower.includes('text') || lower.includes('foreground')) && !colorMap.text) colorMap.text = { name: varName, val };
    else if ((lower.includes('muted') || lower.includes('subtext')) && !colorMap.muted) colorMap.muted = { name: varName, val };
    else if (lower.includes('accent') && !colorMap.accent) colorMap.accent = { name: varName, val };
  });

  // If the HTML does NOT have CSS variables, inspect colors used in style rules
  if (Object.keys(cssVariables).length === 0) {
    const hexRegex = /#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})\b/g;
    const colorCounts: Record<string, number> = {};

    styleTags.forEach((styleTag) => {
      const text = styleTag.textContent || '';
      let m;
      while ((m = hexRegex.exec(text)) !== null) {
        const hex = m[0].toLowerCase();
        colorCounts[hex] = (colorCounts[hex] || 0) + 1;
      }
    });

    const sortedColors = Object.entries(colorCounts).sort((a, b) => b[1] - a[1]);
    const detectedPalette = sortedColors.map((item) => item[0]);

    // Construct synthetic fallback variables
    const bgCandidate = detectedPalette.find((c) => c === '#000000' || c === '#050706' || c.startsWith('#0') || c.startsWith('#1')) || '#0f1110';
    const textCandidate = detectedPalette.find((c) => c === '#ffffff' || c.startsWith('#f') || c.startsWith('#e')) || '#ffffff';
    const primaryCandidate = detectedPalette.find((c) => c !== bgCandidate && c !== textCandidate) || '#36FF88';
    const surfaceCandidate = detectedPalette.find((c) => c !== bgCandidate && c !== textCandidate && c !== primaryCandidate) || '#181c1a';

    colorMap.primary = { name: '--bio-primary', val: primaryCandidate };
    colorMap.secondary = { name: '--bio-secondary', val: primaryCandidate };
    colorMap.background = { name: '--bio-background', val: bgCandidate };
    colorMap.surface = { name: '--bio-surface', val: surfaceCandidate };
    colorMap.text = { name: '--bio-text', val: textCandidate };
    colorMap.muted = { name: '--bio-muted', val: '#87938B' };

    // Inject support style into <head>
    let overrideStyle = doc.querySelector('style#bio-vars-support');
    if (!overrideStyle) {
      overrideStyle = doc.createElement('style');
      overrideStyle.id = 'bio-vars-support';
      overrideStyle.textContent = `
        :root {
          --bio-primary: ${primaryCandidate};
          --bio-secondary: ${primaryCandidate};
          --bio-background: ${bgCandidate};
          --bio-surface: ${surfaceCandidate};
          --bio-text: ${textCandidate};
          --bio-muted: #87938B;
        }
      `;
      doc.head.appendChild(overrideStyle);
    }
  }

  // Create clean color items for the visual circles editor
  const addColorItem = (role: ColorRole, label: string, varInfo: { name: string; val: string } | null, fallback: string) => {
    const varName = varInfo?.name || `--bio-${role}`;
    const val = varInfo?.val || fallback;
    const key = `color_${role}`;
    colors.push({
      key,
      label,
      role,
      defaultValue: val,
      currentValue: val,
      cssVarName: varName,
    });
  };

  addColorItem('primary', 'Cor Principal', colorMap.primary, '#36FF88');
  addColorItem('secondary', 'Cor Secundária', colorMap.secondary, '#00E86B');
  addColorItem('background', 'Fundo da Página', colorMap.background, '#050706');
  addColorItem('surface', 'Superfície / Cards', colorMap.surface, '#0B0F0D');
  addColorItem('text', 'Texto Principal', colorMap.text, '#F5FFF8');
  addColorItem('muted', 'Texto Suave / Muted', colorMap.muted, '#87938B');

  // 2. SCAN FOR EXPLICIT data-bio-* ATTRIBUTES
  const explicitBioEls = doc.querySelectorAll('[data-bio-text], [data-bio-image], [data-bio-link], [data-bio-services]');
  explicitBioEls.forEach((el) => {
    const stableId = el.getAttribute('data-bio-id') || generateId('bio');
    el.setAttribute('data-bio-id', stableId);

    if (el.hasAttribute('data-bio-text')) {
      const key = el.getAttribute('data-bio-text') || stableId;
      if (!foundKeys.has(key)) {
        foundKeys.add(key);
        const textVal = el.textContent?.trim() || '';
        fields.push({
          key,
          label: key.replace(/_/g, ' ').toUpperCase(),
          type: textVal.length > 70 ? 'textarea' : 'text',
          defaultValue: textVal,
          currentValue: textVal,
          selector: `[data-bio-id="${stableId}"]`,
          attribute: 'textContent',
          enabled: true,
        });
      }
    }

    if (el.hasAttribute('data-bio-image')) {
      const key = el.getAttribute('data-bio-image') || stableId;
      if (!foundKeys.has(key)) {
        foundKeys.add(key);
        const img = el as HTMLImageElement;
        const srcVal = img.src || img.getAttribute('src') || '';
        fields.push({
          key,
          label: key.toLowerCase().includes('logo') ? 'Logotipo' : 'Imagem',
          type: key.toLowerCase().includes('logo') ? 'logo' : 'image',
          defaultValue: srcVal,
          currentValue: srcVal,
          selector: `[data-bio-id="${stableId}"]`,
          attribute: 'src',
          enabled: true,
        });
      }
    }

    if (el.hasAttribute('data-bio-link')) {
      const key = el.getAttribute('data-bio-link') || stableId;
      if (!foundKeys.has(key)) {
        foundKeys.add(key);
        const a = el as HTMLAnchorElement;
        const hrefVal = a.getAttribute('href') || '';
        let type: FieldType = 'link';
        if (key.includes('whatsapp') || hrefVal.includes('wa.me')) type = 'whatsapp';
        else if (key.includes('instagram') || hrefVal.includes('instagram.com')) type = 'instagram';
        else if (key.includes('maps') || hrefVal.includes('maps')) type = 'maps';

        fields.push({
          key,
          label: key.replace(/_/g, ' ').toUpperCase(),
          type,
          defaultValue: hrefVal,
          currentValue: hrefVal,
          selector: `[data-bio-id="${stableId}"]`,
          attribute: 'href',
          enabled: true,
        });
      }
    }
  });

  // 3. SEMANTIC DOM PARSING (if elements don't have explicit data-bio-*)
  // 3A. Logo / Avatar
  const logoCandidate = doc.querySelector('img[alt*="logo" i], img[class*="logo" i], .logo img, header img, [id*="logo" i] img, .avatar-img');
  if (logoCandidate && !foundKeys.has('logo')) {
    foundKeys.add('logo');
    const stableId = generateId('logo');
    logoCandidate.setAttribute('data-bio-id', stableId);
    logoCandidate.setAttribute('data-bio-image', 'logo');
    const src = logoCandidate.getAttribute('src') || '';
    fields.unshift({
      key: 'logo',
      label: 'Logotipo / Foto de Perfil',
      type: 'logo',
      defaultValue: src,
      currentValue: src,
      selector: `[data-bio-id="${stableId}"]`,
      attribute: 'src',
      enabled: true,
    });
  }

  // 3B. Main Title (H1)
  const h1 = doc.querySelector('h1, .hero-title, .title, [class*="title" i]');
  if (h1 && !foundKeys.has('title_main')) {
    foundKeys.add('title_main');
    const stableId = generateId('title_main');
    h1.setAttribute('data-bio-id', stableId);
    h1.setAttribute('data-bio-text', 'title_main');
    const text = h1.textContent?.trim() || '';
    fields.push({
      key: 'title_main',
      label: 'Título Principal / Nome',
      type: 'text',
      defaultValue: text,
      currentValue: text,
      selector: `[data-bio-id="${stableId}"]`,
      attribute: 'textContent',
      enabled: true,
    });
  }

  // 3C. Subtitle / Bio (H2, H3, .subtitle, .bio)
  const subtitle = doc.querySelector('h2, .subtitle, [class*="subtitle" i], .bio, [class*="bio" i]:not(body)');
  if (subtitle && !foundKeys.has('subtitle')) {
    foundKeys.add('subtitle');
    const stableId = generateId('subtitle');
    subtitle.setAttribute('data-bio-id', stableId);
    subtitle.setAttribute('data-bio-text', 'subtitle');
    const text = subtitle.textContent?.trim() || '';
    fields.push({
      key: 'subtitle',
      label: 'Subtítulo / Descrição / Bio',
      type: text.length > 60 ? 'textarea' : 'text',
      defaultValue: text,
      currentValue: text,
      selector: `[data-bio-id="${stableId}"]`,
      attribute: 'textContent',
      enabled: true,
    });
  }

  // 3D. WhatsApp Links (Grouped logically)
  const waLinks = doc.querySelectorAll('a[href*="wa.me"], a[href*="api.whatsapp.com"], a[class*="whatsapp" i], a[id*="whatsapp" i]');
  if (waLinks.length > 0 && !foundKeys.has('whatsapp')) {
    foundKeys.add('whatsapp');
    const sampleHref = waLinks[0].getAttribute('href') || '';
    waLinks.forEach((el, idx) => {
      const stableId = generateId(`wa_${idx}`);
      el.setAttribute('data-bio-id', stableId);
      el.setAttribute('data-bio-link', 'whatsapp');
    });
    fields.push({
      key: 'whatsapp',
      label: 'WhatsApp (Botões & Contato)',
      type: 'whatsapp',
      defaultValue: sampleHref,
      currentValue: sampleHref,
      selector: '[data-bio-link="whatsapp"]',
      attribute: 'href',
      enabled: true,
      helpText: 'Número de WhatsApp com DDD e mensagem inicial',
    });
  }

  // 3E. Instagram Links
  const instaLinks = doc.querySelectorAll('a[href*="instagram.com"], a[class*="instagram" i]');
  if (instaLinks.length > 0 && !foundKeys.has('instagram')) {
    foundKeys.add('instagram');
    const sampleHref = instaLinks[0].getAttribute('href') || '';
    instaLinks.forEach((el, idx) => {
      const stableId = generateId(`ig_${idx}`);
      el.setAttribute('data-bio-id', stableId);
      el.setAttribute('data-bio-link', 'instagram');
    });
    fields.push({
      key: 'instagram',
      label: 'Instagram (@usuario ou link)',
      type: 'instagram',
      defaultValue: sampleHref,
      currentValue: sampleHref,
      selector: '[data-bio-link="instagram"]',
      attribute: 'href',
      enabled: true,
    });
  }

  // 3F. Location / Google Maps
  const mapsLink = doc.querySelector('a[href*="maps.google"], a[href*="goo.gl"], a[class*="maps" i], a[class*="location" i]');
  if (mapsLink && !foundKeys.has('maps_link')) {
    foundKeys.add('maps_link');
    const stableId = generateId('maps');
    mapsLink.setAttribute('data-bio-id', stableId);
    mapsLink.setAttribute('data-bio-link', 'maps_link');
    const href = mapsLink.getAttribute('href') || '';
    fields.push({
      key: 'maps_link',
      label: 'Link do Google Maps',
      type: 'maps',
      defaultValue: href,
      currentValue: href,
      selector: `[data-bio-id="${stableId}"]`,
      attribute: 'href',
      enabled: true,
    });
  }

  // 3G. Address / Location Text
  const addressEl = doc.querySelector('address, .address, [class*="address" i], .localizacao, [class*="local" i]');
  if (addressEl && !foundKeys.has('address_text')) {
    foundKeys.add('address_text');
    const stableId = generateId('address');
    addressEl.setAttribute('data-bio-id', stableId);
    addressEl.setAttribute('data-bio-text', 'address_text');
    const text = addressEl.textContent?.trim() || '';
    fields.push({
      key: 'address_text',
      label: 'Endereço & Horários',
      type: 'text',
      defaultValue: text,
      currentValue: text,
      selector: `[data-bio-id="${stableId}"]`,
      attribute: 'textContent',
      enabled: true,
    });
  }

  // 3H. Detect other paragraphs & informative texts
  const paragraphs = doc.querySelectorAll('p:not([data-bio-text])');
  paragraphs.forEach((p, idx) => {
    if (idx > 5) return;
    const text = p.textContent?.trim() || '';
    if (text.length > 15) {
      const key = `texto_${idx + 1}`;
      if (!foundKeys.has(key)) {
        foundKeys.add(key);
        const stableId = generateId(`p_${idx}`);
        p.setAttribute('data-bio-id', stableId);
        p.setAttribute('data-bio-text', key);
        fields.push({
          key,
          label: `Texto de Apresentação ${idx + 1}`,
          type: text.length > 70 ? 'textarea' : 'text',
          defaultValue: text,
          currentValue: text,
          selector: `[data-bio-id="${stableId}"]`,
          attribute: 'textContent',
          enabled: true,
        });
      }
    }
  });

  // 3I. Detect remaining standalone images (gallery, banners)
  const remainingImages = doc.querySelectorAll('img:not([data-bio-image])');
  remainingImages.forEach((img, idx) => {
    if (idx > 6) return;
    const key = `foto_${idx + 1}`;
    if (!foundKeys.has(key)) {
      foundKeys.add(key);
      const stableId = generateId(`img_${idx}`);
      img.setAttribute('data-bio-id', stableId);
      img.setAttribute('data-bio-image', key);
      const src = img.getAttribute('src') || '';
      fields.push({
        key,
        label: `Foto / Imagem ${idx + 1}`,
        type: 'image',
        defaultValue: src,
        currentValue: src,
        selector: `[data-bio-id="${stableId}"]`,
        attribute: 'src',
        enabled: true,
      });
    }
  });

  // 3J. Detect CTA Buttons / Action Links
  const buttons = doc.querySelectorAll('a.btn, a[class*="button" i], button:not([data-bio-link])');
  buttons.forEach((btn, idx) => {
    const href = btn.getAttribute('href') || '';
    if (href.includes('wa.me') || href.includes('instagram.com')) return;
    if (idx > 4) return;
    const key = `botao_cta_${idx + 1}`;
    if (!foundKeys.has(key)) {
      foundKeys.add(key);
      const stableId = generateId(`btn_${idx}`);
      btn.setAttribute('data-bio-id', stableId);
      btn.setAttribute('data-bio-link', key);
      const btnText = btn.textContent?.trim().slice(0, 24) || 'Botão';
      fields.push({
        key,
        label: `Botão: "${btnText}"`,
        type: 'link',
        defaultValue: href || '#',
        currentValue: href || '#',
        selector: `[data-bio-id="${stableId}"]`,
        attribute: 'href',
        enabled: true,
      });
    }
  });

  const cleanedHtml = doc.documentElement.outerHTML;

  return {
    fields,
    colors,
    theme: {
      cssVariables,
      colors,
    },
    cleanedHtml,
  };
}
