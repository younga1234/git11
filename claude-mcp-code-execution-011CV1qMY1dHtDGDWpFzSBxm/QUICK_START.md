# MCP Code Execution - Quick Start
# 5분만에 시작하기

## 🚀 즉시 실행 (3 commands)

```bash
npm install && npm run build
npm start &
npx ts-node examples/production-demo.ts
```

## 📊 실무 예제 실행

### 1. 매출 분석 (Sales Analytics)
```bash
npx ts-node -e "
import { createServer } from './src/server';

(async () => {
  const server = await createServer({
    mcpServerUrl: 'http://localhost:3000',
    toolsDirectory: './src/tools'
  });

  const result = await server.execute(\`
    const sales = salesData;
    const total = sales.reduce((sum, s) => sum + s.amount, 0);
    return { total, count: sales.length };
  \`, {
    salesData: [
      { amount: 1000000 },
      { amount: 2000000 },
      { amount: 1500000 }
    ]
  });

  console.log('매출 합계:', result.data);
  await server.stop();
})();
"
```

### 2. PII 보호 고객 처리
```bash
npx ts-node -e "
import { createServer } from './src/server';

(async () => {
  const server = await createServer({
    mcpServerUrl: 'http://localhost:3000',
    toolsDirectory: './src/tools'
  });

  const result = await server.execute(\`
    return customers.map(c => ({
      email: c.email,
      phone: c.phone,
      segment: c.age >= 50 ? 'VIP' : 'Regular'
    }));
  \`, {
    customers: [
      { email: 'john@example.com', phone: '010-1234-5678', age: 55 },
      { email: 'jane@example.com', phone: '010-2345-6789', age: 30 }
    ]
  }, {
    enablePIIProtection: true  // PII 자동 보호
  });

  console.log('처리 결과 (PII 보호됨):', result.data);
  await server.stop();
})();
"
```

### 3. 배치 처리
```bash
npx ts-node -e "
import { createServer } from './src/server';

(async () => {
  const server = await createServer({
    mcpServerUrl: 'http://localhost:3000',
    toolsDirectory: './src/tools'
  });

  // 1000개 데이터 처리
  const data = Array.from({ length: 1000 }, (_, i) => ({
    id: i,
    value: Math.random() * 1000
  }));

  const result = await server.execute(\`
    const processed = items.filter(item => item.value > 500);
    return {
      total: items.length,
      filtered: processed.length,
      percentage: (processed.length / items.length * 100).toFixed(2) + '%'
    };
  \`, { items: data });

  console.log('배치 처리:', result.data);
  console.log('실행 시간:', result.stats.executionTime + 'ms');
  await server.stop();
})();
"
```

## 🔧 설정

### 최소 설정
```typescript
import { createServer } from './src/server';

const server = await createServer({
  mcpServerUrl: 'http://localhost:3000',
  toolsDirectory: './src/tools'
});
```

### 프로덕션 설정
```typescript
const server = await createServer({
  mcpServerUrl: process.env.MCP_SERVER_URL,
  toolsDirectory: './src/tools',
  sandboxConfig: {
    timeout: 10000,      // 10초
    memoryLimit: 256,    // 256MB
    allowedModules: ['Math', 'JSON', 'Date']
  },
  resourceLimits: {
    maxExecutionTime: 30000,        // 30초
    maxMemory: 512 * 1024 * 1024,  // 512MB
    maxConcurrentExecutions: 20     // 20개 동시
  }
});
```

## 📝 사용 패턴

### Pattern 1: 간단한 계산
```typescript
const result = await server.execute(`
  return Math.sqrt(number);
`, { number: 16 });

console.log(result.data); // 4
```

### Pattern 2: 데이터 변환
```typescript
const result = await server.execute(`
  return data.map(item => item.name.toUpperCase());
`, {
  data: [
    { name: 'apple' },
    { name: 'banana' }
  ]
});

console.log(result.data); // ['APPLE', 'BANANA']
```

### Pattern 3: 집계 연산
```typescript
const result = await server.execute(`
  const groups = {};
  for (const item of items) {
    groups[item.category] = (groups[item.category] || 0) + item.count;
  }
  return groups;
