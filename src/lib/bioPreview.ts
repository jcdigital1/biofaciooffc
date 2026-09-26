/**
 * Prepares the HTML for safe rendering inside the sandbox iframe
 * with live bi-directional message synchronization, visual outline and direct-click editing.
 */
export function preparePreviewHtml(
  rawHtml: string,
  isEditor = false,
  initialValues: Record<string, any> = {},
  initialTheme: Record<string, string> = {}
): string {
  if (!rawHtml) {
    return '<html><body style="background:#050706;color:#87938B;display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;">Pré-visualização indisponível</body></html>';
  }

  const bridgeScript = `
  <style id="bio-editor-bridge-styles">
    ${
      isEditor
        ? `
      /* Editor interactive outlines */
      [data-bio-text], [data-bio-image], [data-bio-link], [data-bio-id], h1, h2, h3, h4, p, a, button, img {
        cursor: pointer !important;
        transition: outline 0.15s ease, box-shadow 0.15s ease !important;
      }
      [data-bio-text]:hover, [data-bio-image]:hover, [data-bio-link]:hover, [data-bio-id]:hover, img:hover, h1:hover, h2:hover, a:hover, button:hover {
        outline: 2px dashed #36FF88 !important;
        outline-offset: 3px !important;
        box-shadow: 0 0 14px rgba(54, 255, 136, 0.35) !important;
      }
      .bio-field-active {
        outline: 3px solid #36FF88 !important;
        outline-offset: 4px !important;
        box-shadow: 0 0 25px rgba(54, 255, 136, 0.7) !important;
      }
    `
        : ''
    }
  </style>

  <style id="biofacil-theme-override"></style>

  <script id="bio-editor-bridge-script">
    (function() {
      const isEditorMode = ${isEditor ? 'true' : 'false'};

      // 1. Apply Initial Theme Variables
      const initialTheme = ${JSON.stringify(initialTheme || {})};
      applyTheme(initialTheme);

      // 2. Apply Initial Values
      const initialValues = ${JSON.stringify(initialValues || {})};
      for (const [key, val] of Object.entries(initialValues)) {
        applyFieldToDOM(key, val);
      }

      function applyTheme(themeObj) {
        if (!themeObj || typeof themeObj !== 'object') return;
        let overrideCss = ':root {\\n';
        for (const [key, val] of Object.entries(themeObj)) {
          if (key && val) {
            document.documentElement.style.setProperty(key, val);
            overrideCss += '  ' + key + ': ' + val + ' !important;\\n';
          }
        }
        overrideCss += '}\\n';

        const styleEl = document.getElementById('biofacil-theme-override');
        if (styleEl) {
          styleEl.textContent = overrideCss;
        }
      }

      function applyFieldToDOM(key, val) {
        if (val === undefined || val === null) return;

        // WhatsApp formatting & multi-element synchronization
        if (key === 'whatsapp' || key.includes('whatsapp')) {
          const waEls = document.querySelectorAll('[data-bio-link="' + key + '"], a[href*="wa.me"], a[href*="whatsapp"]');
          let cleanPhone = String(val).replace(/\\D/g, '');
          let waUrl = val;
          if (cleanPhone && !String(val).startsWith('http')) {
            waUrl = 'https://wa.me/' + cleanPhone;
          }
          waEls.forEach(el => el.setAttribute('href', waUrl));
          return;
        }

        // Instagram formatting & multi-element synchronization
        if (key === 'instagram' || key.includes('instagram')) {
          const igEls = document.querySelectorAll('[data-bio-link="' + key + '"], a[href*="instagram.com"]');
          let igUrl = val;
          if (val && !String(val).startsWith('http')) {
            let handle = String(val).replace('@', '').trim();
            igUrl = 'https://instagram.com/' + handle;
          }
          igEls.forEach(el => el.setAttribute('href', igUrl));
          return;
        }

        // Match by data-bio-text
        const textEls = document.querySelectorAll('[data-bio-text="' + key + '"], [data-bio-id="' + key + '"]');
        textEls.forEach(el => {
          if (el.tagName !== 'IMG') {
            el.textContent = val;
          }
        });

        // Match by data-bio-image
        const imgEls = document.querySelectorAll('[data-bio-image="' + key + '"], [data-bio-id="' + key + '"]');
        imgEls.forEach(el => {
          if (el.tagName === 'IMG') {
            el.setAttribute('src', val);
          } else {
            el.style.backgroundImage = 'url(' + val + ')';
          }
        });

        // Match by data-bio-link
        const linkEls = document.querySelectorAll('[data-bio-link="' + key + '"]');
        linkEls.forEach(el => {
          el.setAttribute('href', val);
        });
      }

      // Message Receiver from Parent Window
      window.addEventListener('message', function(event) {
        const data = event.data;
        if (!data || !data.type) return;

        if (data.type === 'BIO_UPDATE_FIELD') {
          applyFieldToDOM(data.key, data.value);
        }

        if (data.type === 'BIO_UPDATE_THEME') {
          applyTheme(data.theme);
        }

        if (data.type === 'BIO_HIGHLIGHT_FIELD') {
          document.querySelectorAll('.bio-field-active').forEach(el => el.classList.remove('bio-field-active'));
          if (data.key) {
            const target = document.querySelector('[data-bio-text="' + data.key + '"], [data-bio-image="' + data.key + '"], [data-bio-link="' + data.key + '"], [data-bio-id="' + data.key + '"]');
            if (target) {
              target.classList.add('bio-field-active');
              target.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }
        }
      });

      // EDITAR PELO PREVIEW - Direct click interception
      if (isEditorMode) {
        document.addEventListener('click', function(e) {
          e.preventDefault();
          e.stopPropagation();

          let target = e.target;
          let matchedKey = null;
          let fieldType = 'text';
          let currentValue = '';

          while (target && target !== document.body) {
            if (target.hasAttribute('data-bio-image') || target.tagName === 'IMG') {
              matchedKey = target.getAttribute('data-bio-image') || target.getAttribute('data-bio-id') || 'logo';
              fieldType = (matchedKey.includes('logo') || target.alt.toLowerCase().includes('logo')) ? 'logo' : 'image';
              currentValue = target.getAttribute('src') || '';
              break;
            }

            if (target.hasAttribute('data-bio-link') || target.tagName === 'A' || target.tagName === 'BUTTON') {
              const href = target.getAttribute('href') || '';
              if (href.includes('wa.me') || href.includes('whatsapp') || target.className.includes('whatsapp')) {
                matchedKey = 'whatsapp';
                fieldType = 'whatsapp';
              } else if (href.includes('instagram.com') || target.className.includes('instagram')) {
                matchedKey = 'instagram';
                fieldType = 'instagram';
              } else if (href.includes('maps') || target.className.includes('maps')) {
                matchedKey = 'maps_link';
                fieldType = 'maps';
              } else {
                matchedKey = target.getAttribute('data-bio-link') || target.getAttribute('data-bio-id') || 'link';
                fieldType = 'link';
              }
              currentValue = href;
              break;
            }

            if (target.hasAttribute('data-bio-text')) {
              matchedKey = target.getAttribute('data-bio-text');
              fieldType = target.textContent.length > 70 ? 'textarea' : 'text';
              currentValue = target.textContent.trim();
              break;
            }

            if (['H1', 'H2', 'H3', 'H4', 'P', 'SPAN', 'ADDRESS'].includes(target.tagName)) {
              matchedKey = target.getAttribute('data-bio-id') || target.getAttribute('data-bio-text') || 'texto';
              fieldType = target.textContent.length > 70 ? 'textarea' : 'text';
              currentValue = target.textContent.trim();
              break;
            }

            target = target.parentElement;
          }

          if (matchedKey) {
            // Apply visual highlight
            document.querySelectorAll('.bio-field-active').forEach(el => el.classList.remove('bio-field-active'));
            if (target) target.classList.add('bio-field-active');

            window.parent.postMessage({
              type: 'BIO_ELEMENT_CLICKED',
              key: matchedKey,
              fieldType: fieldType,
              currentValue: currentValue,
              tagName: target ? target.tagName : 'DIV',
            }, '*');
          }
        }, true);
      }
    })();
  </script>
  `;

  if (rawHtml.includes('</body>')) {
    return rawHtml.replace('</body>', `${bridgeScript}</body>`);
  }
  return `${rawHtml}${bridgeScript}`;
}

