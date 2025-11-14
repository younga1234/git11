# DongArch3D 시스템 아키텍처 v4.0 (품질 최우선)

**버전**: 4.0.0 (품질 최우선, 시간 제약 없음)
**최종 업데이트**: 2025-11-08
**기반**: GigaMesh 70% + 2025년 최신 논문 + C++20 전면 도입
**목표**: Arch3D Liner 능가

이 문서는 DongArch3D v4의 전체 시스템 구조를 **최신 기술 기준**으로 매우 상세하게 설명합니다.

---

## 📋 목차

1. 전체 아키텍처 개요 (v4)
2. GigaMesh 활용 전략 (70%)
3. 최신 기술 통합 (30%)
4. Phase별 구현 위치
5. 데이터 흐름
6. 클래스 설계 (C++20)

---

## 1. 전체 아키텍처 개요 (v4)

### 1.1 레이어 구조 (최신 기술 통합)

```
┌────────────────────────────────────────────────────────────────────┐
│  Layer 5: 2025년 최신 기술 (30%)                                   │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ Self-Intersection Repair (2025) - Clip 안정성               │  │
│  │ Quadric Error Metric (2025) - Outline 품질                  │  │
│  │ Heat Method GPU (2018) - D-Tak 10-100배 가속                │  │
│  │ Geometry Shader Silhouette (2008) - Outline GPU 가속        │  │
│  │ Douglas-Peucker (1999) - Cutline 간략화                     │  │
│  │ Catmull-Rom Spline (1974) - Cutline 곡선                    │  │
│  └──────────────────────────────────────────────────────────────┘  │
├────────────────────────────────────────────────────────────────────┤
│  Layer 4: Arch3D Liner Feature Modules (C++20)                    │
│  ┌────────────┬──────────────┬─────────────┬────────────────────┐ │
│  │ Cutline    │ Outline      │ Clip        │ Vis                │ │
│  │ Manager    │ Extractor    │ Manager     │ (X-Ray/D-Tak GPU)  │ │
│  │ (C++20)    │ (Geometry    │ (Self-Int   │ (Heat Method)      │ │
│  │            │  Shader)     │  Repair)    │                    │ │
│  └────────────┴──────────────┴─────────────┴────────────────────┘ │
├────────────────────────────────────────────────────────────────────┤
│  Layer 3: Qt GUI (한국어 UI) - Qt 5.15.2                          │
│  - DongArchMainWindow (메인 창)                                   │
│  - Dialogs: Cutline, Outline, Clip, Vis, MFE, Export             │
│  - Toolbars: Align, ViewPoint                                    │
├────────────────────────────────────────────────────────────────────┤
│  Layer 2: MeshWidget & MeshQt (Qt-OpenGL 통합)                    │
│  - User interaction (mouse, keyboard)                            │
│  - Signal/Slot connections                                       │
├────────────────────────────────────────────────────────────────────┤
│  Layer 1.5: MeshGL (OpenGL 3.3 Rendering)                        │
│  - Fragment Shader 실시간 프리뷰 (Cutline, Clip)                 │
│  - Geometry Shader Silhouette (Outline GPU 가속)                │
│  - Heat Method GPU (D-Tak Fragment Shader)                       │
│  - X-Ray Depth Peeling (고품질 시각화)                            │
├────────────────────────────────────────────────────────────────────┤
│  Layer 1: Core Mesh Library (GigaMesh 70%) ⭐                     │
│  - mesh.cpp:4041 (Mesh-Plane Intersection) - Cutline             │
│  - mesh.cpp:4017 (Mesh Split) - Clip                             │
│  - polyline.cpp:52 (PolyLine) - Cutline                          │
│  - edgegeodesic.cpp (Geodesic Distance) - D-Tak                  │
│  - octree.cpp (Octree 가속) - 최적화                              │
│  - NPR Shaders (Sobel, Hatching) - Outline, X-Ray                │
│  - MeshWriter.cpp (SVG Export) - Illustrator                     │
│  - gigamesh-clean.cpp (메시 후처리) - Phase 0                    │
├────────────────────────────────────────────────────────────────────┤
│  Layer 0: External Libraries                                     │
│  - Qt 5.15.2, OpenGL 3.3, GLM (FetchContent), libtiff            │
└────────────────────────────────────────────────────────────────────┘
```

