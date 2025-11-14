# 양방향 자동 빌드 워크플로우

DongArch3D 개발을 위한 Linux ↔ Windows 자동 동기화 시스템

## 🔄 워크플로우

### 1️⃣ Linux Claude Code (코드 작성)
```bash
# 1. 코드 작성
Edit GigaMesh/gui/src/dongarch/...

# 2. 빌드 요청 상태 업데이트
# build-status.json:
{
  "linuxStatus": "ready_to_build",
  "currentCommit": "abc1234"
}

# 3. Git push
git add . && git commit -m "..." && git push
```

### 2️⃣ Windows VS Code (자동 동기화)
```
VS Code 설정:
- git.autofetch: ✅ ON
- git.autofetchPeriod: 60 (1분마다)
```

### 3️⃣ Windows Claude Code (자동 빌드)
```powershell
# /watch-and-build 커맨드 실행 (자동 또는 수동)

# 1. build-status.json 감지
# 2. CMake 빌드 실행
cmake --build . --config Release --target DongArch3D

# 3. 결과 업데이트
{
  "windowsStatus": "build_success",
  "buildResult": {
    "success": true,
    "timestamp": "2025-11-09T09:30:00Z"
  }
}

# 4. Git push
```

### 4️⃣ Linux Claude Code (결과 확인)
```bash
# /check-build-result 커맨드 실행

# 1. Git pull
# 2. build-status.json 읽기
# 3. 성공 → 다음 Phase 진행
#    실패 → 에러 분석 후 수정
```

## 📁 상태 파일

### `.claude/build-status.json`
```json
{
  "lastUpdate": "ISO 8601 timestamp",
  "linuxStatus": "idle | coding | ready_to_build",
  "windowsStatus": "pending | building | build_success | build_failed",
  "currentCommit": "git commit hash",
  "buildRequest": {
    "commit": "hash",
    "target": "DongArch3D",
    "config": "Release"
  },
  "buildResult": {
    "success": true/false,
    "message": "에러 메시지 또는 성공 메시지",
    "timestamp": "ISO 8601 timestamp"
  }
}
```

## 🚀 사용 방법

### Linux에서:
1. 코드 작성 완료
2. `build-status.json` → `linuxStatus: "ready_to_build"`
3. Git push
4. 1-2분 대기
5. `/check-build-result` 실행 → 빌드 결과 확인

### Windows에서:
1. VS Code git.autofetch ON 설정
2. Claude Code에게 `/watch-and-build` 실행 요청
3. 또는 수동: Git pull → 빌드 → 상태 업데이트 → Git push

## ⚙️ 설정

### Windows VS Code:
```
Ctrl+, → 검색: "git.autofetch" → ✅ 체크
```

### 슬래시 커맨드:
- Linux: `/check-build-result` - 빌드 결과 확인
- Windows: `/watch-and-build` - 자동 빌드 실행

---

**문서 버전**: 1.0.0
**최종 수정**: 2025-11-09
