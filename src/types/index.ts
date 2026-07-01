// ============================
// Wyniki Badań — Types
// ============================

export interface TestParameter {
  name: string;
  unit: string;
  referenceRange: string;
  category: string;
  tags?: string[];
}

export interface TestResult {
  id: string;
  date: string; // YYYY-MM-DD
  parameter: string;
  value: number;
  unit: string;
  referenceRange: string;
  category: string;
  notes: string;
}

export type RangeStatus = 'normal' | 'low' | 'high' | 'unknown';

export interface ParsedRange {
  min: number | null;
  max: number | null;
}

export const CATEGORIES = ['Krew', 'Tarczyca', 'Lipidy', 'Hormony', 'Mocz', 'Inne'] as const;
export type Category = typeof CATEGORIES[number];

export const CATEGORY_COLORS: Record<string, string> = {
  'Krew': '#ff7675',
  'Tarczyca': '#74b9ff',
  'Lipidy': '#ffeaa7',
  'Hormony': '#a29bfe',
  'Mocz': '#55efc4',
  'Inne': '#b2bec3',
};

export const CATEGORY_ICONS: Record<string, string> = {
  'Krew': '🩸',
  'Tarczyca': '🦋',
  'Lipidy': '🥑',
  'Hormony': '🧬',
  'Mocz': '🧪',
  'Inne': '📦',
};