### 1.2 핵심 설계 원칙 (v4)

**1. 품질 최우선 (시간 제약 없음)**
- Arch3D Liner 능가 - 더 빠르고, 더 좋은 품질
- 2025년 최신 논문 3개 적용
- C++20 전면 도입
- GPU 가속 최대 활용

**2. GigaMesh 기존 코드 최대한 활용 (70%)**
- Cutline: `mesh.cpp:4041` + `polyline.cpp:52` + `octree.cpp`
- Clip: `mesh.cpp:4017` + Self-Intersection Repair (2025)
- D-Tak: `edgegeodesic.cpp` + Heat Method GPU (2018)
- Outline: NPR Sobel Shader + Geometry Shader (2008) + Quadric (2025)

**3. 모듈화 및 분리**
- 각 기능은 독립 모듈 (C++20 Concepts로 인터페이스 정의)
- GigaMesh 코어는 수정 최소화 (읽기 전용)
- 새 기능은 `gui/src/dongarch/` 폴더에 구현

---

## 2. GigaMesh 활용 전략 (70%)

### 2.1 완전 재사용 (GigaMesh 이미 구현됨)

| 기능 | GigaMesh 소스 | 사용 위치 | Phase |
|------|---------------|----------|-------|
| **Mesh-Plane Intersection** | `mesh.cpp:4041` | DongArchCutlineManager | Phase 2 |
| **PolyLine 클래스** | `polyline.cpp:52` | DongArchCutlineManager | Phase 2 |
| **Octree 공간 분할** | `octree.cpp` | 대형 메시 최적화 | Phase 2, 3 |
| **Mesh Split** | `mesh.cpp:4017` | DongArchClipManager | Phase 4 |
| **Geodesic Distance** | `edgegeodesic.cpp` | DTakRenderer (CPU 버전) | Phase 5 |
| **Sobel Edge Detection** | `shaders/NPR/NPR_ApplySobel.frag` | OutlineExtractor (후처리) | Phase 3 |
| **NPR Hatching** | `shaders/NPR/NPR_hatches.frag` | XRayRenderer (참고) | Phase 5 |
| **SVG Export** | `MeshWriter.cpp` | SVGExporter | Phase 7 |
| **메시 후처리** | `gigamesh-clean.cpp` | Phase 0 전처리 | Phase 0 |

### 2.2 GigaMesh 소스 호출 방법 (C++20)

```cpp
// Phase 2: Cutline - Mesh-Plane Intersection
class DongArchCutlineManager {
public:
    // C++20 std::span 사용
    std::vector<Vector3D> extractCutline(
        std::span<const Plane> planes
    ) {
        std::vector<Vector3D> result;

        // GigaMesh 함수 호출 ✅
        mesh->calcIntersectionPolylineWithPlane(
            plane.getHNF(),
            &result
        );

        // C++20 Ranges로 필터링
        auto filtered = result
            | std::views::filter([](auto& p) { return p.isValid(); })
            | std::ranges::to<std::vector>();

        return filtered;
    }
};
```

---

## 3. 최신 기술 통합 (30%)

### 3.1 C++20 기능 전면 도입

```cpp
// 1. std::span - 배열 전달
void processMesh(std::span<const float> vertices);  // ✅
// void processMesh(const float* vertices, size_t count);  // ❌

// 2. Ranges - 필터링/변환
auto silhouetteEdges = mesh.edges()
    | std::views::filter([](auto& e) { return e.isSilhouette(); })
    | std::ranges::to<std::vector>();

// 3. Concepts - 템플릿 제약
template<std::ranges::range R>
requires std::same_as<std::ranges::range_value_t<R>, Vertex>
void alignMesh(const R& vertices);

// 4. Designated Initializers - 구조체 초기화
CutlineParams params {
    .planeHeight = 10.0f,
    .smoothingLevel = 3,
    .useSpline = true
};

// 5. constexpr - 컴파일 타임 연산
constexpr Vector3 crossProduct(const Vector3& a, const Vector3& b) {
    return Vector3 {
        a.y * b.z - a.z * b.y,
        a.z * b.x - a.x * b.z,
        a.x * b.y - a.y * b.x
    };
}
```

