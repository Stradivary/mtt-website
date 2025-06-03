/**
 * Duplicate Detection and Handling System
 * MTT Qurban Dashboard
 */

export interface DuplicateDetectionConfig {
  strictMode: boolean; // true = exact match, false = fuzzy match
  action: 'skip' | 'update' | 'merge' | 'prompt'; // What to do with duplicates
  tolerance: number; // For fuzzy matching (0-1, 1=exact)
}

export interface DuplicateResult {
  isDuplicate: boolean;
  matchType: 'exact' | 'fuzzy' | 'partial';
  matchingFields: string[];
  confidence: number; // 0-1
  existingRecord?: any;
  suggestedAction: 'skip' | 'update' | 'merge';
}

export interface ProcessedUploadResult {
  totalRecords: number;
  newRecords: any[];
  duplicates: {
    exact: any[];
    fuzzy: any[];
    partial: any[];
  };
  stats: {
    totalProcessed: number;
    newAdded: number;
    duplicatesSkipped: number;
    duplicatesUpdated: number;
    duplicatesMerged: number;
    errors: number;
  };
  errors: Array<{
    row: number;
    data: any;
    error: string;
    severity: 'warning' | 'error';
  }>;
}

/**
 * MUZAKKI Duplicate Detection
 * Primary keys: nama_muzakki + jenis_hewan + nilai_qurban
 * Secondary: nama_muzakki + telepon
 * Fuzzy: nama_muzakki (similarity)
 */
export class MuzakkiDuplicateDetector {
  private existingData: any[];
  private config: DuplicateDetectionConfig;

  constructor(existingData: any[], config: DuplicateDetectionConfig) {
    this.existingData = existingData;
    this.config = config;
  }

  detectDuplicate(newRecord: any): DuplicateResult {
    // 1. Exact match check
    const exactMatch = this.findExactMatch(newRecord);
    if (exactMatch) {
      return {
        isDuplicate: true,
        matchType: 'exact',
        matchingFields: ['nama_muzakki', 'jenis_hewan', 'nilai_qurban'],
        confidence: 1.0,
        existingRecord: exactMatch,
        suggestedAction: 'skip'
      };
    }

    // 2. Secondary exact match (nama + telepon)
    const phoneMatch = this.findPhoneMatch(newRecord);
    if (phoneMatch) {
      return {
        isDuplicate: true,
        matchType: 'exact',
        matchingFields: ['nama_muzakki', 'telepon'],
        confidence: 0.9,
        existingRecord: phoneMatch,
        suggestedAction: 'merge'
      };
    }

    // 3. Fuzzy matching (if enabled)
    if (!this.config.strictMode) {
      const fuzzyMatch = this.findFuzzyMatch(newRecord);
      if (fuzzyMatch && fuzzyMatch.confidence >= this.config.tolerance) {
        return {
          isDuplicate: true,
          matchType: 'fuzzy',
          matchingFields: ['nama_muzakki'],
          confidence: fuzzyMatch.confidence,
          existingRecord: fuzzyMatch.record,
          suggestedAction: 'prompt'
        };
      }
    }

    return {
      isDuplicate: false,
      matchType: 'exact',
      matchingFields: [],
      confidence: 0,
      suggestedAction: 'skip'
    };
  }

  private findExactMatch(newRecord: any): any | null {
    return this.existingData.find(existing => 
      this.normalizeString(existing.nama_muzakki) === this.normalizeString(newRecord.nama_muzakki) &&
      existing.jenis_hewan.toLowerCase() === newRecord.jenis_hewan.toLowerCase() &&
      parseFloat(existing.nilai_qurban) === parseFloat(newRecord.nilai_qurban)
    );
  }

  private findPhoneMatch(newRecord: any): any | null {
    if (!newRecord.telepon) return null;
    
    return this.existingData.find(existing => 
      this.normalizeString(existing.nama_muzakki) === this.normalizeString(newRecord.nama_muzakki) &&
      this.normalizePhone(existing.telepon) === this.normalizePhone(newRecord.telepon)
    );
  }

