import { callMCPTool } from '../../utils/mcp-client';

/**
 * Input schema for retrieveMemory
 */
export interface RetrieveMemoryInput {
  memoryId: string;
  includeRelated?: boolean;
  depth?: number;
}

/**
 * Output schema for retrieveMemory
 */
export interface RetrieveMemoryOutput {
  memory: {
    id: string;
    content: string;
    type: string;
    metadata: Record<string, any>;
    createdAt: string;
  };
  related?: Array<{
    id: string;
    content: string;
    relationship: string;
    distance: number;
  }>;
}

/**
 * Retrieve a specific memory
 *
 * @param input - Retrieval parameters
 * @returns Memory data
 */
export async function retrieveMemory(input: RetrieveMemoryInput): Promise<RetrieveMemoryOutput> {
  return callMCPTool<RetrieveMemoryOutput>('neo4j-memory__retrieve_memory', input);
}
