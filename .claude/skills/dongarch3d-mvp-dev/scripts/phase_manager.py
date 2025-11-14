#!/usr/bin/env python3
"""
DongArch3D Phase Manager
========================

Phase와 Task 기반 개발 진행 상황 관리 도구

기능:
- 현재 Phase/Task 확인
- 다음 Task 추천
- Task 완료 체크
- 진행률 계산
- 자동 커밋 메시지 생성

사용법:
    python scripts/phase_manager.py status         # 현재 상태
    python scripts/phase_manager.py next           # 다음 Task
    python scripts/phase_manager.py complete 101   # Task 101 완료
    python scripts/phase_manager.py progress       # 진행률
"""

import sys
import json
import subprocess
from pathlib import Path
from datetime import datetime

# Phase 정의
PHASES = {
    "Phase 0": {
        "name": "프로젝트 리브랜딩",
        "tasks": list(range(1, 6)),  # 001-005
        "days": 1
    },
    "Phase 1": {
        "name": "UI 전면 개편",
        "tasks": list(range(101, 113)),  # 101-112
        "days": 3
    },
    "Phase 2": {
        "name": "핵심 실측 기능",
        "tasks": list(range(201, 219)),  # 201-218
        "days": 5
    },
    "Phase 3": {
        "name": "고고학 전용 도구",
        "tasks": list(range(301, 318)),  # 301-317
        "days": 7
    },
    "Phase 4": {
        "name": "데이터 관리",
        "tasks": list(range(401, 410)),  # 401-409
        "days": 3
    },
    "Phase 5": {
        "name": "출력 및 보고서",
        "tasks": list(range(501, 511)),  # 501-510
        "days": 3
    },
}


def get_project_root():
    """프로젝트 루트 찾기"""
    current = Path.cwd()
    while current != current.parent:
        if (current / ".git").exists():
            return current
        current = current.parent
    return Path.cwd()


def get_completed_tasks():
    """Git 로그에서 완료된 Task 추출"""
    try:
        project_root = get_project_root()
        commits = subprocess.check_output(
            ["git", "log", "--pretty=format:%s", "--all"],
            cwd=project_root,
            text=True
        ).strip().split('\n')

        completed = set()
        completed_phases = set()

        for commit_msg in commits:
            # Phase 완료 패턴
            if "Phase" in commit_msg and "완료" in commit_msg:
                import re
                match = re.search(r'Phase (\d+)', commit_msg)
                if match:
                    phase_num = int(match.group(1))
                    completed_phases.add(f"Phase {phase_num}")
                    # Phase 완료 시 모든 Task 완료 처리
                    phase_key = f"Phase {phase_num}"
                    if phase_key in PHASES:
                        completed.update(PHASES[phase_key]["tasks"])

            # Task 패턴
            import re
            match = re.search(r'Task (\d+)', commit_msg)
            if match:
                task_num = int(match.group(1))
                completed.add(task_num)

        return completed, completed_phases
    except Exception as e:
        print(f"Error: {e}")
        return set(), set()


def get_current_phase_task():
    """현재 Phase와 Task 확인"""
    completed_tasks, completed_phases = get_completed_tasks()

    for phase_name, phase_info in PHASES.items():
        if phase_name not in completed_phases:
            # 이 Phase의 첫 번째 미완료 Task 찾기
            for task_num in phase_info["tasks"]:
                if task_num not in completed_tasks:
                    return phase_name, task_num
            # 모든 Task가 완료되었으면 Phase 완료
            return phase_name, None

    return None, None


def show_status():
    """현재 상태 출력"""
    completed_tasks, completed_phases = get_completed_tasks()
    current_phase, current_task = get_current_phase_task()

    print("\n" + "=" * 60)
    print("📊 DongArch3D 개발 현황")
    print("=" * 60)

    if current_phase:
        phase_info = PHASES[current_phase]
        print(f"\n📌 현재 Phase: {current_phase} - {phase_info['name']}")

        if current_task:
            print(f"🎯 현재 Task: {current_task:03d}")
        else:
            print(f"✅ {current_phase} 완료!")
    else:
        print("\n🎉 모든 Phase 완료!")

    print(f"\n📈 전체 진행률:")
    total_tasks = sum(len(p["tasks"]) for p in PHASES.values())
    completed_count = len(completed_tasks)
    progress = (completed_count / total_tasks) * 100

    bar_length = 40
    filled = int(bar_length * progress / 100)
    bar = "█" * filled + "░" * (bar_length - filled)
    print(f"  {bar} {progress:.1f}%")
    print(f"  완료: {completed_count}/{total_tasks} Tasks")

    print("\n" + "=" * 60 + "\n")


