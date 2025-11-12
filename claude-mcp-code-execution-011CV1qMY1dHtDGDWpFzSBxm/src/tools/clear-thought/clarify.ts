import { callMCPTool } from '../../utils/mcp-client';

/**
 * Input schema for clarify
 */
export interface ClarifyInput {
  statement: string;
  ambiguities?: string[];
}

/**
 * Output schema for clarify
 */
export interface ClarifyOutput {
  clarified: string;
  improvements: Array<{
    original: string;
    improved: string;
    reason: string;
  }>;
  remainingAmbiguities: string[];
}

/**
 * Clarify ambiguous statements
 *
 * @param input - Clarification parameters
 * @returns Clarified statement
 */
export async function clarify(input: ClarifyInput): Promise<ClarifyOutput> {
  return callMCPTool<ClarifyOutput>('clear-thought__clarify', input);
}
