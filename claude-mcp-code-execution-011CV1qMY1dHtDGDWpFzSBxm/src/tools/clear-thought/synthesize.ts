import { callMCPTool } from '../../utils/mcp-client';

/**
 * Input schema for synthesize
 */
export interface SynthesizeInput {
  inputs: Array<{
    source: string;
    content: string;
    weight?: number;
  }>;
  goal?: string;
}

/**
 * Output schema for synthesize
 */
export interface SynthesizeOutput {
  synthesis: string;
  keyInsights: string[];
  connections: Array<{
    sources: number[];
    insight: string;
  }>;
  confidence: number;
}

/**
 * Synthesize multiple inputs into coherent understanding
 *
 * @param input - Synthesis parameters
 * @returns Synthesized understanding
 */
export async function synthesize(input: SynthesizeInput): Promise<SynthesizeOutput> {
  return callMCPTool<SynthesizeOutput>('clear-thought__synthesize', input);
}