  private findFuzzyMatch(newRecord: any): { record: any, confidence: number } | null {
    let bestMatch: { record: any, confidence: number } | null = null;

    for (const existing of this.existingData) {
      const similarity = this.calculateNameSimilarity(
        newRecord.nama_muzakki, 
        existing.nama_muzakki
      );

      if (similarity > (bestMatch?.confidence || 0) && similarity >= this.config.tolerance) {
        bestMatch = { record: existing, confidence: similarity };
      }
    }

    return bestMatch;
  }

  private normalizeString(str: string): string {
    return str?.toLowerCase().trim().replace(/\s+/g, ' ') || '';
  }

  private normalizePhone(phone: string): string {
    return phone?.replace(/\D/g, '') || '';
  }

  private calculateNameSimilarity(name1: string, name2: string): number {
    // Simple Levenshtein distance based similarity
    const str1 = this.normalizeString(name1);
    const str2 = this.normalizeString(name2);
    
    if (str1 === str2) return 1.0;
    
    const maxLength = Math.max(str1.length, str2.length);
    if (maxLength === 0) return 1.0;
    
    const distance = this.levenshteinDistance(str1, str2);
    return 1 - (distance / maxLength);
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,     // deletion
          matrix[j - 1][i] + 1,     // insertion
          matrix[j - 1][i - 1] + cost // substitution
        );
      }
    }
    
    return matrix[str2.length][str1.length];
  }
}

/**
 * DISTRIBUSI Duplicate Detection
 * Primary keys: nama_penerima + alamat_penerima + tanggal_distribusi
 * Secondary: alamat_penerima + tanggal_distribusi + jenis_hewan
 */
export class DistribusiDuplicateDetector {
  private existingData: any[];
  private config: DuplicateDetectionConfig;

  constructor(existingData: any[], config: DuplicateDetectionConfig) {
    this.existingData = existingData;
    this.config = config;
  }

  detectDuplicate(newRecord: any): DuplicateResult {
    // 1. Exact match check
    const exactMatch = this.findExactMatch(newRecord);
    if (exactMatch) {
      return {
        isDuplicate: true,
        matchType: 'exact',
        matchingFields: ['nama_penerima', 'alamat_penerima', 'tanggal_distribusi'],
        confidence: 1.0,
        existingRecord: exactMatch,
        suggestedAction: 'skip'
      };
    }

    // 2. Location + date match
    const locationMatch = this.findLocationMatch(newRecord);
    if (locationMatch) {
      return {
        isDuplicate: true,
        matchType: 'partial',
        matchingFields: ['alamat_penerima', 'tanggal_distribusi', 'jenis_hewan'],
        confidence: 0.8,
        existingRecord: locationMatch,
        suggestedAction: 'merge'
      };
    }

    // 3. Fuzzy address matching
    if (!this.config.strictMode) {
      const fuzzyMatch = this.findFuzzyAddressMatch(newRecord);
      if (fuzzyMatch && fuzzyMatch.confidence >= this.config.tolerance) {
        return {
          isDuplicate: true,
          matchType: 'fuzzy',
          matchingFields: ['alamat_penerima', 'tanggal_distribusi'],
          confidence: fuzzyMatch.confidence,
          existingRecord: fuzzyMatch.record,
          suggestedAction: 'prompt'
        };
      }
    }

    return {
      isDuplicate: false,
      matchType: 'exact',
      matchingFields: [],
      confidence: 0,
      suggestedAction: 'skip'
    };
  }

  private findExactMatch(newRecord: any): any | null {
    return this.existingData.find(existing => 
      this.normalizeString(existing.nama_penerima) === this.normalizeString(newRecord.nama_penerima) &&
      this.normalizeString(existing.alamat_penerima) === this.normalizeString(newRecord.alamat_penerima) &&
      existing.tanggal_distribusi === newRecord.tanggal_distribusi
    );
  }

