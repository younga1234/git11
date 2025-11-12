#!/usr/bin/env node

/**
 * MCP Server for Code Execution
 *
 * Provides a code execution tool via Model Context Protocol
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { createServer, MCPServerConfig } from './server/index.js';
import * as path from 'path';

// Create code execution server
const config: MCPServerConfig = {
  mcpServerUrl: process.env.MCP_SERVER_URL || 'http://localhost:3000',
  mcpApiKey: process.env.MCP_API_KEY,
  toolsDirectory: path.join(__dirname, 'tools'),
  sandboxConfig: {
    timeout: parseInt(process.env.TIMEOUT || '10000'),
    memoryLimit: parseInt(process.env.MEMORY_LIMIT || '256'),
    allowedModules: ['Math', 'JSON', 'Date', 'Array', 'Object', 'String', 'Number'],
  },
};

let codeExecutor: Awaited<ReturnType<typeof createServer>>;

// Create MCP server
const server = new Server(
  {
    name: 'code-execution-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Initialize code executor
async function init() {
  codeExecutor = await createServer(config);
  console.error('✅ Code Execution MCP Server ready');
}

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'execute_code',
        description: `Execute JavaScript/TypeScript code in a secure sandbox environment.

Features:
- Secure sandboxed execution with resource limits
- PII (Personally Identifiable Information) protection
- Support for async/await operations
- Access to Math, JSON, Date and other built-in modules

Parameters:
- code: The JavaScript code to execute
- context: Optional variables to inject into execution context (JSON object)
- enablePIIProtection: Enable PII tokenization (default: true)

Example usage:
{
  "code": "const sum = numbers.reduce((a, b) => a + b, 0); return sum;",
  "context": {"numbers": [1, 2, 3, 4, 5]},
  "enablePIIProtection": true
}

Returns:
- success: Whether execution succeeded
- data: The return value from code execution
- error: Error message if execution failed
- stats: Execution statistics (time, memory, etc.)`,
        inputSchema: {
          type: 'object',
          properties: {
            code: {
              type: 'string',
              description: 'JavaScript code to execute',
            },
            context: {
              type: 'object',
              description: 'Variables to inject into execution context',
              additionalProperties: true,
            },
            enablePIIProtection: {
              type: 'boolean',
              description: 'Enable PII tokenization (default: true)',
              default: true,
            },
          },
          required: ['code'],
        },
      },
    ],
  };
});

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name !== 'execute_code') {
    throw new Error(`Unknown tool: ${request.params.name}`);
  }

  const { code, context = {}, enablePIIProtection = true } = request.params.arguments as {
    code: string;
    context?: Record<string, any>;
    enablePIIProtection?: boolean;
  };

  try {
    const result = await codeExecutor.execute(code, context, {
      enablePIIProtection,
      injectTools: false, // Don't inject tools by default
    });

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: result.success,
            data: result.data,
            error: result.error,
            stats: result.stats,
          }, null, 2),
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: false,
            error: error instanceof Error ? error.message : String(error),
          }, null, 2),
        },
      ],
      isError: true,
    };
  }
});

// Start server
async function main() {
  await init();

  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error('🚀 MCP Code Execution Server started');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
