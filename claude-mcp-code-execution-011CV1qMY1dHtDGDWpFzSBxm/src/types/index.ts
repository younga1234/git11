import { z } from 'zod';

/**
 * Tool definition schema
 */
export const ToolSchema = z.object({
  name: z.string(),
  description: z.string(),
  inputSchema: z.record(z.any()),
  outputSchema: z.record(z.any()).optional(),
});

export type Tool = z.infer<typeof ToolSchema>;

/**
 * Execution context for sandboxed code
 */
export interface ExecutionContext {
  timeout: number; // milliseconds
  memoryLimit: number; // bytes
  allowedModules: string[];
  env: Record<string, string>;
}

/**
 * Execution result
 */
export interface ExecutionResult<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    stack?: string;
    code?: string;
  };
  stats: {
    executionTime: number;
    memoryUsed: number;
  };
}

/**
 * PII token mapping
 */
export interface TokenMapping {
  token: string;
  originalValue: string;
  type: PIIType;
}

export enum PIIType {
  EMAIL = 'EMAIL',
  PHONE = 'PHONE',
  SSN = 'SSN',
  CREDIT_CARD = 'CREDIT_CARD',
  NAME = 'NAME',
  ADDRESS = 'ADDRESS',
}

/**
 * Tool discovery result
 */
export interface DiscoveredTool {
  path: string;
  name: string;
  namespace: string;
  exportedFunctions: string[];
}

/**
 * Sandbox configuration
 */
export interface SandboxConfig {
  timeout: number;
  memoryLimit: number;
  allowNetworkAccess: boolean;
  allowFileSystemAccess: boolean;
  allowedModules: string[];
  maxCpuTime: number;
}

/**
 * MCP Tool call request
 */
export interface MCPToolCallRequest {
  toolName: string;
  input: Record<string, any>;
}

/**
 * MCP Tool call response
 */
export interface MCPToolCallResponse<T = any> {
  result: T;
  metadata?: {
    tokensUsed?: number;
    latency?: number;
    attempt?: number;
  };
}

/**
 * Resource limits
 */
export interface ResourceLimits {
  maxExecutionTime: number;
  maxMemory: number;
  maxFileSize: number;
  maxConcurrentExecutions: number;
}
