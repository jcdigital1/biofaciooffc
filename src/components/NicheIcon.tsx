import React from 'react';

interface NicheIconProps {
  name: string;
  className?: string;
  size?: number;
}

export const NICHE_EMOJIS: Record<string, string> = {
  // 💈 Barbearia
  barber: '💈',
  barbearia: '💈',

  // 💅 Beleza & Estética
  beauty: '💅',
  'beleza-estetica': '💅',

  // 🍕 Gastronomia & Delivery
  food: '🍕',
  'gastronomia-delivery': '🍕',

  // 🛍️ Loja & Comércio
  store: '🛍️',
  'loja-comercio': '🛍️',

  // 🎓 Formação Acadêmica
  education: '🎓',
  'formacao-academica': '🎓',

  // 🧰 Serviços Profissionais
  services: '🧰',
  'servicos-profissionais': '🧰',

  // 💎 Modelos Premium
  premium: '💎',
  'modelos-premium': '💎',

  // 💬 Modelos Chatbot
  chatbot: '💬',
  'modelos-chatbot': '💬',

  // 📱 Cardápios Digital (substitui Saúde & Bem-Estar)
  menu: '📱',
  health: '📱',
  'cardapios-digital': '📱',
  'saude-bem-estar': '📱',

  // 🎨 Portfólios
  creators: '🎨',
  'portfolio-criadores': '🎨',
  portfolios: '🎨',
};

export const NicheIcon: React.FC<NicheIconProps> = ({ name, className = '', size = 34 }) => {
  const emoji = NICHE_EMOJIS[name] || NICHE_EMOJIS[name.toLowerCase()] || '💎';

  return (
    <div
      className={`inline-flex items-center justify-center rounded-2xl bg-[#111713]/90 border border-[#1e2a22] shadow-[0_4px_12px_rgba(0,0,0,0.4)] select-none transition-transform duration-200 group-hover:scale-110 group-hover:border-[#36FF88]/40 ${className}`}
      style={{
        width: `${size + 16}px`,
        height: `${size + 16}px`,
      }}
    >
      <span
        className="transform-gpu filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] leading-none"
        style={{
          fontSize: `${size}px`,
          lineHeight: 1,
        }}
        role="img"
        aria-label={name}
      >
        {emoji}
      </span>
    </div>
  );
};
