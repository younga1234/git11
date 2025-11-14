# DongArch3D 최종 개선 계획 v4.0 (품질 최우선)

**생성일**: 2025-11-08
**기반**: 115개 수집 문서 + 50개 논문 분석
**원칙**: Arch3D Liner 능가, GigaMesh 최대 활용, 최신 기술 적용
**시간 제약**: 없음 (품질 최우선)

---

## 📋 핵심 전략

### 1. GigaMesh 기존 구현 최대 활용 (70%)
| 기능 | GigaMesh 구현 | 활용 Phase |
|------|---------------|------------|
| Mesh-Plane Intersection | `mesh.cpp:4041` ✅ | Phase 2 (Cutline) |
| Plane 클래스 | `plane.cpp` ✅ | Phase 1, 2, 4 |
| PolyLine | `polyline.cpp` ✅ | Phase 2 |
| Mesh Split | `mesh.cpp:4017` ✅ | Phase 4 (Clip) |
| Geodesic Distance | `edgegeodesic.cpp` ✅ | Phase 5 (D-Tak) |
| Sobel Edge Detection | NPR Shaders ✅ | Phase 3 (Outline) |
| NPR Hatching | NPR Shaders ✅ | Phase 5 (X-Ray) |
| Octree | `octree.cpp` ✅ | Phase 2, 3 최적화 |
| gigamesh-clean | CLI ✅ | Phase 0 |
| SVG Export | `MeshWriter.cpp` ✅ | Phase 7 |

### 2. 새로 구현 (30%) - 수집 문서/논문 기반
| 기능 | 참조 문서/논문 | Phase |
|------|---------------|-------|
| Douglas-Peucker | research-papers.md (1999, 268 citations) | Phase 2 |
| Catmull-Rom Spline | research-papers.md (1974) | Phase 2 |
| Geometry Shader Silhouette | 2008 Silhouette Smoothing 논문 | Phase 3 |
| Quadric Error Metric | 2025 최신 논문! | Phase 3 |
| Self-Intersection Repair | 2025 최신 논문! | Phase 4 |
| Heat Method GPU | 2018 Parallel Heat Methods 논문 | Phase 5 |
| C++20 Ranges/Concepts | cpp20-resources.md | 전체 |

### 3. Arch3D Liner 능가 전략
| 영역 | Arch3D Liner | DongArch3D | 우위 |
|------|-------------|------------|------|
| 성능 | CPU 위주 | GPU 병렬화 (Geometry/Fragment Shader) | ⭐⭐⭐⭐⭐ |
| 품질 | 2023년 기술 | 2025년 최신 논문 적용 | ⭐⭐⭐⭐⭐ |
| 안정성 | - | Self-Intersection Repair | ⭐⭐⭐⭐ |
| 코드 | 미공개 | C++20, 현대적 | ⭐⭐⭐⭐ |
| 기능 | Arch3D Liner 전용 | GigaMesh 전체 + Arch3D Liner | ⭐⭐⭐⭐⭐ |

---

## 🎯 Phase별 상세 계획

### Phase 0: 기반 시스템 구축

#### GigaMesh 재사용 ✅
- 3D I/O (PLY, OBJ, STL, GLTF) - `MeshIO/*Reader.cpp`
- gigamesh-clean 후처리 - `cli/gigamesh-clean.cpp`
- Octree 공간 분할 - `octree.cpp`

#### 새로 구현 🆕
- **C++20 std::span 전면 도입**
  - 참조: `cpp20-resources.md`
  - 모든 메시 데이터 전달에 사용
  - 안전성 향상, 포인터+크기 대체
  ```cpp
  // Before
  void processMesh(const float* vertices, size_t count);

  // After (C++20)
  void processMesh(std::span<const float> vertices);
  ```

- **CMake FetchContent 자동화**
  - 참조: `cmake-resources.md`
  - GLM, 기타 헤더 전용 라이브러리 자동 다운로드
  ```cmake
  include(FetchContent)
  FetchContent_Declare(glm
      GIT_REPOSITORY https://github.com/g-truc/glm.git
      GIT_TAG 0.9.9.8
  )
  FetchContent_MakeAvailable(glm)
  ```

