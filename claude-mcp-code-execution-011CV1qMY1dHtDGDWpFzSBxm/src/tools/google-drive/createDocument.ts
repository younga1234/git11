import { callMCPTool } from '../../utils/mcp-client';

/**
 * Input schema for createDocument
 */
export interface CreateDocumentInput {
  name: string;
  mimeType: string;
  content?: string;
  folderId?: string;
  metadata?: Record<string, any>;
}

/**
 * Output schema for createDocument
 */
export interface CreateDocumentOutput {
  id: string;
  name: string;
  webViewLink: string;
  createdTime: string;
}

/**
 * Create a new document in Google Drive
 *
 * @param input - Document creation parameters
 * @returns Created document details
 *
 * @example
 * ```typescript
 * const doc = await createDocument({
 *   name: 'My New Document',
 *   mimeType: 'application/vnd.google-apps.document',
 *   content: 'Initial content',
 *   folderId: 'folder123'
 * });
 * console.log('Created:', doc.webViewLink);
 * ```
 */
export async function createDocument(input: CreateDocumentInput): Promise<CreateDocumentOutput> {
  return callMCPTool<CreateDocumentOutput>('google_drive__create_document', input);
}
