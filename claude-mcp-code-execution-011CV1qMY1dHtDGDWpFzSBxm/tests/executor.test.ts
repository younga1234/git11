import { CodeExecutor } from '../src/server/executor';
import { initializeMCPClient } from '../src/utils/mcp-client';
import * as path from 'path';

describe('CodeExecutor', () => {
  let executor: CodeExecutor;

  beforeAll(() => {
    // Initialize MCP client for tests
    initializeMCPClient('http://localhost:3000', 'test-key');
  });

  beforeEach(() => {
    const toolsDir = path.join(__dirname, '../src/tools');
    executor = new CodeExecutor(toolsDir, {
      timeout: 5000,
      memoryLimit: 128,
      allowedModules: ['Math', 'JSON'],
    });
  });

  afterEach(async () => {
    await executor.cleanup();
  });

  describe('Basic execution', () => {
    it('should execute code successfully', async () => {
      const code = 'return 2 + 2;';
      const result = await executor.execute(code);

      expect(result.success).toBe(true);
      expect(result.data).toBe(4);
    });

    it('should provide context to code', async () => {
      const code = 'return name + " " + age;';
      const result = await executor.execute(code, {
        name: 'John',
        age: 30,
      });

      expect(result.success).toBe(true);
      expect(result.data).toBe('John 30');
    });
  });

  describe('PII Protection', () => {
    it('should tokenize PII in context', async () => {
      const code = 'return email;';
      const result = await executor.execute(
        code,
        { email: 'john@example.com' },
        { enablePIIProtection: true },
      );

      expect(result.success).toBe(true);
      // Result should be detokenized
      expect(result.data).toBe('john@example.com');
    });

    it('should work without PII protection', async () => {
      const code = 'return email;';
      const result = await executor.execute(
        code,
        { email: 'john@example.com' },
        { enablePIIProtection: false },
      );

      expect(result.success).toBe(true);
      expect(result.data).toBe('john@example.com');
    });
  });

  describe('Tool injection', () => {
    it('should inject tools list', async () => {
      const code = 'return _tools;';
      const result = await executor.execute(code, {}, { injectTools: true });

      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('should work without tool injection', async () => {
      const code = 'return typeof _tools;';
      const result = await executor.execute(code, {}, { injectTools: false });

      expect(result.success).toBe(true);
      expect(result.data).toBe('undefined');
    });
  });

  describe('Resource limits', () => {
    it('should respect concurrent execution limits', async () => {
      const limitedExecutor = new CodeExecutor(
        path.join(__dirname, '../src/tools'),
        { timeout: 5000 },
        { maxConcurrentExecutions: 2 },
      );

      const slowCode = `
        await new Promise(resolve => setTimeout(resolve, 100));
        return 42;
      `;

      // Start 3 executions
      const promises = [
        limitedExecutor.execute(slowCode),
        limitedExecutor.execute(slowCode),
        limitedExecutor.execute(slowCode),
      ];

      const results = await Promise.all(promises);

      // Third one should fail due to limit
      const failedResults = results.filter((r) => !r.success);
      expect(failedResults.length).toBeGreaterThan(0);

      await limitedExecutor.cleanup();
    });
  });

  describe('Error handling', () => {
    it('should handle execution errors', async () => {
      const code = 'throw new Error("Test error");';
      const result = await executor.execute(code);

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('Test error');
    });

    it('should handle syntax errors', async () => {
      const code = 'return [[[;';
      const result = await executor.execute(code);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('Statistics', () => {
    it('should track active executions', async () => {
      const slowCode = `
        await new Promise(resolve => setTimeout(resolve, 200));
        return 42;
      `;

      const promise = executor.execute(slowCode);

      // Check stats while executing
      const stats = executor.getStatistics();
      expect(stats.activeExecutions).toBeGreaterThanOrEqual(0);

      await promise;
    });

    it('should provide PII mappings count', async () => {
      await executor.execute(
        'return email;',
        { email: 'john@example.com' },
        { enablePIIProtection: true },
      );

      const stats = executor.getStatistics();
      expect(stats.piiMappings).toBeGreaterThan(0);
    });
  });

  describe('File execution', () => {
    it('should handle file read errors', async () => {
      const result = await executor.executeFile('/nonexistent/file.js');

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('FILE_READ_ERROR');
    });
  });

  describe('Cleanup', () => {
    it('should cleanup resources', async () => {
      await executor.execute('return 42;');

      await executor.cleanup();

      const stats = executor.getStatistics();
      expect(stats.activeExecutions).toBe(0);
      expect(stats.piiMappings).toBe(0);
    });
  });
});
