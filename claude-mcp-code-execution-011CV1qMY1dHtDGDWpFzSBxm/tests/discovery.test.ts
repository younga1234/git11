import { ToolDiscovery } from '../src/server/discovery';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';

describe('ToolDiscovery', () => {
  let tempDir: string;
  let discovery: ToolDiscovery;

  beforeEach(async () => {
    // Create temporary directory for tests
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'tool-discovery-test-'));
    discovery = new ToolDiscovery(tempDir);
  });

  afterEach(async () => {
    // Clean up temporary directory
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch (error) {
      console.error('Failed to clean up temp dir:', error);
    }
  });

  describe('Tool discovery', () => {
    it('should discover tools in directory', async () => {
      // Create test tool file
      const toolDir = path.join(tempDir, 'test-tools');
      await fs.mkdir(toolDir, { recursive: true });

      const toolContent = `
        export async function testFunction(input: any): Promise<any> {
          return { success: true };
        }
      `;

      await fs.writeFile(path.join(toolDir, 'testTool.ts'), toolContent);

      const tools = await discovery.discoverTools();

      expect(tools.length).toBeGreaterThan(0);
      const tool = tools.find((t) => t.name.includes('testTool'));
      expect(tool).toBeDefined();
      expect(tool?.exportedFunctions).toContain('testFunction');
    });

    it('should handle nested directories', async () => {
      // Create nested structure
      const nestedDir = path.join(tempDir, 'services', 'api');
      await fs.mkdir(nestedDir, { recursive: true });

      const toolContent = `
        export async function apiCall(): Promise<any> {
          return {};
        }
      `;

      await fs.writeFile(path.join(nestedDir, 'api.ts'), toolContent);

      const tools = await discovery.discoverTools();

      const tool = tools.find((t) => t.namespace === 'services.api');
      expect(tool).toBeDefined();
    });

    it('should ignore index files', async () => {
      await fs.writeFile(
        path.join(tempDir, 'index.ts'),
        'export * from "./other";',
      );

      const tools = await discovery.discoverTools();

      const indexTool = tools.find((t) => t.name === 'index');
      expect(indexTool).toBeUndefined();
    });

    it('should ignore test files', async () => {
      await fs.writeFile(
        path.join(tempDir, 'tool.test.ts'),
        'export function test() {}',
      );

      const tools = await discovery.discoverTools();

      const testTool = tools.find((t) => t.name.includes('test'));
      expect(testTool).toBeUndefined();
    });
  });

  describe('Function extraction', () => {
    it('should extract async functions', async () => {
      const toolContent = `
        export async function asyncFunc(): Promise<void> {}
        export async function anotherAsync(): Promise<string> { return ""; }
      `;

      await fs.writeFile(path.join(tempDir, 'async.ts'), toolContent);

      const tools = await discovery.discoverTools();
      const tool = tools[0];

      expect(tool.exportedFunctions).toContain('asyncFunc');
      expect(tool.exportedFunctions).toContain('anotherAsync');
    });

    it('should extract regular functions', async () => {
      const toolContent = `
        export function regularFunc(): void {}
      `;

      await fs.writeFile(path.join(tempDir, 'regular.ts'), toolContent);

      const tools = await discovery.discoverTools();
      const tool = tools[0];

      expect(tool.exportedFunctions).toContain('regularFunc');
    });

    it('should extract const arrow functions', async () => {
      const toolContent = `
        export const arrowFunc = async (input: any) => {
          return input;
        };
      `;

      await fs.writeFile(path.join(tempDir, 'arrow.ts'), toolContent);

      const tools = await discovery.discoverTools();
      const tool = tools[0];

      expect(tool.exportedFunctions).toContain('arrowFunc');
    });
  });

  describe('Caching', () => {
    it('should cache discovery results', async () => {
      const toolContent = 'export async function test() {}';
      await fs.writeFile(path.join(tempDir, 'tool.ts'), toolContent);

      // First call
      const tools1 = await discovery.discoverTools();

      // Second call (should use cache)
      const tools2 = await discovery.discoverTools();

      expect(tools1).toEqual(tools2);
    });

    it('should refresh cache when forced', async () => {
      const toolContent = 'export async function test() {}';
      await fs.writeFile(path.join(tempDir, 'tool.ts'), toolContent);

      await discovery.discoverTools();

      // Add new tool
      await fs.writeFile(path.join(tempDir, 'tool2.ts'), toolContent);

      // Force refresh
      const tools = await discovery.discoverTools(true);

      expect(tools.length).toBe(2);
    });

    it('should clear cache', async () => {
      const toolContent = 'export async function test() {}';
      await fs.writeFile(path.join(tempDir, 'tool.ts'), toolContent);

      await discovery.discoverTools();
      discovery.clearCache();

      // Should rediscover
      const tools = await discovery.discoverTools();
      expect(tools.length).toBeGreaterThan(0);
    });
  });

  describe('Statistics', () => {
    it('should provide tool statistics', async () => {
      const dir1 = path.join(tempDir, 'namespace1');
      const dir2 = path.join(tempDir, 'namespace2');

      await fs.mkdir(dir1);
      await fs.mkdir(dir2);

      await fs.writeFile(
        path.join(dir1, 'tool1.ts'),
        'export async function func1() {}\nexport async function func2() {}',
      );
      await fs.writeFile(
        path.join(dir2, 'tool2.ts'),
        'export async function func3() {}',
      );

      const stats = await discovery.getStatistics();

      expect(stats.totalTools).toBe(2);
      expect(stats.totalFunctions).toBe(3);
      expect(stats.toolsByNamespace).toHaveProperty('namespace1');
      expect(stats.toolsByNamespace).toHaveProperty('namespace2');
    });
  });
});
