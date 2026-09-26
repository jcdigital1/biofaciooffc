/**
 * Prepares the HTML for safe rendering inside the sandbox iframe
 * with live bi-directional message synchronization.
 */
export function preparePreviewHtml(
  rawHtml: string,
  isEditor = false,
  initialValues: Record<string, any> = {},
  initialTheme: Record<string, string> = {}
): string {
  if (!rawHtml) return '<html><body style="background:#050706;color:#87938B;display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;">Pré-visualização indisponível</body></html>';

  // Inject helper script and interactive styles before </body>
  const bridgeScript = `
  <style id="bio-editor-bridge-styles">
    ${
      isEditor
        ? `
      [data-bio-text], [data-bio-image], [data-bio-link], a, button, img {
        cursor: pointer !important;
        transition: outline 0.15s ease, box-shadow 0.15s ease !important;
      }
      [data-bio-text]:hover, [data-bio-image]:hover, [data-bio-link]:hover {
        outline: 2px dashed #36FF88 !important;
        outline-offset: 3px !important;
        box-shadow: 0 0 12px rgba(54, 255, 136, 0.4) !important;
      }
      .bio-field-highlight {
        outline: 3px solid #36FF88 !important;
        outline-offset: 4px !important;
        box-shadow: 0 0 20px rgba(54, 255, 136, 0.7) !important;
      }
    `
        : ''
    }
  </style>

  <script id="bio-editor-bridge-script">
    (function() {
      const isEditorMode = ${isEditor ? 'true' : 'false'};

      // Apply initial theme variables
      const initialTheme = ${JSON.stringify(initialTheme || {})};
      for (const [key, val] of Object.entries(initialTheme)) {
        if (key && val) {
          document.documentElement.style.setProperty(key, val);
        }
      }

      // Apply initial field values
      const initialValues = ${JSON.stringify(initialValues || {})};
      for (const [key, val] of Object.entries(initialValues)) {
        applyFieldToDOM(key, val);
      }

      function applyFieldToDOM(key, val) {
        if (val === undefined || val === null) return;

        // Check CSS variables
        if (key.startsWith('css_--')) {
          const varName = key.replace('css_', '');
          document.documentElement.style.setProperty(varName, val);
          return;
        }

        // WhatsApp formatting
        if (key === 'whatsapp' || key.includes('whatsapp')) {
          const waEls = document.querySelectorAll('[data-bio-link="' + key + '"], a[href*="wa.me"], a[href*="whatsapp"]');
          let cleanPhone = String(val).replace(/\\D/g, '');
          let waUrl = val;
          if (cleanPhone && !String(val).startsWith('http')) {
            waUrl = 'https://wa.me/' + cleanPhone;
          }
          waEls.forEach(el => {
            el.setAttribute('href', waUrl);
          });
          return;
        }

        // Instagram formatting
        if (key === 'instagram' || key.includes('instagram')) {
          const igEls = document.querySelectorAll('[data-bio-link="' + key + '"], a[href*="instagram.com"]');
          let igUrl = val;
          if (val && !String(val).startsWith('http')) {
            let handle = String(val).replace('@', '').trim();
            igUrl = 'https://instagram.com/' + handle;
          }
          igEls.forEach(el => {
            el.setAttribute('href', igUrl);
          });
          return;
        }

        // Match by data-bio-text
        const textEls = document.querySelectorAll('[data-bio-text="' + key + '"]');
        textEls.forEach(el => {
          el.textContent = val;
        });

        // Match by data-bio-image
        const imgEls = document.querySelectorAll('[data-bio-image="' + key + '"]');
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

      // Handle message from parent
      window.addEventListener('message', function(event) {
        const data = event.data;
        if (!data || !data.type) return;

        if (data.type === 'BIO_UPDATE_FIELD') {
          applyFieldToDOM(data.key, data.value);
        }

        if (data.type === 'BIO_UPDATE_THEME') {
          if (data.cssVarName && data.value) {
            document.documentElement.style.setProperty(data.cssVarName, data.value);
          }
        }

        if (data.type === 'BIO_HIGHLIGHT_FIELD') {
          document.querySelectorAll('.bio-field-highlight').forEach(el => el.classList.remove('bio-field-highlight'));
          if (data.key) {
            const target = document.querySelector('[data-bio-text="' + data.key + '"], [data-bio-image="' + data.key + '"], [data-bio-link="' + data.key + '"]');
            if (target) {
              target.classList.add('bio-field-highlight');
              target.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }
        }
      });

      // If in editor mode, intercept clicks to trigger field selection
      if (isEditorMode) {
        document.addEventListener('click', function(e) {
          e.preventDefault();
          e.stopPropagation();

          let target = e.target;
          let matchedKey = null;

          while (target && target !== document.body) {
            if (target.hasAttribute('data-bio-text')) {
              matchedKey = target.getAttribute('data-bio-text');
              break;
            }
            if (target.hasAttribute('data-bio-image')) {
              matchedKey = target.getAttribute('data-bio-image');
              break;
            }
            if (target.hasAttribute('data-bio-link')) {
              matchedKey = target.getAttribute('data-bio-link');
              break;
            }
            if (target.tagName === 'IMG') {
              matchedKey = 'logo';
              break;
            }
            if (target.tagName === 'A' && (target.href.includes('wa.me') || target.href.includes('whatsapp'))) {
              matchedKey = 'whatsapp';
              break;
            }
            if (target.tagName === 'A' && target.href.includes('instagram.com')) {
              matchedKey = 'instagram';
              break;
            }
            target = target.parentElement;
          }

          if (matchedKey) {
            window.parent.postMessage({
              type: 'BIO_FIELD_SELECTED',
              key: matchedKey
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
 * Generates clean, 100% standalone, independent HTML without any editor scripts or platform markers.
 */
export function generateExportHtml(
  sourceHtml: string,
  values: Record<string, any> = {},
  theme: Record<string, string> = {}
): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(sourceHtml, 'text/html');

  // Apply theme variables
  if (theme && Object.keys(theme).length > 0) {
    let styleTag = doc.querySelector('style#bio-custom-theme');
    if (!styleTag) {
      styleTag = doc.createElement('style');
      styleTag.id = 'bio-custom-theme';
      doc.head.appendChild(styleTag);
    }
    const varDeclarations = Object.entries(theme)
      .map(([k, v]) => `  ${k}: ${v} !important;`)
      .join('\n');
    styleTag.textContent = `:root {\n${varDeclarations}\n}`;
  }

  // Apply values
  for (const [key, val] of Object.entries(values)) {
    if (val === undefined || val === null) continue;

    // CSS variables
    if (key.startsWith('css_--')) {
      const varName = key.replace('css_', '');
      let styleTag = doc.querySelector('style#bio-custom-theme');
      if (!styleTag) {
        styleTag = doc.createElement('style');
        styleTag.id = 'bio-custom-theme';
        doc.head.appendChild(styleTag);
      }
      styleTag.textContent += `\n:root { ${varName}: ${val} !important; }`;
      continue;
    }

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

    // Texts
    const textEls = doc.querySelectorAll(`[data-bio-text="${key}"]`);
    textEls.forEach((el) => {
      el.textContent = val;
    });

    // Images
    const imgEls = doc.querySelectorAll(`[data-bio-image="${key}"]`);
    imgEls.forEach((el) => {
      if (el.tagName === 'IMG') {
        el.setAttribute('src', val);
      } else {
        (el as HTMLElement).style.backgroundImage = `url(${val})`;
      }
    });

    // Links
    const linkEls = doc.querySelectorAll(`[data-bio-link="${key}"]`);
    linkEls.forEach((el) => {
      el.setAttribute('href', val);
    });
  }

  // Remove editor bridge styles and scripts
  const editorBridgeStyle = doc.querySelector('#bio-editor-bridge-styles');
  if (editorBridgeStyle) editorBridgeStyle.remove();

  const editorBridgeScript = doc.querySelector('#bio-editor-bridge-script');
  if (editorBridgeScript) editorBridgeScript.remove();

  // Strip all internal data-bio-* helper attributes so HTML is completely clean
  const allElements = doc.querySelectorAll('*');
  allElements.forEach((el) => {
    el.removeAttribute('data-bio-text');
    el.removeAttribute('data-bio-image');
    el.removeAttribute('data-bio-link');
    el.removeAttribute('data-bio-gallery');
    el.removeAttribute('data-bio-services');
    el.classList.remove('bio-field-highlight');
  });

  return `<!DOCTYPE html>\n${doc.documentElement.outerHTML}`;
}
