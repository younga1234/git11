# DongArch3D 개발 가이드라인 v4.0 (C++20 전면 도입)

**버전**: 4.0.0 (품질 최우선)
**최종 업데이트**: 2025-11-08
**기반**: C++20, 2025년 최신 논문, GPU 가속

이 문서는 DongArch3D v4.0 개발 시 준수해야 할 **C++20 코딩 규칙**, **아키텍처 패턴**, **GPU 가속 전략**을 정의합니다.

---

## 📋 목차

1. C++20 코딩 스타일 (필수)
2. 명명 규칙
3. 파일 및 폴더 구조
4. GigaMesh 활용 규칙 (70%)
5. 최신 기술 구현 규칙 (30%)
6. Qt 시그널/슬롯 패턴
7. OpenGL/GLSL 렌더링 규칙
8. 문서화 규칙
9. 테스트 규칙
10. Git 커밋 규칙 (v4)
11. 절대 금지 사항

---

## 1. C++20 코딩 스타일 (필수)

### 1.1 std::span 사용 (모든 배열 전달)

```cpp
// ✅ 필수: std::span 사용
void processMesh(std::span<const float> vertices) {
    for (const auto& v : vertices) {
        // 안전한 접근, 범위 체크
    }
}

// ❌ 금지: 포인터 + 크기
void processMesh(const float* vertices, size_t count) {
    // 위험: 범위 초과 가능
}
```

### 1.2 std::ranges 사용 (필터링/변환)

```cpp
// ✅ 필수: Ranges 사용
auto silhouetteEdges = mesh.edges()
    | std::views::filter([](const auto& e) { return e.isSilhouette(); })
    | std::views::transform([](const auto& e) { return e.to2D(); })
    | std::ranges::to<std::vector>();

// ❌ 금지: 수동 루프
std::vector<Edge2D> silhouetteEdges;
for (const auto& e : mesh.edges()) {
    if (e.isSilhouette()) {
        silhouetteEdges.push_back(e.to2D());
    }
}
```

### 1.3 Concepts 사용 (템플릿 제약)

```cpp
// ✅ 필수: Concepts로 타입 제약
template<std::ranges::range R>
requires std::same_as<std::ranges::range_value_t<R>, Vertex>
void alignMesh(const R& vertices) {
    // 컴파일 타임에 타입 체크
}

// ❌ 금지: 무제약 템플릿
template<typename T>
void alignMesh(const T& vertices) {
    // 런타임 에러 위험
}
```

### 1.4 Designated Initializers 사용

```cpp
// ✅ 필수: Designated Initializers
CutlineParams params {
    .planeHeight = 10.0f,
    .smoothingLevel = 3,
    .useSpline = true
};

// ❌ 금지: 순서 의존 초기화
CutlineParams params(10.0f, 3, true);  // 순서 헷갈림
```

### 1.5 constexpr 확장 사용

```cpp
// ✅ 필수: constexpr 함수
constexpr Vector3 crossProduct(const Vector3& a, const Vector3& b) {
    return Vector3 {
        a.y * b.z - a.z * b.y,
        a.z * b.x - a.x * b.z,
        a.x * b.y - a.y * b.x
    };
}

// 컴파일 타임 계산
constexpr auto result = crossProduct({1, 0, 0}, {0, 1, 0});
```

---

## 2. 명명 규칙 (v4)

### 2.1 클래스명 (PascalCase + 명확한 역할)

```cpp
// Phase 2: Cutline
class DongArchCutlineManager;       // 메인 관리자
class DouglasPeuckerSimplifier;     // 1999 논문 알고리즘
class CatmullRomSplineGenerator;    // 1974 알고리즘

// Phase 3: Outline
class DongArchOutlineExtractor;     // 메인 추출기
class GeometryShaderSilhouette;     // 2008 논문 GPU 버전
class QuadricErrorOptimizer;        // 2025 최신 논문!

// Phase 4: Clip
class DongArchClipManager;          // 메인 관리자
class SelfIntersectionRepairer;     // 2025 최신 논문!

// Phase 5: Vis
class HeatMethodGPURenderer;        // 2018 논문 GPU 버전
class XRayDepthPeelingRenderer;     // Depth Peeling
```

