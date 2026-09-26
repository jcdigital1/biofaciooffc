import { EditorField, EditorSchema, ThemeMetadata } from '../types';

export interface ParseResult {
  fields: EditorField[];
  theme: ThemeMetadata;
  cleanedHtml: string;
}

export function parseBioSiteHtml(rawHtml: string): ParseResult {
  const parser = new DOMParser();
  const doc = parser.parseFromString(rawHtml, 'text/html');

  const fields: EditorField[] = [];
  const foundKeys = new Set<string>();

  // 1. Extract CSS variables from <style> blocks
  const cssVariables: Record<string, string> = {};
  const styleTags = doc.querySelectorAll('style');
  const cssVarRegex = /--([a-zA-Z0-9_-]+)\s*:\s*([^;}\n]+)/g;

  styleTags.forEach((styleTag) => {
    const text = styleTag.textContent || '';
    let match;
    while ((match = cssVarRegex.exec(text)) !== null) {
      const varName = `--${match[1].trim()}`;
      const varValue = match[2].trim();
      if (
        varName.includes('primary') ||
        varName.includes('secondary') ||
        varName.includes('accent') ||
        varName.includes('bg') ||
        varName.includes('background') ||
        varName.includes('surface') ||
        varName.includes('text') ||
        varName.includes('muted') ||
        varName.includes('glow')
      ) {
        cssVariables[varName] = varValue;
      }
    }
  });

  // If common variables were found, create color fields
  Object.entries(cssVariables).forEach(([varName, val]) => {
    const key = `css_${varName.replace(/[^a-zA-Z0-9]/g, '_')}`;
    let label = `Cor (${varName})`;
    if (varName.includes('primary')) label = 'Cor Primária';
    else if (varName.includes('secondary')) label = 'Cor Secundária';
    else if (varName.includes('background') || varName.includes('bg')) label = 'Cor de Fundo';
    else if (varName.includes('text')) label = 'Cor do Texto';
    else if (varName.includes('accent')) label = 'Cor de Destaque';

    if (!foundKeys.has(key)) {
      foundKeys.add(key);
      fields.push({
        key,
        label,
        type: 'color',
        cssVarName: varName,
        defaultValue: val,
        currentValue: val,
        enabled: true,
        helpText: `Variável CSS ${varName}`,
      });
    }
  });

  // 2. Scan for explicit data-bio-* attributes
  const dataBioElements = doc.querySelectorAll('[data-bio-text], [data-bio-image], [data-bio-link], [data-bio-gallery], [data-bio-services]');
  dataBioElements.forEach((el, index) => {
    if (el.hasAttribute('data-bio-text')) {
      const explicitKey = el.getAttribute('data-bio-text') || `text_${index}`;
      if (!foundKeys.has(explicitKey)) {
        foundKeys.add(explicitKey);
        fields.push({
          key: explicitKey,
          label: explicitKey.replace(/_/g, ' ').toUpperCase(),
          type: (el.textContent || '').length > 60 ? 'textarea' : 'text',
          defaultValue: el.textContent?.trim() || '',
          currentValue: el.textContent?.trim() || '',
          selector: `[data-bio-text="${explicitKey}"]`,
          attribute: 'textContent',
          enabled: true,
        });
      }
    }

    if (el.hasAttribute('data-bio-image')) {
      const explicitKey = el.getAttribute('data-bio-image') || `image_${index}`;
      if (!foundKeys.has(explicitKey)) {
        foundKeys.add(explicitKey);
        const img = el as HTMLImageElement;
        fields.push({
          key: explicitKey,
          label: explicitKey.replace(/_/g, ' ').toUpperCase(),
          type: explicitKey.toLowerCase().includes('logo') ? 'logo' : 'image',
          defaultValue: img.src || img.getAttribute('src') || '',
          currentValue: img.src || img.getAttribute('src') || '',
          selector: `[data-bio-image="${explicitKey}"]`,
          attribute: 'src',
          enabled: true,
        });
      }
    }

    if (el.hasAttribute('data-bio-link')) {
      const explicitKey = el.getAttribute('data-bio-link') || `link_${index}`;
      if (!foundKeys.has(explicitKey)) {
        foundKeys.add(explicitKey);
        const a = el as HTMLAnchorElement;
        const href = a.getAttribute('href') || '';
        let type: any = 'link';
        if (explicitKey.includes('whatsapp') || href.includes('wa.me')) type = 'whatsapp';
        else if (explicitKey.includes('instagram') || href.includes('instagram.com')) type = 'instagram';

        fields.push({
          key: explicitKey,
          label: explicitKey.replace(/_/g, ' ').toUpperCase(),
          type,
          defaultValue: href,
          currentValue: href,
          selector: `[data-bio-link="${explicitKey}"]`,
          attribute: 'href',
          enabled: true,
        });
      }
    }
  });

  // 3. Semantic heuristic DOM detection if no explicit attributes
  // 3A. Logo
  const logoEl = doc.querySelector('img[alt*="logo" i], img[class*="logo" i], .logo img, [id*="logo" i] img, header img');
  if (logoEl && !foundKeys.has('logo')) {
    foundKeys.add('logo');
    logoEl.setAttribute('data-bio-image', 'logo');
    fields.unshift({
      key: 'logo',
      label: 'Logotipo / Foto de Perfil',
      type: 'logo',
      defaultValue: logoEl.getAttribute('src') || '',
      currentValue: logoEl.getAttribute('src') || '',
      selector: '[data-bio-image="logo"]',
      attribute: 'src',
      enabled: true,
      helpText: 'Logotipo principal ou foto do perfil',
    });
  }

  // 3B. Name / Main Title (H1)
  const h1 = doc.querySelector('h1, .hero-title, .title, [class*="title" i]');
  if (h1 && !foundKeys.has('title_main')) {
    foundKeys.add('title_main');
    h1.setAttribute('data-bio-text', 'title_main');
    fields.push({
      key: 'title_main',
      label: 'Nome / Título Principal',
      type: 'text',
      defaultValue: h1.textContent?.trim() || '',
      currentValue: h1.textContent?.trim() || '',
      selector: '[data-bio-text="title_main"]',
      attribute: 'textContent',
      enabled: true,
    });
  }

  // 3C. Subtitle / Profession (H2 / H3 / Subtitle)
  const subtitle = doc.querySelector('h2, .subtitle, [class*="subtitle" i], .profession, .bio');
  if (subtitle && !foundKeys.has('subtitle')) {
    foundKeys.add('subtitle');
    subtitle.setAttribute('data-bio-text', 'subtitle');
    fields.push({
      key: 'subtitle',
      label: 'Subtítulo / Especialidade / Bio',
      type: 'text',
      defaultValue: subtitle.textContent?.trim() || '',
      currentValue: subtitle.textContent?.trim() || '',
      selector: '[data-bio-text="subtitle"]',
      attribute: 'textContent',
      enabled: true,
    });
  }

  // 3D. WhatsApp Links (Grouped logically)
  const waLinks = doc.querySelectorAll('a[href*="wa.me"], a[href*="api.whatsapp.com"], a[class*="whatsapp" i], a[id*="whatsapp" i]');
  if (waLinks.length > 0 && !foundKeys.has('whatsapp')) {
    foundKeys.add('whatsapp');
    let sampleHref = waLinks[0].getAttribute('href') || '';
    waLinks.forEach((l) => l.setAttribute('data-bio-link', 'whatsapp'));
    fields.push({
      key: 'whatsapp',
      label: 'WhatsApp (Agendamento / Contato)',
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
    let sampleHref = instaLinks[0].getAttribute('href') || '';
    instaLinks.forEach((l) => l.setAttribute('data-bio-link', 'instagram'));
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
    mapsLink.setAttribute('data-bio-link', 'maps_link');
    fields.push({
      key: 'maps_link',
      label: 'Link do Google Maps / Como Chegar',
      type: 'maps',
      defaultValue: mapsLink.getAttribute('href') || '',
      currentValue: mapsLink.getAttribute('href') || '',
      selector: '[data-bio-link="maps_link"]',
      attribute: 'href',
      enabled: true,
    });
  }

  // 3G. Address text
  const addressEl = doc.querySelector('address, .address, [class*="address" i], .localizacao, [class*="local" i]');
  if (addressEl && !foundKeys.has('address_text')) {
    foundKeys.add('address_text');
    addressEl.setAttribute('data-bio-text', 'address_text');
    fields.push({
      key: 'address_text',
      label: 'Endereço Completo / Horários',
      type: 'text',
      defaultValue: addressEl.textContent?.trim() || '',
      currentValue: addressEl.textContent?.trim() || '',
      selector: '[data-bio-text="address_text"]',
      attribute: 'textContent',
      enabled: true,
    });
  }

  // 3H. Detect other paragraphs/descriptions
  const paragraphs = doc.querySelectorAll('p');
  paragraphs.forEach((p, idx) => {
    if (idx > 4) return; // limit to first few relevant paragraphs
    const text = p.textContent?.trim() || '';
    if (text.length > 20 && !p.hasAttribute('data-bio-text')) {
      const pKey = `paragrafo_${idx + 1}`;
      if (!foundKeys.has(pKey)) {
        foundKeys.add(pKey);
        p.setAttribute('data-bio-text', pKey);
        fields.push({
          key: pKey,
          label: `Texto de Apresentação ${idx + 1}`,
          type: 'textarea',
          defaultValue: text,
          currentValue: text,
          selector: `[data-bio-text="${pKey}"]`,
          attribute: 'textContent',
          enabled: true,
        });
      }
    }
  });

  // 3I. Detect remaining standalone images (gallery / banner)
  const remainingImages = doc.querySelectorAll('img:not([data-bio-image])');
  remainingImages.forEach((img, idx) => {
    if (idx > 5) return;
    const imgKey = `imagem_destaque_${idx + 1}`;
    if (!foundKeys.has(imgKey)) {
      foundKeys.add(imgKey);
      img.setAttribute('data-bio-image', imgKey);
      fields.push({
        key: imgKey,
        label: `Imagem / Foto ${idx + 1}`,
        type: 'image',
        defaultValue: img.getAttribute('src') || '',
        currentValue: img.getAttribute('src') || '',
        selector: `[data-bio-image="${imgKey}"]`,
        attribute: 'src',
        enabled: true,
      });
    }
  });

  // 3J. Detect CTA Buttons
  const buttons = doc.querySelectorAll('a.btn, a[class*="button" i], button:not([data-bio-link])');
  buttons.forEach((btn, idx) => {
    if (btn.getAttribute('href')?.includes('wa.me') || btn.getAttribute('href')?.includes('instagram.com')) return;
    if (idx > 4) return;
    const btnKey = `btn_cta_${idx + 1}`;
    if (!foundKeys.has(btnKey)) {
      foundKeys.add(btnKey);
      btn.setAttribute('data-bio-link', btnKey);
      fields.push({
        key: btnKey,
        label: `Botão de Ação: "${btn.textContent?.trim().slice(0, 20)}"`,
        type: 'link',
        defaultValue: btn.getAttribute('href') || '#',
        currentValue: btn.getAttribute('href') || '#',
        selector: `[data-bio-link="${btnKey}"]`,
        attribute: 'href',
        enabled: true,
      });
    }
  });

  const cleanedHtml = doc.documentElement.outerHTML;

  return {
    fields,
    theme: {
      cssVariables,
    },
    cleanedHtml,
  };
}
