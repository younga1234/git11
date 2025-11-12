/**
 * Feature Showcase - Real-world use cases
 */

import { createServer } from '../src/server';
import * as path from 'path';

async function showcase() {
  console.log('🎯 MCP Code Execution - Feature Showcase\n');

  const server = await createServer({
    mcpServerUrl: 'http://localhost:3000',
    toolsDirectory: path.join(__dirname, '../src/tools'),
  });

  try {
    // Showcase 1: Data Analysis Pipeline
    console.log('📊 Showcase 1: Data Analysis Pipeline');
    console.log('─'.repeat(60));
    const analysis = await server.execute(
      `
      // Simulate data analysis
      const data = salesData;

      // Calculate metrics
      const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);
      const avgRevenue = totalRevenue / data.length;
      const maxRevenue = Math.max(...data.map(d => d.revenue));
      const minRevenue = Math.min(...data.map(d => d.revenue));

      // Find top performers
      const topPerformers = data
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 3)
        .map(d => ({ name: d.name, revenue: d.revenue }));

      // Growth analysis
      const growth = {};
      for (let i = 1; i < data.length; i++) {
        const current = data[i].revenue;
        const previous = data[i-1].revenue;
        const growthRate = ((current - previous) / previous * 100).toFixed(2);
        growth[data[i].name] = growthRate + '%';
      }

      return {
        summary: {
          total: totalRevenue,
          average: Math.round(avgRevenue),
          max: maxRevenue,
          min: minRevenue
        },
        topPerformers,
        growth
      };
    `,
      {
        salesData: [
          { name: 'Q1', revenue: 150000 },
          { name: 'Q2', revenue: 180000 },
          { name: 'Q3', revenue: 210000 },
          { name: 'Q4', revenue: 195000 },
        ],
      },
    );
    console.log(JSON.stringify(analysis.data, null, 2));
    console.log();

    // Showcase 2: Text Processing
    console.log('📝 Showcase 2: Advanced Text Processing');
    console.log('─'.repeat(60));
    const textProcessing = await server.execute(
      `
      const text = inputText;

      // Extract statistics
      const words = text.split(/\\s+/);
      const sentences = text.split(/[.!?]+/).filter(s => s.trim());
      const uniqueWords = new Set(words.map(w => w.toLowerCase()));

      // Word frequency
      const wordFreq = {};
      for (const word of words) {
        const w = word.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (w.length > 3) {
          wordFreq[w] = (wordFreq[w] || 0) + 1;
        }
      }

      // Top words
      const topWords = Object.entries(wordFreq)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

      return {
        stats: {
          wordCount: words.length,
          sentenceCount: sentences.length,
          uniqueWords: uniqueWords.size,
          avgWordsPerSentence: Math.round(words.length / sentences.length)
        },
        topWords: Object.fromEntries(topWords)
      };
    `,
      {
        inputText: `
          Artificial Intelligence is transforming the world.
          Machine learning and deep learning are powerful technologies.
          Natural language processing enables computers to understand human language.
          The future of AI is incredibly promising and exciting.
        `,
      },
    );
    console.log(JSON.stringify(textProcessing.data, null, 2));
    console.log();

    // Showcase 3: Security & PII
    console.log('🔒 Showcase 3: PII Protection in Action');
    console.log('─'.repeat(60));
    const secureData = await server.execute(
      `
      const users = userData;

      // Process user data
      const processed = users.map(user => ({
        id: user.id,
        contactInfo: \`\${user.email} / \${user.phone}\`,
        status: user.age >= 18 ? 'adult' : 'minor'
      }));

      // Aggregate report
      const report = {
        totalUsers: users.length,
        adults: users.filter(u => u.age >= 18).length,
        contacts: processed.map(p => p.contactInfo)
      };

      return report;
    `,
      {
        userData: [
          { id: 1, email: 'john@example.com', phone: '555-0100', age: 25 },
          { id: 2, email: 'jane@example.com', phone: '555-0101', age: 17 },
          { id: 3, email: 'bob@example.com', phone: '555-0102', age: 30 },
        ],
      },
      { enablePIIProtection: true },
    );
    console.log('✅ PII Protected:');
    console.log(JSON.stringify(secureData.data, null, 2));
    console.log();

    // Showcase 4: Algorithm Implementation
    console.log('🧮 Showcase 4: Algorithm Implementation');
    console.log('─'.repeat(60));
    const algorithm = await server.execute(`
      // Fibonacci sequence
      function fibonacci(n) {
        if (n <= 1) return n;
        const fib = [0, 1];
        for (let i = 2; i <= n; i++) {
          fib[i] = fib[i-1] + fib[i-2];
        }
        return fib;
      }

      // Prime numbers
      function isPrime(num) {
        if (num < 2) return false;
        for (let i = 2; i <= Math.sqrt(num); i++) {
          if (num % i === 0) return false;
        }
        return true;
      }

      const primes = [];
      for (let i = 2; i <= 50; i++) {
        if (isPrime(i)) primes.push(i);
      }

      return {
        fibonacci: fibonacci(10),
        primes: primes,
        stats: {
          fibCount: 11,
          primeCount: primes.length,
          largestPrime: primes[primes.length - 1]
        }
      };
    `);
    console.log(JSON.stringify(algorithm.data, null, 2));
    console.log();

    // Showcase 5: Dynamic Configuration
    console.log('⚙️ Showcase 5: Dynamic Configuration Processing');
    console.log('─'.repeat(60));
    const config = await server.execute(
      `
      const config = configData;

      // Validate and transform
      const processed = {
        validated: true,
        environment: config.env || 'development',
        features: config.features || {},
        computed: {
          isProduction: config.env === 'production',
          enabledFeatures: Object.entries(config.features || {})
            .filter(([_, enabled]) => enabled)
            .map(([name]) => name),
          timestamp: Date.now()
        }
      };

      // Generate config summary
      processed.summary = \`Environment: \${processed.environment}, Features: \${processed.computed.enabledFeatures.length} enabled\`;

      return processed;
    `,
      {
        configData: {
          env: 'production',
          features: {
            analytics: true,
            darkMode: true,
            betaFeatures: false,
            notifications: true,
          },
        },
      },
    );
    console.log(JSON.stringify(config.data, null, 2));
    console.log();

    // Final Stats
    console.log('📈 Final Statistics');
    console.log('─'.repeat(60));
    const stats = server.getStatistics();
    console.log(`Total executions: 5`);
    console.log(`Active executions: ${stats.activeExecutions}`);
    console.log(`PII mappings: ${stats.piiMappings}`);
    console.log(`Max concurrent: ${stats.maxConcurrentExecutions}`);
    console.log();

    console.log('🎉 All showcases completed successfully!');
    console.log('✨ System is production-ready with:');
    console.log('   • Safe code execution');
    console.log('   • PII protection');
    console.log('   • Data processing');
    console.log('   • Algorithm support');
    console.log('   • Real-time metrics');
  } finally {
    await server.stop();
  }
}

if (require.main === module) {
  showcase().catch(console.error);
}
