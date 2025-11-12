import { callMCPTool } from '../../utils/mcp-client';

/**
 * Input schema for queryRecords
 */
export interface QueryRecordsInput {
  query: string; // SOQL query
}

/**
 * Output schema for queryRecords
 */
export interface QueryRecordsOutput {
  totalSize: number;
  done: boolean;
  records: Array<Record<string, any>>;
  nextRecordsUrl?: string;
}

/**
 * Query records from Salesforce using SOQL
 *
 * @param input - Query parameters
 * @returns Query results
 *
 * @example
 * ```typescript
 * const result = await queryRecords({
 *   query: 'SELECT Id, Name, Email FROM Contact WHERE Email != null LIMIT 100'
 * });
 *
 * for (const contact of result.records) {
 *   console.log(contact.Name, contact.Email);
 * }
 * ```
 */
export async function queryRecords(input: QueryRecordsInput): Promise<QueryRecordsOutput> {
  return callMCPTool<QueryRecordsOutput>('salesforce__query_records', input);
}
