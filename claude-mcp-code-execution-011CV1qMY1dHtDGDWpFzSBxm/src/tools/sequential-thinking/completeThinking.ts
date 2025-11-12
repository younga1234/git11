import { callMCPTool } from '../../utils/mcp-client';

/**
 * Input schema for completeThinking
 */
export interface CompleteThinkingInput {
  sessionId: string;
  finalResult?: string;
}

/**
 * Output schema for completeThinking
 */
export interface CompleteThinkingOutput {
  summary: string;
  stepsCompleted: number;
  totalTime: number;
  insights: string[];
  recommendations?: string[];
}

/**
 * Complete a thinking session
 *
 * @param input - Completion parameters
 * @returns Summary and insights
 */
export async function completeThinking(input: CompleteThinkingInput): Promise<CompleteThinkingOutput> {
  return callMCPTool<CompleteThinkingOutput>('sequential-thinking__complete_thinking', input);
}
