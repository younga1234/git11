import axios, { AxiosInstance } from 'axios';
import { MCPToolCallRequest, MCPToolCallResponse } from '../types';

/**
 * Enhanced MCP Client for real MCP server communication
 */
export class MCPClient {
  private serverUrl: string;
  private apiKey?: string;
  private timeout: number;
  private client: AxiosInstance;
  private retries: number;

  constructor(
    serverUrl: string,
    apiKey?: string,
    timeout: number = 30000,
    retries: number = 3,
  ) {
    this.serverUrl = serverUrl;
    this.apiKey = apiKey;
    this.timeout = timeout;
    this.retries = retries;

    this.client = axios.create({
      baseURL: serverUrl,
      timeout,
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey && { Authorization: `Bearer ${apiKey}` }),
      },
    });
  }

  /**
   * Call an MCP tool with retry logic
   */
  async callTool<T = any>(
    toolName: string,
    input: Record<string, any>,
  ): Promise<MCPToolCallResponse<T>> {
    const startTime = Date.now();

    for (let attempt = 0; attempt <= this.retries; attempt++) {
      try {
        const response = await this.makeRequest<T>({
          toolName,
          input,
        });

        const latency = Date.now() - startTime;

        return {
          result: response,
          metadata: {
            latency,
            attempt: attempt + 1,
          },
        };
      } catch (error) {
        const isLastAttempt = attempt === this.retries;

        if (isLastAttempt) {
          throw new Error(
            `MCP tool call failed after ${this.retries + 1} attempts: ${
              error instanceof Error ? error.message : 'Unknown error'
            }`,
          );
        }

        // Exponential backoff
        const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    throw new Error('Unexpected error in callTool');
  }

  /**
   * Make HTTP request to MCP server
   */
  private async makeRequest<T>(request: MCPToolCallRequest): Promise<T> {
    try {
      const response = await this.client.post<{ result: T }>(
        `/tools/${request.toolName}`,
        request.input,
      );

      return response.data.result;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          throw new Error(
            `MCP server error (${error.response.status}): ${
              error.response.data?.message || error.message
            }`,
          );
        } else if (error.request) {
          throw new Error(`MCP server unreachable: ${this.serverUrl}`);
        }
      }
      throw error;
    }
  }

  /**
   * List available tools from the MCP server
   */
  async listTools(): Promise<string[]> {
    try {
      const response = await this.client.get<{ tools: string[] }>('/tools');
      return response.data.tools;
    } catch (error) {
      console.warn('Failed to list tools from MCP server:', error);
      return [];
    }
  }

  /**
   * Get tool schema
   */
  async getToolSchema(toolName: string): Promise<Record<string, any>> {
    try {
      const response = await this.client.get<{ schema: Record<string, any> }>(
        `/tools/${toolName}/schema`,
      );
      return response.data.schema;
    } catch (error) {
      console.warn(`Failed to get schema for tool ${toolName}:`, error);
      return {};
    }
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.client.get('/health');
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get server info
   */
  async getServerInfo(): Promise<{
    name: string;
    version: string;
    capabilities: string[];
  }> {
    try {
      const response = await this.client.get<{
        name: string;
        version: string;
        capabilities: string[];
      }>('/info');
      return response.data;
    } catch (error) {
      return {
        name: 'Unknown',
        version: '0.0.0',
        capabilities: [],
      };
    }
  }
}

/**
 * MCP Server Manager - manages multiple MCP servers
 */
export class MCPServerManager {
  private clients: Map<string, MCPClient> = new Map();
  private config: Map<
    string,
    { url: string; apiKey?: string; timeout?: number; retries?: number }
  > = new Map();

  /**
   * Register an MCP server
   */
  registerServer(
    name: string,
    url: string,
    apiKey?: string,
    timeout?: number,
    retries?: number,
  ): void {
    this.config.set(name, { url, apiKey, timeout, retries });
    const client = new MCPClient(url, apiKey, timeout, retries);
    this.clients.set(name, client);
  }

  /**
   * Get a client for a specific server
   */
  getClient(serverName: string): MCPClient | undefined {
    return this.clients.get(serverName);
  }

  /**
   * Call a tool on a specific server
   */
  async callTool<T = any>(
    serverName: string,
    toolName: string,
    input: Record<string, any>,
  ): Promise<MCPToolCallResponse<T>> {
    const client = this.clients.get(serverName);
    if (!client) {
      throw new Error(`MCP server '${serverName}' not found`);
    }

    return client.callTool<T>(toolName, input);
  }

  /**
   * Health check all servers
   */
  async healthCheckAll(): Promise<Map<string, boolean>> {
    const results = new Map<string, boolean>();

    for (const [name, client] of this.clients.entries()) {
      const healthy = await client.healthCheck();
      results.set(name, healthy);
    }

    return results;
  }

  /**
   * Get info from all servers
   */
  async getAllServerInfo(): Promise<
    Map<string, { name: string; version: string; capabilities: string[] }>
  > {
    const results = new Map();

    for (const [name, client] of this.clients.entries()) {
      const info = await client.getServerInfo();
      results.set(name, info);
    }

    return results;
  }

  /**
   * List all registered servers
   */
  listServers(): string[] {
    return Array.from(this.clients.keys());
  }
}

/**
 * Global MCP server manager instance
 */
let globalManager: MCPServerManager | null = null;

/**
 * Initialize the global MCP server manager
 */
export function initializeMCPManager(): MCPServerManager {
  if (!globalManager) {
    globalManager = new MCPServerManager();
  }
  return globalManager;
}

/**
 * Get the global MCP server manager
 */
export function getMCPManager(): MCPServerManager {
  if (!globalManager) {
    throw new Error(
      'MCP server manager not initialized. Call initializeMCPManager() first.',
    );
  }
  return globalManager;
}

/**
 * Helper function to call MCP tools (legacy compatibility)
 */
export async function callMCPTool<T = any>(
  toolName: string,
  input: Record<string, any>,
): Promise<T> {
  // Parse server name from tool name (format: servername__toolname)
  const parts = toolName.split('__');
  if (parts.length !== 2) {
    throw new Error(
      `Invalid tool name format. Expected 'servername__toolname', got '${toolName}'`,
    );
  }

  const [serverName, actualToolName] = parts;
  const manager = getMCPManager();
  const response = await manager.callTool<T>(serverName, actualToolName, input);

  return response.result;
}

// Backward compatibility
export function initializeMCPClient(serverUrl: string, apiKey?: string): void {
  const manager = initializeMCPManager();
  manager.registerServer('default', serverUrl, apiKey);
}

export function getMCPClient(): MCPClient {
  const manager = getMCPManager();
  const client = manager.getClient('default');
  if (!client) {
    throw new Error('Default MCP client not initialized');
  }
  return client;
}
