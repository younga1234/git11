import { callMCPTool } from '../../utils/mcp-client';

/**
 * Input schema for search
 */
export interface SearchInput {
  query: string;
  numResults?: number;
  type?: 'neural' | 'keyword' | 'auto';
  category?: string;
  startPublishedDate?: string;
  endPublishedDate?: string;
}

/**
 * Output schema for search
 */
export interface SearchOutput {
  results: Array<{
    title: string;
    url: string;
    publishedDate: string;
    author?: string;
    score: number;
    id: string;
  }>;
  autopromptString?: string;
}

/**
 * Search the web using Exa AI
 *
 * @param input - Search parameters
 * @returns Search results
 *
 * @example
 * ```typescript
 * const results = await search({
 *   query: 'latest developments in AI',
 *   numResults: 10,
 *   type: 'neural'
 * });
 * ```
 */
export async function search(input: SearchInput): Promise<SearchOutput> {
  return callMCPTool<SearchOutput>('exa__search', input);
}
