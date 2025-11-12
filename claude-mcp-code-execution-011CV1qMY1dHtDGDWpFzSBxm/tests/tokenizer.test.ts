import { PIITokenizer, PIIType } from '../src/server/tokenizer';

describe('PIITokenizer', () => {
  let tokenizer: PIITokenizer;

  beforeEach(() => {
    tokenizer = new PIITokenizer();
  });

  afterEach(() => {
    tokenizer.clear();
  });

  describe('Email tokenization', () => {
    it('should tokenize email addresses', () => {
      const text = 'Contact john.doe@example.com for more info';
      const tokenized = tokenizer.tokenize(text, [PIIType.EMAIL]);

      expect(tokenized).toContain('[EMAIL_1]');
      expect(tokenized).not.toContain('john.doe@example.com');
    });

    it('should detokenize email addresses', () => {
      const text = 'Contact john.doe@example.com for more info';
      const tokenized = tokenizer.tokenize(text, [PIIType.EMAIL]);
      const detokenized = tokenizer.detokenize(tokenized);

      expect(detokenized).toBe(text);
    });

    it('should reuse tokens for same email', () => {
      const text1 = 'Email: john@example.com';
      const text2 = 'Reply to john@example.com';

      const tokenized1 = tokenizer.tokenize(text1, [PIIType.EMAIL]);
      const tokenized2 = tokenizer.tokenize(text2, [PIIType.EMAIL]);

      expect(tokenized1).toContain('[EMAIL_1]');
      expect(tokenized2).toContain('[EMAIL_1]');
    });
  });

  describe('Phone tokenization', () => {
    it('should tokenize phone numbers', () => {
      const text = 'Call us at +1-555-123-4567';
      const tokenized = tokenizer.tokenize(text, [PIIType.PHONE]);

      expect(tokenized).toContain('[PHONE_1]');
      expect(tokenized).not.toContain('555-123-4567');
    });

    it('should handle multiple phone formats', () => {
      const text = 'Numbers: 555-123-4567 and (555) 123-4567';
      const tokenized = tokenizer.tokenize(text, [PIIType.PHONE]);

      expect(tokenized).toContain('[PHONE_1]');
      expect(tokenized).toContain('[PHONE_2]');
    });
  });

  describe('SSN tokenization', () => {
    it('should tokenize SSN', () => {
      const text = 'SSN: 123-45-6789';
      const tokenized = tokenizer.tokenize(text, [PIIType.SSN]);

      expect(tokenized).toContain('[SSN_1]');
      expect(tokenized).not.toContain('123-45-6789');
    });
  });

  describe('Credit card tokenization', () => {
    it('should tokenize credit card numbers', () => {
      const text = 'Card: 4532 1234 5678 9010';
      const tokenized = tokenizer.tokenize(text, [PIIType.CREDIT_CARD]);

      expect(tokenized).toContain('[CREDIT_CARD_1]');
      expect(tokenized).not.toContain('4532');
    });
  });

  describe('Tool input/output tokenization', () => {
    it('should tokenize nested objects', () => {
      const input = {
        name: 'John Doe',
        email: 'john@example.com',
        nested: {
          phone: '555-123-4567',
        },
      };

      const tokenized = tokenizer.tokenizeToolInput(input, [PIIType.EMAIL, PIIType.PHONE]);

      expect(tokenized.email).toContain('[EMAIL_');
      expect(tokenized.nested.phone).toContain('[PHONE_');
    });

    it('should detokenize nested objects', () => {
      const input = {
        email: 'john@example.com',
        message: 'Contact john@example.com',
      };

      const tokenized = tokenizer.tokenizeToolInput(input, [PIIType.EMAIL]);
      const detokenized = tokenizer.detokenizeToolOutput(tokenized);

      expect(detokenized.email).toBe('john@example.com');
      expect(detokenized.message).toBe('Contact john@example.com');
    });
  });

  describe('Mappings', () => {
    it('should track all mappings', () => {
      tokenizer.tokenize('john@example.com', [PIIType.EMAIL]);
      tokenizer.tokenize('jane@example.com', [PIIType.EMAIL]);

      const mappings = tokenizer.getMappings();
      expect(mappings).toHaveLength(2);
    });

    it('should retrieve original value', () => {
      const text = 'john@example.com';
      const tokenized = tokenizer.tokenize(text, [PIIType.EMAIL]);
      const token = tokenized.match(/\[EMAIL_\d+\]/)?.[0];

      expect(token).toBeDefined();
      expect(tokenizer.getOriginalValue(token!)).toBe('john@example.com');
    });

    it('should clear all mappings', () => {
      tokenizer.tokenize('john@example.com', [PIIType.EMAIL]);
      tokenizer.clear();

      expect(tokenizer.getMappings()).toHaveLength(0);
    });
  });
});
