import { TestParameter, TestResult, CATEGORIES } from '../types';

export interface ExtractedData {
  date: string;
  parameterName: string;
  value: string;
  unit: string;
  refRange: string;
  category: string;
}

// Expanded known parameters and their default categories
export const PARAM_CAT_MAP: Record<string, string> = {
  // Wątrobowe
  ASPAT: 'Wątrobowe',
  AST: 'Wątrobowe',
  ALAT: 'Wątrobowe',
  ALT: 'Wątrobowe',
  GGTP: 'Wątrobowe',
  // Tarczyca
  TSH: 'Tarczyca',
  FT3: 'Tarczyca',
  FT4: 'Tarczyca',
  // Lipidy
  CHOLESTEROL: 'Lipidy',
  HDL: 'Lipidy',
  LDL: 'Lipidy',
  TRIGLICERYDY: 'Lipidy',
  // Mocz
  MOCZ: 'Mocz',
  // Krew / Morfologia
  GLUKOZA: 'Krew',
  HEMOGLOBINA: 'Krew',
  HGB: 'Krew',
  HCT: 'Krew',
  RBC: 'Krew',
  MCV: 'Krew',
  MCH: 'Krew',
  MCHC: 'Krew',
  'RDW-CV': 'Krew',
  'RDW-SD': 'Krew',
  WBC: 'Krew',
  MPV: 'Krew',
  PLT: 'Krew',
  'NEU%': 'Krew',
  'LYM%': 'Krew',
  'MONO%': 'Krew',
  'EOS%': 'Krew',
  'BASO%': 'Krew',
  'NEU#': 'Krew',
  'LYM#': 'Krew',
  'MONO#': 'Krew',
  'EOS#': 'Krew',
  'BASO#': 'Krew',
  'IG%': 'Krew',
  'IG#': 'Krew',
  MICROR: 'Krew',
  MACROR: 'Krew',
  PDW: 'Krew',
  PCT: 'Krew',
  'P-LCR': 'Krew',
  // Inne / Nerki
  MOCZNIK: 'Inne',
  KREATYNINA: 'Inne',
};

// Extracted units list for matching
const KNOWN_UNITS = ['U/l', 'mg/dl', 'mIU/l', 'g/dl', 'g/dL', 'mmol/l', 'pg', 'fL', 'fl', 'k/ul', '%', '10*12/l', '10*12/L', '10*9/l', '10*9/L', '10^12/L', '10^9/L'];

export function parseOCRText(text: string): ExtractedData {
  const allResults = parseOCRTextMulti(text);
  if (allResults.length > 0) {
    return allResults[0];
  }
  
  // Default fallback if absolutely nothing was parsed
  return {
    date: new Date().toISOString().split('T')[0],
    parameterName: 'ALT',
    value: '42',
    unit: 'U/l',
    refRange: 'do 50',
    category: 'Wątrobowe',
  };
}

