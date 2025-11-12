import { callMCPTool } from '../../utils/mcp-client';

/**
 * Input schema for relateMemories
 */
export interface RelateMemoriesInput {
  sourceId: string;
  targetId: string;
  relationship: string;
  properties?: Record<string, any>;
}

/**
 * Output schema for relateMemories
 */
export interface RelateMemoriesOutput {
  relationshipId: string;
  created: boolean;
}

/**
 * Create a relationship between memories
 *
 * @param input - Relationship parameters
 * @returns Relationship result
 */
export async function relateMemories(input: RelateMemoriesInput): Promise<RelateMemoriesOutput> {
  return callMCPTool<RelateMemoriesOutput>('neo4j-memory__relate_memories', input);
}
