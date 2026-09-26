import React from 'react';

interface NicheIconProps {
  name: string;
  className?: string;
  size?: number;
}

export const NicheIcon: React.FC<NicheIconProps> = ({ name, className = '', size = 48 }) => {
  const s = size;

  switch (name) {
    case 'barber':
      // Barbearia: Máquina / Tesoura 3D estilizada
      return (
        <svg width={s} height={s} viewBox="0 0 64 64" fill="none" className={className}>
          <defs>
            <linearGradient id="barber-grad1" x1="12" y1="8" x2="52" y2="56" gradientUnits="userSpaceOnUse">
              <stop stopColor="#36FF88" />
              <stop offset="1" stopColor="#00662B" />
            </linearGradient>
            <linearGradient id="barber-grad2" x1="10" y1="10" x2="40" y2="40" gradientUnits="userSpaceOnUse">
              <stop stopColor="#E2FFF0" />
              <stop offset="1" stopColor="#36FF88" />
            </linearGradient>
            <filter id="glow-b" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#36FF88" floodOpacity="0.4" />
            </filter>
          </defs>
          {/* Scissors blades crossing with depth */}
          <path d="M18 10L36 34M46 10L28 34" stroke="url(#barber-grad2)" strokeWidth="4.5" strokeLinecap="round" filter="url(#glow-b)" />
          {/* Clipper body / pivot */}
          <circle cx="32" cy="30" r="5" fill="#111713" stroke="#36FF88" strokeWidth="2.5" />
          {/* Handles */}
          <circle cx="20" cy="46" r="9" stroke="url(#barber-grad1)" strokeWidth="4" fill="#0B0F0D" />
          <circle cx="44" cy="46" r="9" stroke="url(#barber-grad1)" strokeWidth="4" fill="#0B0F0D" />
          <path d="M25 40L30 33M39 40L34 33" stroke="url(#barber-grad2)" strokeWidth="3.5" strokeLinecap="round" />
        </svg>
      );

    case 'beauty':
      // Beleza & Estética: Elemento de beleza 3D (flor de lótus / cosmético cintilante)
      return (
        <svg width={s} height={s} viewBox="0 0 64 64" fill="none" className={className}>
          <defs>
            <linearGradient id="beauty-grad" x1="32" y1="8" x2="32" y2="56" gradientUnits="userSpaceOnUse">
              <stop stopColor="#36FF88" />
              <stop offset="0.5" stopColor="#00E86B" />
              <stop offset="1" stopColor="#004D20" />
            </linearGradient>
            <filter id="glow-beauty">
              <feDropShadow dx="0" dy="3" stdDeviation="5" floodColor="#36FF88" floodOpacity="0.5" />
            </filter>
          </defs>
          {/* Central petal */}
          <path d="M32 10C24 24 24 38 32 50C40 38 40 24 32 10Z" fill="url(#beauty-grad)" filter="url(#glow-beauty)" />
          {/* Left petal */}
          <path d="M28 22C14 26 12 40 24 48C28 40 30 32 28 22Z" fill="#111713" stroke="#36FF88" strokeWidth="2.5" />
          {/* Right petal */}
          <path d="M36 22C50 26 52 40 40 48C36 40 34 32 36 22Z" fill="#111713" stroke="#36FF88" strokeWidth="2.5" />
          {/* Sparkle star */}
          <circle cx="32" cy="28" r="3.5" fill="#FFFFFF" />
          <circle cx="48" cy="18" r="2" fill="#36FF88" />
        </svg>
      );

    case 'food':
      // Gastronomia & Delivery: Prato com talheres 3D
      return (
        <svg width={s} height={s} viewBox="0 0 64 64" fill="none" className={className}>
          <defs>
            <linearGradient id="food-grad" x1="10" y1="10" x2="54" y2="54" gradientUnits="userSpaceOnUse">
              <stop stopColor="#36FF88" />
              <stop offset="1" stopColor="#0B0F0D" />
            </linearGradient>
          </defs>
          {/* Outer plate glow */}
          <circle cx="32" cy="34" r="22" stroke="#36FF88" strokeWidth="3" fill="#111713" />
          <circle cx="32" cy="34" r="15" stroke="rgba(54, 255, 136, 0.4)" strokeWidth="2" strokeDasharray="3 3" fill="#0B0F0D" />
          {/* Cloche / cover dome handle or utensils */}
          <path d="M16 14L16 46M12 14L20 14" stroke="#36FF88" strokeWidth="3" strokeLinecap="round" />
          <path d="M48 14L48 46M44 14C44 22 52 22 52 14" stroke="#36FF88" strokeWidth="3" strokeLinecap="round" />
          <circle cx="32" cy="34" r="6" fill="#36FF88" fillOpacity="0.8" />
        </svg>
      );

    case 'store':
      // Loja & Comércio: Sacola de compras 3D
      return (
        <svg width={s} height={s} viewBox="0 0 64 64" fill="none" className={className}>
          <defs>
            <linearGradient id="store-grad" x1="14" y1="20" x2="50" y2="56" gradientUnits="userSpaceOnUse">
              <stop stopColor="#18221C" />
              <stop offset="1" stopColor="#0B0F0D" />
            </linearGradient>
          </defs>
          {/* Handle */}
          <path d="M24 24V16C24 11.58 27.58 8 32 8C36.42 8 40 11.58 40 16V24" stroke="#36FF88" strokeWidth="4" strokeLinecap="round" />
          {/* Bag body */}
          <path d="M14 22H50L46 54H18L14 22Z" fill="url(#store-grad)" stroke="#36FF88" strokeWidth="3" />
          {/* Bag badge / tag */}
          <path d="M26 34L32 40L38 34" stroke="#36FF88" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );

    case 'education':
      // Formação Acadêmica: Capelo / Livro 3D
      return (
        <svg width={s} height={s} viewBox="0 0 64 64" fill="none" className={className}>
          {/* Mortarboard cap */}
          <polygon points="32,12 56,22 32,32 8,22" fill="#111713" stroke="#36FF88" strokeWidth="3.5" strokeLinejoin="round" />
          {/* Skullcap underneath */}
          <path d="M18 27V38C18 44 32 48 32 48C32 48 46 44 46 38V27" stroke="#36FF88" strokeWidth="3" fill="#0B0F0D" />
          {/* Tassel */}
          <path d="M48 24V40C48 42 50 43 51 43" stroke="#00E86B" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="51" cy="45" r="2.5" fill="#36FF88" />
        </svg>
      );

    case 'services':
      // Serviços Profissionais: Maleta 3D tecnológica
      return (
        <svg width={s} height={s} viewBox="0 0 64 64" fill="none" className={className}>
          {/* Handle */}
          <rect x="25" y="10" width="14" height="8" rx="3" stroke="#36FF88" strokeWidth="3" fill="none" />
          {/* Briefcase Body */}
          <rect x="10" y="18" width="44" height="34" rx="6" fill="#111713" stroke="#36FF88" strokeWidth="3" />
          {/* Central metallic latch & horizontal band */}
          <line x1="10" y1="34" x2="54" y2="34" stroke="rgba(54,255,136,0.4)" strokeWidth="2" />
          <rect x="28" y="30" width="8" height="8" rx="2" fill="#36FF88" />
        </svg>
      );

    case 'premium':
      // Modelos Premium: Diamante lapidado 3D
      return (
        <svg width={s} height={s} viewBox="0 0 64 64" fill="none" className={className}>
          <defs>
            <linearGradient id="diamond-grad" x1="32" y1="12" x2="32" y2="52" gradientUnits="userSpaceOnUse">
              <stop stopColor="#36FF88" />
              <stop offset="1" stopColor="#0B0F0D" />
            </linearGradient>
          </defs>
          <polygon points="20,14 44,14 54,26 32,52 10,26" fill="url(#diamond-grad)" stroke="#36FF88" strokeWidth="3" strokeLinejoin="round" />
          <line x1="10" y1="26" x2="54" y2="26" stroke="#FFFFFF" strokeWidth="2" strokeOpacity="0.8" />
          <line x1="20" y1="14" x2="32" y2="52" stroke="#36FF88" strokeWidth="2" />
          <line x1="44" y1="14" x2="32" y2="52" stroke="#36FF88" strokeWidth="2" />
          <circle cx="32" cy="18" r="3" fill="#FFFFFF" />
        </svg>
      );

    case 'chatbot':
      // Modelos Chatbot: Balão de Chat 3D / Robô conversacional
      return (
        <svg width={s} height={s} viewBox="0 0 64 64" fill="none" className={className}>
          {/* Chat bubble body */}
          <path d="M12 20C12 14.4772 16.4772 10 22 10H42C47.5228 10 52 14.4772 52 20V34C52 39.5228 47.5228 44 42 44H26L16 52V44H22C16.4772 44 12 39.5228 12 34V20Z" fill="#111713" stroke="#36FF88" strokeWidth="3" />
          {/* Eyes / conversation dots */}
          <circle cx="24" cy="27" r="3.5" fill="#36FF88" />
          <circle cx="32" cy="27" r="3.5" fill="#36FF88" />
          <circle cx="40" cy="27" r="3.5" fill="#36FF88" />
          {/* Antenna */}
          <line x1="32" y1="10" x2="32" y2="4" stroke="#36FF88" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="32" cy="4" r="2" fill="#00E86B" />
        </svg>
      );

    case 'health':
      // Saúde & Bem-Estar: Coração 3D com linha de pulso vital
      return (
        <svg width={s} height={s} viewBox="0 0 64 64" fill="none" className={className}>
          {/* Heart body */}
          <path d="M32 50S12 36 12 22A10 10 0 0 1 32 16A10 10 0 0 1 52 22C52 36 32 50 32 50Z" fill="#111713" stroke="#36FF88" strokeWidth="3" strokeLinejoin="round" />
          {/* Heartbeat pulse */}
          <path d="M16 28H24L28 20L34 38L38 28H48" stroke="#36FF88" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );

    case 'creators':
    default:
      // Portfólio & Criadores: Câmera fotográfica / Lente 3D com brilho
      return (
        <svg width={s} height={s} viewBox="0 0 64 64" fill="none" className={className}>
          {/* Flash notch */}
          <path d="M26 14H38L41 18H23L26 14Z" fill="#36FF88" />
          {/* Camera body */}
          <rect x="10" y="18" width="44" height="32" rx="6" fill="#111713" stroke="#36FF88" strokeWidth="3" />
          {/* Lens */}
          <circle cx="32" cy="34" r="10" stroke="#36FF88" strokeWidth="3" fill="#0B0F0D" />
          <circle cx="32" cy="34" r="5" fill="#36FF88" />
          <circle cx="46" cy="25" r="2.5" fill="#36FF88" />
        </svg>
      );
  }
};
