import { Sandbox, executeInSandbox } from '../src/server/sandbox';

describe('Sandbox', () => {
  let sandbox: Sandbox;

  beforeEach(() => {
    sandbox = new Sandbox({
      timeout: 5000,
      memoryLimit: 128,
      allowedModules: ['Math', 'JSON'],
    });
  });

  afterEach(() => {
    sandbox.dispose();
  });

  describe('Basic execution', () => {
    it('should execute simple code', async () => {
      const code = 'return 1 + 1;';
      const result = await sandbox.execute(code);

      expect(result.success).toBe(true);
      expect(result.data).toBe(2);
    });

    it('should handle async code', async () => {
      const code = `
        const result = await Promise.resolve(42);
        return result;
      `;
      const result = await sandbox.execute(code);

      expect(result.success).toBe(true);
      expect(result.data).toBe(42);
    });

    it('should provide context variables', async () => {
      const code = 'return x + y;';
      const result = await sandbox.execute(code, { x: 10, y: 20 });

      expect(result.success).toBe(true);
      expect(result.data).toBe(30);
    });
  });

  describe('Security', () => {
    it('should prevent access to process', async () => {
      const code = 'return typeof process;';
      const result = await sandbox.execute(code);

      expect(result.success).toBe(true);
      expect(result.data).toBe('undefined');
    });

    it('should prevent access to require', async () => {
      const code = 'return typeof require;';
      const result = await sandbox.execute(code);

      expect(result.success).toBe(true);
      expect(result.data).toBe('undefined');
    });

    it('should handle timeout', async () => {
      const sandbox = new Sandbox({ timeout: 100 });
      const code = 'while(true) {}';
      const result = await sandbox.execute(code);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('TIMEOUT');

      sandbox.dispose();
    });
  });

  describe('Allowed modules', () => {
    it('should provide Math module', async () => {
      const code = 'return Math.sqrt(16);';
      const result = await sandbox.execute(code);

      expect(result.success).toBe(true);
      expect(result.data).toBe(4);
    });

    it('should provide JSON module', async () => {
      const code = 'return JSON.stringify({ test: true });';
      const result = await sandbox.execute(code);

      expect(result.success).toBe(true);
      expect(result.data).toBe('{"test":true}');
    });
  });

  describe('Error handling', () => {
    it('should capture syntax errors', async () => {
      const code = 'return [[[;';
      const result = await sandbox.execute(code);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error?.message).toBeTruthy();
    });

    it('should capture runtime errors', async () => {
      const code = 'throw new Error("Test error");';
      const result = await sandbox.execute(code);

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('Test error');
    });
  });

  describe('Statistics', () => {
    it('should track execution time', async () => {
      const code = 'return 42;';
      const result = await sandbox.execute(code);

      expect(result.stats.executionTime).toBeGreaterThan(0);
    });

    it('should track memory usage', async () => {
      const code = 'return 42;';
      const result = await sandbox.execute(code);

      expect(result.stats.memoryUsed).toBeDefined();
    });
  });

  describe('Helper function', () => {
    it('should execute with default config', async () => {
      const code = 'return "Hello, World!";';
      const result = await executeInSandbox(code);

      expect(result.success).toBe(true);
      expect(result.data).toBe('Hello, World!');
    });
  });
});
