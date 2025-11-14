# DongArch3D - Windows Build Verification Guide

**Cross-Platform CI/CD Workflow: Linux (Development) ↔ Windows (Build Verification)**

This document guides Claude Code instances working in the **Windows build verification** environment for DongArch3D.

---

## 🔄 Workflow Overview

```
Linux Development Machine          Windows Build Machine (A:\1105\git11)
━━━━━━━━━━━━━━━━━━━              ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Code changes (C++20)       →    2. git fetch/pull --rebase
2. git commit + push          →    3. CMake build (Visual Studio 2022)
                                   4. Update .claude/build-status.json
                                   5. git commit + push results back
```

**Your Role**: Monitor git repository, pull changes, build DongArch3D, report ALL results to `.claude/build-status.json`

---

## ⚠️ CRITICAL REQUIREMENT

**User Mandate**: "A:\1105\git11\.claude\build-status.json 에러는 여기무조건 적어라"

**ALL errors, warnings, and build results MUST be recorded in `.claude/build-status.json`**

This file is the **primary communication channel** between Linux development and Windows build verification.

---

## 🔧 Build Commands (Windows)

### Repository Location
```
A:\1105\git11\  ← Git repository root
```

### Check for New Commits
```bash
cd /a/1105/git11
git fetch origin
git log HEAD..origin/main --oneline  # Check for new commits
git pull --rebase  # Pull if new commits exist
```

### Build DongArch3D
```bash
cd /a/1105/git11/GigaMesh/build_korean
cmake --build . --config Release --target DongArch3D
```

### Deploy Qt Dependencies (if needed)
```bash
cd /c/Qt/5.15.2/msvc2019_64/bin
./windeployqt.exe --release --no-system-d3d-compiler \
  /a/1105/git11/GigaMesh/build_korean/gui/Release/DongArch3D.exe
```

### Clean Rebuild
```powershell
powershell.exe -Command "
  cd 'A:\1105\git11\GigaMesh';
  Remove-Item -Recurse -Force 'build_korean' -ErrorAction SilentlyContinue;
  New-Item -ItemType Directory -Path 'build_korean' | Out-Null;
  cd 'build_korean';
  cmake .. -G 'Visual Studio 17 2022' -A x64 -DCMAKE_PREFIX_PATH='A:/1105/Qt/5.15.2/msvc2019_64';
  cmake --build . --config Release --target DongArch3D
"
```

---

## 📊 Build Status Communication

### Location
```
A:\1105\git11\.claude\build-status.json
```

### Structure
```json
{
  "lastUpdate": "2025-11-10T07:35:00Z",
  "linuxStatus": "success",
  "windowsStatus": "rebuild_success",
  "currentCommit": "e8881ed",
  "buildRequest": {
    "commit": "e8881ed",
    "target": "DongArch3D",
    "config": "Release",
    "description": "Add: Windows 캡처 파일들 (UI 이슈 스크린샷)"
  },
  "buildResult": {
    "success": true,
    "message": "✅ REBUILD SUCCESS! DongArch3D.exe - 리빌드 완료",
    "timestamp": "2025-11-10T07:35:00Z",
    "executable": {
      "path": "GigaMesh/build_korean/gui/Release/DongArch3D.exe",
      "size": "26MB",
      "timestamp": "2025-11-10 07:33"
    },
    "buildDetails": {
      "compiler": "MSVC 19.44.35207 (Visual Studio 2022)",
      "qt": "5.15.2 msvc2019_64",
      "warnings": "적음 (type conversion warnings)",
      "errors": "0"
    }
  },
  "buildHistory": [
    {
      "commit": "e8881ed",
      "status": "rebuild_success",
      "message": "캡처 파일 추가 후 리빌드",
      "result": "✅ DongArch3D.exe 리빌드 성공 (26MB)",
      "timestamp": "2025-11-10T07:35:00Z"
    }
  ]
}
```

### Update After Every Build
```bash
# After build completes (success or failure):
cd /a/1105/git11
git add .claude/build-status.json
git commit -m "Windows Build: [status] - commit [hash]

[Build details]

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"
git push
```

---

## 🏗️ Technical Environment

### Build System
- **CMake**: 3.10+ (configured for Visual Studio 17 2022)
- **Generator**: Visual Studio 17 2022, x64 platform
- **Compiler**: MSVC 19.44.35207 (Visual Studio 2022)
- **C++ Standard**: C++20 (for new DongArch code)

### Qt Framework
- **Version**: 5.15.2
- **Toolchain**: msvc2019_64
- **Location**: C:\Qt\5.15.2\msvc2019_64
- **CMAKE_PREFIX_PATH**: A:/1105/Qt/5.15.2/msvc2019_64

### Build Output
- **Executable**: `A:\1105\git11\GigaMesh\build_korean\gui\Release\DongArch3D.exe`
- **Expected Size**: ~26MB (with dependencies)
- **Config**: Release (optimized build)

---

## 📁 Project Structure

