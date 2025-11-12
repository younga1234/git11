import { callMCPTool } from '../../utils/mcp-client';

/**
 * Input schema for searchMemory
 */
export interface SearchMemoryInput {
  query: string;
  type?: string[];
  limit?: number;
  minImportance?: number;
  timeRange?: {
    start?: string;
    end?: string;
  };
}

/**
 * Output schema for searchMemory
 */
export interface SearchMemoryOutput {
  memories: Array<{
    id: string;
    content: string;
    type: string;
    relevanceScore: number;
    metadata: Record<string, any>;
  }>;
  totalCount: number;
}

/**
 * Search memories by content
 *
 * @param input - Search parameters
 * @returns Matching memories
 */
export async function searchMemory(input: SearchMemoryInput): Promise<SearchMemoryOutput> {
  return callMCPTool<SearchMemoryOutput>('neo4j-memory__search_memory', input);
}
