import * as XLSX from 'xlsx';
import * as fs from 'fs';

interface PLOMapping {
  ploCode: string;
  weight: number;
}

interface CompetencyMapping {
  competencyCode: string;
  competencyName: string;
  mappedPLOs: PLOMapping[];
  justification: string;
}

interface ParsedData {
  plos: string[];
  mappings: {
    competencyCode: string;
    ploCode: string;
    weight: number;
  }[];
  justifications: {
    competencyCode: string;
    textEn?: string;
    textAr?: string;
  }[];
  language: 'en' | 'ar';
}

/**
 * Detect if text contains Arabic characters
 */
function containsArabic(text: string): boolean {
  const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
  return arabicRegex.test(text);
}

/**
 * Parse PLO mappings from a cell value like "PLO6 (1.00)" or "PLO4 (0.51) & PLO2 (0.49)"
 */
function parsePLOMappings(cellValue: string): PLOMapping[] {
  if (!cellValue || cellValue.trim() === '-' || cellValue.trim() === '') {
    return [];
  }

  const mappings: PLOMapping[] = [];
  // Split by & to handle multiple PLOs
  const parts = cellValue.split('&');
  
  for (const part of parts) {
    const trimmed = part.trim();
    // Match pattern like "PLO6 (1.00)" or "PLO6(1.00)"
    const match = trimmed.match(/PLO(\d+)\s*\(([0-9.]+)\)/i);
    if (match) {
      const ploNumber = match[1];
      const weight = parseFloat(match[2]);
      mappings.push({
        ploCode: `PLO${ploNumber}`,
        weight: weight
      });
    }
  }

  return mappings;
}

/**
 * Parse Excel file and extract PLO-GA mappings
 */
export function parseExcelPloGa(filePath: string): ParsedData {
  // Read the Excel file
  const workbook = XLSX.readFile(filePath);
  
  // Try to find the "Justifications" sheet first, fall back to first sheet
  let sheetName = 'Justifications';
  if (!workbook.SheetNames.includes(sheetName)) {
    sheetName = workbook.SheetNames[0];
  }
  
  const worksheet = workbook.Sheets[sheetName];
  
  // Convert to JSON (array of arrays)
  const data: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  
  const plosSet = new Set<string>();
  const mappings: { competencyCode: string; ploCode: string; weight: number }[] = [];
  const justifications: { competencyCode: string; textEn?: string; textAr?: string }[] = [];
  
  let currentGA = '';
  let detectedLanguage: 'en' | 'ar' = 'en';
  
  // Skip header row (index 0) and process data rows
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length < 4) continue;
    
    const competencyCode = row[0]?.toString().trim() || '';
    const competencyName = row[1]?.toString().trim() || '';
    const mappedPLOsStr = row[2]?.toString().trim() || '';
    const justification = row[3]?.toString().trim() || '';
    
    // Skip empty rows
    if (!competencyCode && !competencyName) continue;
    
    // Track current GA (GA1, GA2, etc.)
    if (competencyCode.startsWith('GA')) {
      currentGA = competencyCode;
      continue;
    }
    
    // Skip if not a competency code (C1-1, C1-2, etc.)
    if (!competencyCode.match(/^C\d+-\d+$/)) continue;
    
    // Parse PLO mappings
    const ploMappings = parsePLOMappings(mappedPLOsStr);
    
    // Add PLOs to set and create mapping entries
    for (const mapping of ploMappings) {
      plosSet.add(mapping.ploCode);
      mappings.push({
        competencyCode,
        ploCode: mapping.ploCode,
        weight: mapping.weight
      });
    }
    
    // Add justification if exists
    if (justification) {
      const isArabic = containsArabic(justification);
      if (isArabic) {
        detectedLanguage = 'ar';
      }
      
      justifications.push({
        competencyCode,
        ...(isArabic ? { textAr: justification } : { textEn: justification })
      });
    }
  }
  
  return {
    plos: Array.from(plosSet).sort((a, b) => {
      const numA = parseInt(a.replace('PLO', ''));
      const numB = parseInt(b.replace('PLO', ''));
      return numA - numB;
    }),
    mappings,
    justifications,
    language: detectedLanguage
  };
}

// CLI usage
if (require.main === module) {
  const filePath = process.argv[2];
  if (!filePath) {
    console.error('Usage: ts-node parseExcelPloGa.ts <excel-file-path>');
    process.exit(1);
  }
  
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    process.exit(1);
  }
  
  try {
    const result = parseExcelPloGa(filePath);
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Error parsing Excel file:', error);
    process.exit(1);
  }
}