```
A:\1105\git11\
├── .claude/
│   └── build-status.json          ← PRIMARY communication file
├── capture/                        ← UI issue screenshots
│   ├── 되는기능이없다..png          (Ceramic Tools - 4/5 disabled)
│   ├── 인되는기능이 너무많다..png    (Menu bar only)
│   └── 초기시작화면 설청창이 너무크다.png (Oversized settings)
├── docs/
│   └── dongarch3d/
│       └── VISION_완료시_모습.md   ← Complete vision (741 lines)
├── GigaMesh/
│   ├── build_korean/               ← Build directory
│   │   └── gui/Release/DongArch3D.exe
│   ├── gui/src/                    ← DongArch source code
│   │   ├── dongarch/               (C++20 new features)
│   │   └── shaders/                (GLSL shaders)
│   └── core/                       ← GigaMesh base (DO NOT MODIFY)
└── CLAUDE.md                       ← This file
```

---

## 🎯 Current Project Status

### Completion: ~5% (Phase 0 in progress)

**Resolved Issues** ✅:
- glm CMake version compatibility (0.9.9.8 → 1.0.1)
- LaTeX templates (4 files added)
- NPR textures (7 files added)
- archaeology icons QRC fixed
- DongArch C++ compilation errors (16/16 fixed)
- QtConcurrent linking errors (19/19 fixed)
- Qt DLL dependencies deployed (windeployqt)
- UI fully localized to Korean
- Shift/Ctrl/Space key crash prevention
- Build success (commit e8881ed)

### Major Gaps (VISION vs Reality)

**VISION Document** (docs/dongarch3d/VISION_완료시_모습.md):
- Shows complete system with 7 phases
- All features fully functional
- Professional archaeological measurement tool

**Current Reality**:
- Tool Palette UI exists but only 1/5 functions work
- Ceramic Tools tab: 4/5 buttons disabled (gray)
- Core features completely missing:
  - **Phase 2**: Cutline (단면 라인 추출) - NOT IMPLEMENTED
  - **Phase 3**: Outline (외곽 라인 추출) - NOT IMPLEMENTED
  - **Phase 4**: Clip (3D 메시 절단) - PARTIAL
  - **Phase 5**: Vis (시각화) - PARTIAL
  - **Phase 7**: Illustrator 연동 - NOT IMPLEMENTED

**UI Issues** (captured in `/capture` folder):
1. Oversized settings window on startup
2. Most tool palette functions non-functional
3. Error dialogs appearing

---

## 🔄 Common Workflow: "깃" Command

When user says **"깃"**, follow this sequence:

1. **Check for new commits**:
   ```bash
   cd /a/1105/git11
   git fetch origin
   git log HEAD..origin/main --oneline
   ```

2. **If new commits exist, pull**:
   ```bash
   git pull --rebase
   ```

3. **Build in background**:
   ```bash
   cd /a/1105/git11/GigaMesh/build_korean
   cmake --build . --config Release --target DongArch3D 2>&1 | tee build.log
   ```

4. **Monitor build output** (check for errors/warnings)

5. **Update build-status.json** with results

6. **Commit and push** results back to Linux

---

## 🚨 Error Handling

### Build Errors
**Record ALL errors in `.claude/build-status.json`**:
```json
{
  "buildResult": {
    "success": false,
    "message": "❌ BUILD FAILED: [error type]",
    "errors": [
      {
        "file": "path/to/file.cpp",
        "line": 123,
        "message": "error C2065: undeclared identifier",
        "type": "compilation_error"
      }
    ]
  }
}
```

### Runtime Errors
If DongArch3D.exe fails to run:
1. Check for missing DLLs (use Dependency Walker or run from cmd)
2. Deploy Qt dependencies using windeployqt
3. Record error in build-status.json
4. Push error report to Linux

### Common Issues

**Issue**: Qt5OpenGL.dll missing
**Fix**: Run windeployqt (see commands above)

**Issue**: LNK1104 - cannot open DongArch3D.exe
**Cause**: File locked (DongArch3D.exe is running)
**Fix**: Close DongArch3D.exe and retry build

**Issue**: Git repository not found at A:\1105\GigaMesh
**Fix**: Correct path is `A:\1105\git11` (with git11 subdirectory)

---

## 📝 Build History Examples

### Successful Build
```json
{
  "commit": "62f1eb7",
  "status": "build_success",
  "message": "Qt5::Concurrent 링크 추가",
  "result": "✅ DongArch3D.exe 생성 성공 (26MB)",
  "timestamp": "2025-11-09T12:12:00Z"
}
```

### Failed Build
```json
{
  "commit": "7ebd1aa",
  "status": "linker_error",
  "error": "19 QtConcurrent symbols missing",
  "timestamp": "2025-11-09T11:55:30Z",
  "fixCommit": "62f1eb7"
}
```

### Rebuild
```json
{
  "commit": "e8881ed",
  "status": "rebuild_success",
  "message": "캡처 파일 추가 후 리빌드",
  "result": "✅ DongArch3D.exe 리빌드 성공 (26MB)",
  "timestamp": "2025-11-10T07:35:00Z",
  "changes": "3 PNG screenshot files"
}
```

---

## 🎓 Architecture Overview

### GigaMesh Base (70%)
DongArch3D is built on top of **GigaMesh v1.0+**, an established 3D mesh processing framework.

