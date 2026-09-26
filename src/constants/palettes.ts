export interface ColorPalettePreset {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    muted: string;
  };
}

export const PRESET_PALETTES: ColorPalettePreset[] = [
  {
    id: 'black-gold',
    name: 'Preto + Dourado VIP',
    colors: {
      primary: '#d4af37',
      secondary: '#f3e5ab',
      background: '#0d0e0d',
      surface: '#171917',
      text: '#f9f6ee',
      muted: '#9e9885',
    },
  },
  {
    id: 'black-neon-green',
    name: 'Preto + Verde Neon Cyber',
    colors: {
      primary: '#36FF88',
      secondary: '#00E86B',
      background: '#050706',
      surface: '#0B0F0D',
      text: '#F5FFF8',
      muted: '#87938B',
    },
  },
  {
    id: 'blue-white',
    name: 'Azul Noturno + Branco',
    colors: {
      primary: '#38bdf8',
      secondary: '#818cf8',
      background: '#070c14',
      surface: '#0f172a',
      text: '#f8fafc',
      muted: '#94a3b8',
    },
  },
  {
    id: 'purple-black',
    name: 'Roxo Royal + Preto',
    colors: {
      primary: '#a855f7',
      secondary: '#ec4899',
      background: '#09050d',
      surface: '#150d1e',
      text: '#faf5ff',
      muted: '#a89bb0',
    },
  },
  {
    id: 'red-black',
    name: 'Vermelho Carmim + Preto',
    colors: {
      primary: '#ef4444',
      secondary: '#f97316',
      background: '#0c0707',
      surface: '#181010',
      text: '#fef2f2',
      muted: '#a38f8f',
    },
  },
  {
    id: 'rose-gold',
    name: 'Rosé Gold + Veludo',
    colors: {
      primary: '#f472b6',
      secondary: '#fb7185',
      background: '#0c080b',
      surface: '#191117',
      text: '#fdf2f8',
      muted: '#a89bb0',
    },
  },
  {
    id: 'minimal-graphite',
    name: 'Grafite + Prata Puro',
    colors: {
      primary: '#e2e8f0',
      secondary: '#94a3b8',
      background: '#0b0d0e',
      surface: '#14181b',
      text: '#ffffff',
      muted: '#64748b',
    },
  },
];
