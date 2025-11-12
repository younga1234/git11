import { callMCPTool } from '../../utils/mcp-client';

/**
 * Input schema for forkDocument
 */
export interface ForkDocumentInput {
  documentId: string;
  name?: string;
  description?: string;
  preserveHistory?: boolean;
}

/**
 * Output schema for forkDocument
 */
export interface ForkDocumentOutput {
  forkId: string;
  originalId: string;
  name: string;
  createdAt: string;
  url: string;
}

/**
 * Fork a document for independent editing
 *
 * @param input - Fork parameters
 * @returns Forked document details
 *
 * @example
 * ```typescript
 * const fork = await forkDocument({
 *   documentId: 'doc123',
 *   name: 'My Fork',
 *   preserveHistory: true
 * });
 * console.log('Fork created:', fork.forkId);
 * ```
 */
export async function forkDocument(input: ForkDocumentInput): Promise<ForkDocumentOutput> {
  return callMCPTool<ForkDocumentOutput>('docfork-mcp__fork_document', input);
}
