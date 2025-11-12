# MCP Code Execution - Claude Code Integration

## 자동 로드 설정

Claude Code가 재시작될 때마다 이 MCP 시스템을 자동으로 사용하려면:

### 방법 1: 프로젝트별 설정 (.claude-code.json)

프로젝트 루트에 `.claude-code.json` 생성:

```json
{
  "mcpServers": {
    "mcp-code-execution": {
      "command": "node",
      "args": ["dist/server/index.js"],
      "env": {
        "MCP_SERVER_URL": "http://localhost:3000"
      }
    }
  }
}
```

### 방법 2: 글로벌 Claude Code 설정

**Mac/Linux:**
```bash
~/.config/claude-code/settings.json
```

**Windows:**
```bash
%APPDATA%\claude-code\settings.json
```

설정 내용:
```json
{
  "mcp": {
    "servers": {
      "mcp-code-execution": {
        "command": "node",
        "args": ["/path/to/test1/dist/server/index.js"]
      }
    }
  }
}
```

### 방법 3: Claude Desktop 통합

**Mac:**
```bash
~/Library/Application Support/Claude/claude_desktop_config.json
```

**Windows:**
```bash
%APPDATA%\Claude\claude_desktop_config.json
```

**Linux:**
```bash
~/.config/Claude/claude_desktop_config.json
```

예시 설정:
```json
{
  "mcpServers": {
    "mcp-code-execution": {
      "command": "node",
      "args": ["/absolute/path/to/test1/dist/server/index.js"],
      "env": {}
    },
    "exa": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-exa"],
      "env": {
        "EXA_API_KEY": "your-api-key-here"
      }
    },
    "neo4j-memory": {
      "command": "npx",
      "args": ["-y", "knowall-ai-mcp-neo-4-j-agent-memory"],
      "env": {
        "NEO4J_URI": "bolt://localhost:7687",
        "NEO4J_PASSWORD": "your-password"
      }
    }
  }
}
```

## 빠른 시작 스크립트

재접속 시 자동으로 서버를 시작하려면:

### start-mcp.sh
```bash
#!/bin/bash
cd /home/user/test1
npm run build
node dist/server/index.js &
echo $! > .mcp-server.pid
```

### stop-mcp.sh
```bash
#!/bin/bash
if [ -f .mcp-server.pid ]; then
  kill $(cat .mcp-server.pid)
  rm .mcp-server.pid
fi
```

## 사용 방법

### 1. 빌드 (최초 1회)
```bash
npm run build
```

### 2. 서버 시작
```bash
npm start
# 또는
node dist/server/index.js
```

### 3. Claude Code에서 사용
```typescript
// 자동으로 로드된 MCP 도구 사용
const result = await callMCPTool('exa__search', {
  query: 'AI developments'
});
```

## 환경 변수 설정

`.env` 파일 생성:
```bash
cp .env.example .env
```

편집:
```env
EXA_API_KEY=your_key_here
NEO4J_URI=bolt://localhost:7687
NEO4J_PASSWORD=your_password
```

## 검증

설정이 제대로 되었는지 확인:

```bash
# 1. 빌드 확인
npm run build

# 2. 서버 시작 확인
node dist/server/index.js &

# 3. 도구 발견 확인
npx ts-node -e "
import { ToolDiscovery } from './src/server/discovery';
const d = new ToolDiscovery('./src/tools');
d.discoverTools().then(t => console.log(t.length + ' tools found'));
"
```

## 자동 시작 (선택사항)

### systemd (Linux)
`~/.config/systemd/user/mcp-server.service`:
```ini
[Unit]
Description=MCP Code Execution Server

[Service]
Type=simple
WorkingDirectory=/home/user/test1
ExecStart=/usr/bin/node /home/user/test1/dist/server/index.js
Restart=always

[Install]
WantedBy=default.target
```

활성화:
```bash
systemctl --user enable mcp-server
systemctl --user start mcp-server
```

### PM2 (모든 플랫폼)
```bash
npm install -g pm2
pm2 start dist/server/index.js --name mcp-server
pm2 save
pm2 startup
```

## 트러블슈팅

### MCP 서버가 보이지 않을 때:
1. Claude Code 재시작
2. 설정 파일 경로 확인
3. 서버가 실행 중인지 확인: `ps aux | grep mcp`

### 도구가 발견되지 않을 때:
```bash
# 캐시 클리어 후 재시작
rm -rf dist/
npm run build
```

### 로그 확인:
```bash
# 서버 로그
tail -f ~/.mcp/logs/mcp-server.log

# 또는 직접 실행으로 로그 확인
node dist/server/index.js
```

## 추가 리소스

- [MCP 공식 문서](https://modelcontextprotocol.io)
- [Claude Code 문서](https://docs.claude.com/claude-code)
- [프로젝트 README](../README.md)