- **Designated Initializers 사용**
  - 참조: `cpp20-resources.md`
  - 설정 구조체 초기화 간소화
  ```cpp
  CutlineParameters params {
      .planeHeight = 10.0f,
      .smoothingLevel = 3,
      .useSpline = true
  };
  ```

---

### Phase 1: Align (정렬)

#### GigaMesh 재사용 ✅
- Rotation 변환 - `mesh.cpp` 기존 함수
- ViewPoint 카메라 - `meshwidget.cpp` 기존 구조

#### 새로 구현 🆕
- **C++20 Concepts로 타입 제약**
  - 참조: `cpp20-resources.md`
  - 정렬 알고리즘 템플릿에 타입 안전성 추가
  ```cpp
  template<std::ranges::range R>
  requires std::same_as<std::ranges::range_value_t<R>, Vertex>
  void alignMesh(const R& vertices);
  ```

- **constexpr 벡터 연산**
  - 참조: `cpp20-resources.md`
  - 회전 행렬 컴파일 타임 계산
  ```cpp
  constexpr Vector3 crossProduct(const Vector3& a, const Vector3& b) {
      return Vector3{
          a.y * b.z - a.z * b.y,
          a.z * b.x - a.x * b.z,
          a.x * b.y - a.y * b.x
      };
  }
  ```

---

### Phase 2: Cutline (단면 라인) - 핵심 Phase ⭐⭐⭐⭐⭐

#### GigaMesh 재사용 ✅
- **Mesh-Plane Intersection** - `mesh.cpp:4041`
  ```cpp
  bool Mesh::calcIntersectionPolylineWithPlane(
      const Vector3D& planeHNF,
      std::vector<Vector3D>* rIntersectionPoints
  );
  ```
  - Triangle-Plane intersection 완전 구현
  - 연속된 교차점 반환
  - **이미 완성된 알고리즘, 그대로 사용 ✅**

- **Plane 클래스** - `plane.cpp`
  - 3점 정의, 점+법선 정의, HNF
  - Top/Front/Right 평면 생성에 사용

- **PolyLine 클래스** - `polyline.cpp:52`
  ```cpp
  PolyLine::PolyLine(const Plane& rPlaneIntersecting);
  ```
  - 평면으로부터 자동 생성
  - **이미 완성, 그대로 사용 ✅**

- **Octree 가속** - `octree.cpp`
  - 대형 메시 (100만+ 정점) 최적화
  - Space Partitioning으로 Intersection 가속

#### 새로 구현 🆕
1. **Douglas-Peucker Line Simplification**
   - **참조 논문**: research-papers.md
     - "Douglas-Peucker Line Simplification" (1999)
     - 268 citations ⭐⭐⭐⭐⭐
     - Wikipedia: https://en.wikipedia.org/wiki/Ramer%E2%80%93Douglas%E2%80%93Peucker_algorithm
   - **구현 방법**:
     ```cpp
     std::vector<Vector2D> douglasPeucker(
         const std::vector<Vector2D>& points,
         double tolerance  // Detail Lv: 0.1mm, 0.5mm, 1mm
     ) {
         // 1. 시작점-끝점 직선 생성
         // 2. 가장 먼 점 찾기
         // 3. tolerance보다 크면 재귀 분할
         // 4. tolerance보다 작으면 직선으로 근사
     }
     ```
   - **UI**: Detail Lv 슬라이더 (0.1mm ~ 1mm)
   - **구현 가능성**: ✅ 고전 알고리즘, 구현 자료 풍부

