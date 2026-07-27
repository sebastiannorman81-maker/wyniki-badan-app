import { TestParameter, TestResult } from '../types';

export interface CompactExport {
  p: [string, string, string, string, string]; // name, unit, range, category, tags (comma-separated)
  r: [string, number, string][]; // array of [date, value, notes]
}

export function serializeIndicator(param: TestParameter, results: TestResult[]): string {
  const paramResults = results.filter(r => r.parameter === param.name);
  const compact: CompactExport = {
    p: [
      param.name,
      param.unit,
      param.referenceRange,
      param.category,
      param.tags ? param.tags.join(',') : '',
    ],
    r: paramResults.map(r => [r.date, r.value, r.notes]),
  };
  return JSON.stringify(compact);
}

export function deserializeIndicator(serialized: string): { param: TestParameter; results: TestResult[] } {
  try {
    const compact: CompactExport = JSON.parse(serialized.trim());
    if (!compact.p || !Array.isArray(compact.p) || !compact.r || !Array.isArray(compact.r)) {
      throw new Error('Nieprawidłowy format kodu wskaźnika');
    }

    const param: TestParameter = {
      name: compact.p[0],
      unit: compact.p[1],
      referenceRange: compact.p[2],
      category: compact.p[3],
      tags: compact.p[4] ? compact.p[4].split(',').map(t => t.trim()).filter(Boolean) : [],
    };

    const results: TestResult[] = compact.r.map((r, idx) => ({
      id: `test_import_${Date.now()}_${idx}`,
      date: r[0],
      parameter: param.name,
      value: r[1],
      unit: param.unit,
      referenceRange: param.referenceRange,
      category: param.category,
      notes: r[2] || '',
    }));

    return { param, results };
  } catch (err) {
    throw new Error('Nie udało się rozszyfrować kodu. Upewnij się, że kod jest poprawny.');
  }
}
