import { callMCPTool } from '../../utils/mcp-client';

/**
 * Input schema for findSimilar
 */
export interface FindSimilarInput {
  url: string;
  numResults?: number;
  excludeSourceDomain?: boolean;
}

/**
 * Output schema for findSimilar
 */
export interface FindSimilarOutput {
  results: Array<{
    title: string;
    url: string;
    publishedDate: string;
    author?: string;
    score: number;
  }>;
}

/**
 * Find similar pages to a given URL
 *
 * @param input - Similar search parameters
 * @returns Similar pages
 */
export async function findSimilar(input: FindSimilarInput): Promise<FindSimilarOutput> {
  return callMCPTool<FindSimilarOutput>('exa__find_similar', input);
}
