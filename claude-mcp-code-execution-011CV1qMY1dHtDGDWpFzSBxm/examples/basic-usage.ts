/**
 * Basic Usage Example
 * Demonstrates simple code execution with MCP
 */

import { createServer, MCPServerConfig } from '../src/server';
import * as path from 'path';

async function main() {
  // Configure the server
  const config: MCPServerConfig = {
    mcpServerUrl: 'http://localhost:3000',
    mcpApiKey: process.env.MCP_API_KEY,
    toolsDirectory: path.join(__dirname, '../src/tools'),
    sandboxConfig: {
      timeout: 5000,
      memoryLimit: 128,
      allowedModules: ['Math', 'JSON', 'Date'],
    },
  };

  // Create and start the server
  const server = await createServer(config);

  try {
    // Example 1: Simple calculation
    console.log('\n=== Example 1: Simple Calculation ===');
    const result1 = await server.execute(`
      const a = 10;
      const b = 20;
      return a + b;
    `);
    console.log('Result:', result1.data);
    console.log('Execution time:', result1.stats.executionTime, 'ms');

    // Example 2: Using Math module
    console.log('\n=== Example 2: Using Math Module ===');
    const result2 = await server.execute(`
      const numbers = [1, 4, 9, 16, 25];
      return numbers.map(n => Math.sqrt(n));
    `);
    console.log('Square roots:', result2.data);

    // Example 3: With context variables
    console.log('\n=== Example 3: With Context Variables ===');
    const result3 = await server.execute(
      `
      const greeting = \`Hello, \${name}! You are \${age} years old.\`;
      return greeting;
    `,
      { name: 'Alice', age: 30 },
    );
    console.log('Greeting:', result3.data);

    // Example 4: With PII protection
    console.log('\n=== Example 4: PII Protection ===');
    const result4 = await server.execute(
      `
      const message = \`User email: \${email}, Phone: \${phone}\`;
      return message;
    `,
      {
        email: 'alice@example.com',
        phone: '555-123-4567',
      },
      { enablePIIProtection: true },
    );
    console.log('Protected message:', result4.data);

    // Example 5: Async operations
    console.log('\n=== Example 5: Async Operations ===');
    const result5 = await server.execute(`
      const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

      await delay(100);
      const data = await Promise.resolve({ status: 'completed' });

      return data;
    `);
    console.log('Async result:', result5.data);

    // Example 6: Error handling
    console.log('\n=== Example 6: Error Handling ===');
    const result6 = await server.execute(`
      if (Math.random() > 0.5) {
        throw new Error('Random error occurred!');
      }
      return 'Success';
    `);
    if (!result6.success) {
      console.log('Error caught:', result6.error?.message);
    } else {
      console.log('Result:', result6.data);
    }

    // Example 7: JSON processing
    console.log('\n=== Example 7: JSON Processing ===');
    const result7 = await server.execute(
      `
      const parsed = JSON.parse(jsonData);
      parsed.processed = true;
      parsed.timestamp = Date.now();
      return JSON.stringify(parsed, null, 2);
    `,
      { jsonData: '{"name":"Bob","age":25}' },
    );
    console.log('Processed JSON:', result7.data);

    // Get server statistics
    console.log('\n=== Server Statistics ===');
    const stats = server.getStatistics();
    console.log('Active executions:', stats.activeExecutions);
    console.log('PII mappings:', stats.piiMappings);
  } finally {
    // Clean up
    await server.stop();
  }
}

// Run the example
main().catch(console.error);