`, {
  items: [
    { category: 'A', count: 10 },
    { category: 'B', count: 20 },
    { category: 'A', count: 15 }
  ]
});

console.log(result.data); // { A: 25, B: 20 }
```

### Pattern 4: 에러 처리
```typescript
async function executeWithRetry(code, data, maxAttempts = 3) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      return await server.execute(code, data);
    } catch (error) {
      if (i === maxAttempts - 1) throw error;
      await new Promise(r => setTimeout(r, Math.pow(2, i) * 1000));
    }
  }
}

const result = await executeWithRetry(`
  // 실패할 수 있는 코드
  return processData(input);
`, { input: data });
```

## 🎯 실무 시나리오

### Scenario 1: 일일 매출 리포트
```typescript
// 매일 오전 9시 실행
const dailyReport = await server.execute(`
  const today = salesData.filter(s =>
    new Date(s.date).toDateString() === new Date().toDateString()
  );

  return {
    total: today.reduce((sum, s) => sum + s.amount, 0),
    transactions: today.length,
    avgTransaction: today.reduce((sum, s) => sum + s.amount, 0) / today.length
  };
`, { salesData: await fetchTodaySales() });

sendReportEmail(dailyReport.data);
```

### Scenario 2: 고객 세그먼트 업데이트
```typescript
// 고객 데이터 변경 시 실행
const segments = await server.execute(`
  const result = { vip: [], regular: [], inactive: [] };

  for (const customer of customers) {
    const segment =
      customer.totalSpent > 5000000 ? 'vip' :
      customer.lastPurchase < 90 ? 'regular' : 'inactive';

    result[segment].push({
      id: customer.id,
      email: customer.email,
      phone: customer.phone
    });
  }

  return result;
`,
{ customers: await getAllCustomers() },
{ enablePIIProtection: true }
);

await updateCRM(segments.data);
```

### Scenario 3: 주문 검증 파이프라인
```typescript
// 주문 생성 시 실행
const validation = await server.execute(`
  const errors = [];

  for (const order of orders) {
    if (!order.customerId) errors.push({ id: order.id, error: 'No customer' });
    if (order.total <= 0) errors.push({ id: order.id, error: 'Invalid amount' });
    if (!order.email?.includes('@')) errors.push({ id: order.id, error: 'Invalid email' });
  }

  return {
    valid: orders.length - errors.length,
    invalid: errors.length,
    errors: errors.slice(0, 10)  // 처음 10개만
  };
`,
{ orders: newOrders },
{ enablePIIProtection: true }
);

if (validation.data.invalid > 0) {
  notifyAdmins(validation.data.errors);
}
```

## 📊 모니터링

```typescript
// 주기적으로 실행
setInterval(() => {
  const stats = server.getStatistics();
  console.log({
    activeExecutions: stats.activeExecutions,
    piiMappings: stats.piiMappings,
    maxConcurrent: stats.maxConcurrentExecutions
  });
}, 60000); // 1분마다
```

## 🚨 트러블슈팅

### 문제: "Cannot find module"
```bash
# 해결
npm run build
```

### 문제: "Timeout"
```typescript
// 타임아웃 늘리기
const server = await createServer({
  sandboxConfig: { timeout: 30000 }  // 30초
});
```

### 문제: "Out of memory"
```typescript
// 메모리 늘리기
const server = await createServer({
  sandboxConfig: { memoryLimit: 512 }  // 512MB
});
```

## 📚 더 보기

- [프로덕션 가이드](PRODUCTION_GUIDE.md) - 상세 사용법
- [토큰 분석](docs/TOKEN_ANALYSIS.md) - 성능 분석
- [예제 모음](examples/) - 더 많은 예제

## ✅ 체크리스트

배포 전:
- [ ] `npm test` 통과
- [ ] `.env` 파일 설정
- [ ] PII 보호 활성화
- [ ] 에러 처리 구현
- [ ] 모니터링 설정

실행:
```bash
# 1. 빌드
npm run build

# 2. 테스트
npm test

# 3. 데모 실행
npx ts-node examples/production-demo.ts

# 4. 서버 시작
npm start

# 5. 확인
curl http://localhost:3000/health
```

**5분 만에 프로덕션 레디!** 🚀
