/**
 * Tool Usage Example
 * Demonstrates using MCP tools (Google Drive, Salesforce)
 */

import { createServer, MCPServerConfig } from '../src/server';
import * as path from 'path';

async function main() {
  const config: MCPServerConfig = {
    mcpServerUrl: 'http://localhost:3000',
    mcpApiKey: process.env.MCP_API_KEY,
    toolsDirectory: path.join(__dirname, '../src/tools'),
  };

  const server = await createServer(config);

  try {
    // Example 1: List Google Drive documents
    console.log('\n=== Example 1: List Google Drive Documents ===');
    const listDocsCode = `
      // In real scenario, this would be auto-discovered from filesystem
      const docs = await _callTool('google_drive__list_documents', {
        pageSize: 10,
        orderBy: 'modifiedTime desc'
      });

      return docs;
    `;

    const result1 = await server.execute(listDocsCode, {}, { injectTools: true });
    console.log('Documents:', JSON.stringify(result1.data, null, 2));

    // Example 2: Batch operations with multiple tools
    console.log('\n=== Example 2: Batch Operations ===');
    const batchCode = `
      // Get document
      const doc = await _callTool('google_drive__get_document', {
        documentId: 'doc123',
        includeContent: true
      });

      // Process content (simulated)
      const processed = doc.content.toUpperCase();

      // Update document
      const updated = await _callTool('google_drive__update_document', {
        documentId: 'doc123',
        content: processed
      });

      return { original: doc, updated };
    `;

    const result2 = await server.execute(batchCode, {}, { injectTools: true });
    console.log('Batch result:', JSON.stringify(result2.data, null, 2));

    // Example 3: Salesforce query with filtering
    console.log('\n=== Example 3: Salesforce Query ===');
    const salesforceCode = `
      // Query Salesforce records
      const contacts = await _callTool('salesforce__query_records', {
        query: 'SELECT Id, Name, Email FROM Contact WHERE Email != null LIMIT 50'
      });

      // Filter contacts with specific domain
      const filtered = contacts.records.filter(c =>
        c.Email && c.Email.endsWith('@example.com')
      );

      return {
        total: contacts.totalSize,
        filtered: filtered.length,
        contacts: filtered
      };
    `;

    const result3 = await server.execute(salesforceCode, {}, { injectTools: true });
    console.log('Salesforce result:', JSON.stringify(result3.data, null, 2));

    // Example 4: Cross-platform data sync
    console.log('\n=== Example 4: Cross-Platform Sync ===');
    const syncCode = `
      // Get Salesforce contacts
      const sfContacts = await _callTool('salesforce__query_records', {
        query: 'SELECT Name, Email FROM Contact LIMIT 10'
      });

      // Create Google Drive document with contact list
      const content = sfContacts.records
        .map(c => \`\${c.Name}: \${c.Email}\`)
        .join('\\n');

      const doc = await _callTool('google_drive__create_document', {
        name: 'Salesforce Contacts Export',
        mimeType: 'text/plain',
        content: content
      });

      return {
        contactsExported: sfContacts.records.length,
        documentId: doc.id,
        documentUrl: doc.webViewLink
      };
    `;

    const result4 = await server.execute(syncCode, {}, { injectTools: true });
    console.log('Sync result:', JSON.stringify(result4.data, null, 2));

    // Example 5: Error handling with tools
    console.log('\n=== Example 5: Tool Error Handling ===');
    const errorHandlingCode = `
      try {
        const result = await _callTool('google_drive__get_document', {
          documentId: 'invalid-id'
        });
        return { success: true, data: result };
      } catch (error) {
        return {
          success: false,
          error: error.message,
          fallback: 'Using cached data instead'
        };
      }
    `;

    const result5 = await server.execute(errorHandlingCode, {}, { injectTools: true });
    console.log('Error handling result:', JSON.stringify(result5.data, null, 2));

    // Example 6: Tool discovery
    console.log('\n=== Example 6: Tool Discovery ===');
    const discoveryCode = `
      // List all available tools
      const tools = _tools || [];

      // Group by namespace
      const grouped = tools.reduce((acc, tool) => {
        const namespace = tool.split('.')[0] || 'root';
        if (!acc[namespace]) acc[namespace] = [];
        acc[namespace].push(tool);
        return acc;
      }, {});

      return grouped;
    `;

    const result6 = await server.execute(discoveryCode, {}, { injectTools: true });
    console.log('Available tools:', JSON.stringify(result6.data, null, 2));
  } finally {
    await server.stop();
  }
}

main().catch(console.error);