/**
 * Generates clean, 100% standalone, independent static HTML.
 * The downloaded file has all customizations baked in, with NO editor overlays,
 * NO platform dependencies, and works anywhere immediately.
 */
export function generateExportHtml(
  sourceHtml: string,
  values: Record<string, any> = {},
  theme: Record<string, string> = {}
): string {
  if (!sourceHtml) return '<!DOCTYPE html><html><body>Bio Fácil</body></html>';

  const parser = new DOMParser();
  const doc = parser.parseFromString(sourceHtml, 'text/html');

  // 1. Bake in customized theme styles
  if (theme && Object.keys(theme).length > 0) {
    let styleTag = doc.querySelector('style#bio-custom-theme');
    if (!styleTag) {
      styleTag = doc.createElement('style');
      styleTag.id = 'bio-custom-theme';
      doc.head.appendChild(styleTag);
    }
    const declarations = Object.entries(theme)
      .map(([k, v]) => `  ${k}: ${v} !important;`)
      .join('\n');
    styleTag.textContent = `:root {\n${declarations}\n}`;
  }

  // 2. Bake in all customized values into the DOM
  for (const [key, val] of Object.entries(values)) {
    if (val === undefined || val === null) continue;

    // WhatsApp
    if (key === 'whatsapp' || key.includes('whatsapp')) {
      const waEls = doc.querySelectorAll(`[data-bio-link="${key}"], a[href*="wa.me"], a[href*="whatsapp"]`);
      let cleanPhone = String(val).replace(/\D/g, '');
      let waUrl = val;
      if (cleanPhone && !String(val).startsWith('http')) {
        waUrl = `https://wa.me/${cleanPhone}`;
      }
      waEls.forEach((el) => el.setAttribute('href', waUrl));
      continue;
    }

    // Instagram
    if (key === 'instagram' || key.includes('instagram')) {
      const igEls = doc.querySelectorAll(`[data-bio-link="${key}"], a[href*="instagram.com"]`);
      let igUrl = val;
      if (val && !String(val).startsWith('http')) {
        let handle = String(val).replace('@', '').trim();
        igUrl = `https://instagram.com/${handle}`;
      }
      igEls.forEach((el) => el.setAttribute('href', igUrl));
      continue;
    }

    // Text elements
    const textEls = doc.querySelectorAll(`[data-bio-text="${key}"], [data-bio-id="${key}"]`);
    textEls.forEach((el) => {
      if (el.tagName !== 'IMG') {
        el.textContent = String(val);
      }
    });

    // Image elements
    const imgEls = doc.querySelectorAll(`[data-bio-image="${key}"], [data-bio-id="${key}"]`);
    imgEls.forEach((el) => {
      if (el.tagName === 'IMG') {
        el.setAttribute('src', String(val));
      } else {
        (el as HTMLElement).style.backgroundImage = `url(${val})`;
      }
    });

    // Links
    const linkEls = doc.querySelectorAll(`[data-bio-link="${key}"]`);
    linkEls.forEach((el) => {
      el.setAttribute('href', String(val));
    });
  }

  // 3. Remove editor bridge styles, scripts and outline classes
  const editorBridgeStyle = doc.querySelector('#bio-editor-bridge-styles');
  if (editorBridgeStyle) editorBridgeStyle.remove();

  const editorBridgeScript = doc.querySelector('#bio-editor-bridge-script');
  if (editorBridgeScript) editorBridgeScript.remove();

  const tempOverride = doc.querySelector('#biofacil-theme-override');
  if (tempOverride) tempOverride.remove();

  // Strip all data-bio-* internal attributes for clean output
  const allElements = doc.querySelectorAll('*');
  allElements.forEach((el) => {
    el.removeAttribute('data-bio-text');
    el.removeAttribute('data-bio-image');
    el.removeAttribute('data-bio-link');
    el.removeAttribute('data-bio-id');
    el.removeAttribute('data-bio-services');
    el.removeAttribute('data-bio-gallery');
    el.classList.remove('bio-field-active');
  });

  return `<!DOCTYPE html>\n${doc.documentElement.outerHTML}`;
}
