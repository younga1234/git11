---
name: dongarch3d-mvp-dev
description: Comprehensive toolkit for DongArch3D Archaeological 3D Measurement System (v4.0 - 품질 최우선, Arch3D Liner 능가). This skill should be used when developing DongArch3D with quality-first approach (no time constraints), implementing Arch3D Liner features with latest technologies (C++20, 2025 papers, GPU acceleration), working with GigaMesh 70% + new tech 30%, or managing Phase/Task progress. Includes GigaMesh integration guides, auto-documentation, and quality-focused development. (project)
---

# DongArch3D MVP Development Skill v4.0 (품질 최우선, Arch3D Liner 능가)

**Version**: 4.0.0
**Created**: 2025-11-07
**Updated**: 2025-11-08
**Plan**: 시간 제약 없음 (품질 최우선, Arch3D Liner 능가)

---

## 📋 Overview

DongArch3D v4.0은 **Arch3D Liner를 능가하는** 고고학 실측 프로그램입니다. 이 Skill은 **품질 최우선** 개발 계획의 모든 단계를 지원합니다.

### 주요 변경사항 (v3.0 → v4.0) ⭐
- **시간 제약**: 70일 → **없음** (품질 최우선)
- **목표**: Arch3D Liner 동등 → **Arch3D Liner 능가**
- **C++20**: 일부 사용 → **전면 도입** (std::span, Ranges, Concepts)
- **최신 기술**: 없음 → **2025년 최신 논문 3개** (Self-Intersection Repair, Quadric Error Metric, Heat Method GPU)
- **GPU 가속**: 없음 → **Geometry/Fragment Shader** (10-100배 빠름)
- **GigaMesh 활용**: 70% (변화 없음) + **최신 기술 30% 추가**

### Phase 구조 (8 Phases) - v4.0 품질 최우선
```
Phase 0: 기반 시스템                 - gigamesh-clean 통합 (GigaMesh 70%)
Phase 1: Align                       - 정렬, ViewPoint, Rotation + C++20 constexpr
Phase 2: Cutline ⭐ 핵심             - 단면 라인 추출 (GigaMesh + Douglas-Peucker)
Phase 3: Outline ⭐ 핵심             - 외곽 라인 추출 (GPU Geometry Shader + Quadric Error Metric 2025)
Phase 4: Clip                        - 3D 메시 절단 (GigaMesh splitMesh + Self-Intersection Repair 2025)
Phase 5: Vis                         - X-Ray, D-Tak (Heat Method GPU 2018, 10-100배 빠름)
Phase 6: MFE                         - Mini File Explorer
Phase 7: Illustrator                 - Adobe Illustrator 연동 (SVG Export)
Phase 8: 테스트                      - 통합 테스트 및 릴리스

**v4.0 원칙**: 시간 제약 없음, 품질 100% 완성 목표
```

---

## 🎯 Skill 활성화 조건

이 Skill은 다음 키워드 감지 시 자동 활성화됩니다:

### 키워드
- "DongArch3D", "dongarch3d", "동국문화재"
- "Arch3D Liner", "Cutline", "Outline", "Clip", "Vis"
- "Phase", "Task", "품질 최우선", "v4.0"
- "GigaMesh", "mesh-plane intersection", "splitMesh"
- "C++20", "GPU", "Geometry Shader", "2025년 논문"

