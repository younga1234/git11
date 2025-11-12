/**
 * Advanced Usage Patterns
 * Demonstrates advanced patterns like state persistence, retry logic, and parallel execution
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
    // Pattern 1: Retry logic
    console.log('\n=== Pattern 1: Retry Logic ===');
    const retryCode = `
      async function withRetry(fn, maxRetries = 3) {
        let lastError;
        for (let i = 0; i < maxRetries; i++) {
          try {
            return await fn();
          } catch (error) {
            lastError = error;
            if (i < maxRetries - 1) {
              await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
            }
          }
        }
        throw lastError;
      }

      const result = await withRetry(async () => {
        return await _callTool('google_drive__list_documents', {});
      });

      return result;
    `;

    const result1 = await server.execute(retryCode, {}, { injectTools: true });
    console.log('Retry result:', result1.success);

    // Pattern 2: Parallel execution
    console.log('\n=== Pattern 2: Parallel Execution ===');
    const parallelCode = `
      // Execute multiple tool calls in parallel
      const [driveData, salesforceData] = await Promise.all([
        _callTool('google_drive__list_documents', { pageSize: 5 }),
        _callTool('salesforce__query_records', {
          query: 'SELECT Id FROM Account LIMIT 5'
        })
      ]);

      return {
        driveCount: driveData.documents?.length || 0,
        salesforceCount: salesforceData.records?.length || 0
      };
    `;

    const result2 = await server.execute(parallelCode, {}, { injectTools: true });
    console.log('Parallel result:', JSON.stringify(result2.data, null, 2));

    // Pattern 3: Data transformation pipeline
    console.log('\n=== Pattern 3: Data Transformation Pipeline ===');
    const pipelineCode = `
      // Fetch data
      const rawData = await _callTool('salesforce__query_records', {
        query: 'SELECT Name, Email, Phone FROM Contact LIMIT 20'
      });

      // Transform
      const transformed = rawData.records
        .filter(r => r.Email)
        .map(r => ({
          name: r.Name,
          email: r.Email,
          hasPhone: !!r.Phone
        }));

      // Aggregate
      const stats = {
        total: rawData.records.length,
        withEmail: transformed.length,
        withPhone: transformed.filter(r => r.hasPhone).length,
        emailDomains: [...new Set(
          transformed.map(r => r.email.split('@')[1])
        )]
      };

      return stats;
    `;

    const result3 = await server.execute(pipelineCode, {}, { injectTools: true });
    console.log('Pipeline result:', JSON.stringify(result3.data, null, 2));

    // Pattern 4: Conditional tool selection
    console.log('\n=== Pattern 4: Conditional Tool Selection ===');
    const conditionalCode = `
      const source = dataSource; // from context

      let data;
      if (source === 'drive') {
        data = await _callTool('google_drive__list_documents', {});
      } else if (source === 'salesforce') {
        data = await _callTool('salesforce__query_records', {
          query: 'SELECT Id FROM Account LIMIT 10'
        });
      } else {
        data = { error: 'Unknown source' };
      }

      return { source, data };
    `;

    const result4 = await server.execute(
      conditionalCode,
      { dataSource: 'salesforce' },
      { injectTools: true },
    );
    console.log('Conditional result:', JSON.stringify(result4.data, null, 2));

    // Pattern 5: Batching and chunking
    console.log('\n=== Pattern 5: Batching ===');
    const batchingCode = `
      const itemIds = items; // from context
      const BATCH_SIZE = 5;

      const results = [];
      for (let i = 0; i < itemIds.length; i += BATCH_SIZE) {
        const batch = itemIds.slice(i, i + BATCH_SIZE);

        const batchResults = await Promise.all(
          batch.map(id =>
            _callTool('salesforce__get_record', {
              objectType: 'Account',
              recordId: id
            })
          )
        );

        results.push(...batchResults);
      }

      return {
        processed: results.length,
        batches: Math.ceil(itemIds.length / BATCH_SIZE)
      };
    `;

    const result5 = await server.execute(
      batchingCode,
      { items: ['001', '002', '003', '004', '005', '006', '007'] },
      { injectTools: true },
    );
    console.log('Batching result:', JSON.stringify(result5.data, null, 2));

    // Pattern 6: Caching with timestamp
    console.log('\n=== Pattern 6: Simple Cache Pattern ===');
    const cacheCode = `
      const CACHE_TTL = 60000; // 1 minute
      const cache = new Map();

      async function getCached(key, fetchFn) {
        const cached = cache.get(key);
        if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
          return { ...cached.data, fromCache: true };
        }

        const data = await fetchFn();
        cache.set(key, { data, timestamp: Date.now() });
        return { ...data, fromCache: false };
      }

      const result = await getCached('documents', async () => {
        return await _callTool('google_drive__list_documents', {});
      });

      return result;
    `;

    const result6 = await server.execute(cacheCode, {}, { injectTools: true });
    console.log('Cache result:', JSON.stringify(result6.data, null, 2));

    // Pattern 7: Circuit breaker
    console.log('\n=== Pattern 7: Circuit Breaker ===');
    const circuitBreakerCode = `
      class CircuitBreaker {
        constructor(threshold = 3, timeout = 60000) {
          this.failureCount = 0;
          this.threshold = threshold;
          this.timeout = timeout;
          this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
          this.nextAttempt = Date.now();
        }

        async execute(fn) {
          if (this.state === 'OPEN') {
            if (Date.now() < this.nextAttempt) {
              throw new Error('Circuit breaker is OPEN');
            }
            this.state = 'HALF_OPEN';
          }

          try {
            const result = await fn();
            this.onSuccess();
            return result;
          } catch (error) {
            this.onFailure();
            throw error;
          }
        }

        onSuccess() {
          this.failureCount = 0;
          this.state = 'CLOSED';
        }

        onFailure() {
          this.failureCount++;
          if (this.failureCount >= this.threshold) {
            this.state = 'OPEN';
            this.nextAttempt = Date.now() + this.timeout;
          }
        }
      }

      const breaker = new CircuitBreaker();

      try {
        const result = await breaker.execute(() =>
          _callTool('google_drive__list_documents', {})
        );
        return { success: true, state: breaker.state };
      } catch (error) {
        return { success: false, state: breaker.state, error: error.message };
      }
    `;

    const result7 = await server.execute(circuitBreakerCode, {}, { injectTools: true });
    console.log('Circuit breaker result:', JSON.stringify(result7.data, null, 2));
  } finally {
    await server.stop();
  }
}

main().catch(console.error);
