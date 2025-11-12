import { callMCPTool } from '../../utils/mcp-client';

/**
 * Input schema for createRecord
 */
export interface CreateRecordInput {
  objectType: string;
  fields: Record<string, any>;
}

/**
 * Output schema for createRecord
 */
export interface CreateRecordOutput {
  id: string;
  success: boolean;
  errors: string[];
}

/**
 * Create a new record in Salesforce
 *
 * @param input - Record creation parameters
 * @returns Creation result
 *
 * @example
 * ```typescript
 * const result = await createRecord({
 *   objectType: 'Lead',
 *   fields: {
 *     FirstName: 'John',
 *     LastName: 'Doe',
 *     Company: 'Acme Corp',
 *     Email: 'john@example.com'
 *   }
 * });
 * console.log('Created ID:', result.id);
 * ```
 */
export async function createRecord(input: CreateRecordInput): Promise<CreateRecordOutput> {
  return callMCPTool<CreateRecordOutput>('salesforce__create_record', input);
}