def show_next():
    """다음 Task 추천"""
    current_phase, current_task = get_current_phase_task()

    if not current_phase:
        print("✅ 모든 Task 완료!")
        return

    if not current_task:
        print(f"✅ {current_phase} 완료!")
        return

    phase_info = PHASES[current_phase]
    print(f"\n🎯 다음 Task: {current_task:03d}")
    print(f"📌 Phase: {current_phase} - {phase_info['name']}")
    print(f"\n💡 개발 계획서에서 Task {current_task:03d} 내용을 확인하세요!")
    print(f"   파일: references/development_plan.md")
    print()


def complete_task(task_num):
    """Task 완료 처리"""
    task_num = int(task_num)

    # Task가 어느 Phase에 속하는지 찾기
    phase_name = None
    for pname, pinfo in PHASES.items():
        if task_num in pinfo["tasks"]:
            phase_name = pname
            break

    if not phase_name:
        print(f"❌ Task {task_num:03d}를 찾을 수 없습니다.")
        return

    # 커밋 메시지 생성
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    commit_msg = f"feat: Task {task_num:03d} 완료 ({phase_name})\n\n"
    commit_msg += f"- {phase_name}: {PHASES[phase_name]['name']}\n"
    commit_msg += f"- Task {task_num:03d} 구현 완료\n"
    commit_msg += f"- 완료 시간: {timestamp}\n\n"
    commit_msg += "🤖 Generated with [Claude Code](https://claude.com/claude-code)\n\n"
    commit_msg += "Co-Authored-By: Claude <noreply@anthropic.com>"

    print(f"\n✅ Task {task_num:03d} 완료!")
    print(f"\n📝 커밋 메시지:")
    print("=" * 60)
    print(commit_msg)
    print("=" * 60)
    print(f"\n💡 다음 명령으로 커밋하세요:")
    print(f'   git add . && git commit -m "{commit_msg.split(chr(10))[0]}"')
    print()


def show_progress():
    """상세 진행률"""
    completed_tasks, completed_phases = get_completed_tasks()

    print("\n" + "=" * 60)
    print("📊 Phase별 진행률")
    print("=" * 60)

    for phase_name, phase_info in PHASES.items():
        tasks = phase_info["tasks"]
        completed_in_phase = len([t for t in tasks if t in completed_tasks])
        total_in_phase = len(tasks)
        progress = (completed_in_phase / total_in_phase) * 100 if total_in_phase > 0 else 0

        bar_length = 20
        filled = int(bar_length * progress / 100)
        bar = "█" * filled + "░" * (bar_length - filled)

        status = "✅" if phase_name in completed_phases else "🔜" if progress > 0 else "⏸️"

        print(f"\n{status} {phase_name}: {phase_info['name']}")
        print(f"   {bar} {progress:.0f}% ({completed_in_phase}/{total_in_phase})")

    print("\n" + "=" * 60 + "\n")


def main():
    if len(sys.argv) < 2:
        print("사용법:")
        print("  python phase_manager.py status         # 현재 상태")
        print("  python phase_manager.py next           # 다음 Task")
        print("  python phase_manager.py complete 101   # Task 완료")
        print("  python phase_manager.py progress       # 진행률")
        sys.exit(1)

    command = sys.argv[1]

    if command == "status":
        show_status()
    elif command == "next":
        show_next()
    elif command == "complete":
        if len(sys.argv) < 3:
            print("Task 번호를 입력하세요. 예: python phase_manager.py complete 101")
            sys.exit(1)
        complete_task(sys.argv[2])
    elif command == "progress":
        show_progress()
    else:
        print(f"알 수 없는 명령: {command}")
        sys.exit(1)


if __name__ == "__main__":
    main()