2. **Catmull-Rom Spline Curve Fitting**
   - **참조 논문**: research-papers.md
     - Catmull-Rom Spline (1974)
     - Wikipedia: https://en.wikipedia.org/wiki/Centripetal_Catmull%E2%80%93Rom_spline
   - **구현 방법**:
     ```cpp
     std::vector<Vector2D> catmullRomSpline(
         const std::vector<Vector2D>& controlPoints,
         int segments  // Curve Lv: Low=10, Mid=20, High=40
     ) {
         // Centripetal Catmull-Rom 공식
         for (int i = 0; i < controlPoints.size() - 3; i++) {
             Vector2D p0 = controlPoints[i];
             Vector2D p1 = controlPoints[i+1];
             Vector2D p2 = controlPoints[i+2];
             Vector2D p3 = controlPoints[i+3];

             for (int j = 0; j < segments; j++) {
                 float t = j / float(segments);
                 // Catmull-Rom 보간
             }
         }
     }
     ```
   - **UI**: Curve Lv (Low/Mid/High)
   - **구현 가능성**: ✅ 표준 알고리즘

3. **C++20 Ranges로 필터링**
   - **참조**: `cpp20-resources.md`
   - 교차점 필터링, 정렬을 Ranges로 간결하게
   ```cpp
   // Silhouette Edge 필터링
   auto silhouetteEdges = mesh.edges()
       | std::views::filter([](const Edge& e) { return e.isSilhouette(); })
       | std::ranges::to<std::vector>();
   ```

4. **Fragment Shader 실시간 프리뷰**
   - **참조**: `opengl3.3-resources.md`
   - Clipping Plane을 실시간으로 시각화
   - 사용자가 평면 위치 조정 시 즉시 확인
   ```glsl
   // Fragment Shader
   void main() {
       float dist = dot(fragPos, planeNormal) - planeD;
       if (abs(dist) < 0.01) {
           fragColor = vec4(1.0, 0.0, 0.0, 1.0); // Red line
       }
   }
   ```

---

### Phase 3: Outline (외곽선) - 핵심 Phase ⭐⭐⭐⭐⭐

#### GigaMesh 재사용 ✅
- **Sobel Edge Detection** - `shaders/NPR/NPR_ApplySobel.frag`
  ```glsl
  // Image-space edge detection
  const mat3 sobelX = mat3(-1.0, 0.0, 1.0, -2.0, 0.0, 2.0, -1.0, 0.0, 1.0);
  const mat3 sobelY = mat3(-1.0, -2.0, -1.0, 0.0, 0.0, 0.0, 1.0, 2.0, 1.0);
  ```
  - **이미 완성, 후처리에 사용 ✅**

#### 새로 구현 🆕
1. **Geometry Shader Silhouette 추출**
   - **참조 논문**: research-papers.md
     - "Silhouette Smoothing and Quality Assessment" (2008)
     - GPU 기반 실시간 Silhouette
   - **OpenGL 지원 확인**: `opengl3.3-resources.md`
     - OpenGL 3.3에서 Geometry Shader 지원 ✅
   - **구현 방법**:
     ```glsl
     // Geometry Shader
     #version 330 core
     layout(triangles) in;
     layout(line_strip, max_vertices = 6) out;

     void main() {
         // 인접 삼각형의 법선 확인
         vec3 n1 = faceNormal[0];
         vec3 n2 = adjacentNormal[0];

         bool isSilhouette =
             dot(n1, viewDir) * dot(n2, viewDir) < 0.0;

         if (isSilhouette) {
             // Silhouette edge 출력
             gl_Position = gl_in[0].gl_Position;
             EmitVertex();
             gl_Position = gl_in[1].gl_Position;
             EmitVertex();
             EndPrimitive();
         }
     }
     ```
   - **성능**: CPU 대비 10-100배 빠름
   - **구현 가능성**: ✅ 논문 + OpenGL 3.3 지원

2. **Quadric-Based Silhouette Quality 보장**
   - **참조 논문**: research-papers.md
     - "Quadric-Based Mesh Simplification for Silhouette Sampling" (2025) - 최신!
     - Silhouette 간략화 시 중요한 특징 보존
   - **구현 방법**:
     - Quadric Error Metric 계산
     - Silhouette edge에 높은 가중치
     - Douglas-Peucker 시 Quadric 고려
   ```cpp
   double quadricError(const Vector3D& vertex) {
       // Q = sum of fundamental quadrics
       // error = v^T * Q * v
   }
   ```
   - **고고학 도면 품질**: Arch3D Liner보다 우수
   - **구현 가능성**: ✅ 2025년 최신 논문

