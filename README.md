# DongArch3D (Arch3D Liner 기반)

**동국문화재연구원 전용 고고학 3D 실측 프로그램**

GigaMesh 오픈소스 프레임워크 기반의 Arch3D Liner 수준 고고학 전문 프로그램

---

## 📋 프로젝트 개요

- **프로젝트명**: DongArch3D
- **영문명**: Dongguk Archaeological 3D Measurement System
- **기반**: GigaMesh v1.0+ (GPL v3) + Arch3D Liner 기능 구현
- **목표**: Arch3D Liner 수준의 한국형 고고학 전용 프로그램 개발
- **개발기간**: 70일 (실작업 59일 + 버퍼 11일)
- **성공 가능성**: 95% (GigaMesh가 핵심 알고리즘 70% 이미 구현)

---

## 🎯 핵심 기능

### 1. 3D 파일 처리
- PLY, OBJ, STL 형식 지원 ✅
- Drag & Drop 파일 로드
- 메시 후처리 (Border Erosion, Hole Filling, Component Filtering)

### 2. Cutline (단면 라인 추출) ⭐ 핵심
- Top/Front/Right Cut (평면도, 정면도, 측면도)
- Mesh-Plane Intersection (GigaMesh `mesh.cpp:4041` 활용)
- Douglas-Peucker 간략화
- Catmull-Rom Spline 곡선 피팅
- 2D 미리보기 및 Save Slots (5개)

### 3. Outline (외곽 라인 추출)
- Silhouette Edge Detection (6방향)
- View-dependent 실루엣 계산
- 벡터화 (Vector Tracing)

### 4. Clip (3D 메시 절단)
- OpenGL Clipping Plane
- Mesh Split (GigaMesh `mesh.cpp:4017` 활용)
- 실시간 미리보기

### 5. Vis (시각화)
- X-Ray 렌더링
- D-Tak (디지털 탁본) - Geodesic Distance 활용
- Tiled Capture (고해상도 캡처)

### 6. Adobe Illustrator 연동
- SVG Export (1:1 스케일)
- 레이어 분리 (Cutline, Outline)
- Drag & Drop to Illustrator

### 7. MFE (Mini File Explorer)
- 파일 목록 및 썸네일 미리보기
- 3D Model Information
- SVG 파일 관리

---

## 📂 프로젝트 구조

```
A:/1105/
├── GigaMesh/                                  # 소스 코드
│   ├── gui/                                   # Qt GUI 애플리케이션
│   │   └── Release/
│   │       └── DongArch3D.exe                # 실행 파일
│   ├── core/                                  # 코어 라이브러리
│   │   ├── mesh/                              # 메시 처리
│   │   │   ├── mesh.cpp (4041: Mesh-Plane Intersection)
│   │   │   ├── mesh.cpp (4017: Mesh Split)
│   │   │   ├── polyline.cpp (PolyLine 클래스)
│   │   │   ├── edgegeodesic.cpp (Geodesic Distance)
│   │   │   └── MeshIO/ (PLY, OBJ, GLTF, SVG)
│   └── cli/                                   # CLI 도구
│       ├── gigamesh-clean (메시 후처리)
│       └── gigamesh-featurevectors (MSII)
├── docs/                                      # 문서
│   ├── dongarch3d/                            # DongArch3D 문서
│   │   ├── implementation_reports/            # 구현 보고서
│   │   └── .scripts/autocommit_daemon.py     # 자동 커밋
│   └── archaeology/                           # 고고학 참고자료
│       └── Arch3D Liner User Guide ver.2023.07.01.01.pdf
├── .claude/                                   # Claude Code 설정
│   ├── commands/                              # 커스텀 커맨드
│   ├── skills/                                # 프로젝트별 Skill
│   ├── architecture.md                        # 상세 구조 문서
│   ├── guidelines.md                          # 코딩 가이드
│   └── qt-app-translator/                    # Qt 번역 도구
├── DongArch3D_개발계획_v3_Arch3DLiner기반.md    # 개발 계획 (70일)
├── Arch3D_Liner_구현가능성_평가_GigaMesh기반.md # 구현 가능성 평가
└── CLAUDE.md                                  # 프로젝트 루트 가이드
```

