#!/bin/bash

# MCP 서버 시작 스크립트
# Claude Code 재접속 시 자동으로 실행됩니다

cd "$(dirname "$0")"

echo "🚀 MCP Code Execution Server 시작..."

# 빌드가 없으면 빌드
if [ ! -d "dist" ]; then
  echo "📦 빌드 중..."
  npm run build
fi

# 환경 변수 로드
if [ -f ".env" ]; then
  export $(cat .env | grep -v '^#' | xargs)
fi

# 서버 시작
echo "✨ 서버 시작 중..."
node dist/server/index.js &

# PID 저장
echo $! > .mcp-server.pid

echo "✅ MCP 서버 시작 완료 (PID: $(cat .mcp-server.pid))"
echo "📝 로그를 보려면: tail -f /tmp/mcp-server.log"
echo "🛑 서버를 중지하려면: ./stop-mcp.sh"