### 2.2 함수명 (camelCase + 동사)

```cpp
// C++20 std::span 사용
std::vector<Vector2D> extractCutline(std::span<const Vertex> vertices);
std::vector<Edge> computeSilhouette(std::span<const Triangle> triangles);
Mesh repairSelfIntersection(std::span<const Triangle> faces);

// Ranges 반환
auto filterValidEdges(std::span<const Edge> edges) {
    return edges
        | std::views::filter([](auto& e) { return e.isValid(); })
        | std::ranges::to<std::vector>();
}
```

---

## 3. 파일 및 폴더 구조 (v4)

```
GigaMesh/gui/src/dongarch/          # DongArch3D v4 전용 폴더
├── common/
│   ├── DongArchTypes.h             # C++20 타입, Concepts 정의
│   ├── DongArchMath.h/cpp          # constexpr 수학 함수
│   └── DongArchRanges.h            # Ranges 유틸리티
│
├── cutline/                        # Phase 2
│   ├── DongArchCutlineManager.h/cpp
│   ├── algorithms/
│   │   ├── DouglasPeucker.h/cpp            # 1999 논문
│   │   ├── CatmullRomSpline.h/cpp          # 1974
│   │   └── CutlineOptimizer.h/cpp          # Ranges 활용
│   └── shaders/
│       └── cutline_preview.frag            # Fragment Shader
│
├── outline/                        # Phase 3
│   ├── DongArchOutlineExtractor.h/cpp
│   ├── algorithms/
│   │   ├── GeometrySilhouette.h/cpp        # 2008 논문
│   │   └── QuadricOptimizer.h/cpp          # 2025 최신!
│   └── shaders/
│       ├── silhouette.geom                 # Geometry Shader
│       ├── silhouette.vert
│       └── silhouette.frag
│
├── clip/                           # Phase 4
│   ├── DongArchClipManager.h/cpp
│   ├── algorithms/
│   │   └── SelfIntersectionRepairer.h/cpp  # 2025 최신!
│   └── shaders/
│       └── clip_preview.frag
│
└── vis/                            # Phase 5
    ├── HeatMethodGPURenderer.h/cpp         # 2018 논문
    ├── XRayRenderer.h/cpp
    └── shaders/
        ├── heat_method.frag                # GPU 가속
        └── xray_depth_peeling.frag
```

---

## 4. GigaMesh 활용 규칙 (70%)

### 4.1 읽기 전용 사용

```cpp
// ✅ GigaMesh 함수 호출 (읽기 전용)
#include "core/mesh/mesh.h"

std::vector<Vector3D> DongArchCutlineManager::extractFromPlane(const Plane& plane) {
    std::vector<Vector3D> result;

    // GigaMesh 함수 호출 ✅
    mMesh->calcIntersectionPolylineWithPlane(
        plane.getHNF(),
        &result
    );

    // C++20 Ranges로 후처리
    auto filtered = result
        | std::views::filter([](auto& p) { return p.isValid(); })
        | std::ranges::to<std::vector>();

    return filtered;
}
```

### 4.2 절대 수정 금지

```cpp
// ❌ 절대 금지: GigaMesh 소스 수정
// GigaMesh/core/mesh/mesh.cpp 파일을 직접 수정하지 말 것!

// ✅ 허용: Wrapper 클래스 작성
class GigaMeshWrapper {
    Mesh* mMesh;  // GigaMesh 객체

public:
    // 새 기능 추가는 Wrapper에서
    std::vector<Vector3D> extractWithOctree(const Plane& plane);
};
```

---

## 5. 최신 기술 구현 규칙 (30%)

### 5.1 2025년 논문 구현 시 주석 필수