---

## 🚀 빌드 방법

### Windows (MSVC)

```bash
cd A:/1105/GigaMesh/build_korean
cmake --build . --config Release --target DongArch3D
```

### Linux/macOS

```bash
mkdir -p GigaMesh/build && cd GigaMesh/build
cmake .. -DCMAKE_BUILD_TYPE=Release
make -j8 DongArch3D
```

---

## 🎮 실행

```bash
# Windows
A:\1105\GigaMesh\build_korean\gui\Release\DongArch3D.exe

# Linux/macOS
./GigaMesh/build/gui/DongArch3D
```

---

## 📊 개발 계획 (70일)

| Phase | 기능 | 기간 | GigaMesh 활용 | 상태 |
|-------|------|------|---------------|------|
| **Phase 0** | 기반 시스템 구축 | 4일 | 3D I/O, 메시 후처리 | 계획 중 |
| **Phase 1** | Align (정렬) | 10일 | Rotation, ViewPoint | 계획 중 |
| **Phase 2** | Cutline (단면) | 8일 | **Mesh-Plane Intersection** | 계획 중 |
| **Phase 3** | Outline (외곽) | 8일 | NPR Shaders 참고 | 계획 중 |
| **Phase 4** | Clip (절단) | 2일 | **Mesh Split** | 계획 중 |
| **Phase 5** | Vis (시각화) | 7일 | **Geodesic Distance** | 계획 중 |
| **Phase 6** | MFE (파일 탐색) | 5일 | Qt 기본 위젯 | 계획 중 |
| **Phase 7** | Illustrator 연동 | 5일 | **SVG Export** | 계획 중 |
| **Phase 8** | 테스트 및 문서화 | 10일 | - | 계획 중 |
| **버퍼** | 예비 시간 | 11일 | - | - |
| **총 개발 기간** | | **70일** | | |

---

## 💡 GigaMesh 활용 전략

### ✅ 완전 구현 가능 (70%)

| 기능 | GigaMesh 소스 | 단축 시간 |
|------|---------------|----------|
| **Mesh-Plane Intersection** ⭐ | `mesh.cpp:4041 calcIntersectionPolylineWithPlane()` | **7일 단축** |
| **Mesh Split** ⭐ | `mesh.cpp:4017 splitMesh()` | **3일 단축** |
| **Geodesic Distance** ⭐ | `edgegeodesic.cpp EdgeGeodesic` | **3일 단축** |
| **PolyLine** | `polyline.cpp:52 PolyLine(Plane)` | 즉시 사용 |
| **SVG Export** | `MeshWriter.cpp` | 1일 단축 |
| **메시 후처리** | `gigamesh-clean.cpp` | 1일 단축 |

**총 단축 시간**: 20일 (90일 → 70일, 22% 빠름)

### 🟡 새로 구현 필요 (30%)

- Douglas-Peucker 간략화 (3일)
- Catmull-Rom Spline (3일)
- Silhouette Edge Detection CPU 버전 (3일)
- Qt UI 작업 (20일)

---

## 📚 참고 문서

- **개발 계획**: `DongArch3D_개발계획_v3_Arch3DLiner기반.md`
- **구현 가능성 평가**: `Arch3D_Liner_구현가능성_평가_GigaMesh기반.md`
- **GigaMesh 가이드**: `GigaMesh/CLAUDE.md`
- **프로젝트 가이드**: `CLAUDE.md`
- **Arch3D Liner 매뉴얼**: `docs/archaeology/Arch3D Liner User Guide ver.2023.07.01.01.pdf`

---

## 🧪 테스트

```bash
cd GigaMesh/build
ctest
```

---

## 📄 라이선스

GPL v3 (GigaMesh 기반)

---

## 🔗 참고 링크

- **GigaMesh**: https://gigamesh.eu
- **GigaMesh GitLab**: https://gitlab.com/fcgl/GigaMesh
- **Arch3D Liner**: https://www.carrotphant.com

---

**문서 버전**: 2.0.0 (Arch3D Liner 기반)
**최종 수정**: 2025-11-08
**다음 업데이트**: Phase 0 시작 시
