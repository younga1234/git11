# MCP Code Execution Examples

This directory contains comprehensive examples demonstrating the MCP code execution system.

## Examples Overview

### 1. `basic-usage.ts`
Basic code execution examples:
- Simple calculations
- Math module usage
- Context variables
- PII protection
- Async operations
- Error handling
- JSON processing

```bash
ts-node examples/basic-usage.ts
```

### 2. `tool-usage.ts`
MCP tool integration examples:
- Google Drive operations
- Salesforce queries
- Batch operations
- Cross-platform data sync
- Tool discovery

```bash
ts-node examples/tool-usage.ts
```

### 3. `advanced-patterns.ts`
Advanced programming patterns:
- Retry logic with exponential backoff
- Parallel execution
- Data transformation pipelines
- Conditional tool selection
- Batching and chunking
- Caching strategies
- Circuit breaker pattern

```bash
ts-node examples/advanced-patterns.ts
```

### 4. `mcp-servers-integration.ts`
**NEW!** Integration of 5 MCP servers:
- **DocFork MCP**: Document management
- **Exa AI**: Advanced web search
- **Neo4j Memory**: Knowledge graph storage
- **Sequential Thinking**: Step-by-step reasoning
- **Clear Thought**: Structured analysis

```bash
ts-node examples/mcp-servers-integration.ts
```

## MCP Servers

### DocFork MCP
Document forking and version control:
- `forkDocument`: Create document forks
- `getDocument`: Retrieve documents
- `listForks`: List all forks
- `mergeDocument`: Merge changes

### Exa AI
Advanced AI-powered web search:
- `search`: Neural search
- `searchAndContents`: Search with full content
- `findSimilar`: Find similar pages

**Required**: `EXA_API_KEY` environment variable

### Neo4j Memory
Graph-based agent memory:
- `storeMemory`: Store memories
- `retrieveMemory`: Retrieve specific memory
- `searchMemory`: Search by content
- `relateMemories`: Create relationships

**Required**: Neo4j database connection

### Sequential Thinking
Step-by-step problem solving:
- `startThinking`: Begin thinking session
- `nextStep`: Get next reasoning step
- `evaluateStep`: Evaluate results
- `completeThinking`: Finish session

### Clear Thought
Structured reasoning:
- `analyze`: Analyze topics
- `breakDown`: Decompose problems
- `synthesize`: Combine insights
- `clarify`: Clarify ambiguities

## Setup

### 1. Install Dependencies

```bash
npm install
npm run build
```

### 2. Configure Environment

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
EXA_API_KEY=your_api_key
NEO4J_URI=bolt://localhost:7687
NEO4J_PASSWORD=your_password
```

### 3. Start MCP Servers

The MCP servers need to be running. You can start them individually:

```bash
# DocFork MCP
npx docfork-mcp

# Exa
npx @modelcontextprotocol/server-exa

# Neo4j Memory (requires Neo4j running)
npx knowall-ai-mcp-neo-4-j-agent-memory

# Sequential Thinking
npx smithery-ai-server-sequential-thinking

# Clear Thought
npx waldzellai-clear-thought
```

Or configure them in `mcp-config.json`.

## Running Examples

Run any example with:

```bash
# Basic usage
npm run dev:example examples/basic-usage.ts

# Or with ts-node directly
ts-node examples/basic-usage.ts
```

## Multi-Server Workflow Example

The `mcp-servers-integration.ts` demonstrates a powerful workflow:

1. **Search** for information using Exa AI
2. **Store** findings in Neo4j memory
3. **Process** with sequential thinking
4. **Clarify** results with clear thought
5. **Document** in DocFork MCP

```typescript
// Example: Research and synthesize information
const workflow = await server.execute(`
  // Search for latest info
  const results = await _callTool('exa__search', {
    query: 'AI architecture patterns'
  });

  // Store in memory
  await _callTool('neo4j-memory__store_memory', {
    content: results.results[0].title,
    type: 'fact'
  });

  // Analyze with clear thought
  const analysis = await _callTool('clear-thought__analyze', {
    topic: results.results[0].title
  });

  return analysis;
`, {}, { injectTools: true });
```

## Configuration

### MCP Server URLs

Configure server URLs in `mcp-config.json`:

```json
{
  "mcpServers": {
    "docfork-mcp": {
      "enabled": true,
      "command": "npx",
      "args": ["-y", "docfork-mcp"]
    },
    "exa": {
      "enabled": true,
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-exa"],
      "env": {
        "EXA_API_KEY": "${EXA_API_KEY}"
      }
    }
  }
}
```

### Custom Server Registration

```typescript
import { initializeMCPManager } from 'mcp-code-execution';

const manager = initializeMCPManager();

manager.registerServer(
  'my-server',
  'http://localhost:3000',
  'api-key',
  30000,  // timeout
  3       // retries
);
```

## API Reference

### Tool Naming Convention

Tools follow the pattern: `{server}__{tool_name}`

Examples:
- `exa__search`
- `docfork-mcp__fork_document`
- `neo4j-memory__store_memory`
- `sequential-thinking__start_thinking`
- `clear-thought__analyze`

### Calling Tools

```typescript
// In sandbox code
const result = await _callTool('exa__search', {
  query: 'AI developments',
  numResults: 10
});
```

### Direct API

```typescript
import { getMCPManager } from 'mcp-code-execution';

const manager = getMCPManager();
const result = await manager.callTool(
  'exa',
  'search',
  { query: 'AI' }
);
```

## Troubleshooting

### Server Connection Issues

Check server health:

```typescript
const health = await manager.healthCheckAll();
console.log(health);
```

### Tool Not Found

Verify tool discovery:

```typescript
const tools = await discovery.discoverTools();
console.log(tools.map(t => t.name));
```

### Authentication Errors

Ensure API keys are set:

```bash
echo $EXA_API_KEY
```

## Performance Tips

1. **Use health checks** before executing workflows
2. **Enable caching** for repeated queries
3. **Batch operations** when possible
4. **Monitor PII mappings** to avoid memory leaks
5. **Set appropriate timeouts** for long-running operations

## Best Practices

1. Always handle errors gracefully
2. Use PII protection for sensitive data
3. Implement retry logic for network calls
4. Monitor resource usage
5. Clean up sessions when done

## More Information

- [Main README](../README.md)
- [API Documentation](../docs/API.md)
- [MCP Protocol](https://modelcontextprotocol.io)
