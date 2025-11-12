import { callMCPTool } from '../../utils/mcp-client';

/**
 * Input schema for breakDown
 */
export interface BreakDownInput {
  problem: string;
  maxLevels?: number;
}

/**
 * Output schema for breakDown
 */
export interface BreakDownOutput {
  components: Array<{
    id: string;
    name: string;
    description: string;
    level: number;
    dependencies: string[];
    subComponents?: string[];
  }>;
  hierarchy: Record<string, string[]>;
}

/**
 * Break down a complex problem into components
 *
 * @param input - Problem description
 * @returns Component breakdown
 */
export async function breakDown(input: BreakDownInput): Promise<BreakDownOutput> {
  return callMCPTool<BreakDownOutput>('clear-thought__break_down', input);
}