  private findLocationMatch(newRecord: any): any | null {
    return this.existingData.find(existing => 
      this.normalizeString(existing.alamat_penerima) === this.normalizeString(newRecord.alamat_penerima) &&
      existing.tanggal_distribusi === newRecord.tanggal_distribusi &&
      existing.jenis_hewan.toLowerCase() === newRecord.jenis_hewan.toLowerCase()
    );
  }

  private findFuzzyAddressMatch(newRecord: any): { record: any, confidence: number } | null {
    let bestMatch: { record: any, confidence: number } | null = null;

    for (const existing of this.existingData) {
      if (existing.tanggal_distribusi !== newRecord.tanggal_distribusi) continue;

      const similarity = this.calculateAddressSimilarity(
        newRecord.alamat_penerima, 
        existing.alamat_penerima
      );

      if (similarity > (bestMatch?.confidence || 0) && similarity >= this.config.tolerance) {
        bestMatch = { record: existing, confidence: similarity };
      }
    }

    return bestMatch;
  }

  private normalizeString(str: string): string {
    return str?.toLowerCase().trim().replace(/\s+/g, ' ') || '';
  }

  private calculateAddressSimilarity(addr1: string, addr2: string): number {
    // Enhanced address similarity with keyword matching
    const str1 = this.normalizeString(addr1);
    const str2 = this.normalizeString(addr2);
    
    if (str1 === str2) return 1.0;
    
    // Extract keywords
    const keywords1 = str1.split(' ').filter(word => word.length > 2);
    const keywords2 = str2.split(' ').filter(word => word.length > 2);
    
    let matchCount = 0;
    for (const keyword of keywords1) {
      if (keywords2.includes(keyword)) matchCount++;
    }
    
    const keywordSimilarity = keywords1.length > 0 ? matchCount / keywords1.length : 0;
    
    // Combine with character similarity
    const maxLength = Math.max(str1.length, str2.length);
    const distance = this.levenshteinDistance(str1, str2);
    const charSimilarity = maxLength > 0 ? 1 - (distance / maxLength) : 1;
    
    // Weighted average (60% keyword, 40% character)
    return (keywordSimilarity * 0.6) + (charSimilarity * 0.4);
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + cost
        );
      }
    }
    
    return matrix[str2.length][str1.length];
  }
}

/**
 * Main Upload Processor
 */
export class UploadProcessor {
  async processMuzakkiUpload(
    newRecords: any[], 
    existingData: any[], 
    config: DuplicateDetectionConfig
  ): Promise<ProcessedUploadResult> {
    const detector = new MuzakkiDuplicateDetector(existingData, config);
    const result: ProcessedUploadResult = {
      totalRecords: newRecords.length,
      newRecords: [],
      duplicates: { exact: [], fuzzy: [], partial: [] },
      stats: {
        totalProcessed: newRecords.length,
        newAdded: 0,
        duplicatesSkipped: 0,
        duplicatesUpdated: 0,
        duplicatesMerged: 0,
        errors: 0
      },
      errors: []
    };

    for (let i = 0; i < newRecords.length; i++) {
      const record = newRecords[i];
      
      try {
        const duplicateResult = detector.detectDuplicate(record);
        
        if (duplicateResult.isDuplicate) {
          // Store duplicate information for later processing
          const duplicateInfo = { new: record, existing: duplicateResult.existingRecord };
          
          switch (duplicateResult.matchType) {
            case 'exact':
              result.duplicates.exact.push(duplicateInfo);
              break;
            case 'fuzzy':
              result.duplicates.fuzzy.push(duplicateInfo);
              break;
            case 'partial':
              result.duplicates.partial.push(duplicateInfo);
              break;
          }

          // Handle based on configured action
          if (config.action === 'prompt') {
            // Don't process duplicates, let UI handle them
            // The records stay in duplicates arrays for user review
          } else if (config.action === 'skip') {
            result.stats.duplicatesSkipped++;
          } else if (config.action === 'merge') {
            result.newRecords.push(this.mergeMuzakkiRecords(record, duplicateResult.existingRecord));
            result.stats.duplicatesMerged++;
          } else if (config.action === 'update') {
            result.newRecords.push(record);
            result.stats.duplicatesUpdated++;
          }
        } else {
          // Not a duplicate, add to new records
          result.newRecords.push(record);
          result.stats.newAdded++;
        }
      } catch (error) {
        result.errors.push({
          row: i + 1,
          data: record,
          error: error instanceof Error ? error.message : 'Unknown error',
          severity: 'error'
        });
        result.stats.errors++;
      }
    }

    return result;
  }

