import { callMCPTool } from '../../utils/mcp-client';

/**
 * Input schema for listDocuments
 */
export interface ListDocumentsInput {
  folderId?: string;
  query?: string;
  pageSize?: number;
  pageToken?: string;
  orderBy?: string;
}

/**
 * Output schema for listDocuments
 */
export interface ListDocumentsOutput {
  documents: Array<{
    id: string;
    name: string;
    mimeType: string;
    modifiedTime: string;
    size?: number;
  }>;
  nextPageToken?: string;
  totalCount: number;
}

/**
 * List documents from Google Drive
 *
 * @param input - List parameters
 * @returns List of documents
 *
 * @example
 * ```typescript
 * const result = await listDocuments({
 *   folderId: 'root',
 *   pageSize: 50,
 *   orderBy: 'modifiedTime desc'
 * });
 *
 * for (const doc of result.documents) {
 *   console.log(doc.name);
 * }
 * ```
 */
export async function listDocuments(input: ListDocumentsInput = {}): Promise<ListDocumentsOutput> {
  return callMCPTool<ListDocumentsOutput>('google_drive__list_documents', input);
}
