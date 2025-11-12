import { Sandbox } from './sandbox';
import { PIITokenizer, getTokenizer } from './tokenizer';
import { ToolDiscovery } from './discovery';
import { ExecutionResult, SandboxConfig, ResourceLimits } from '../types';
import { getMCPClient } from '../utils/mcp-client';

/**
 * Code Execution Engine
 * Orchestrates code execution with sandboxing, PII protection, and tool discovery
 */
export class CodeExecutor {
  private sandbox: Sandbox;
  private tokenizer: PIITokenizer;
  private discovery: ToolDiscovery;
  private resourceLimits: ResourceLimits;
  private activeExecutions: Map<string, Promise<ExecutionResult>> = new Map();

  constructor(
    toolsDirectory: string,
    sandboxConfig?: Partial<SandboxConfig>,
    resourceLimits?: Partial<ResourceLimits>,
  ) {
    this.sandbox = new Sandbox(sandboxConfig);
    this.tokenizer = getTokenizer();
    this.discovery = new ToolDiscovery(toolsDirectory);

    this.resourceLimits = {
      maxExecutionTime: resourceLimits?.maxExecutionTime || 30000,
      maxMemory: resourceLimits?.maxMemory || 256 * 1024 * 1024, // 256MB
      maxFileSize: resourceLimits?.maxFileSize || 10 * 1024 * 1024, // 10MB
      maxConcurrentExecutions: resourceLimits?.maxConcurrentExecutions || 10,
    };
  }

  /**
   * Execute code with full safety features
   */
  async execute<T = any>(
    code: string,
    context: Record<string, any> = {},
    options: {
      enablePIIProtection?: boolean;
      executionId?: string;
      injectTools?: boolean;
    } = {},
  ): Promise<ExecutionResult<T>> {
    const {
      enablePIIProtection = true,
      executionId = this.generateExecutionId(),
      injectTools = true,
    } = options;

    // Check concurrent execution limit
    if (this.activeExecutions.size >= this.resourceLimits.maxConcurrentExecutions) {
      return {
        success: false,
        error: {
          message: 'Maximum concurrent executions reached',
          code: 'CONCURRENT_LIMIT',
        },
        stats: {
          executionTime: 0,
          memoryUsed: 0,
        },
      };
    }

    // Tokenize sensitive data in context if enabled
    let processedContext = context;
    if (enablePIIProtection) {
      processedContext = this.tokenizer.tokenizeToolInput(context);
    }

    // Inject tool discovery capabilities
    if (injectTools) {
      processedContext = {
        ...processedContext,
        _tools: await this.getToolsList(),
        _callTool: this.createToolCaller(),
      };
    }

    // Create execution promise
    const executionPromise = this.executeInternal<T>(code, processedContext, enablePIIProtection);

    // Track active execution
    this.activeExecutions.set(executionId, executionPromise as Promise<ExecutionResult>);

    try {
      const result = await executionPromise;

      // Detokenize result if PII protection was enabled
      if (enablePIIProtection && result.success && result.data) {
        result.data = this.detokenizeData(result.data);
      }

      return result;
    } finally {
      // Remove from active executions
      this.activeExecutions.delete(executionId);
    }
  }

  /**
   * Internal execution logic
   */
  private async executeInternal<T>(
    code: string,
    context: Record<string, any>,
    enablePIIProtection: boolean,
  ): Promise<ExecutionResult<T>> {
    try {
      // Execute in sandbox
      const result = await this.sandbox.execute<T>(code, context);

      return result;
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Unknown execution error',
          stack: error instanceof Error ? error.stack : undefined,
          code: 'EXECUTION_ERROR',
        },
        stats: {
          executionTime: 0,
          memoryUsed: 0,
        },
      };
    }
  }

  /**
   * Get list of available tools
   */
  private async getToolsList(): Promise<string[]> {
    const tools = await this.discovery.discoverTools();
    return tools.map((tool) => tool.name);
  }

  /**
   * Create a tool caller function for the sandbox
   */
  private createToolCaller() {
    return async (toolName: string, input: Record<string, any>) => {
      try {
        const client = getMCPClient();

        // Detokenize input before sending to MCP
        const detokenizedInput = this.tokenizer.detokenizeToolOutput(input);

        // Call the tool
        const response = await client.callTool(toolName, detokenizedInput);

        // Tokenize response
        const tokenizedResponse = this.tokenizer.tokenizeToolInput(response.result);

        return tokenizedResponse;
      } catch (error) {
        throw new Error(`Tool call failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    };
  }

  /**
   * Detokenize data recursively
   */
  private detokenizeData(data: any): any {
    if (typeof data === 'string') {
      return this.tokenizer.detokenize(data);
    } else if (Array.isArray(data)) {
      return data.map((item) => this.detokenizeData(item));
    } else if (typeof data === 'object' && data !== null) {
      return this.tokenizer.detokenizeToolOutput(data);
    }
    return data;
  }

  /**
   * Generate unique execution ID
   */
  private generateExecutionId(): string {
    return `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Execute code from file
   */
  async executeFile(
    filePath: string,
    context?: Record<string, any>,
    options?: {
      enablePIIProtection?: boolean;
      injectTools?: boolean;
    },
  ): Promise<ExecutionResult> {
    const fs = await import('fs/promises');
    try {
      const code = await fs.readFile(filePath, 'utf-8');
      return await this.execute(code, context, options);
    } catch (error) {
      return {
        success: false,
        error: {
          message: `Failed to read file: ${error instanceof Error ? error.message : 'Unknown error'}`,
          code: 'FILE_READ_ERROR',
        },
        stats: {
          executionTime: 0,
          memoryUsed: 0,
        },
      };
    }
  }

  /**
   * Get execution statistics
   */
  getStatistics() {
    return {
      activeExecutions: this.activeExecutions.size,
      maxConcurrentExecutions: this.resourceLimits.maxConcurrentExecutions,
      piiMappings: this.tokenizer.getMappings().length,
    };
  }

  /**
   * Cancel an execution
   */
  async cancelExecution(executionId: string): Promise<boolean> {
    if (this.activeExecutions.has(executionId)) {
      this.activeExecutions.delete(executionId);
      return true;
    }
    return false;
  }

  /**
   * Clean up resources
   */
  async cleanup(): Promise<void> {
    this.activeExecutions.clear();
    this.tokenizer.clear();
    this.discovery.clearCache();
    this.sandbox.dispose();
  }
}
