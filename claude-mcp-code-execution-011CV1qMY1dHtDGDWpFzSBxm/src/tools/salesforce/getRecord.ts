import { callMCPTool } from '../../utils/mcp-client';

/**
 * Input schema for getRecord
 */
export interface GetRecordInput {
  objectType: string;
  recordId: string;
  fields?: string[];
}

/**
 * Output schema for getRecord
 */
export interface GetRecordOutput {
  Id: string;
  attributes: {
    type: string;
    url: string;
  };
  [key: string]: any;
}

/**
 * Get a record from Salesforce
 *
 * @param input - Record retrieval parameters
 * @returns Record data
 *
 * @example
 * ```typescript
 * const account = await getRecord({
 *   objectType: 'Account',
 *   recordId: '001...',
 *   fields: ['Name', 'Industry', 'AnnualRevenue']
 * });
 * console.log(account.Name);
 * ```
 */
export async function getRecord(input: GetRecordInput): Promise<GetRecordOutput> {
  return callMCPTool<GetRecordOutput>('salesforce__get_record', input);
}