```cpp
/**
 * @brief Repair self-intersections after mesh splitting
 * @param triangles Mesh triangles
 * @return Repaired mesh
 *
 * Reference: "Instant Self-Intersection Repair for Mesh Cutting" (2025)
 * Paper: research-papers.md
 * - Detects self-intersecting triangles
 * - Automatically splits intersecting faces
 * - Ensures topological correctness
 */
Mesh SelfIntersectionRepairer::repair(std::span<const Triangle> triangles) {
    // 구현...
}
```

### 5.2 GPU 셰이더 주석

```glsl
// gui/src/shaders/dongarch/silhouette.geom
#version 330 core

// Reference: "Silhouette Smoothing and Quality Assessment" (2008)
// GPU-accelerated silhouette extraction using Geometry Shader
// Performance: 10-100x faster than CPU version

layout(triangles_adjacency) in;
layout(line_strip, max_vertices = 6) out;

// ... 구현
```

---

## 6. Qt 시그널/슬롯 패턴 (v4)

```cpp
class DongArchCutlineManager : public QObject {
    Q_OBJECT

signals:
    // C++20 타입 사용
    void cutlineExtracted(std::span<const Vector2D> points);
    void progressChanged(int percentage);
    void errorOccurred(const QString& message);

public slots:
    // std::span 사용
    void extractCutline(std::span<const Vertex> vertices);
    void simplifyLine(float tolerance);
};
```

---

## 7. OpenGL/GLSL 렌더링 규칙 (v4)

### 7.1 Geometry Shader 사용 (Phase 3)

```cpp
// Geometry Shader 로드
ShaderProgram silhouetteShader;
silhouetteShader.addShaderFromFile(QOpenGLShader::Vertex,
    ":/shaders/dongarch/silhouette.vert");
silhouetteShader.addShaderFromFile(QOpenGLShader::Geometry,
    ":/shaders/dongarch/silhouette.geom");  // GPU 가속!
silhouetteShader.addShaderFromFile(QOpenGLShader::Fragment,
    ":/shaders/dongarch/silhouette.frag");
silhouetteShader.link();
```

### 7.2 Fragment Shader Multi-pass (Phase 5)

```cpp
// Heat Method GPU: Multi-pass rendering
void HeatMethodGPURenderer::render() {
    // Pass 1: Heat source initialization
    fbo1.bind();
    initHeatSource();

    // Pass 2-N: Heat diffusion iterations
    for (int i = 0; i < iterations; i++) {
        fbo2.bind();
        diffuseHeat(fbo1.texture());
        std::swap(fbo1, fbo2);
    }

    // Final: Geodesic distance extraction
    extractGeodesicDistance(fbo1.texture());
}
```

---

## 8. 문서화 규칙 (v4)

### 8.1 Doxygen 주석 (필수)

```cpp
/**
 * @brief Extract silhouette using Quadric Error Metric (2025)
 * @param edges Input silhouette edges
 * @param threshold Quadric error threshold
 * @return Optimized edges with important features preserved
 *
 * @note Uses 2025 latest paper: "Quadric-Based Mesh Simplification for Silhouette Sampling"
 * @see docs/references/algorithms/research-papers.md
 *
 * @performance 10-100x faster than CPU Douglas-Peucker
 * @quality Better preservation of high-curvature features
 *
 * @since DongArch3D v4.0
 */
std::vector<Edge> QuadricErrorOptimizer::optimize(
    std::span<const Edge> edges,
    float threshold
);
```

---

## 9. 테스트 규칙 (v4)

### 9.1 C++20 테스트 코드

```cpp
// tests/cutline_test.cpp
#include <gtest/gtest.h>
#include <ranges>

TEST(DouglasPeuckerTest, SimplifiesPolyline) {
    // C++20 Ranges로 테스트 데이터 생성
    auto points = std::views::iota(0, 100)
        | std::views::transform([](int i) {
            return Vector2D(i, std::sin(i * 0.1));
          })
        | std::ranges::to<std::vector>();

    // std::span으로 전달
    DouglasPeucker simplifier;
    auto result = simplifier.simplify(points, 0.5f);

    EXPECT_LT(result.size(), points.size());
}
```

