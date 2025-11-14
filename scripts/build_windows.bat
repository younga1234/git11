@echo off
REM ========================================
REM DongArch3D Windows 빌드 스크립트
REM 버전: 4.0.0
REM ========================================

echo.
echo ================================================
echo DongArch3D v4.0 Windows Build Script
echo ================================================
echo.

REM 현재 디렉토리 저장
set SCRIPT_DIR=%~dp0
set PROJECT_ROOT=%SCRIPT_DIR%..
cd /d %PROJECT_ROOT%

REM ========================================
REM 1. 빌드 디렉토리 설정
REM ========================================
echo [1/6] 빌드 디렉토리 준비 중...
set BUILD_DIR=GigaMesh\build_windows
if not exist %BUILD_DIR% (
    mkdir %BUILD_DIR%
    echo     - 빌드 디렉토리 생성: %BUILD_DIR%
) else (
    echo     - 기존 빌드 디렉토리 사용: %BUILD_DIR%
)

cd %BUILD_DIR%
echo.

REM ========================================
REM 2. CMake 설정 (Visual Studio 2019/2022)
REM ========================================
echo [2/6] CMake 설정 중...
echo     - Generator: Visual Studio 17 2022 (or 16 2019)
echo     - Platform: x64
echo     - C++ Standard: C++20
echo     - Build Type: Release
echo.

REM Visual Studio 2022 우선, 없으면 2019
cmake .. -G "Visual Studio 17 2022" -A x64 -DCMAKE_CXX_STANDARD=20
if errorlevel 1 (
    echo     - Visual Studio 2022 not found, trying 2019...
    cmake .. -G "Visual Studio 16 2019" -A x64 -DCMAKE_CXX_STANDARD=20
    if errorlevel 1 (
        echo.
        echo ❌ ERROR: CMake 설정 실패!
        echo.
        echo 다음 사항을 확인하세요:
        echo   1. Visual Studio 2019 또는 2022 설치 여부
        echo   2. Qt 5.15.2 설치 여부 (환경변수 설정)
        echo   3. CMake 3.10+ 설치 여부
        echo.
        pause
        exit /b 1
    )
)
echo     ✅ CMake 설정 완료
echo.

REM ========================================
REM 3. Release 빌드
REM ========================================
echo [3/6] Release 빌드 시작...
echo     - Target: DongArch3D (GUI)
echo     - Configuration: Release
echo.

cmake --build . --config Release --target DongArch3D
if errorlevel 1 (
    echo.
    echo ❌ ERROR: 빌드 실패!
    echo.
    echo 빌드 로그를 확인하세요:
    echo   %BUILD_DIR%\CMakeFiles\CMakeError.log
    echo.
    pause
    exit /b 1
)
echo     ✅ Release 빌드 완료
echo.

REM ========================================
REM 4. 테스트 빌드 (Optional)
REM ========================================
echo [4/6] 테스트 빌드 (Optional, 10초 대기, Ctrl+C로 건너뛰기)...
timeout /t 10

cmake --build . --config Release --target test_dongarch
if errorlevel 1 (
    echo     ⚠️ 테스트 빌드 스킵 (에러 또는 사용자 취소)
) else (
    echo     ✅ 테스트 빌드 완료
)
echo.

REM ========================================
REM 5. 실행 파일 확인
REM ========================================
echo [5/6] 빌드 결과 확인...
if exist "gui\Release\DongArch3D.exe" (
    echo     ✅ DongArch3D.exe 생성 완료!
    echo     📍 위치: %BUILD_DIR%\gui\Release\DongArch3D.exe

    REM 파일 크기 확인
    for %%F in ("gui\Release\DongArch3D.exe") do (
        echo     📦 크기: %%~zF bytes
    )
) else (
    echo     ❌ DongArch3D.exe not found!
    pause
    exit /b 1
)
echo.

REM ========================================
REM 6. 완료 및 실행 옵션
REM ========================================
echo [6/6] 빌드 완료!
echo.
echo ================================================
echo 빌드 성공!
echo ================================================
echo.
echo 다음 옵션을 선택하세요:
echo   1. DongArch3D 실행
echo   2. 빌드 폴더 열기
echo   3. 종료
echo.

choice /c 123 /n /m "선택 (1/2/3): "

if errorlevel 3 goto :END
if errorlevel 2 goto :OPEN_FOLDER
if errorlevel 1 goto :RUN_APP

:RUN_APP
echo.
echo DongArch3D 실행 중...
start "" "gui\Release\DongArch3D.exe"
goto :END

:OPEN_FOLDER
echo.
echo 빌드 폴더 열기...
explorer "gui\Release"
goto :END

:END
echo.
echo 스크립트 종료.
cd /d %PROJECT_ROOT%
pause
exit /b 0