### 3.2 2025년 최신 논문 3개 적용

#### 3.2.1 Self-Intersection Repair (2025) - Phase 4

```cpp
// gui/src/dongarch/clip/SelfIntersectionRepairer.h
class SelfIntersectionRepairer {
public:
    /**
     * @brief Repair self-intersections after mesh splitting
     * @param mesh Mesh after split
     * @return Repaired mesh
     *
     * Reference: "Instant Self-Intersection Repair for Mesh Cutting" (2025)
     * - Detects self-intersecting triangles
     * - Splits intersecting faces automatically
     * - Ensures topological correctness
     */
    std::unique_ptr<Mesh> repair(std::span<const Triangle> triangles);

private:
    bool detectSelfIntersection(const Triangle& t1, const Triangle& t2);
    void splitIntersectingFaces(std::span<Triangle> faces);
};
```

#### 3.2.2 Quadric Error Metric (2025) - Phase 3

```cpp
// gui/src/dongarch/outline/QuadricSilhouetteOptimizer.h
class QuadricSilhouetteOptimizer {
public:
    /**
     * @brief Optimize silhouette using Quadric Error Metric
     * @param edges Silhouette edges
     * @return Optimized edges with important features preserved
     *
     * Reference: "Quadric-Based Mesh Simplification for Silhouette Sampling" (2025)
     * - Computes Quadric error for each vertex
     * - Preserves high-curvature silhouette edges
     * - Better quality than simple Douglas-Peucker
     */
    std::vector<Edge> optimize(std::span<const Edge> edges);

private:
    double computeQuadricError(const Vertex& v);
    bool isCriticalSilhouetteEdge(const Edge& e);
};
```

#### 3.2.3 Heat Method GPU (2018) - Phase 5

```glsl
// gui/src/shaders/dongarch/heat_method.frag
#version 330 core

// Fragment Shader for Heat Method Geodesic Distance (GPU)
// Reference: "Parallel Heat Methods for Geodesic Distance" (2018)

uniform sampler2D heatSource;  // Heat source texture
uniform float deltaTime;       // Time step
uniform int iteration;         // Current iteration

in vec2 texCoord;
out vec4 fragColor;

void main() {
    // Heat diffusion equation: ∂u/∂t = Δu
    vec4 center = texture(heatSource, texCoord);
    vec4 left = texture(heatSource, texCoord + vec2(-1.0/1024, 0));
    vec4 right = texture(heatSource, texCoord + vec2(1.0/1024, 0));
    vec4 up = texture(heatSource, texCoord + vec2(0, 1.0/1024));
    vec4 down = texture(heatSource, texCoord + vec2(0, -1.0/1024));

    // Laplacian: Δu = (left + right + up + down - 4*center)
    vec4 laplacian = (left + right + up + down - 4.0 * center);

    // Forward Euler: u(t+Δt) = u(t) + Δt * Δu
    vec4 newHeat = center + deltaTime * laplacian;

    fragColor = newHeat;
}
```

### 3.3 GPU 가속 (Geometry Shader, Fragment Shader)

#### 3.3.1 Geometry Shader Silhouette (Phase 3)

```glsl
// gui/src/shaders/dongarch/silhouette.geom
#version 330 core

layout(triangles_adjacency) in;  // 인접 정보 포함
layout(line_strip, max_vertices = 6) out;

in vec3 vNormal[];  // Vertex Shader에서 전달된 법선

uniform vec3 viewDir;  // 카메라 방향

void main() {
    // Reference: "Silhouette Smoothing and Quality Assessment" (2008)

    for (int i = 0; i < 3; i++) {
        // 현재 삼각형 법선
        vec3 n1 = vNormal[i*2];
        // 인접 삼각형 법선
        vec3 n2 = vNormal[i*2+1];

        // Silhouette 조건: 한쪽은 앞, 한쪽은 뒤
        bool isSilhouette = dot(n1, viewDir) * dot(n2, viewDir) < 0.0;

        if (isSilhouette) {
            // Silhouette edge 출력
            gl_Position = gl_in[i*2].gl_Position;
            EmitVertex();
            gl_Position = gl_in[(i+1)*2].gl_Position;
            EmitVertex();
            EndPrimitive();
        }
    }
}
```

