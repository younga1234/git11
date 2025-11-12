import { callMCPTool } from '../../utils/mcp-client';

/**
 * Input schema for getDocument
 */
export interface GetDocumentInput {
  documentId: string;
  includeHistory?: boolean;
}

/**
 * Output schema for getDocument
 */
export interface GetDocumentOutput {
  id: string;
  name: string;
  content: string;
  version: number;
  parentId?: string;
  forks?: string[];
  history?: Array<{
    version: number;
    timestamp: string;
    author: string;
    changes: string;
  }>;
}

/**
 * Get document details and content
 *
 * @param input - Document retrieval parameters
 * @returns Document details
 */
export async function getDocument(input: GetDocumentInput): Promise<GetDocumentOutput> {
  return callMCPTool<GetDocumentOutput>('docfork-mcp__get_document', input);
}
