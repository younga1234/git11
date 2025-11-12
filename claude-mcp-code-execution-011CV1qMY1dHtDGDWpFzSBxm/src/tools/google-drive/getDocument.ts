import { callMCPTool } from '../../utils/mcp-client';

/**
 * Input schema for getDocument
 */
export interface GetDocumentInput {
  documentId: string;
  includeContent?: boolean;
  fields?: string[];
}

/**
 * Output schema for getDocument
 */
export interface GetDocumentOutput {
  id: string;
  name: string;
  mimeType: string;
  createdTime: string;
  modifiedTime: string;
  content?: string;
  owners: Array<{
    emailAddress: string;
    displayName: string;
  }>;
  size?: number;
}

/**
 * Get a document from Google Drive
 *
 * @param input - Document retrieval parameters
 * @returns Document details
 *
 * @example
 * ```typescript
 * const doc = await getDocument({
 *   documentId: '1abc123...',
 *   includeContent: true
 * });
 * console.log(doc.name, doc.content);
 * ```
 */
export async function getDocument(input: GetDocumentInput): Promise<GetDocumentOutput> {
  return callMCPTool<GetDocumentOutput>('google_drive__get_document', input);
}
