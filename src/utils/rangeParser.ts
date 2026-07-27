import { ParsedRange, RangeStatus } from '../types';

/**
 * Parsuje string zakresu referencyjnego na obiekt {min, max}.
 * Obsługuje formaty: "0.27 - 4.2", "< 190", "> 50"
 */
export function parseRange(rangeStr: string): ParsedRange | null {
  if (!rangeStr) return null;

  // Format: X - Y
  const dashMatch = rangeStr.match(/([\d.]+)\s*-\s*([\d.]+)/);
  if (dashMatch) {
    return { min: parseFloat(dashMatch[1]), max: parseFloat(dashMatch[2]) };
  }

  // Format: < X
  const ltMatch = rangeStr.match(/<\s*([\d.]+)/);
  if (ltMatch) {
    return { min: null, max: parseFloat(ltMatch[1]) };
  }

  // Format: > X
  const gtMatch = rangeStr.match(/>\s*([\d.]+)/);
  if (gtMatch) {
    return { min: parseFloat(gtMatch[1]), max: null };
  }

  return null;
}

/**
 * Sprawdza status wartości względem zakresu referencyjnego.
 */
export function checkRangeStatus(value: number, rangeStr: string): RangeStatus {
  const range = parseRange(rangeStr);
  if (!range) return 'unknown';

  if (range.min !== null && value < range.min) return 'low';
  if (range.max !== null && value > range.max) return 'high';
  return 'normal';
}

/**
 * Zwraca kolory i etykietę statusu.
 */
export function getStatusInfo(status: RangeStatus): { bg: string; text: string; label: string } {
  switch (status) {
    case 'normal':
      return { bg: 'rgba(85,239,196,0.15)', text: '#55efc4', label: 'W normie' };
    case 'low':
      return { bg: 'rgba(116,185,255,0.15)', text: '#74b9ff', label: 'Poniżej normy' };
    case 'high':
      return { bg: 'rgba(255,118,117,0.15)', text: '#ff7675', label: 'Powyżej normy' };
    default:
      return { bg: 'rgba(255,255,255,0.05)', text: '#8b8da8', label: 'Brak normy' };
  }
}