---

## 4. Phase별 구현 위치

### Phase 0: 기반 시스템 (C++20 도입)

```
GigaMesh/
└── gui/src/dongarch/
    ├── common/
    │   ├── DongArchTypes.h          # C++20 타입 정의 (std::span, Concepts)
    │   ├── DongArchMath.h           # constexpr 수학 함수
    │   └── DongArchUtils.h          # Ranges 유틸리티
    └── core/
        └── MeshPreprocessor.cpp     # gigamesh-clean 래퍼
```

**C++20 타입 정의**:
```cpp
// gui/src/dongarch/common/DongArchTypes.h
#pragma once
#include <span>
#include <ranges>
#include <concepts>

namespace DongArch {

// Vertex Concept
template<typename T>
concept VertexLike = requires(T v) {
    { v.x() } -> std::convertible_to<float>;
    { v.y() } -> std::convertible_to<float>;
    { v.z() } -> std::convertible_to<float>;
};

// Mesh Container Concept
template<typename T>
concept MeshContainer = std::ranges::range<T> &&
                       VertexLike<std::ranges::range_value_t<T>>;

// Designated Initializer 구조체
struct CutlineParams {
    float planeHeight;
    int smoothingLevel;
    bool useSpline;
};

struct OutlineParams {
    int viewDirection;  // 0-5 (Top, Front, Right, Left, Back, Bottom)
    float quadricThreshold;
    bool useGeometryShader;
};

} // namespace DongArch
```

### Phase 2: Cutline (Douglas-Peucker + Catmull-Rom)

```
gui/src/dongarch/cutline/
├── DongArchCutlineManager.h/cpp      # 메인 (GigaMesh 활용)
├── CutlineDialog.h/cpp               # UI
├── CutlinePreviewWidget.h/cpp        # 2D 미리보기
├── algorithms/
│   ├── DouglasPeucker.h/cpp          # 새로 구현 (1999 논문)
│   ├── CatmullRomSpline.h/cpp        # 새로 구현 (1974)
│   └── CutlineOptimizer.h/cpp        # C++20 Ranges 활용
└── shaders/
    └── cutline_preview.frag          # Fragment Shader 실시간 프리뷰
```

### Phase 3: Outline (Geometry Shader + Quadric)

```
gui/src/dongarch/outline/
├── DongArchOutlineExtractor.h/cpp    # 메인
├── OutlineDialog.h/cpp               # UI
├── algorithms/
│   ├── GeometrySilhouette.h/cpp      # CPU 버전 (2008 논문)
│   └── QuadricOptimizer.h/cpp        # 2025 최신 논문!
└── shaders/
    ├── silhouette.geom               # Geometry Shader (GPU 10-100배 빠름)
    ├── silhouette.vert
    └── silhouette.frag
```

### Phase 4: Clip (Self-Intersection Repair)

```
gui/src/dongarch/clip/
├── DongArchClipManager.h/cpp         # 메인 (GigaMesh splitMesh 활용)
├── ClipDialog.h/cpp                  # UI
├── algorithms/
│   └── SelfIntersectionRepairer.h/cpp  # 2025 최신 논문!
└── shaders/
    └── clip_preview.frag             # Fragment Shader 실시간 프리뷰
```

### Phase 5: Vis (Heat Method GPU)

```
gui/src/dongarch/vis/
├── XRayRenderer.h/cpp                # X-Ray (Depth Peeling)
├── DTakRenderer.h/cpp                # D-Tak (Heat Method GPU)
├── VisDialog.h/cpp                   # UI
└── shaders/
    ├── xray_depth_peeling.frag       # X-Ray 고품질
    ├── heat_method.frag              # 2018 논문 (GPU 10-100배 빠름)
    └── heat_method.vert
```

