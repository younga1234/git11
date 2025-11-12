import { CodeExecutor } from './executor.js';
import { initializeMCPClient } from '../utils/mcp-client.js';
import { SandboxConfig, ResourceLimits } from '../types/index.js';
import * as path from 'path';

/**
 * MCP Code Execution Server Configuration
 */
export interface MCPServerConfig {
  mcpServerUrl: string;
  mcpApiKey?: string;
  toolsDirectory: string;
  sandboxConfig?: Partial<SandboxConfig>;
  resourceLimits?: Partial<ResourceLimits>;
}

/**
 * MCP Code Execution Server
 * Main entry point for the MCP code execution system
 */
export class MCPCodeExecutionServer {
  private executor: CodeExecutor;
  private config: MCPServerConfig;

  constructor(config: MCPServerConfig) {
    this.config = config;

    // Initialize MCP client
    initializeMCPClient(config.mcpServerUrl, config.mcpApiKey);

    // Initialize code executor
    this.executor = new CodeExecutor(
      config.toolsDirectory,
      config.sandboxConfig,
      config.resourceLimits,
    );
  }

  /**
   * Start the server
   */
  async start(): Promise<void> {
    console.log('🚀 MCP Code Execution Server starting...');
    console.log(`📁 Tools directory: ${this.config.toolsDirectory}`);
    console.log(`🔗 MCP Server URL: ${this.config.mcpServerUrl}`);

    // Discover available tools
    const stats = await this.executor['discovery'].getStatistics();
    console.log(`✅ Discovered ${stats.totalTools} tools with ${stats.totalFunctions} functions`);
    console.log(`📊 Tools by namespace:`, stats.toolsByNamespace);

    console.log('✨ Server ready!');
  }

  /**
   * Stop the server
   */
  async stop(): Promise<void> {
    console.log('🛑 MCP Code Execution Server stopping...');
    await this.executor.cleanup();
    console.log('✅ Server stopped');
  }

  /**
   * Get the code executor instance
   */
  getExecutor(): CodeExecutor {
    return this.executor;
  }

  /**
   * Execute code
   */
  async execute(
    code: string,
    context?: Record<string, any>,
    options?: {
      enablePIIProtection?: boolean;
      injectTools?: boolean;
    },
  ) {
    return this.executor.execute(code, context, options);
  }

  /**
   * Get server statistics
   */
  getStatistics() {
    return this.executor.getStatistics();
  }
}

/**
 * Create and start an MCP Code Execution Server
 */
export async function createServer(config: MCPServerConfig): Promise<MCPCodeExecutionServer> {
  const server = new MCPCodeExecutionServer(config);
  await server.start();
  return server;
}

// Export all main components
export * from './executor';
export * from './sandbox';
export * from './discovery';
export * from './tokenizer';
export * from '../types';
export * from '../utils/mcp-client';

// CLI entry point
if (require.main === module) {
  const defaultConfig: MCPServerConfig = {
    mcpServerUrl: process.env.MCP_SERVER_URL || 'http://localhost:3000',
    mcpApiKey: process.env.MCP_API_KEY,
    toolsDirectory: path.join(__dirname, '../tools'),
    sandboxConfig: {
      timeout: 5000,
      memoryLimit: 128,
      allowedModules: ['Math', 'JSON', 'Date'],
    },
    resourceLimits: {
      maxExecutionTime: 30000,
      maxMemory: 256 * 1024 * 1024,
      maxConcurrentExecutions: 10,
    },
  };

  createServer(defaultConfig)
    .then((server) => {
      console.log('Server started successfully');

      // Handle shutdown
      process.on('SIGINT', async () => {
        await server.stop();
        process.exit(0);
      });

      process.on('SIGTERM', async () => {
        await server.stop();
        process.exit(0);
      });
    })
    .catch((error) => {
      console.error('Failed to start server:', error);
      process.exit(1);
    });
}
