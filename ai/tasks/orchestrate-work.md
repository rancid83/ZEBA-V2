# Task: 서브에이전트 기반 작업 요청

## 사용 방법
```md
Agent: codex-orchestrator
Skill: subagent-orchestration, codex-workflow

다음 작업을 에이전트 분업으로 처리해줘:

[목표]
(예: project-hub 협업 패널 UX 개선)

[범위]
- 수정 대상:
- 가능하면 건드리지 말 것:

[세부 요청]
- Explorer가 먼저 확인할 것:
- Worker가 구현할 것:
- Verifier가 검토할 것:
```

## 체크리스트
- [ ] 목표가 한 줄로 명확한가
- [ ] 수정 가능 파일 범위를 적었는가
- [ ] 병렬 가능한 작업인지 구분했는가
- [ ] 검증 기준을 적었는가
