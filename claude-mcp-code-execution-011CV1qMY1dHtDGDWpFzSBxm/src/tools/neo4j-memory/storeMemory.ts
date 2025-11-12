import { callMCPTool } from '../../utils/mcp-client';

/**
 * Input schema for storeMemory
 */
export interface StoreMemoryInput {
  content: string;
  type: 'fact' | 'event' | 'conversation' | 'observation';
  metadata?: {
    timestamp?: string;
    source?: string;
    importance?: number;
    tags?: string[];
  };
  entities?: Array<{
    name: string;
    type: string;
    properties?: Record<string, any>;
  }>;
}

/**
 * Output schema for storeMemory
 */
export interface StoreMemoryOutput {
  memoryId: string;
  nodeId: string;
  created: boolean;
  relationships: number;
}

/**
 * Store a memory in the knowledge graph
 *
 * @param input - Memory data
 * @returns Storage result
 *
 * @example
 * ```typescript
 * const result = await storeMemory({
 *   content: 'User prefers dark mode',
 *   type: 'observation',
 *   metadata: { importance: 8 }
 * });
 * ```
 */
export async function storeMemory(input: StoreMemoryInput): Promise<StoreMemoryOutput> {
  return callMCPTool<StoreMemoryOutput>('neo4j-memory__store_memory', input);
}
