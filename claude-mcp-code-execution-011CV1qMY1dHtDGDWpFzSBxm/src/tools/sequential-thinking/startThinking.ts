import { callMCPTool } from '../../utils/mcp-client';

/**
 * Input schema for startThinking
 */
export interface StartThinkingInput {
  problem: string;
  context?: string;
  goal?: string;
  constraints?: string[];
}

/**
 * Output schema for startThinking
 */
export interface StartThinkingOutput {
  sessionId: string;
  initialAnalysis: string;
  proposedSteps: string[];
  estimatedDifficulty: 'easy' | 'medium' | 'hard';
}

/**
 * Start a sequential thinking session
 *
 * @param input - Problem description
 * @returns Thinking session details
 *
 * @example
 * ```typescript
 * const session = await startThinking({
 *   problem: 'Design a scalable API architecture',
 *   goal: 'Handle 10K requests/second'
 * });
 * ```
 */
export async function startThinking(input: StartThinkingInput): Promise<StartThinkingOutput> {
  return callMCPTool<StartThinkingOutput>('sequential-thinking__start_thinking', input);
}
