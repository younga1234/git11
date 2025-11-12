import { callMCPTool } from '../../utils/mcp-client';

/**
 * Input schema for mergeDocument
 */
export interface MergeDocumentInput {
  sourceId: string;
  targetId: string;
  strategy?: 'auto' | 'manual' | 'theirs' | 'ours';
  resolveConflicts?: boolean;
}

/**
 * Output schema for mergeDocument
 */
export interface MergeDocumentOutput {
  mergedId: string;
  conflicts: Array<{
    line: number;
    source: string;
    target: string;
    resolution?: string;
  }>;
  success: boolean;
}

/**
 * Merge a forked document back to the original
 *
 * @param input - Merge parameters
 * @returns Merge result
 */
export async function mergeDocument(input: MergeDocumentInput): Promise<MergeDocumentOutput> {
  return callMCPTool<MergeDocumentOutput>('docfork-mcp__merge_document', input);
}