  async processDistribusiUpload(
    newRecords: any[], 
    existingData: any[], 
    config: DuplicateDetectionConfig
  ): Promise<ProcessedUploadResult> {
    const detector = new DistribusiDuplicateDetector(existingData, config);
    const result: ProcessedUploadResult = {
      totalRecords: newRecords.length,
      newRecords: [],
      duplicates: { exact: [], fuzzy: [], partial: [] },
      stats: {
        totalProcessed: newRecords.length,
        newAdded: 0,
        duplicatesSkipped: 0,
        duplicatesUpdated: 0,
        duplicatesMerged: 0,
        errors: 0
      },
      errors: []
    };

    for (let i = 0; i < newRecords.length; i++) {
      const record = newRecords[i];
      
      try {
        const duplicateResult = detector.detectDuplicate(record);
        
        if (duplicateResult.isDuplicate) {
          // Store duplicate information for later processing
          const duplicateInfo = { new: record, existing: duplicateResult.existingRecord };
          
          switch (duplicateResult.matchType) {
            case 'exact':
              result.duplicates.exact.push(duplicateInfo);
              break;
            case 'fuzzy':
              result.duplicates.fuzzy.push(duplicateInfo);
              break;
            case 'partial':
              result.duplicates.partial.push(duplicateInfo);
              break;
          }

          // Handle based on configured action
          if (config.action === 'prompt') {
            // Don't process duplicates, let UI handle them
            // The records stay in duplicates arrays for user review
          } else if (config.action === 'skip') {
            result.stats.duplicatesSkipped++;
          } else if (config.action === 'merge') {
            result.newRecords.push(this.mergeDistribusiRecords(record, duplicateResult.existingRecord));
            result.stats.duplicatesMerged++;
          } else if (config.action === 'update') {
            result.newRecords.push(record);
            result.stats.duplicatesUpdated++;
          }
        } else {
          // Not a duplicate, add to new records
          result.newRecords.push(record);
          result.stats.newAdded++;
        }
      } catch (error) {
        result.errors.push({
          row: i + 1,
          data: record,
          error: error instanceof Error ? error.message : 'Unknown error',
          severity: 'error'
        });
        result.stats.errors++;
      }
    }

    return result;
  }

  private mergeMuzakkiRecords(newRecord: any, existingRecord: any): any {
    // Merge logic: use new data where available, keep existing where new is empty
    return {
      ...existingRecord,
      ...Object.fromEntries(
        Object.entries(newRecord).filter(([_, value]) => 
          value !== null && value !== undefined && value !== ''
        )
      ),
      updated_at: new Date().toISOString()
    };
  }

  private mergeDistribusiRecords(newRecord: any, existingRecord: any): any {
    // Merge logic: use new data where available, keep existing where new is empty
    return {
      ...existingRecord,
      ...Object.fromEntries(
        Object.entries(newRecord).filter(([_, value]) => 
          value !== null && value !== undefined && value !== ''
        )
      ),
      updated_at: new Date().toISOString()
    };
  }
} 