**Key GigaMesh Features Used**:
- Mesh I/O (PLY, OBJ formats)
- Mesh-Plane Intersection (`mesh.cpp:4041`) - for Cutline
- Mesh Split (`mesh.cpp:4017`) - for Clip
- PolyLine (`polyline.cpp:52`) - for Cutline
- Geodesic Distance (`edgegeodesic.cpp`) - for D-Tak
- Octree (`octree.cpp`) - for optimization
- NPR Shaders (Sobel, Hatching) - for Outline/X-Ray
- SVG Export (`MeshWriter.cpp`) - for Illustrator

### DongArch Extensions (30%)
New archaeological-specific features implemented in **C++20**:

**Phase Structure**:
- **Phase 0**: 기반 시스템 (메시 정리, glm 업그레이드) ← **CURRENT**
- **Phase 1**: Align (3D 정렬)
- **Phase 2**: Cutline (단면 라인 추출) ← **MISSING**
- **Phase 3**: Outline (외곽 라인 추출) ← **MISSING**
- **Phase 4**: Clip (3D 메시 절단)
- **Phase 5**: Vis (시각화 - D-Tak, X-Ray)
- **Phase 6**: MFE (Multi-Find Extremum)
- **Phase 7**: Illustrator 연동

**New Technologies** (planned):
- C++20 Ranges, std::span, Concepts
- GPU acceleration (Geometry/Fragment Shaders)
- 2025 research papers (3 latest algorithms)

---

## 📚 Reference Documents

### Main Repository
- **A:\1105\** - Main development workspace (not git repository)
- **A:\1105\.claude\DongArch3D_최종개선계획_v4_품질최우선.md** - Master plan
- **A:\1105\docs\references\** - 115 technical documents, 50 research papers

### This Repository (git11)
- **A:\1105\git11\.claude\build-status.json** - Build communication file
- **A:\1105\git11\docs\dongarch3d\VISION_완료시_모습.md** - Complete vision
- **A:\1105\git11\capture\** - UI issue screenshots

---

## 🚫 Critical Don'ts

1. **DO NOT modify** `GigaMesh/core/` or `GigaMesh/external/` (GigaMesh base code)
2. **DO NOT skip** updating `.claude/build-status.json` after builds
3. **DO NOT forget** to push build results back to Linux
4. **DO NOT use** `git pull` without `--rebase` (maintain linear history)
5. **DO NOT assume** build succeeded without checking build output

---

## ✅ Critical Do's

1. **ALWAYS record** ALL errors in `.claude/build-status.json`
2. **ALWAYS push** build results back to Linux after each build
3. **ALWAYS use** `git pull --rebase` (never plain `git pull`)
4. **ALWAYS check** for new commits when user says "깃"
5. **ALWAYS deploy** Qt dependencies if DongArch3D.exe fails to run

---

## 🎯 Typical User Commands

### "깃"
→ Check for new commits, pull if exists, build, report results

### "깃 커밋했나?"
→ Verify if build results were committed and pushed

### "리빌드"
→ Clean rebuild (delete build_korean/, reconfigure CMake, build)

### "push하라"
→ Push current changes to Linux

### "다시깃"
→ Check for new commits again

---

## 🔍 Debugging Tips

### Check Build Output
```bash
cd /a/1105/git11/GigaMesh/build_korean
tail -100 build.log  # Last 100 lines of build output
```

### Check Executable
```bash
ls -lh /a/1105/git11/GigaMesh/build_korean/gui/Release/DongArch3D.exe
```

### Check Running Processes
```bash
tasklist | grep -i dongarch
```

### Verify Qt Deployment
```bash
ls -lh /a/1105/git11/GigaMesh/build_korean/gui/Release/Qt5*.dll
```

---

## 📞 Key Paths

```
Git Repository:     A:\1105\git11\
Build Directory:    A:\1105\git11\GigaMesh\build_korean\
Executable:         A:\1105\git11\GigaMesh\build_korean\gui\Release\DongArch3D.exe
Build Status:       A:\1105\git11\.claude\build-status.json
VISION Document:    A:\1105\git11\docs\dongarch3d\VISION_완료시_모습.md
UI Screenshots:     A:\1105\git11\capture\
Qt Location:        C:\Qt\5.15.2\msvc2019_64\
```

---

## 🎉 Success Criteria

A successful build verification cycle includes:

1. ✅ New commits detected and pulled
2. ✅ DongArch3D.exe built successfully (Release config)
3. ✅ Executable size ~26MB
4. ✅ Qt dependencies deployed (if needed)
5. ✅ `.claude/build-status.json` updated with ALL details
6. ✅ Build results committed and pushed to Linux
7. ✅ No errors or warnings (or all errors documented)

---

**Document Version**: 1.0.0
**Created**: 2025-11-10
**Based on**: Conversation history with DongArch3D Windows build verification workflow
**Environment**: Windows build verification machine (A:\1105\git11)

**Remember**: This is a **build verification** environment, not the primary development environment. Your job is to pull changes, build, and report results back to Linux developers via `.claude/build-status.json`.
