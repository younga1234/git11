import { callMCPTool } from '../../utils/mcp-client';

/**
 * Input schema for updateDocument
 */
export interface UpdateDocumentInput {
  documentId: string;
  name?: string;
  content?: string;
  metadata?: Record<string, any>;
}

/**
 * Output schema for updateDocument
 */
export interface UpdateDocumentOutput {
  id: string;
  name: string;
  modifiedTime: string;
  success: boolean;
}

/**
 * Update an existing document in Google Drive
 *
 * @param input - Document update parameters
 * @returns Updated document details
 *
 * @example
 * ```typescript
 * const result = await updateDocument({
 *   documentId: '1abc123...',
 *   name: 'Updated Name',
 *   content: 'New content'
 * });
 * console.log('Updated:', result.modifiedTime);
 * ```
 */
export async function updateDocument(input: UpdateDocumentInput): Promise<UpdateDocumentOutput> {
  return callMCPTool<UpdateDocumentOutput>('google_drive__update_document', input);
}