### 파일 경로
- `A:\1105\.dongarch3d-progress.json`
- `A:\1105\.claude\DongArch3D_최종개선계획_v4_품질최우선.md`
- `A:\1105\CLAUDE.md` (v4.0)
- `A:\1105\GigaMesh\gui\src\arch3d\`

### 커맨드
- `/dongarch-*` (모든 dongarch 커맨드)

---

## 🚀 개발 워크플로우

### 1. 세션 시작
```bash
/dongarch-init
```

자동 실행:
- 진행 상황 파일 읽기 (.dongarch3d-progress.json)
- 핵심 문서 로드 (CLAUDE.md, 개발계획서)
- MCP 서버 확인
- 자동 커밋 데몬 시작
- 현재 Phase/Task 보고

### 2. 현재 상태 확인
```bash
/dongarch-status
```

출력 예시 (v4.0):
```
현재 위치: Phase 2 (Cutline), Task 205 (Douglas-Peucker)
완성도:    12/71 tasks (품질 100% 목표)
v4.0:      시간 제약 없음, 품질 최우선
```

### 3. Phase 정보 확인
```bash
/dongarch-phase 2  # Phase 2 상세 정보
```

출력:
- Phase 목표 및 Task 목록
- GigaMesh 활용 전략
- 구현 위치
- 참고 자료

### 4. Task 시작
```bash
/dongarch-task 205  # Task 205 시작
```

제공 내용:
- Task 상세 정보
- 코드 스켈레톤
- 체크리스트
- 구현 가이드

### 5. 코드 구현

**Cutline (Phase 2) 예시**:
```cpp
// DongArchCutlineManager.cpp
std::vector<Vector3D> DongArchCutlineManager::calculateTopCut(
    Mesh* mesh, double height
) {
    // GigaMesh calcIntersectionPolylineWithPlane() 활용
    Vector3D planeHNF(0, 0, 1, -height);  // Hesse Normal Form
    std::vector<Vector3D> intersectionPoints;

    bool success = mesh->calcIntersectionPolylineWithPlane(
        planeHNF,
        &intersectionPoints
    );

    return intersectionPoints;
}
```

**Outline (Phase 3) 예시**:
```cpp
// SilhouetteDetector.cpp
bool SilhouetteDetector::isSilhouetteEdge(
    Edge* edge,
    const Vector3D& viewDir
) {
    if (!edge->face1 || !edge->face2) return false;

    Vector3D n1 = edge->face1->getNormal();
    Vector3D n2 = edge->face2->getNormal();

    double dot1 = n1.dot3(viewDir);
    double dot2 = n2.dot3(viewDir);

    return (dot1 * dot2) < 0;  // Silhouette condition
}
```

### 6. 빌드 및 테스트
```bash
cd A:\1105\GigaMesh\build_korean
cmake --build . --config Release --target DongArch3D
```

### 7. Task 완료
```bash
/dongarch-complete
```

자동 제공:
- 완료 체크리스트
- 구현 보고서 템플릿
- Git 커밋 가이드
- 진행 상황 업데이트 가이드

---

## 📚 GigaMesh 알고리즘 활용 가이드

### Phase 2: Cutline (단면 라인 추출)

**GigaMesh 함수**:
```cpp
// A:\1105\GigaMesh\core\mesh\mesh.cpp:4041
bool Mesh::calcIntersectionPolylineWithPlane(
    const Vector3D& planeHNF,
    std::vector<Vector3D>* rIntersectionPoints
);

// A:\1105\GigaMesh\core\mesh\polyline.cpp:52
PolyLine::PolyLine(const Plane& rPlaneIntersecting);
```

**개발 시간**: 15일 → **8일** (7일 단축)

### Phase 4: Clip (3D 절단)

**GigaMesh 함수**:
```cpp
// A:\1105\GigaMesh\core\mesh\mesh.cpp:4017
splitMesh(intersectFun, distFun, getIntersectionVectorFun);
```

**개발 시간**: 5일 → **2일** (3일 단축)

### Phase 5: Vis (D-Tak 렌더링)

**GigaMesh 클래스**:
```cpp
// A:\1105\GigaMesh\core\mesh\edgegeodesic.cpp
class EdgeGeodesic : public Edge {
public:
    double getGeodAngle();  // 곡률 계산
};
```

**개발 시간**: 5일 → **3일** (2일 단축)

---

## 📂 파일 구조 (v2.0.0)

```
A:\1105\
├── GigaMesh/
│   ├── core/mesh/                    # GigaMesh 코어 (수정 금지)
│   │   ├── mesh.cpp:4041 ⭐          # calcIntersectionPolylineWithPlane
│   │   ├── mesh.cpp:4017 ⭐          # splitMesh
│   │   ├── edgegeodesic.cpp ⭐       # EdgeGeodesic
│   │   └── MeshIO/                   # PLY, OBJ, SVG
│   └── gui/src/
│       └── arch3d/                   # Arch3D Liner 기능 (새로 구현)
│           ├── base/                 # 기반 시스템
│           ├── align/                # Align (정렬)
│           ├── cutline/ ⭐           # Cutline (단면)
│           │   ├── DongArchCutlineManager.h/cpp
│           │   ├── DouglasPeucker.h/cpp
│           │   └── CatmullRomSpline.h/cpp
│           ├── outline/ ⭐           # Outline (외곽)
│           │   ├── DongArchOutlineExtractor.h/cpp
│           │   └── SilhouetteDetector.h/cpp
│           ├── clip/                 # Clip (절단)
│           ├── vis/                  # Vis (X-Ray, D-Tak)
│           ├── mfe/                  # MFE (파일 탐색기)
│           └── export/               # SVG/Illustrator
├── .dongarch3d-progress.json         # 진행 상황 추적
├── .claude/
│   ├── DongArch3D_개발계획_v3_Arch3DLiner기반.md
│   ├── architecture.md (v2.0.0)
│   ├── decisions.md (ADR 009-015)
│   └── commands/
│       ├── dongarch-init.md
│       ├── dongarch-status.md
│       ├── dongarch-complete.md
│       ├── dongarch-phase.md
│       └── dongarch-task.md
└── docs/dongarch3d/
    ├── CONTEXT_CORE.md
    ├── implementation_reports/       # Phase별 구현 보고서
    └── .logs/                        # 자동 로그
