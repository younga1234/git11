import { callMCPTool } from '../../utils/mcp-client';

/**
 * Input schema for analyze
 */
export interface AnalyzeInput {
  topic: string;
  context?: string;
  focusAreas?: string[];
}

/**
 * Output schema for analyze
 */
export interface AnalyzeOutput {
  analysis: {
    mainPoints: string[];
    assumptions: string[];
    implications: string[];
    uncertainties: string[];
  };
  clarityScore: number;
}

/**
 * Analyze a topic with clear structured thinking
 *
 * @param input - Analysis parameters
 * @returns Structured analysis
 *
 * @example
 * ```typescript
 * const analysis = await analyze({
 *   topic: 'Impact of AI on healthcare',
 *   focusAreas: ['diagnosis', 'treatment', 'ethics']
 * });
 * ```
 */
export async function analyze(input: AnalyzeInput): Promise<AnalyzeOutput> {
  return callMCPTool<AnalyzeOutput>('clear-thought__analyze', input);
}