export function parseOCRTextMulti(text: string): ExtractedData[] {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  
  // 1. Extract Date (use the first one found on the sheet, support various delimiters: -, ., / and spaces)
  let date = new Date().toISOString().split('T')[0];
  const dateRegex = /\b\d{4}[-./\s]+\d{2}[-./\s]+\d{2}\b/g;
  const dates: string[] = [];
  let dateMatch;
  while ((dateMatch = dateRegex.exec(text)) !== null) {
    // Normalize date delimiters to "-" and strip spaces
    const cleanDate = dateMatch[0].replace(/[./\s]+/g, '-').trim();
    dates.push(cleanDate);
  }
  
  if (dates.length > 0) {
    // Prefer dates associated with "wykonane" or "badanie" or "rejestracji"
    const wykonaneIdx = text.toLowerCase().indexOf('wykonane');
    const pobraniaIdx = text.toLowerCase().indexOf('pobrania');
    const rejestracjiIdx = text.toLowerCase().indexOf('rejestracji');
    
    if (wykonaneIdx !== -1) {
      const dateAfter = dates.find(d => text.indexOf(d) > wykonaneIdx);
      if (dateAfter) date = dateAfter;
      else date = dates[0];
    } else if (rejestracjiIdx !== -1) {
      const dateAfter = dates.find(d => text.indexOf(d) > rejestracjiIdx);
      if (dateAfter) date = dateAfter;
      else date = dates[0];
    } else {
      date = dates[0];
    }
  }

  const extractedList: ExtractedData[] = [];

  // 2. Scan line by line for parameters
  for (const line of lines) {
    const upperLine = line.toUpperCase();
    let matchedParam = '';
    
    // Look for exact word matches in PARAM_CAT_MAP keys
    for (const param of Object.keys(PARAM_CAT_MAP)) {
      // Escape special characters in key for regex (like % or #)
      const escapedParam = param.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      const reg = new RegExp(`\\b${escapedParam}\\b`, 'i');
      if (reg.test(upperLine)) {
        matchedParam = param;
        break;
      }
    }
    
    // Fallback to substring matching if no exact word matches (e.g. RDW-CV might be next to other characters)
    if (!matchedParam) {
      for (const param of Object.keys(PARAM_CAT_MAP)) {
        if (upperLine.includes(param)) {
          matchedParam = param;
          break;
        }
      }
    }

    if (!matchedParam) continue;

    // We found a parameter on this line! Parse its details.
    // Clean up/normalize units first on this line
    let normalizedLine = line
      .replace(/U\/I/gi, 'U/l')
      .replace(/U\/1/gi, 'U/l')
      .replace(/g\/dI/gi, 'g/dL')
      .replace(/g\/d1/gi, 'g/dL')
      .replace(/mIU\/I/gi, 'mIU/l')
      .replace(/mIU\/1/gi, 'mIU/l');

    // Extract unit
    let unit = 'U/l';
    for (const u of KNOWN_UNITS) {
      const reg = new RegExp(`\\b${u.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'i');
      if (reg.test(normalizedLine)) {
        unit = u;
        break;
      }
    }

    // Extract reference range from line
    // E.g. "13.74-16.47", "do 50", "40.10-51.00", "< 190"
    const refRangeRegex = /(?:do|<|>|<=|>=)?\s*\d+(?:[.,]\d+)?(?:\s*-\s*\d+(?:[.,]\d+)?)?/gi;
    const refMatches = normalizedLine.match(refRangeRegex) || [];
    let refRange = '';
    
    if (refMatches.length > 0) {
      // Look for the range that contains dash or bounds, usually later in the string
      const matchedRange = refMatches.find(m => 
        m.includes('-') || m.toLowerCase().includes('do') || m.includes('<') || m.includes('>')
      );
      
      if (matchedRange) {
        refRange = matchedRange.trim();
      } else {
        // Fallback: take the last matched numbers sequence as range if it looks like a range bounds
        refRange = refMatches[refMatches.length - 1].trim();
      }
    }

    if (refRange.includes('-')) {
      const parts = refRange.split('-').map(p => p.trim());
      refRange = parts.join(' - ');
    }

    // Extract all decimal/integer numbers from line
    const numberRegex = /\b\d+(?:[.,]\d+)?\b/g;
    const numbers: string[] = [];
    let numMatch;
    while ((numMatch = numberRegex.exec(normalizedLine)) !== null) {
      numbers.push(numMatch[0]);
    }

    // The result value is typically the first number that is NOT part of the reference range
    let value = '';
    if (numbers.length > 0) {
      let filteredNumbers = numbers;
      if (refRange) {
        const rangeNumbers: string[] = refRange.match(/\d+(?:[.,]\d+)?/g) || [];
        filteredNumbers = numbers.filter(n => !rangeNumbers.includes(n));
      }
      
      if (filteredNumbers.length > 0) {
        value = filteredNumbers[0];
      } else {
        value = numbers[0];
      }
    }

    // Skip if we couldn't parse a valid value
    if (!value) continue;

    // Check if we already added this parameter name (avoid duplicates from same line splits)
    if (extractedList.some(item => item.parameterName === matchedParam)) continue;

    extractedList.push({
      date,
      parameterName: matchedParam,
      value,
      unit,
      refRange: refRange || '0 - 100',
      category: PARAM_CAT_MAP[matchedParam],
    });
  }

  return extractedList;
}