3. **CPU Silhouette (view-dependent)**
   - **참조 논문**: research-papers.md (2008)
   - 6방향 Silhouette 추출 (Top, Front, Right, Left, Back, Bottom)
   - Geometry Shader와 병행 사용
   ```cpp
   bool Edge::isSilhouette(const Vector3D& viewDir) {
       // 인접 두 삼각형의 법선
       Vector3D n1 = face1->normal();
       Vector3D n2 = face2->normal();

       // 한쪽은 앞, 한쪽은 뒤
       return dot(n1, viewDir) * dot(n2, viewDir) < 0.0;
   }
   ```
   - **구현 가능성**: ✅ 표준 알고리즘

4. **Dual-pass Rendering**
   - **참조**: `opengl3.3-resources.md`
   - Pass 1: Geometry Shader Silhouette 검출
   - Pass 2: Sobel Edge Detection 후처리
   - 최고 품질 외곽선
   ```cpp
   // Pass 1: Silhouette to FBO
   renderSilhouetteToFBO();

   // Pass 2: Sobel filter
   applySobelFilter(silhouetteFBO);
   ```
   - **구현 가능성**: ✅ OpenGL 3.3 FBO 지원

---

### Phase 4: Clip (3D 절단)

#### GigaMesh 재사용 ✅
- **Mesh Split** - `mesh.cpp:4017`
  ```cpp
  splitMesh(intersectFun, distFun, getIntersectionVectorFun);
  ```
  - 평면으로 메시 분할
  - **이미 완성, 그대로 사용 ✅**

#### 새로 구현 🆕
1. **Self-Intersection Repair**
   - **참조 논문**: research-papers.md
     - "Instant Self-Intersection Repair for Mesh Cutting" (2025) - 최신!
     - Mesh 절단 시 Self-Intersection 자동 해결
   - **필요성**: 고고학 유물은 복잡한 형상, Self-Intersection 발생 가능
   - **구현 방법**:
     - Mesh Split 후 Self-Intersection 검사
     - 교차하는 삼각형 자동 분할
     - 안정적인 메시 보장
   - **Arch3D Liner 능가**: Arch3D Liner는 Self-Intersection 처리 없음
   - **구현 가능성**: ✅ 2025년 최신 논문

2. **OpenGL Clipping Plane 실시간 프리뷰**
   - **참조**: `opengl3.3-resources.md`
   - Fragment Shader에서 clipping 영역 시각화
   ```glsl
   void main() {
       float dist = gl_ClipDistance[0];
       if (dist < 0.0) discard;

       // 절단면 근처 하이라이트
       if (abs(dist) < 0.1) {
           fragColor = mix(fragColor, vec4(1,0,0,1), 0.5);
       }
   }
   ```
   - **구현 가능성**: ✅ OpenGL 3.3 지원

---

### Phase 5: Vis (시각화)

#### GigaMesh 재사용 ✅
- **Geodesic Distance** - `edgegeodesic.cpp`
  ```cpp
  EdgeGeodesic::getGeoDistA();
  EdgeGeodesic::getGeoDistB();
  ```
  - D-Tak 곡률 계산 기반
  - **CPU 버전 완성, 그대로 사용 ✅**

- **NPR Hatching Shader** - `shaders/NPR/NPR_hatches.frag`
  - X-Ray 셰이더 구조 참고
  - **기존 셰이더 재활용 ✅**

