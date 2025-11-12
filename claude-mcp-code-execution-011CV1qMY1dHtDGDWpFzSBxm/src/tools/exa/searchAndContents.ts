import { callMCPTool } from '../../utils/mcp-client';

/**
 * Input schema for searchAndContents
 */
export interface SearchAndContentsInput {
  query: string;
  numResults?: number;
  text?: boolean | { maxCharacters?: number; includeHtmlTags?: boolean };
  highlights?: boolean | { numSentences?: number; highlightsPerUrl?: number };
}

/**
 * Output schema for searchAndContents
 */
export interface SearchAndContentsOutput {
  results: Array<{
    title: string;
    url: string;
    publishedDate: string;
    author?: string;
    score: number;
    text?: string;
    highlights?: string[];
  }>;
}

/**
 * Search and retrieve full content
 *
 * @param input - Search parameters
 * @returns Search results with content
 */
export async function searchAndContents(
  input: SearchAndContentsInput,
): Promise<SearchAndContentsOutput> {
  return callMCPTool<SearchAndContentsOutput>('exa__search_and_contents', input);
}
