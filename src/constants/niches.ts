import { NicheInfo } from '../types';

export const OFFICIAL_NICHES: NicheInfo[] = [
  {
    id: 'barbearia',
    name: 'Barbearia',
    slug: 'barbearia',
    description: 'Cortes, barbas, agendamentos e catálogo de estilo masculino',
    iconName: 'barber',
  },
  {
    id: 'beleza-estetica',
    name: 'Beleza & Estética',
    slug: 'beleza-estetica',
    description: 'Salões de beleza, estética, spas, unhas e cuidados pessoais',
    iconName: 'beauty',
  },
  {
    id: 'gastronomia-delivery',
    name: 'Gastronomia & Delivery',
    slug: 'gastronomia-delivery',
    description: 'Cardápios digitais, restaurantes, lanchonetes e pedidos via WhatsApp',
    iconName: 'food',
  },
  {
    id: 'loja-comercio',
    name: 'Loja & Comércio',
    slug: 'loja-comercio',
    description: 'Vitrine virtual, produtos em destaque e catálogo de vendas',
    iconName: 'store',
  },
  {
    id: 'formacao-academica',
    name: 'Formação Acadêmica',
    slug: 'formacao-academica',
    description: 'Cursos, mentorias, professores, workshops e e-books',
    iconName: 'education',
  },
  {
    id: 'servicos-profissionais',
    name: 'Serviços Profissionais',
    slug: 'servicos-profissionais',
    description: 'Advogados, contadores, consultores, corretores e engenheiros',
    iconName: 'services',
  },
  {
    id: 'modelos-premium',
    name: 'Modelos Premium',
    slug: 'modelos-premium',
    description: 'Biosites de alto padrão, visual cinematográfico e luxo',
    iconName: 'premium',
  },
  {
    id: 'modelos-chatbot',
    name: 'Modelos Chatbot',
    slug: 'modelos-chatbot',
    description: 'Biosites conversacionais, funil interativo e captação rápida',
    iconName: 'chatbot',
  },
  {
    id: 'cardapios-digital',
    name: 'Cardápios Digital',
    slug: 'cardapios-digital',
    description: 'Cardápios interativos, combos, vitrine de produtos e pedidos diretos',
    iconName: 'menu',
  },
  {
    id: 'portfolio-criadores',
    name: 'Portfólios',
    slug: 'portfolio-criadores',
    description: 'Designers, fotógrafos, videomakers, influenciadores e artistas',
    iconName: 'creators',
  },
];

/**
 * Matches a template's nicheId with a target nicheId, seamlessly supporting
 * any legacy models created under 'saude-bem-estar' so they map to 'cardapios-digital'.
 */
export function matchTemplateNiche(templateNicheId: string, targetNicheId: string): boolean {
  if (templateNicheId === targetNicheId) return true;
  if (targetNicheId === 'cardapios-digital' && templateNicheId === 'saude-bem-estar') return true;
  if (targetNicheId === 'saude-bem-estar' && templateNicheId === 'cardapios-digital') return true;
  if (targetNicheId === 'portfolio-criadores' && (templateNicheId === 'portfolio-criadores' || templateNicheId === 'portfolios')) return true;
  return false;
}

/**
 * Normalizes niche display name, safely handling legacy names like 'saude-bem-estar' and 'Portfólio & Criadores'.
 */
export function getNormalizedNicheName(nicheId: string, currentName?: string): string {
  if (nicheId === 'cardapios-digital' || nicheId === 'saude-bem-estar') {
    return 'Cardápios Digital';
  }
  if (nicheId === 'portfolio-criadores' || currentName === 'Portfólio & Criadores' || currentName === 'portfolio-criadores') {
    return 'Portfólios';
  }
  const found = OFFICIAL_NICHES.find((n) => n.id === nicheId);
  return found?.name || currentName || nicheId;
}