```

---

## 🔧 주요 커맨드

### 기본 커맨드
- `/dongarch-init`: 세션 시작 (컨텍스트 복구)
- `/dongarch-status`: 현재 진행 상황
- `/dongarch-complete`: Task 완료 기록
- `/dongarch-phase [N]`: Phase N 정보
- `/dongarch-task [ID]`: Task ID 시작

### 자동 커밋
- `/dongarch-autocommit`: 1분마다 자동 Git 커밋 (백그라운드)

---

## 📖 Phase별 구현 가이드

### Phase 0: 기반 시스템 (4일)
- gigamesh-clean CLI → GUI 통합
- 3D 파일 드래그 앤 드롭
- 기본 Settings UI

**구현 위치**: `gui/src/arch3d/base/`

### Phase 1: Align (10일)
- Rotation UI (슬라이더, 버튼)
- Ground Plane 표시
- ViewPoint 버튼 (6방향)
- Fit Ground Plane (자동 정렬)

**구현 위치**: `gui/src/arch3d/align/`

### Phase 2: Cutline (8일) ⭐ 핵심
1. **Mesh-Plane Intersection (2일)** - GigaMesh 활용
2. **3D → 2D 투영 (1일)**
3. **Douglas-Peucker (3일)** - 새로 구현
4. **Catmull-Rom Spline (3일)** - 새로 구현
5. **Cutline UI (2일)**

**구현 위치**: `gui/src/arch3d/cutline/`

### Phase 3: Outline (8일) ⭐ 핵심
1. **Silhouette Edge Detection (3일)** - CPU 버전
2. **6방향 계산 (2일)**
3. **벡터화 (1일)** - Douglas-Peucker 재사용
4. **UI (1일)**

**구현 위치**: `gui/src/arch3d/outline/`

### Phase 4: Clip (2일)
1. **OpenGL Clipping Plane (1일)**
2. **Mesh Split (1일)** - GigaMesh splitMesh()

**구현 위치**: `gui/src/arch3d/clip/`

### Phase 5: Vis (7일)
1. **X-Ray 렌더링 (4일)** - GLSL 셰이더
2. **D-Tak 렌더링 (3일)** - EdgeGeodesic 활용

**구현 위치**: `gui/src/arch3d/vis/`

### Phase 6: MFE (5일)
- 파일 탐색기 UI
- 3D Model Information
- SVG Drag & Drop

**구현 위치**: `gui/src/arch3d/mfe/`

### Phase 7: Illustrator (5일)
- SVG Export 개선
- 레이어 분리
- 1:1 스케일 유지

**구현 위치**: `gui/src/arch3d/export/`

### Phase 8: 테스트 (10일)
- 워크플로우 테스트
- 성능 최적화
- 사용자 매뉴얼 작성

**구현 위치**: `tests/arch3d/`

---

## ⚠️ 주의사항

### 절대 수정 금지
```
❌ GigaMesh/core/mesh/        # 코어 메시 처리
❌ GigaMesh/external/         # 서드파티 라이브러리
```

### 수정 가능
```
✅ GigaMesh/gui/src/          # GUI 컴포넌트
✅ GigaMesh/gui/resources/    # 리소스
✅ .claude/                   # Claude Code 설정
✅ docs/dongarch3d/           # DongArch3D 문서
```

### 코딩 규칙
- **변수/함수**: camelCase (mDarkModeEnabled, applyTheme())
- **클래스**: PascalCase (QGMDarkModeManager)
- **상수**: UPPER_SNAKE_CASE (SOIL_LAYER_BROWN)
- **멤버 변수**: m 접두사 (mInstance)

---

## 📊 성공 기준

### MVP (60일 목표)
1. 3D 파일 열기 (PLY, OBJ, STL)
2. 메시 후처리 (GigaMesh 기능)
3. Align (6방향 ViewPoint)
4. Cutline (Top/Front/Right 단면)
5. Outline (6방향 외곽선)
6. SVG 내보내기

### Full (70일 목표)
7. Clip (3D 절단)
8. X-Ray 렌더링
9. D-Tak 렌더링
10. MFE + Adobe Illustrator 연동

---

## 📞 지원 및 참고

### 문서
- **개발 계획**: `.claude/DongArch3D_개발계획_v3_Arch3DLiner기반.md`
- **아키텍처**: `.claude/architecture.md` v2.0.0
- **기술 결정**: `.claude/decisions.md` (ADR 009-015)
- **코딩 규칙**: `.claude/guidelines.md`

### 스크립트
- **자동 커밋**: `docs/dongarch3d/.scripts/autocommit_daemon.py`
- **진행 추적**: `.dongarch3d-progress.json`

---

**Skill Version**: 2.0.0 (Arch3D Liner 기반)
**Last Updated**: 2025-11-08
**Plan Duration**: 70일 (약 2.3개월)
**Total Tasks**: 71 tasks (8 Phases)
**GigaMesh Usage**: 70% (20일 단축)
