import * as fs from 'fs/promises';
import * as path from 'path';
import { DiscoveredTool } from '../types';

/**
 * Tool Discovery System
 * Discovers tools by exploring the filesystem structure
 */
export class ToolDiscovery {
  private toolsDirectory: string;
  private cachedTools: Map<string, DiscoveredTool> = new Map();
  private lastScanTime: number = 0;
  private cacheTTL: number = 60000; // 1 minute cache

  constructor(toolsDirectory: string) {
    this.toolsDirectory = toolsDirectory;
  }

  /**
   * Discover all available tools
   */
  async discoverTools(forceRefresh: boolean = false): Promise<DiscoveredTool[]> {
    const now = Date.now();

    // Return cached results if still valid
    if (!forceRefresh && this.cachedTools.size > 0 && now - this.lastScanTime < this.cacheTTL) {
      return Array.from(this.cachedTools.values());
    }

    this.cachedTools.clear();

    try {
      const tools = await this.scanDirectory(this.toolsDirectory);
      this.lastScanTime = now;
      return tools;
    } catch (error) {
      console.error('Error discovering tools:', error);
      return [];
    }
  }

  /**
   * Scan directory recursively for tool files
   */
  private async scanDirectory(dirPath: string, namespace: string = ''): Promise<DiscoveredTool[]> {
    const tools: DiscoveredTool[] = [];

    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);

        if (entry.isDirectory()) {
          // Recursively scan subdirectories
          const subNamespace = namespace ? `${namespace}.${entry.name}` : entry.name;
          const subTools = await this.scanDirectory(fullPath, subNamespace);
          tools.push(...subTools);
        } else if (entry.isFile() && this.isToolFile(entry.name)) {
          // Parse tool file
          const tool = await this.parseTool(fullPath, namespace);
          if (tool) {
            tools.push(tool);
            this.cachedTools.set(tool.name, tool);
          }
        }
      }
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        console.error(`Error scanning directory ${dirPath}:`, error);
      }
    }

    return tools;
  }

  /**
   * Check if a file is a valid tool file
   */
  private isToolFile(filename: string): boolean {
    return (
      (filename.endsWith('.ts') || filename.endsWith('.js')) &&
      filename !== 'index.ts' &&
      filename !== 'index.js' &&
      !filename.endsWith('.test.ts') &&
      !filename.endsWith('.test.js') &&
      !filename.endsWith('.d.ts')
    );
  }

  /**
   * Parse a tool file to extract metadata
   */
  private async parseTool(filePath: string, namespace: string): Promise<DiscoveredTool | null> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');

      // Extract exported functions using regex
      const exportedFunctions = this.extractExportedFunctions(content);

      if (exportedFunctions.length === 0) {
        return null;
      }

      const filename = path.basename(filePath, path.extname(filePath));
      const toolName = namespace ? `${namespace}.${filename}` : filename;

      return {
        path: filePath,
        name: toolName,
        namespace,
        exportedFunctions,
      };
    } catch (error) {
      console.error(`Error parsing tool file ${filePath}:`, error);
      return null;
    }
  }

  /**
   * Extract exported function names from source code
   */
  private extractExportedFunctions(content: string): string[] {
    const functions: string[] = [];

    // Match: export async function functionName
    const asyncFunctionRegex = /export\s+async\s+function\s+(\w+)/g;
    let match;

    while ((match = asyncFunctionRegex.exec(content)) !== null) {
      functions.push(match[1]);
    }

    // Match: export function functionName
    const functionRegex = /export\s+function\s+(\w+)/g;
    while ((match = functionRegex.exec(content)) !== null) {
      if (!functions.includes(match[1])) {
        functions.push(match[1]);
      }
    }

    // Match: export const functionName = async
    const constAsyncRegex = /export\s+const\s+(\w+)\s*=\s*async/g;
    while ((match = constAsyncRegex.exec(content)) !== null) {
      if (!functions.includes(match[1])) {
        functions.push(match[1]);
      }
    }

    return functions;
  }

  /**
   * Get a specific tool by name
   */
  async getTool(toolName: string): Promise<DiscoveredTool | null> {
    // Check cache first
    if (this.cachedTools.has(toolName)) {
      return this.cachedTools.get(toolName) || null;
    }

    // Refresh cache and search
    await this.discoverTools(true);
    return this.cachedTools.get(toolName) || null;
  }

  /**
   * Generate TypeScript wrapper for a tool
   */
  async generateToolWrapper(tool: DiscoveredTool): Promise<string> {
    const imports = `import { callMCPTool } from '../utils/mcp-client';`;

    const functions = tool.exportedFunctions.map((funcName) => {
      const mcpToolName = `${tool.namespace}__${funcName}`;
      return `
export async function ${funcName}(input: any): Promise<any> {
  return callMCPTool('${mcpToolName}', input);
}`;
    });

    return `${imports}\n\n${functions.join('\n')}`;
  }

  /**
   * Get tool statistics
   */
  async getStatistics(): Promise<{
    totalTools: number;
    toolsByNamespace: Record<string, number>;
    totalFunctions: number;
  }> {
    const tools = await this.discoverTools();

    const toolsByNamespace: Record<string, number> = {};
    let totalFunctions = 0;

    for (const tool of tools) {
      const namespace = tool.namespace || 'root';
      toolsByNamespace[namespace] = (toolsByNamespace[namespace] || 0) + 1;
      totalFunctions += tool.exportedFunctions.length;
    }

    return {
      totalTools: tools.length,
      toolsByNamespace,
      totalFunctions,
    };
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cachedTools.clear();
    this.lastScanTime = 0;
  }
}
