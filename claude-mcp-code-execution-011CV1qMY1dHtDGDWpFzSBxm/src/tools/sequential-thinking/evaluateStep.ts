import { callMCPTool } from '../../utils/mcp-client';

/**
 * Input schema for evaluateStep
 */
export interface EvaluateStepInput {
  sessionId: string;
  stepNumber: number;
  result: string;
  success: boolean;
}

/**
 * Output schema for evaluateStep
 */
export interface EvaluateStepOutput {
  evaluation: string;
  shouldContinue: boolean;
  adjustments?: string[];
  confidenceScore: number;
}

/**
 * Evaluate the result of a thinking step
 *
 * @param input - Evaluation parameters
 * @returns Evaluation result
 */
export async function evaluateStep(input: EvaluateStepInput): Promise<EvaluateStepOutput> {
  return callMCPTool<EvaluateStepOutput>('sequential-thinking__evaluate_step', input);
}
