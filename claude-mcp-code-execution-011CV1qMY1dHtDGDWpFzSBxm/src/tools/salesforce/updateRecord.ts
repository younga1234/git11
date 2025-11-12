import { callMCPTool } from '../../utils/mcp-client';

/**
 * Input schema for updateRecord
 */
export interface UpdateRecordInput {
  objectType: string;
  recordId: string;
  fields: Record<string, any>;
}

/**
 * Output schema for updateRecord
 */
export interface UpdateRecordOutput {
  id: string;
  success: boolean;
  errors: string[];
}

/**
 * Update a record in Salesforce
 *
 * @param input - Record update parameters
 * @returns Update result
 *
 * @example
 * ```typescript
 * const result = await updateRecord({
 *   objectType: 'Contact',
 *   recordId: '003...',
 *   fields: {
 *     Email: 'newemail@example.com',
 *     Phone: '+1-555-0100'
 *   }
 * });
 * console.log('Success:', result.success);
 * ```
 */
export async function updateRecord(input: UpdateRecordInput): Promise<UpdateRecordOutput> {
  return callMCPTool<UpdateRecordOutput>('salesforce__update_record', input);
}