#### 새로 구현 🆕
1. **Heat Method GPU 버전**
   - **참조 논문**: research-papers.md
     - "Parallel Heat Methods for Geodesic Distance" (2018)
     - GPU 병렬화로 성능 대폭 향상
   - **OpenGL 3.3 구현**: Fragment Shader 사용 (Compute Shader 대신)
   - **구현 방법**:
     ```glsl
     // Multi-pass Heat Diffusion
     // Pass 1: Heat source initialization
     // Pass 2-N: Heat diffusion iterations
     // Final: Geodesic distance extraction
     ```
   - **성능**: GigaMesh CPU 버전보다 10-100배 빠름
   - **구현 가능성**: ✅ Fragment Shader로 구현 가능

2. **X-Ray Rendering 품질 향상**
   - **참조**: `opengl3.3-resources.md`
   - Depth Peeling for layered rendering
   ```cpp
   // Pass 1: Render front layer
   // Pass 2: Render second layer (depth > first)
   // Pass 3+: Additional layers
   // Composite with alpha blending
   ```
   - 더 사실적인 X-Ray 효과
   - **구현 가능성**: ✅ OpenGL 3.3 지원

---

### Phase 6: MFE (Mini File Explorer)

#### Qt 5.15 기반 ✅
- **참조**: `qt5.15-resources.md`
- QFileSystemModel, QTreeView
- Drag & Drop
- **구현 가능성**: ✅ Qt 표준 기능

---

### Phase 7: Adobe Illustrator 연동

#### GigaMesh 재사용 ✅
- **SVG Export** - `MeshWriter.cpp`
  - 1:1 스케일 보장
  - **이미 완성, 그대로 사용 ✅**

#### Qt 5.15 기반 ✅
- **참조**: `qt5.15-resources.md`
- QDrag, QMimeData
- **구현 가능성**: ✅ Qt 표준 기능

---

### Phase 8: 통합 테스트

#### 새로 구현 🆕
- **CMake CTest 통합**
  - **참조**: `cmake-resources.md`
  - 단위 테스트, 통합 테스트 자동화
  ```cmake
  enable_testing()
  add_test(NAME cutline_test COMMAND cutline_test)
  ```
  - **구현 가능성**: ✅ CMake 표준 기능

---

## 🏆 Arch3D Liner 능가 요약

| 기능 | Arch3D Liner | DongArch3D | 개선 |
|------|-------------|------------|------|
| **Cutline** | CPU | GigaMesh 알고리즘 + Octree 가속 | ✅ 더 빠름 |
| **Outline** | CPU | Geometry Shader + Quadric (2025) | ✅ 더 빠르고 품질 좋음 |
| **Clip** | 기본 | Self-Intersection Repair (2025) | ✅ 더 안정적 |
| **D-Tak** | CPU | Heat Method GPU (2018) | ✅ 10-100배 빠름 |
| **X-Ray** | 기본 | Depth Peeling | ✅ 더 사실적 |
| **코드** | 미공개 | C++20, 오픈소스 | ✅ 현대적 |
| **기능** | Arch3D Liner 전용 | GigaMesh 전체 + Arch3D | ✅ 더 많음 |

---

## 📚 구현 가능성 확인

### ✅ 모든 기능 구현 가능
1. **GigaMesh 활용 (70%)**: 이미 완성된 코드
2. **새로 구현 (30%)**: 모두 참조 문서/논문 있음
   - Douglas-Peucker (1999, 268 citations)
   - Catmull-Rom Spline (1974, 표준)
   - Geometry Shader Silhouette (2008)
   - Quadric Error Metric (2025 최신)
   - Self-Intersection Repair (2025 최신)
   - Heat Method GPU (2018)

### 📖 참조 자료 완비
- 115개 수집 문서
- 50개 학술 논문 (2008-2025)
- C++20, Qt 5.15, OpenGL 3.3, CMake 상세 문서

### 🎯 품질 최우선
- 시간 제약 없음
- Arch3D Liner 능가 목표
- 2025년 최신 기술 적용

---

## 다음 단계

1. Phase 0부터 순차적 구현
2. 각 Phase 완료 후 품질 검증
3. GigaMesh 코드는 최대한 재사용
4. 새 코드는 C++20 + 최신 논문 기반
5. 지속적 테스트 및 개선

**모든 기능 구현 가능! 최고 품질로 완성 가능!**