---

## 5. 데이터 흐름 (C++20)

### 5.1 Cutline 데이터 흐름

```
User Input (Plane Height)
    ↓
DongArchCutlineManager
    ↓ C++20 std::span
GigaMesh mesh.cpp:4041 (Mesh-Plane Intersection)
    ↓ std::vector<Vector3D>
Douglas-Peucker (간략화)
    ↓ C++20 Ranges filter
Catmull-Rom Spline (곡선)
    ↓ std::vector<Vector2D>
Fragment Shader (실시간 프리뷰)
    ↓
2D Preview Widget (QPainter)
    ↓
SVG Export (1:1 스케일)
```

### 5.2 Outline 데이터 흐름 (GPU 가속)

```
Mesh + View Direction
    ↓
Geometry Shader Silhouette (GPU 10-100배 빠름)
    ↓ Silhouette Edges
Quadric Error Metric (2025 최신)
    ↓ Optimized Edges
Sobel Filter (후처리)
    ↓
2D Outline
    ↓
SVG Export
```

---

## 6. 클래스 설계 (C++20)

### 6.1 DongArchCutlineManager (Phase 2)

```cpp
// gui/src/dongarch/cutline/DongArchCutlineManager.h
#pragma once
#include <span>
#include <ranges>
#include "dongarch/common/DongArchTypes.h"

namespace DongArch {

class CutlineManager : public QObject {
    Q_OBJECT

public:
    /**
     * @brief Extract cutline using GigaMesh + modern algorithms
     * @param mesh Mesh to process (std::span for safety)
     * @param params Parameters (Designated Initializers)
     * @return 2D cutline points
     */
    std::vector<Vector2D> extractCutline(
        std::span<const Vertex> vertices,
        const CutlineParams& params  // C++20 Designated Initializers
    );

signals:
    void cutlineExtracted(const std::vector<Vector2D>& points);
    void progressChanged(int percentage);

private:
    // GigaMesh 활용
    std::vector<Vector3D> meshPlaneIntersection(const Plane& plane);

    // 새로 구현 (1999 논문)
    std::vector<Vector2D> douglasPeucker(
        std::span<const Vector2D> points,
        float tolerance
    );

    // 새로 구현 (1974)
    std::vector<Vector2D> catmullRomSpline(
        std::span<const Vector2D> controlPoints,
        int segments
    );

    // C++20 Ranges 활용
    auto filterValidPoints(std::span<const Vector3D> points) {
        return points
            | std::views::filter([](auto& p) { return p.isValid(); })
            | std::ranges::to<std::vector>();
    }
};

} // namespace DongArch
```

### 6.2 OutlineExtractor (Phase 3)

```cpp
// gui/src/dongarch/outline/OutlineExtractor.h
#pragma once
#include "dongarch/common/DongArchTypes.h"

namespace DongArch {

class OutlineExtractor : public QObject {
    Q_OBJECT

public:
    /**
     * @brief Extract outline using Geometry Shader + Quadric (2025)
     * @param mesh Mesh
     * @param params Outline parameters
     * @return Outline edges
     */
    std::vector<Edge> extractOutline(
        std::span<const Vertex> vertices,
        const OutlineParams& params
    );

private:
    // Geometry Shader GPU 버전 (2008 논문)
    std::vector<Edge> geometryShaderSilhouette(const ViewDirection& view);

    // Quadric Error Metric (2025 최신!)
    std::vector<Edge> optimizeWithQuadric(std::span<const Edge> edges);

    // GigaMesh Sobel Shader (후처리)
    void applySobelFilter();
};

} // namespace DongArch
```

---

## 7. Arch3D Liner 능가 전략