---

## 10. Git 커밋 규칙 (v4)

```
Phase X.Y: [한글 요약] (v4)

- [구체적 변경사항 1]
- [구체적 변경사항 2]
- C++20 기능: [std::span / Ranges / Concepts]
- 참조 논문: [논문명 (연도)]
- 빌드 성공: DongArch3D.exe

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>
```

**예시**:
```
Phase 3.2: Geometry Shader Silhouette 구현 (v4)

- Geometry Shader 기반 GPU 실루엣 추출 구현
- 인접 삼각형 법선 비교로 실루엣 판정
- OpenGL 3.3 Geometry Shader 사용
- C++20 기능: std::span, Ranges
- 참조 논문: Silhouette Smoothing (2008)
- 성능: CPU 대비 10-100배 향상
- 빌드 성공: DongArch3D.exe (5.8MB)

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>
```

---

## 11. 절대 금지 사항 (v4)

### ❌ 금지 1: GigaMesh 코어 수정
```
❌ GigaMesh/core/mesh/        # 절대 수정 금지
❌ GigaMesh/external/         # 절대 수정 금지
```

### ❌ 금지 2: C++17 이하 사용
```cpp
❌ void func(const float* data, size_t size);  // 포인터+크기
✅ void func(std::span<const float> data);    // std::span

❌ for (int i = 0; i < vec.size(); i++)      // 인덱스 루프
✅ for (const auto& item : vec)              // 범위 기반 for

❌ template<typename T>                       // 무제약 템플릿
✅ template<std::ranges::range R>            // Concepts 제약
```

### ❌ 금지 3: CPU만 사용
```cpp
❌ // CPU로만 Silhouette 계산
for (const auto& edge : edges) {
    if (isSilhouette(edge)) {
        result.push_back(edge);
    }
}

✅ // Geometry Shader GPU 가속
renderSilhouetteWithGeometryShader();
```

### ❌ 금지 4: 시간 우선순위
```
❌ "빨리 끝내기 위해 품질 타협"
✅ "시간 제약 없음, 품질 최우선"
✅ "Arch3D Liner 능가가 목표"
```

### ❌ 금지 5: 빌드 없이 커밋
```bash
❌ git add . && git commit -m "코드 수정"  # 빌드 안 함
✅ cmake --build . && git add . && git commit  # 빌드 확인
```

---

## 📊 v4 코딩 규칙 체크리스트

### Phase 시작 전
- [ ] C++20 기능 숙지 (std::span, Ranges, Concepts)
- [ ] 참조 논문 읽기 (research-papers.md)
- [ ] GigaMesh 활용 가능 함수 확인
- [ ] GPU 셰이더 필요 여부 확인

### 코드 작성 중
- [ ] std::span 사용 (모든 배열 전달)
- [ ] Ranges 사용 (필터링/변환)
- [ ] Concepts 사용 (템플릿 제약)
- [ ] Designated Initializers 사용
- [ ] constexpr 사용 (컴파일 타임 연산)
- [ ] Doxygen 주석 작성
- [ ] 논문 참조 주석 추가

### 빌드 전
- [ ] C++20 컴파일 확인 (`-std=c++20`)
- [ ] 경고 없음 확인 (`-Wall -Wextra`)
- [ ] Clang-tidy 검사
- [ ] 테스트 실행

### Git 커밋 전
- [ ] 빌드 성공 확인
- [ ] v4 커밋 메시지 형식
- [ ] C++20 기능 명시
- [ ] 참조 논문 명시

---

**문서 버전**: 4.0.0 (C++20 전면 도입)
**최종 수정**: 2025-11-08
**기반**: 115개 문서 + 50개 논문 + C++20

**⚡ 핵심**: 품질 최우선, C++20 필수, GPU 가속, Arch3D Liner 능가!
