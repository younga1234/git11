import { v4 as uuidv4 } from 'uuid';
import { PIIType, TokenMapping } from '../types';

// Re-export PIIType for convenience
export { PIIType } from '../types';

/**
 * PII Tokenizer for protecting sensitive information
 * Automatically detects and tokenizes PII data
 */
export class PIITokenizer {
  private tokenMappings: Map<string, TokenMapping> = new Map();
  private reverseTokenMappings: Map<string, string> = new Map();
  private tokenCounters: Map<PIIType, number> = new Map();

  // Regex patterns for PII detection
  private readonly patterns: Record<PIIType, RegExp> = {
    [PIIType.EMAIL]: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    [PIIType.PHONE]: /\b(\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
    [PIIType.SSN]: /\b\d{3}-\d{2}-\d{4}\b/g,
    [PIIType.CREDIT_CARD]: /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g,
    [PIIType.NAME]: /\b[A-Z][a-z]+ [A-Z][a-z]+\b/g, // Simple name pattern
    [PIIType.ADDRESS]: /\b\d{1,5}\s+([A-Z][a-z]+\s*)+,\s*[A-Z]{2}\s+\d{5}\b/g,
  };

  /**
   * Tokenize PII in the given text
   */
  tokenize(text: string, types?: PIIType[]): string {
    let tokenizedText = text;
    const typesToProcess = types || Object.values(PIIType);

    for (const type of typesToProcess) {
      const pattern = this.patterns[type];
      if (!pattern) continue;

      tokenizedText = tokenizedText.replace(pattern, (match) => {
        return this.createToken(match, type);
      });
    }

    return tokenizedText;
  }

  /**
   * Detokenize text by replacing tokens with original values
   */
  detokenize(text: string): string {
    let detokenizedText = text;

    for (const [token, originalValue] of this.reverseTokenMappings.entries()) {
      detokenizedText = detokenizedText.replace(new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), originalValue);
    }

    return detokenizedText;
  }

  /**
   * Create a token for a PII value
   */
  private createToken(value: string, type: PIIType): string {
    // Check if we already have a token for this value
    const existingMapping = Array.from(this.tokenMappings.values()).find(
      (mapping) => mapping.originalValue === value && mapping.type === type,
    );

    if (existingMapping) {
      return existingMapping.token;
    }

    // Generate new token
    const counter = (this.tokenCounters.get(type) || 0) + 1;
    this.tokenCounters.set(type, counter);

    const token = `[${type}_${counter}]`;
    const mapping: TokenMapping = {
      token,
      originalValue: value,
      type,
    };

    const id = uuidv4();
    this.tokenMappings.set(id, mapping);
    this.reverseTokenMappings.set(token, value);

    return token;
  }

  /**
   * Get all token mappings
   */
  getMappings(): TokenMapping[] {
    return Array.from(this.tokenMappings.values());
  }

  /**
   * Get original value for a token
   */
  getOriginalValue(token: string): string | undefined {
    return this.reverseTokenMappings.get(token);
  }

  /**
   * Clear all mappings
   */
  clear(): void {
    this.tokenMappings.clear();
    this.reverseTokenMappings.clear();
    this.tokenCounters.clear();
  }

  /**
   * Tokenize input for MCP tool calls
   */
  tokenizeToolInput(input: Record<string, any>, types?: PIIType[]): Record<string, any> {
    const tokenized: Record<string, any> = {};

    for (const [key, value] of Object.entries(input)) {
      if (typeof value === 'string') {
        tokenized[key] = this.tokenize(value, types);
      } else if (typeof value === 'object' && value !== null) {
        tokenized[key] = this.tokenizeToolInput(value, types);
      } else {
        tokenized[key] = value;
      }
    }

    return tokenized;
  }

  /**
   * Detokenize output from MCP tool calls
   */
  detokenizeToolOutput(output: Record<string, any>): Record<string, any> {
    const detokenized: Record<string, any> = {};

    for (const [key, value] of Object.entries(output)) {
      if (typeof value === 'string') {
        detokenized[key] = this.detokenize(value);
      } else if (Array.isArray(value)) {
        detokenized[key] = value.map(item =>
          typeof item === 'string' ? this.detokenize(item) : item
        );
      } else if (typeof value === 'object' && value !== null) {
        detokenized[key] = this.detokenizeToolOutput(value);
      } else {
        detokenized[key] = value;
      }
    }

    return detokenized;
  }
}

/**
 * Global tokenizer instance
 */
let globalTokenizer: PIITokenizer | null = null;

/**
 * Get or create the global tokenizer instance
 */
export function getTokenizer(): PIITokenizer {
  if (!globalTokenizer) {
    globalTokenizer = new PIITokenizer();
  }
  return globalTokenizer;
}
