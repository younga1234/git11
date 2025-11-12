/**
 * MCP Servers Integration Example
 * Demonstrates integration of all 5 MCP servers
 */

import { createServer, MCPServerConfig } from '../src/server';
import { initializeMCPManager } from '../src/utils/mcp-client';
import * as path from 'path';

async function main() {
  console.log('🚀 Initializing MCP Code Execution with Multiple Servers...\n');

  // Initialize MCP Server Manager
  const manager = initializeMCPManager();

  // Register all MCP servers
  console.log('📡 Registering MCP servers...');

  manager.registerServer(
    'docfork-mcp',
    process.env.DOCFORK_MCP_URL || 'http://localhost:3001',
  );

  manager.registerServer(
    'exa',
    process.env.EXA_URL || 'http://localhost:3002',
    process.env.EXA_API_KEY,
  );

  manager.registerServer(
    'neo4j-memory',
    process.env.NEO4J_MEMORY_URL || 'http://localhost:3003',
  );

  manager.registerServer(
    'sequential-thinking',
    process.env.SEQUENTIAL_THINKING_URL || 'http://localhost:3004',
  );

  manager.registerServer(
    'clear-thought',
    process.env.CLEAR_THOUGHT_URL || 'http://localhost:3005',
  );

  console.log('✅ Registered servers:', manager.listServers().join(', '));
  console.log();

  // Create MCP code execution server
  const config: MCPServerConfig = {
    mcpServerUrl: 'http://localhost:3000',
    toolsDirectory: path.join(__dirname, '../src/tools'),
    sandboxConfig: {
      timeout: 10000,
      memoryLimit: 256,
      allowedModules: ['Math', 'JSON', 'Date'],
    },
  };

  const server = await createServer(config);

  try {
    // Health check all servers
    console.log('🏥 Checking server health...');
    const health = await manager.healthCheckAll();
    for (const [name, healthy] of health.entries()) {
      console.log(`  ${healthy ? '✅' : '❌'} ${name}`);
    }
    console.log();

    // Example 1: DocFork MCP - Document Management
    console.log('=== Example 1: Document Forking ===');
    const docForkExample = await server.execute(
      `
      // Fork a document
      const fork = await _callTool('docfork-mcp__fork_document', {
        documentId: 'doc123',
        name: 'My Fork',
        preserveHistory: true
      });

      // List all forks
      const forks = await _callTool('docfork-mcp__list_forks', {
        documentId: 'doc123',
        recursive: true
      });

      return { fork, forks };
    `,
      {},
      { injectTools: true },
    );
    console.log('Result:', JSON.stringify(docForkExample.data, null, 2));
    console.log();

    // Example 2: Exa AI - Web Search
    console.log('=== Example 2: Advanced Web Search ===');
    const exaExample = await server.execute(
      `
      // Search for latest AI developments
      const results = await _callTool('exa__search', {
        query: 'latest developments in Large Language Models',
        numResults: 5,
        type: 'neural'
      });

      // Get similar articles to first result
      if (results.results && results.results.length > 0) {
        const similar = await _callTool('exa__find_similar', {
          url: results.results[0].url,
          numResults: 3
        });
        return { mainResults: results, similar };
      }

      return results;
    `,
      {},
      { injectTools: true },
    );
    console.log('Result:', JSON.stringify(exaExample.data, null, 2));
    console.log();

    // Example 3: Neo4j Memory - Knowledge Graph
    console.log('=== Example 3: Agent Memory System ===');
    const memoryExample = await server.execute(
      `
      // Store a memory
      const stored = await _callTool('neo4j-memory__store_memory', {
        content: 'User prefers TypeScript over JavaScript',
        type: 'observation',
        metadata: {
          timestamp: new Date().toISOString(),
          importance: 8,
          tags: ['preference', 'programming']
        }
      });

      // Search for related memories
      const memories = await _callTool('neo4j-memory__search_memory', {
        query: 'programming preferences',
        limit: 5,
        minImportance: 5
      });

      return { stored, memories };
    `,
      {},
      { injectTools: true },
    );
    console.log('Result:', JSON.stringify(memoryExample.data, null, 2));
    console.log();

    // Example 4: Sequential Thinking - Problem Solving
    console.log('=== Example 4: Sequential Thinking Process ===');
    const thinkingExample = await server.execute(
      `
      // Start a thinking session
      const session = await _callTool('sequential-thinking__start_thinking', {
        problem: 'Design a scalable microservices architecture',
        goal: 'Handle 100K requests per second',
        constraints: ['Low latency', 'High availability', 'Cost effective']
      });

      // Get first few steps
      const step1 = await _callTool('sequential-thinking__next_step', {
        sessionId: session.sessionId
      });

      const step2 = await _callTool('sequential-thinking__next_step', {
        sessionId: session.sessionId,
        previousResult: 'Completed initial analysis'
      });

      return { session, steps: [step1, step2] };
    `,
      {},
      { injectTools: true },
    );
    console.log('Result:', JSON.stringify(thinkingExample.data, null, 2));
    console.log();

    // Example 5: Clear Thought - Structured Reasoning
    console.log('=== Example 5: Clear Thought Analysis ===');
    const clearThoughtExample = await server.execute(
      `
      // Analyze a complex topic
      const analysis = await _callTool('clear-thought__analyze', {
        topic: 'Impact of AI on software development',
        focusAreas: ['productivity', 'code quality', 'job market']
      });

      // Break down the problem
      const breakdown = await _callTool('clear-thought__break_down', {
        problem: 'Implementing AI in existing development workflow',
        maxLevels: 3
      });

      return { analysis, breakdown };
    `,
      {},
      { injectTools: true },
    );
    console.log('Result:', JSON.stringify(clearThoughtExample.data, null, 2));
    console.log();

    // Example 6: Multi-Server Workflow
    console.log('=== Example 6: Multi-Server Workflow ===');
    const multiServerExample = await server.execute(
      `
      // Complex workflow using multiple servers

      // 1. Search for information (Exa)
      const searchResults = await _callTool('exa__search', {
        query: 'microservices architecture patterns',
        numResults: 5
      });

      // 2. Store findings in memory (Neo4j)
      const memories = [];
      if (searchResults.results) {
        for (const result of searchResults.results.slice(0, 3)) {
          const memory = await _callTool('neo4j-memory__store_memory', {
            content: \`Found article: \${result.title}\`,
            type: 'fact',
            metadata: {
              source: result.url,
              timestamp: new Date().toISOString()
            }
          });
          memories.push(memory);
        }
      }

      // 3. Use sequential thinking to process (Sequential Thinking)
      const thinking = await _callTool('sequential-thinking__start_thinking', {
        problem: 'Synthesize microservices patterns from research',
        context: \`Found \${searchResults.results?.length || 0} articles\`
      });

      // 4. Clarify findings (Clear Thought)
      const clarified = await _callTool('clear-thought__clarify', {
        statement: thinking.initialAnalysis
      });

      return {
        searchCount: searchResults.results?.length || 0,
        memoriesStored: memories.length,
        thinkingSession: thinking.sessionId,
        clarification: clarified.clarified
      };
    `,
      {},
      { injectTools: true },
    );
    console.log('Result:', JSON.stringify(multiServerExample.data, null, 2));
    console.log();

    // Get server info
    console.log('=== Server Information ===');
    const serverInfo = await manager.getAllServerInfo();
    for (const [name, info] of serverInfo.entries()) {
      console.log(`\n📦 ${name}`);
      console.log(`   Version: ${info.version}`);
      console.log(`   Capabilities: ${info.capabilities.join(', ')}`);
    }

    // Statistics
    console.log('\n=== Server Statistics ===');
    const stats = server.getStatistics();
    console.log(`Active executions: ${stats.activeExecutions}`);
    console.log(`PII mappings: ${stats.piiMappings}`);
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await server.stop();
  }
}

// Run the example
if (require.main === module) {
  main().catch(console.error);
}

export { main };
