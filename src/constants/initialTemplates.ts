import { BioTemplate } from '../types';

export const INITIAL_TEMPLATES: BioTemplate[] = [
  {
    templateId: 'tpl-barbearia-classic',
    name: 'Barbearia Vintage & Navalha',
    nicheId: 'barbearia',
    nicheName: 'Barbearia',
    version: 1,
    status: 'published',
    sourceHtml: `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Navalha de Ouro Barber Club</title>
  <style>
    :root {
      --primary: #d4af37;
      --secondary: #e6c86e;
      --background: #0f1110;
      --surface: #181c1a;
      --text: #f0f4f2;
      --muted: #9aa8a1;
      --glow: rgba(212, 175, 55, 0.35);
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: var(--background);
      color: var(--text);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      min-height: 100vh;
      display: flex;
      justify-content: center;
      padding: 24px 16px;
    }
    .container {
      width: 100%;
      max-width: 440px;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }
    .profile-card {
      margin-top: 16px;
      margin-bottom: 24px;
      position: relative;
    }
    .avatar-wrapper {
      width: 104px;
      height: 104px;
      border-radius: 50%;
      padding: 3px;
      background: linear-gradient(135deg, var(--primary), #2c332e);
      box-shadow: 0 8px 24px var(--glow);
      margin: 0 auto 16px;
    }
    .avatar-img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      object-fit: cover;
      background: #111;
    }
    h1 {
      font-size: 24px;
      font-weight: 700;
      letter-spacing: -0.5px;
      color: #ffffff;
      margin-bottom: 6px;
    }
    .badge {
      display: inline-block;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: var(--primary);
      font-weight: 600;
      margin-bottom: 8px;
    }
    .bio {
      font-size: 14px;
      color: var(--muted);
      line-height: 1.5;
      max-width: 340px;
    }
    .cta-card {
      width: 100%;
      background: var(--surface);
      border: 1px solid rgba(212, 175, 55, 0.25);
      border-radius: 16px;
      padding: 20px 16px;
      margin-bottom: 24px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    }
    .btn-agendar {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      width: 100%;
      background: linear-gradient(135deg, var(--primary), var(--secondary));
      color: #0c0e0d;
      font-weight: 700;
      font-size: 15px;
      padding: 14px 20px;
      border-radius: 12px;
      text-decoration: none;
      box-shadow: 0 4px 20px var(--glow);
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .btn-agendar:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px var(--glow);
    }
    .links-list {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-bottom: 24px;
    }
    .link-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 18px;
      background: var(--surface);
      border: 1px solid rgba(255,255,255,0.06);
      border-radius: 12px;
      color: var(--text);
      text-decoration: none;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.2s ease;
    }
    .link-item:hover {
      border-color: var(--primary);
      transform: translateY(-1px);
    }
    .services-grid {
      width: 100%;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin-bottom: 24px;
    }
    .service-box {
      background: var(--surface);
      border: 1px solid rgba(255,255,255,0.05);
      border-radius: 12px;
      padding: 12px;
      text-align: left;
    }
    .service-name { font-size: 13px; font-weight: 600; color: #fff; margin-bottom: 4px; }
    .service-price { font-size: 14px; font-weight: 700; color: var(--primary); }
    .footer-info {
      font-size: 12px;
      color: var(--muted);
      line-height: 1.6;
      margin-top: 10px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="profile-card">
      <div class="avatar-wrapper">
        <img class="avatar-img" data-bio-image="logo" src="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400&auto=format&fit=crop&q=80" alt="Logo Barbearia">
      </div>
      <div class="badge">ESTILO & TRADIÇÃO</div>
      <h1 data-bio-text="title_main">Navalha de Ouro Barber Club</h1>
      <p class="bio" data-bio-text="subtitle">Cortes clássicos, toalha quente, barboterapia e atendimento exclusivo em ambiente climatizado.</p>
    </div>

    <div class="cta-card">
      <a class="btn-agendar" data-bio-link="whatsapp" href="https://wa.me/5511999999999?text=Ol%C3%A1!%20Gostaria%20de%20agendar%20um%20hor%C3%A1rio.">
        <span>✂️</span>
        <span>AGENDAR MEU HORÁRIO</span>
      </a>
    </div>

    <div class="services-grid">
      <div class="service-box">
        <div class="service-name">Corte Masculino</div>
        <div class="service-price">R$ 55,00</div>
      </div>
      <div class="service-box">
        <div class="service-name">Barba Terapia</div>
        <div class="service-price">R$ 45,00</div>
      </div>
      <div class="service-box">
        <div class="service-name">Combo Cabelo + Barba</div>
        <div class="service-price">R$ 90,00</div>
      </div>
      <div class="service-box">
        <div class="service-name">Acabamento & Pezinho</div>
        <div class="service-price">R$ 25,00</div>
      </div>
    </div>

    <div class="links-list">
      <a class="link-item" data-bio-link="instagram" href="https://instagram.com/navalha_de_ouro" target="_blank">
        <span>📸 Siga no Instagram</span>
        <span>→</span>
      </a>
      <a class="link-item" data-bio-link="maps_link" href="https://maps.google.com" target="_blank">
        <span>📍 Como Chegar (Google Maps)</span>
        <span>→</span>
      </a>
    </div>

    <div class="footer-info">
      <p data-bio-text="address_text">Av. Paulista, 1000 - Sala 402 - São Paulo / SP</p>
      <p>Terça a Sábado: 09h às 20h</p>
    </div>
  </div>
</body>
</html>`,
    editorSchema: {
      fields: [
        { key: 'logo', label: 'Logotipo / Foto de Perfil', type: 'logo', selector: '[data-bio-image="logo"]', attribute: 'src', enabled: true },
        { key: 'title_main', label: 'Nome da Barbearia', type: 'text', selector: '[data-bio-text="title_main"]', attribute: 'textContent', enabled: true },
        { key: 'subtitle', label: 'Descrição / Bio', type: 'textarea', selector: '[data-bio-text="subtitle"]', attribute: 'textContent', enabled: true },
        { key: 'whatsapp', label: 'WhatsApp (Agendamento)', type: 'whatsapp', selector: '[data-bio-link="whatsapp"]', attribute: 'href', enabled: true },
        { key: 'instagram', label: 'Instagram', type: 'instagram', selector: '[data-bio-link="instagram"]', attribute: 'href', enabled: true },
        { key: 'maps_link', label: 'Link Google Maps', type: 'maps', selector: '[data-bio-link="maps_link"]', attribute: 'href', enabled: true },
        { key: 'address_text', label: 'Endereço & Horários', type: 'text', selector: '[data-bio-text="address_text"]', attribute: 'textContent', enabled: true },
        { key: 'css_--primary', label: 'Cor Principal (Dourado/Destaque)', type: 'color', cssVarName: '--primary', defaultValue: '#d4af37', enabled: true },
      ],
    },
    themeMetadata: {
      cssVariables: {
        '--primary': '#d4af37',
        '--secondary': '#e6c86e',
        '--background': '#0f1110',
        '--surface': '#181c1a',
      },
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    templateId: 'tpl-beleza-glow',
    name: 'Espaço Glow Estética & Spa',
    nicheId: 'beleza-estetica',
    nicheName: 'Beleza & Estética',
    version: 1,
    status: 'published',
    sourceHtml: `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Espaço Glow Estética Avançada</title>
  <style>
    :root {
      --primary: #f472b6;
      --secondary: #fb7185;
      --background: #0d0a0f;
      --surface: #17121b;
      --text: #fdf2f8;
      --muted: #a89bb0;
      --glow: rgba(244, 114, 182, 0.3);
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: var(--background);
      color: var(--text);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      min-height: 100vh;
      display: flex;
      justify-content: center;
      padding: 28px 16px;
    }
    .container {
      width: 100%;
      max-width: 440px;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }
    .avatar-wrapper {
      width: 108px;
      height: 108px;
      border-radius: 50%;
      padding: 3px;
      background: linear-gradient(135deg, var(--primary), var(--secondary));
      box-shadow: 0 10px 30px var(--glow);
      margin: 0 auto 16px;
    }
    .avatar-img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      object-fit: cover;
    }
    h1 {
      font-size: 24px;
      font-weight: 700;
      color: #fff;
      margin-bottom: 6px;
    }
    .badge {
      font-size: 11px;
      letter-spacing: 2px;
      color: var(--primary);
      text-transform: uppercase;
      font-weight: 600;
      margin-bottom: 8px;
    }
    .bio {
      font-size: 14px;
      color: var(--muted);
      line-height: 1.5;
      margin-bottom: 24px;
      max-width: 320px;
    }
    .btn-main {
      width: 100%;
      padding: 16px;
      background: linear-gradient(135deg, var(--primary), var(--secondary));
      color: #fff;
      font-weight: 700;
      border-radius: 14px;
      text-decoration: none;
      box-shadow: 0 6px 25px var(--glow);
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }
    .links-box {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-bottom: 24px;
    }
    .link-item {
      padding: 14px 18px;
      background: var(--surface);
      border: 1px solid rgba(244, 114, 182, 0.15);
      border-radius: 12px;
      color: var(--text);
      text-decoration: none;
      font-size: 14px;
      font-weight: 500;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .footer {
      font-size: 12px;
      color: var(--muted);
      margin-top: 10px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="avatar-wrapper">
      <img class="avatar-img" data-bio-image="logo" src="https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400&auto=format&fit=crop&q=80" alt="Espaço Glow">
    </div>
    <div class="badge">ESTÉTICA AVANÇADA & BEM-ESTAR</div>
    <h1 data-bio-text="title_main">Espaço Glow Estética</h1>
    <p class="bio" data-bio-text="subtitle">Realçando sua beleza natural com tratamentos faciais, corporais, botox e skincare personalizado.</p>

    <a class="btn-main" data-bio-link="whatsapp" href="https://wa.me/5511988888888?text=Ol%C3%A1!%20Gostaria%20de%20agendar%20uma%20avalia%C3%A7%C3%A3o.">
      <span>✨</span>
      <span>AGENDAR AVALIAÇÃO VIP</span>
    </a>

    <div class="links-box">
      <a class="link-item" data-bio-link="instagram" href="https://instagram.com/espaco_glow" target="_blank">
        <span>📸 Acompanhe Antes & Depois</span>
        <span>→</span>
      </a>
      <a class="link-item" data-bio-link="maps_link" href="https://maps.google.com" target="_blank">
        <span>📍 Localização da Clínica</span>
        <span>→</span>
      </a>
    </div>

    <div class="footer">
      <p data-bio-text="address_text">Rua Oscar Freire, 800 - Jardins - São Paulo / SP</p>
    </div>
  </div>
</body>
</html>`,
    editorSchema: {
      fields: [
        { key: 'logo', label: 'Logotipo / Foto de Perfil', type: 'logo', selector: '[data-bio-image="logo"]', attribute: 'src', enabled: true },
        { key: 'title_main', label: 'Nome da Clínica / Profissional', type: 'text', selector: '[data-bio-text="title_main"]', attribute: 'textContent', enabled: true },
        { key: 'subtitle', label: 'Bio / Descrição dos Procedimentos', type: 'textarea', selector: '[data-bio-text="subtitle"]', attribute: 'textContent', enabled: true },
        { key: 'whatsapp', label: 'WhatsApp (Avaliações)', type: 'whatsapp', selector: '[data-bio-link="whatsapp"]', attribute: 'href', enabled: true },
        { key: 'instagram', label: 'Instagram', type: 'instagram', selector: '[data-bio-link="instagram"]', attribute: 'href', enabled: true },
        { key: 'maps_link', label: 'Google Maps', type: 'maps', selector: '[data-bio-link="maps_link"]', attribute: 'href', enabled: true },
        { key: 'address_text', label: 'Endereço da Clínica', type: 'text', selector: '[data-bio-text="address_text"]', attribute: 'textContent', enabled: true },
        { key: 'css_--primary', label: 'Cor de Destaque', type: 'color', cssVarName: '--primary', defaultValue: '#f472b6', enabled: true },
      ],
    },
    themeMetadata: {
      cssVariables: {
        '--primary': '#f472b6',
        '--secondary': '#fb7185',
        '--background': '#0d0a0f',
        '--surface': '#17121b',
      },
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    templateId: 'tpl-gastronomia-delivery',
    name: 'Burger & Grill Artesanal',
    nicheId: 'gastronomia-delivery',
    nicheName: 'Gastronomia & Delivery',
    version: 1,
    status: 'published',
    sourceHtml: `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Burger & Grill Artesanal</title>
  <style>
    :root {
      --primary: #f97316;
      --secondary: #ef4444;
      --background: #110d0c;
      --surface: #1c1514;
      --text: #fef2f2;
      --muted: #a89f9e;
      --glow: rgba(249, 115, 22, 0.35);
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: var(--background);
      color: var(--text);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      min-height: 100vh;
      display: flex;
      justify-content: center;
      padding: 24px 16px;
    }
    .container {
      width: 100%;
      max-width: 440px;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }
    .avatar-wrapper {
      width: 100px;
      height: 100px;
      border-radius: 20px;
      overflow: hidden;
      border: 3px solid var(--primary);
      box-shadow: 0 8px 24px var(--glow);
      margin: 0 auto 16px;
    }
    .avatar-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    h1 {
      font-size: 24px;
      font-weight: 800;
      color: #fff;
      margin-bottom: 6px;
    }
    .badge {
      font-size: 11px;
      letter-spacing: 1.5px;
      color: var(--primary);
      text-transform: uppercase;
      font-weight: 700;
      margin-bottom: 8px;
    }
    .bio {
      font-size: 14px;
      color: var(--muted);
      line-height: 1.5;
      margin-bottom: 20px;
      max-width: 320px;
    }
    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(34, 197, 94, 0.15);
      color: #4ade80;
      border: 1px solid rgba(34, 197, 94, 0.3);
      padding: 4px 12px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 600;
      margin-bottom: 20px;
    }
    .pulse-dot {
      width: 8px;
      height: 8px;
      background: #4ade80;
      border-radius: 50%;
    }
    .btn-cardapio {
      width: 100%;
      padding: 16px;
      background: linear-gradient(135deg, var(--primary), var(--secondary));
      color: #fff;
      font-weight: 700;
      font-size: 15px;
      border-radius: 14px;
      text-decoration: none;
      box-shadow: 0 6px 25px var(--glow);
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }
    .links-box {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-bottom: 24px;
    }
    .link-item {
      padding: 14px 18px;
      background: var(--surface);
      border: 1px solid rgba(255, 255, 255, 0.07);
      border-radius: 12px;
      color: var(--text);
      text-decoration: none;
      font-size: 14px;
      font-weight: 500;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .footer {
      font-size: 12px;
      color: var(--muted);
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="avatar-wrapper">
      <img class="avatar-img" data-bio-image="logo" src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&auto=format&fit=crop&q=80" alt="Logo Hamburgueria">
    </div>
    <div class="badge">BURGER ARTESANAL & DEFUMADOS</div>
    <h1 data-bio-text="title_main">Burger & Grill Artesanal</h1>
    <p class="bio" data-bio-text="subtitle">Blend especial 100% Angus, pão brioche amanteigado, batata rústica e molhos caseiros secretos.</p>

    <div class="status-badge">
      <span class="pulse-dot"></span>
      <span>ESTAMOS ABERTOS • ENTREGA RÁPIDA</span>
    </div>

    <a class="btn-cardapio" data-bio-link="whatsapp" href="https://wa.me/5511977777777?text=Ol%C3%A1!%20Gostaria%20de%20fazer%20um%20pedido%20pelo%20card%C3%A1pio.">
      <span>🍔</span>
      <span>FAZER PEDIDO NO WHATSAPP</span>
    </a>

    <div class="links-box">
      <a class="link-item" data-bio-link="instagram" href="https://instagram.com/burger_grill" target="_blank">
        <span>📸 Fotos do Cardápio no Instagram</span>
        <span>→</span>
      </a>
      <a class="link-item" data-bio-link="maps_link" href="https://maps.google.com" target="_blank">
        <span>📍 Retirada no Balcão (Google Maps)</span>
        <span>→</span>
      </a>
    </div>

    <div class="footer">
      <p data-bio-text="address_text">Rua Gastronômica, 420 - Delivery até 5km</p>
      <p>Quarta a Domingo: 18h às 23h30</p>
    </div>
  </div>
</body>
</html>`,
    editorSchema: {
      fields: [
        { key: 'logo', label: 'Logotipo / Foto do Burger', type: 'logo', selector: '[data-bio-image="logo"]', attribute: 'src', enabled: true },
        { key: 'title_main', label: 'Nome do Restaurante / Lanchonete', type: 'text', selector: '[data-bio-text="title_main"]', attribute: 'textContent', enabled: true },
        { key: 'subtitle', label: 'Descrição / Destaque do Cardápio', type: 'textarea', selector: '[data-bio-text="subtitle"]', attribute: 'textContent', enabled: true },
        { key: 'whatsapp', label: 'WhatsApp (Pedidos)', type: 'whatsapp', selector: '[data-bio-link="whatsapp"]', attribute: 'href', enabled: true },
        { key: 'instagram', label: 'Instagram', type: 'instagram', selector: '[data-bio-link="instagram"]', attribute: 'href', enabled: true },
        { key: 'maps_link', label: 'Google Maps / Retirada', type: 'maps', selector: '[data-bio-link="maps_link"]', attribute: 'href', enabled: true },
        { key: 'address_text', label: 'Endereço & Horário de Funcionamento', type: 'text', selector: '[data-bio-text="address_text"]', attribute: 'textContent', enabled: true },
        { key: 'css_--primary', label: 'Cor Primária (Laranja/Fogo)', type: 'color', cssVarName: '--primary', defaultValue: '#f97316', enabled: true },
      ],
    },
    themeMetadata: {
      cssVariables: {
        '--primary': '#f97316',
        '--secondary': '#ef4444',
        '--background': '#110d0c',
        '--surface': '#1c1514',
      },
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    templateId: 'tpl-servicos-adv',
    name: 'Advocacia & Consultoria Jurídica',
    nicheId: 'servicos-profissionais',
    nicheName: 'Serviços Profissionais',
    version: 1,
    status: 'published',
    sourceHtml: `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dr. Carlos Mendes & Associados</title>
  <style>
    :root {
      --primary: #3b82f6;
      --secondary: #60a5fa;
      --background: #080d16;
      --surface: #101927;
      --text: #f0f6ff;
      --muted: #8fa0ba;
      --glow: rgba(59, 130, 246, 0.35);
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: var(--background);
      color: var(--text);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      min-height: 100vh;
      display: flex;
      justify-content: center;
      padding: 24px 16px;
    }
    .container {
      width: 100%;
      max-width: 440px;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }
    .avatar-wrapper {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      padding: 3px;
      background: linear-gradient(135deg, var(--primary), #1e293b);
      box-shadow: 0 8px 24px var(--glow);
      margin: 0 auto 16px;
    }
    .avatar-img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      object-fit: cover;
    }
    h1 {
      font-size: 22px;
      font-weight: 700;
      color: #fff;
      margin-bottom: 6px;
    }
    .badge {
      font-size: 11px;
      letter-spacing: 1.5px;
      color: var(--primary);
      text-transform: uppercase;
      font-weight: 600;
      margin-bottom: 8px;
    }
    .bio {
      font-size: 14px;
      color: var(--muted);
      line-height: 1.5;
      margin-bottom: 24px;
      max-width: 340px;
    }
    .btn-action {
      width: 100%;
      padding: 16px;
      background: linear-gradient(135deg, var(--primary), var(--secondary));
      color: #fff;
      font-weight: 700;
      border-radius: 12px;
      text-decoration: none;
      box-shadow: 0 4px 20px var(--glow);
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
    }
    .links-box {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-bottom: 24px;
    }
    .link-item {
      padding: 14px 18px;
      background: var(--surface);
      border: 1px solid rgba(59, 130, 246, 0.2);
      border-radius: 12px;
      color: var(--text);
      text-decoration: none;
      font-size: 14px;
      font-weight: 500;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .footer {
      font-size: 12px;
      color: var(--muted);
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="avatar-wrapper">
      <img class="avatar-img" data-bio-image="logo" src="https://images.unsplash.com/photo-1556157382-97eda2d62296?w=400&auto=format&fit=crop&q=80" alt="Dr. Carlos Mendes">
    </div>
    <div class="badge">OAB/SP 000.000 • CONSULTORIA JURÍDICA</div>
    <h1 data-bio-text="title_main">Dr. Carlos Mendes & Associados</h1>
    <p class="bio" data-bio-text="subtitle">Especialistas em Direito Civil, Empresarial e Trabalhista. Atendimento ágil e assessoria estratégica personalizada.</p>

    <a class="btn-action" data-bio-link="whatsapp" href="https://wa.me/5511966666666?text=Ol%C3%A1%20Dr.%20Carlos,%20gostaria%20de%20uma%20consulta%20jur%C3%ADdica.">
      <span>⚖️</span>
      <span>FALAR COM ADVOGADO DE PLANTÃO</span>
    </a>

    <div class="links-box">
      <a class="link-item" data-bio-link="instagram" href="https://instagram.com/mendes_adv" target="_blank">
        <span>📸 Artigos & Dicas Jurídicas no Instagram</span>
        <span>→</span>
      </a>
      <a class="link-item" data-bio-link="maps_link" href="https://maps.google.com" target="_blank">
        <span>📍 Nosso Escritório Físico</span>
        <span>→</span>
      </a>
    </div>

    <div class="footer">
      <p data-bio-text="address_text">Edifício Tower Corporate, Av. Faria Lima, 2500 - SP</p>
    </div>
  </div>
</body>
</html>`,
    editorSchema: {
      fields: [
        { key: 'logo', label: 'Foto Profissional / Logotipo', type: 'logo', selector: '[data-bio-image="logo"]', attribute: 'src', enabled: true },
        { key: 'title_main', label: 'Nome do Advogado / Escritório', type: 'text', selector: '[data-bio-text="title_main"]', attribute: 'textContent', enabled: true },
        { key: 'subtitle', label: 'Especialidades / Descrição', type: 'textarea', selector: '[data-bio-text="subtitle"]', attribute: 'textContent', enabled: true },
        { key: 'whatsapp', label: 'WhatsApp (Consultas)', type: 'whatsapp', selector: '[data-bio-link="whatsapp"]', attribute: 'href', enabled: true },
        { key: 'instagram', label: 'Instagram', type: 'instagram', selector: '[data-bio-link="instagram"]', attribute: 'href', enabled: true },
        { key: 'maps_link', label: 'Google Maps Escritório', type: 'maps', selector: '[data-bio-link="maps_link"]', attribute: 'href', enabled: true },
        { key: 'address_text', label: 'Endereço do Escritório', type: 'text', selector: '[data-bio-text="address_text"]', attribute: 'textContent', enabled: true },
        { key: 'css_--primary', label: 'Cor de Destaque', type: 'color', cssVarName: '--primary', defaultValue: '#3b82f6', enabled: true },
      ],
    },
    themeMetadata: {
      cssVariables: {
        '--primary': '#3b82f6',
        '--secondary': '#60a5fa',
        '--background': '#080d16',
        '--surface': '#101927',
      },
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    templateId: 'tpl-premium-gold',
    name: 'Black Diamond Luxury Bio',
    nicheId: 'modelos-premium',
    nicheName: 'Modelos Premium',
    version: 1,
    status: 'published',
    sourceHtml: `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Maison Élite</title>
  <style>
    :root {
      --primary: #36FF88;
      --secondary: #00E86B;
      --background: #050706;
      --surface: #0B0F0D;
      --text: #F5FFF8;
      --muted: #87938B;
      --glow: rgba(54, 255, 136, 0.4);
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: radial-gradient(circle at top, #111e15 0%, #050706 70%);
      color: var(--text);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      min-height: 100vh;
      display: flex;
      justify-content: center;
      padding: 30px 16px;
    }
    .container {
      width: 100%;
      max-width: 440px;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }
    .avatar-wrapper {
      width: 110px;
      height: 110px;
      border-radius: 50%;
      padding: 2px;
      background: linear-gradient(135deg, var(--primary), transparent);
      box-shadow: 0 0 35px var(--glow);
      margin: 0 auto 18px;
    }
    .avatar-img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      object-fit: cover;
    }
    h1 {
      font-size: 26px;
      font-weight: 800;
      letter-spacing: -0.5px;
      color: #fff;
      margin-bottom: 6px;
    }
    .badge {
      font-size: 11px;
      letter-spacing: 3px;
      color: var(--primary);
      text-transform: uppercase;
      font-weight: 700;
      margin-bottom: 12px;
    }
    .bio {
      font-size: 14px;
      color: var(--muted);
      line-height: 1.6;
      margin-bottom: 24px;
      max-width: 320px;
    }
    .btn-exclusive {
      width: 100%;
      padding: 16px;
      background: var(--surface);
      border: 1px solid var(--primary);
      color: var(--primary);
      font-weight: 700;
      border-radius: 14px;
      text-decoration: none;
      box-shadow: 0 0 25px rgba(54, 255, 136, 0.2);
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      transition: all 0.2s;
    }
    .btn-exclusive:hover {
      background: var(--primary);
      color: #050706;
      box-shadow: 0 0 35px var(--glow);
    }
    .links-box {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-bottom: 24px;
    }
    .link-item {
      padding: 15px 20px;
      background: var(--surface);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      color: var(--text);
      text-decoration: none;
      font-size: 14px;
      font-weight: 500;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .footer {
      font-size: 12px;
      color: var(--muted);
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="avatar-wrapper">
      <img class="avatar-img" data-bio-image="logo" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80" alt="Maison Élite">
    </div>
    <div class="badge">PRIVATE CLUB • LUXO & DESIGN</div>
    <h1 data-bio-text="title_main">Maison Élite Exclusive</h1>
    <p class="bio" data-bio-text="subtitle">Experiências sob medida, alta joalheria e curadoria exclusiva para membros selecionados.</p>

    <a class="btn-exclusive" data-bio-link="whatsapp" href="https://wa.me/5511955555555?text=Ol%C3%A1,%20gostaria%20de%20acesso%20exclusivo.">
      <span>💎</span>
      <span>SOLICITAR CONVITE EXCLUSIVO</span>
    </a>

    <div class="links-box">
      <a class="link-item" data-bio-link="instagram" href="https://instagram.com/maison_elite" target="_blank">
        <span>📸 Curadoria Visual no Instagram</span>
        <span>→</span>
      </a>
      <a class="link-item" data-bio-link="maps_link" href="https://maps.google.com" target="_blank">
        <span>📍 Salão Privado de Atendimento</span>
        <span>→</span>
      </a>
    </div>

    <div class="footer">
      <p data-bio-text="address_text">Atendimento exclusivo com hora marcada em São Paulo & Paris</p>
    </div>
  </div>
</body>
</html>`,
    editorSchema: {
      fields: [
        { key: 'logo', label: 'Foto / Emblema da Marca', type: 'logo', selector: '[data-bio-image="logo"]', attribute: 'src', enabled: true },
        { key: 'title_main', label: 'Nome da Marca / Criador', type: 'text', selector: '[data-bio-text="title_main"]', attribute: 'textContent', enabled: true },
        { key: 'subtitle', label: 'Bio / Posicionamento de Marca', type: 'textarea', selector: '[data-bio-text="subtitle"]', attribute: 'textContent', enabled: true },
        { key: 'whatsapp', label: 'WhatsApp (Concierge)', type: 'whatsapp', selector: '[data-bio-link="whatsapp"]', attribute: 'href', enabled: true },
        { key: 'instagram', label: 'Instagram', type: 'instagram', selector: '[data-bio-link="instagram"]', attribute: 'href', enabled: true },
        { key: 'maps_link', label: 'Google Maps / Localização Privada', type: 'maps', selector: '[data-bio-link="maps_link"]', attribute: 'href', enabled: true },
        { key: 'address_text', label: 'Texto de Localização & Horários', type: 'text', selector: '[data-bio-text="address_text"]', attribute: 'textContent', enabled: true },
        { key: 'css_--primary', label: 'Cor de Destaque Neon', type: 'color', cssVarName: '--primary', defaultValue: '#36FF88', enabled: true },
      ],
    },
    themeMetadata: {
      cssVariables: {
        '--primary': '#36FF88',
        '--secondary': '#00E86B',
        '--background': '#050706',
        '--surface': '#0B0F0D',
      },
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    templateId: 'tpl-chatbot-funnel',
    name: 'Smart Funnel Conversacional',
    nicheId: 'modelos-chatbot',
    nicheName: 'Modelos Chatbot',
    version: 1,
    status: 'published',
    sourceHtml: `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assistente Virtual Interativo</title>
  <style>
    :root {
      --primary: #38bdf8;
      --secondary: #818cf8;
      --background: #090d16;
      --surface: #111827;
      --text: #f0f9ff;
      --muted: #94a3b8;
      --glow: rgba(56, 189, 248, 0.35);
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: var(--background);
      color: var(--text);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      min-height: 100vh;
      display: flex;
      justify-content: center;
      padding: 24px 16px;
    }
    .container {
      width: 100%;
      max-width: 440px;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .bot-header {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-bottom: 20px;
      text-align: center;
    }
    .bot-avatar {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      border: 3px solid var(--primary);
      box-shadow: 0 0 20px var(--glow);
      margin-bottom: 12px;
      object-fit: cover;
    }
    .bot-name { font-size: 20px; font-weight: 700; color: #fff; margin-bottom: 4px; }
    .bot-status {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      color: #38bdf8;
      background: rgba(56, 189, 248, 0.1);
      padding: 4px 12px;
      border-radius: 99px;
    }
    .dot { width: 7px; height: 7px; background: #38bdf8; border-radius: 50%; }
    .chat-box {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-bottom: 24px;
    }
    .bubble {
      max-width: 85%;
      padding: 12px 16px;
      border-radius: 16px;
      font-size: 14px;
      line-height: 1.5;
    }
    .bubble-bot {
      align-self: flex-start;
      background: var(--surface);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-bottom-left-radius: 4px;
      color: #e2e8f0;
    }
    .actions-grid {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .action-btn {
      width: 100%;
      padding: 14px 16px;
      background: rgba(56, 189, 248, 0.1);
      border: 1px solid var(--primary);
      border-radius: 12px;
      color: #fff;
      font-weight: 600;
      font-size: 14px;
      text-decoration: none;
      display: flex;
      align-items: center;
      justify-content: space-between;
      transition: all 0.2s;
    }
    .action-btn:hover {
      background: var(--primary);
      color: #090d16;
    }
    .footer {
      font-size: 12px;
      color: var(--muted);
      margin-top: 24px;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="bot-header">
      <img class="bot-avatar" data-bio-image="logo" src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=80" alt="Assistente">
      <h1 class="bot-name" data-bio-text="title_main">Atendimento Express 24h</h1>
      <div class="bot-status"><span class="dot"></span> <span data-bio-text="bot_status">Online agora para te ajudar</span></div>
    </div>

    <div class="chat-box" id="bio-chat-messages">
      <div class="bubble bubble-bot" data-bio-text="subtitle">
        Olá! Sou o assistente automático. Como posso agilizar seu atendimento hoje? Escolha uma das opções abaixo:
      </div>
    </div>

    <div class="actions-grid" id="bio-chat-actions">
      <a class="action-btn" data-bio-link="whatsapp" href="https://wa.me/5511944444444?text=Ol%C3%A1!%20Gostaria%20de%20saber%20valores%20e%20planos.">
        <span data-bio-text="opt_1_label">💰 1. Quero saber valores e planos</span>
        <span>→</span>
      </a>
      <a class="action-btn" data-bio-link="instagram" href="https://wa.me/5511944444444?text=Ol%C3%A1!%20Quero%20falar%20com%20um%20especialista.">
        <span data-bio-text="opt_2_label">👨‍💻 2. Falar com atendente humano</span>
        <span>→</span>
      </a>
      <a class="action-btn" data-bio-link="maps_link" href="https://maps.google.com">
        <span data-bio-text="opt_3_label">📍 3. Endereço e rotas de acesso</span>
        <span>→</span>
      </a>
    </div>

    <div class="footer">
      <p data-bio-text="address_text">Atendimento automatizado com resposta em menos de 1 minuto</p>
    </div>
  </div>
</body>
</html>`,
    editorSchema: {
      fields: [
        { key: 'logo', label: 'Foto / Avatar do Assistente', type: 'logo', selector: '[data-bio-image="logo"]', attribute: 'src', enabled: true },
        { key: 'title_main', label: 'Nome do Assistente / Canal', type: 'text', selector: '[data-bio-text="title_main"]', attribute: 'textContent', enabled: true },
        { key: 'bot_status', label: 'Status do Assistente', type: 'text', selector: '[data-bio-text="bot_status"]', attribute: 'textContent', enabled: true, defaultValue: 'Online agora para te ajudar' },
        { key: 'subtitle', label: 'Mensagem de Abertura do Chat', type: 'textarea', selector: '[data-bio-text="subtitle"]', attribute: 'textContent', enabled: true },
        { key: 'opt_1_label', label: 'Texto Opção 1', type: 'text', selector: '[data-bio-text="opt_1_label"]', attribute: 'textContent', enabled: true, defaultValue: '💰 1. Quero saber valores e planos' },
        { key: 'whatsapp', label: 'WhatsApp Principal (Opção 1)', type: 'whatsapp', selector: '[data-bio-link="whatsapp"]', attribute: 'href', enabled: true },
        { key: 'opt_2_label', label: 'Texto Opção 2', type: 'text', selector: '[data-bio-text="opt_2_label"]', attribute: 'textContent', enabled: true, defaultValue: '👨‍💻 2. Falar com atendente humano' },
        { key: 'instagram', label: 'Link Atendente Humano (Opção 2)', type: 'whatsapp', selector: '[data-bio-link="instagram"]', attribute: 'href', enabled: true },
        { key: 'opt_3_label', label: 'Texto Opção 3', type: 'text', selector: '[data-bio-text="opt_3_label"]', attribute: 'textContent', enabled: true, defaultValue: '📍 3. Endereço e rotas de acesso' },
        { key: 'maps_link', label: 'Link de Localização (Opção 3)', type: 'maps', selector: '[data-bio-link="maps_link"]', attribute: 'href', enabled: true },
        { key: 'address_text', label: 'Rodapé Informativo', type: 'text', selector: '[data-bio-text="address_text"]', attribute: 'textContent', enabled: true },
        { key: 'css_--primary', label: 'Cor de Destaque Bot', type: 'color', cssVarName: '--primary', defaultValue: '#38bdf8', enabled: true },
      ],
    },
    themeMetadata: {
      cssVariables: {
        '--primary': '#38bdf8',
        '--secondary': '#818cf8',
        '--background': '#090d16',
        '--surface': '#111827',
      },
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];
