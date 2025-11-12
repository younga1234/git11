import { callMCPTool } from '../../utils/mcp-client';

/**
 * Input schema for listForks
 */
export interface ListForksInput {
  documentId: string;
  recursive?: boolean;
}

/**
 * Output schema for listForks
 */
export interface ListForksOutput {
  forks: Array<{
    id: string;
    name: string;
    createdAt: string;
    author: string;
    divergence: number;
  }>;
  totalCount: number;
}

/**
 * List all forks of a document
 *
 * @param input - List parameters
 * @returns List of forks
 */
export async function listForks(input: ListForksInput): Promise<ListForksOutput> {
  return callMCPTool<ListForksOutput>('docfork-mcp__list_forks', input);
}
