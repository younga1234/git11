import { callMCPTool } from '../../utils/mcp-client';

/**
 * Input schema for nextStep
 */
export interface NextStepInput {
  sessionId: string;
  previousResult?: string;
}

/**
 * Output schema for nextStep
 */
export interface NextStepOutput {
  stepNumber: number;
  description: string;
  reasoning: string;
  action: string;
  completed: boolean;
}

/**
 * Get the next step in the thinking process
 *
 * @param input - Session parameters
 * @returns Next step details
 */
export async function nextStep(input: NextStepInput): Promise<NextStepOutput> {
  return callMCPTool<NextStepOutput>('sequential-thinking__next_step', input);
}
