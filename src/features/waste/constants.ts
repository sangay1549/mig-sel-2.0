import type { WasteCategory } from '@/features/waste/types';

export const CATEGORIES: { value: WasteCategory; label: string; color: string }[] = [
  { value: 'organic-food', label: 'Organic/Food waste', color: '#16a34a' },
  { value: 'paper-cardboard', label: 'Paper & Cardboard', color: '#2563eb' },
  { value: 'plastic-soft-packaging', label: 'Plastic soft packaging', color: '#eab308' },
  { value: 'plastic-pet-hdpe', label: 'Plastic (PET&HDPE)', color: '#f97316' },
  { value: 'textile', label: 'Textile', color: '#ec4899' },
  { value: 'glass', label: 'Glass', color: '#06b6d4' },
  { value: 'metal-aluminum', label: 'Metal, Aluminum', color: '#8b5cf6' },
  { value: 'e-waste', label: 'E-waste', color: '#ef4444' },
  { value: 'infectious-waste', label: 'Infectious waste', color: '#dc2626' },
  { value: 'leather-rubber', label: 'Leather, Rubber', color: '#78716c' },
  { value: 'wood', label: 'Wood', color: '#d97706' },
  { value: 'sanitary-waste', label: 'Sanitary waste', color: '#a1a1aa' },
  { value: 'green-plant-materials', label: 'Green plant materials', color: '#22c55e' },
  { value: 'construction-demolition', label: 'Construction & Demolition wastes', color: '#92400e' },
];

export const CATEGORY_LABELS: Record<WasteCategory, string> = {
  'organic-food': 'Organic/Food waste',
  'paper-cardboard': 'Paper & Cardboard',
  'plastic-soft-packaging': 'Plastic soft packaging',
  'plastic-pet-hdpe': 'Plastic (PET&HDPE)',
  textile: 'Textile',
  glass: 'Glass',
  'metal-aluminum': 'Metal, Aluminum',
  'e-waste': 'E-waste',
  'infectious-waste': 'Infectious waste',
  'leather-rubber': 'Leather, Rubber',
  wood: 'Wood',
  'sanitary-waste': 'Sanitary waste',
  'green-plant-materials': 'Green plant materials',
  'construction-demolition': 'Construction & Demolition wastes',
};

export const CATEGORY_COLORS: Record<WasteCategory, string> = {
  'organic-food': '#22c55e',
  'paper-cardboard': '#3b82f6',
  'plastic-soft-packaging': '#eab308',
  'plastic-pet-hdpe': '#f97316',
  textile: '#ec4899',
  glass: '#06b6d4',
  'metal-aluminum': '#a855f7',
  'e-waste': '#ef4444',
  'infectious-waste': '#be123c',
  'leather-rubber': '#78716c',
  wood: '#d97706',
  'sanitary-waste': '#94a3b8',
  'green-plant-materials': '#10b981',
  'construction-demolition': '#92400e',
};
