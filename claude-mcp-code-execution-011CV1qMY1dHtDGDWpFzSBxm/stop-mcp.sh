#!/bin/bash

# MCP 서버 중지 스크립트

cd "$(dirname "$0")"

if [ -f ".mcp-server.pid" ]; then
  PID=$(cat .mcp-server.pid)
  echo "🛑 MCP 서버 중지 중... (PID: $PID)"
  kill $PID 2>/dev/null
  rm .mcp-server.pid
  echo "✅ MCP 서버 중지 완료"
else
  echo "⚠️  실행 중인 MCP 서버를 찾을 수 없습니다"
fi