| 기능 | Arch3D Liner | DongArch3D v4 | 개선 |
|------|-------------|---------------|------|
| **Cutline** | CPU | GigaMesh + Octree 가속 | ✅ 더 빠름 |
| **Outline** | CPU | Geometry Shader (GPU 10-100배) + Quadric (2025) | ✅ 훨씬 빠르고 품질 좋음 |
| **Clip** | 기본 | GigaMesh + Self-Intersection Repair (2025) | ✅ 더 안정적 |
| **D-Tak** | CPU | Heat Method GPU (10-100배 빠름) | ✅ 실시간 가능 |
| **X-Ray** | 기본 | Depth Peeling | ✅ 더 사실적 |
| **코드** | 미공개 | C++20 오픈소스 | ✅ 현대적, 유지보수 쉬움 |

---

## 8. 빌드 시스템 (CMake + C++20)

### 8.1 CMakeLists.txt 구조

```cmake
# GigaMesh/CMakeLists.txt
cmake_minimum_required(VERSION 3.10)
project(DongArch3D VERSION 4.0.0 LANGUAGES CXX C)

# C++20 필수
set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# FetchContent for GLM
include(FetchContent)
FetchContent_Declare(glm
    GIT_REPOSITORY https://github.com/g-truc/glm.git
    GIT_TAG 0.9.9.8
)
FetchContent_MakeAvailable(glm)

# Qt 5.15
find_package(Qt5 COMPONENTS Core Widgets Gui OpenGL Network REQUIRED)

# OpenGL 3.3
find_package(OpenGL REQUIRED)

# DongArch3D GUI
add_subdirectory(gui)
```

### 8.2 GUI CMakeLists.txt

```cmake
# GigaMesh/gui/CMakeLists.txt

# Qt 자동 처리
set(CMAKE_AUTOMOC ON)
set(CMAKE_AUTORCC ON)
set(CMAKE_AUTOUIC ON)

# 소스 파일
set(DONGARCH_SOURCES
    # Phase 0
    src/dongarch/common/DongArchTypes.h
    src/dongarch/common/DongArchMath.cpp

    # Phase 2: Cutline
    src/dongarch/cutline/DongArchCutlineManager.cpp
    src/dongarch/cutline/algorithms/DouglasPeucker.cpp
    src/dongarch/cutline/algorithms/CatmullRomSpline.cpp

    # Phase 3: Outline
    src/dongarch/outline/OutlineExtractor.cpp
    src/dongarch/outline/algorithms/QuadricOptimizer.cpp

    # Phase 4: Clip
    src/dongarch/clip/DongArchClipManager.cpp
    src/dongarch/clip/algorithms/SelfIntersectionRepairer.cpp

    # Phase 5: Vis
    src/dongarch/vis/DTakRenderer.cpp
    src/dongarch/vis/XRayRenderer.cpp
)

# Shader 파일
set(DONGARCH_SHADERS
    src/shaders/dongarch/cutline_preview.frag
    src/shaders/dongarch/silhouette.geom
    src/shaders/dongarch/silhouette.vert
    src/shaders/dongarch/heat_method.frag
    src/shaders/dongarch/xray_depth_peeling.frag
)

# 리소스
qt5_add_resources(DONGARCH_RESOURCES
    resources/dongarch.qrc
)

# 실행 파일
add_executable(DongArch3D
    ${DONGARCH_SOURCES}
    ${DONGARCH_SHADERS}
    ${DONGARCH_RESOURCES}
)

# 링크
target_link_libraries(DongArch3D PRIVATE
    Qt5::Widgets
    Qt5::OpenGL
    OpenGL::GL
    glm::glm
    gigameshCore  # GigaMesh 코어 라이브러리
)

# C++20 컴파일 옵션
target_compile_features(DongArch3D PRIVATE cxx_std_20)
```

---

## 9. 참조 문서

- **최종 계획**: `A:\1105\.claude\DongArch3D_최종개선계획_v4_품질최우선.md`
- **115개 참조 문서**: `A:\1105\docs\references\`
- **50개 학술 논문**: `A:\1105\docs\references\algorithms\research-papers.md`
- **C++20 가이드**: `A:\1105\docs\references\cpp\cpp20-resources.md`
- **OpenGL 3.3 가이드**: `A:\1105\docs\references\opengl\opengl3.3-resources.md`

---

**문서 버전**: 4.0.0 (품질 최우선)
**최종 수정**: 2025-11-08
**다음 업데이트**: Phase 0 시작 시
