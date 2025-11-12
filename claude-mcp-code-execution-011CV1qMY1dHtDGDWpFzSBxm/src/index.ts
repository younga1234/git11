/**
 * MCP Code Execution System
 *
 * A production-ready implementation of Anthropic's MCP (Model Context Protocol)
 * code execution with:
 * - Filesystem-based tool discovery
 * - Secure sandboxed execution
 * - PII tokenization
 * - Resource limits and monitoring
 * - Multi-server support
 *
 * @packageDocumentation
 */

export * from './server';
export * from './types';
export * from './utils/mcp-client';

// Export MCP server tools as namespaces to avoid conflicts
import * as GoogleDrive from './tools/google-drive';
import * as Salesforce from './tools/salesforce';
import * as DocFork from './tools/docfork-mcp';
import * as Exa from './tools/exa';
import * as Neo4jMemory from './tools/neo4j-memory';
import * as SequentialThinking from './tools/sequential-thinking';
import * as ClearThought from './tools/clear-thought';

export { GoogleDrive, Salesforce, DocFork, Exa, Neo4jMemory, SequentialThinking, ClearThought };
