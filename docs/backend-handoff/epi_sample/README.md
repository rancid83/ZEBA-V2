# EPI 배점 계산 로직

EPI(에너지성능지표) 표준모델 배점 데이터를 기반으로 건물 유형별 점수를 계산하는 TypeScript/React 모듈입니다.

## 파일 구조

```
src/
├── types/
│   └── epi.types.ts          # 전체 타입 정의
├── data/
│   └── epiData.ts            # 엑셀 원본 데이터 (JSON 변환)
├── engine/
│   ├── epiEngine.ts          # 핵심 계산 로직 (순수 함수)
│   └── epiEngine.test.ts     # 단위 테스트
├── hooks/
│   └── useEpiCalculator.ts   # React 상태 관리 훅
├── components/
│   └── EpiCalculator.tsx     # UI 컴포넌트 예시
└── index.ts                  # barrel export
```

---

## 계산 로직 요약

### 1. 건물 분류

| 조건 | 분류 |
|------|------|
| 연면적 ≥ 3,000㎡ | 대형 (large) |
| 연면적 < 3,000㎡ | 소형 (small) |

냉난방 방식: `central` (중앙식) / `individual` (개별식)

### 2. 항목별 점수 계산

| scoreType | 입력 | 공식 |
|-----------|------|------|
| `graded`  | 배점비율 b (1 / 0.9 / 0.8 / 0.7 / 0.6) | 취득점수 = 기본배점(a) × b |
| `boolean` | 적용 여부 (true/false) | 적용 → 기본배점(a), 미적용 → 0 |

### 3. 표준모델 기준점수

| 유형 | 기준점수 |
|------|---------|
| 대형 중앙식 | 65.4점 |
| 대형 개별식 | 65.8점 |
| 소형 중앙식 | 71.6점 |
| 소형 개별식 | 71.0점 |

---

## 사용법

### React 훅 사용 (권장)

```tsx
import { useEpiCalculator } from './src/hooks/useEpiCalculator';

function MyPage() {
  const {
    buildingInfo,
    setBuildingInfo,
    inputs,
    setItemInput,
    result,
    benchmarkScore,
    achievementRate,
    applyStandardDefaults,
    reset,
  } = useEpiCalculator();

  return (
    <div>
      {/* 면적 입력 */}
      <input
        type="number"
        value={buildingInfo.area}
        onChange={(e) => setBuildingInfo({ area: Number(e.target.value) })}
      />

      {/* 항목 입력 예시: 건축부문 1번 항목 배점비율 설정 */}
      <select
        onChange={(e) =>
          setItemInput('architecture', 1, Number(e.target.value) as 0.8)
        }
      >
        <option value={1}>1.0</option>
        <option value={0.9}>0.9</option>
        <option value={0.8}>0.8</option>
      </select>

      {/* 결과 표시 */}
      <p>취득점수: {result.totalEarned}</p>
      <p>기준점수: {benchmarkScore}</p>
      <p>달성률: {achievementRate}%</p>
    </div>
  );
}
```

### 순수 함수 사용 (서버사이드 / Node.js)

```ts
import { calculateEpi, buildStandardInputs, classifyBuildingSize } from './src/engine/epiEngine';

const buildingInfo = {
  area: 5000,
  buildingUse: 'nonResidential',
  hvacType: 'central',
};

// 표준모델 기본값으로 계산
const sizeType = classifyBuildingSize(buildingInfo.area); // 'large'
const inputs = buildStandardInputs(sizeType, buildingInfo.hvacType);
const result = calculateEpi(buildingInfo, inputs);

console.log(result.totalEarned);   // ≈ 65.4
console.log(result.totalStandard); // 표준모델 합계
```

### Node.js API 예시

```ts
// routes/epi.ts (Express / Fastify)
import { calculateEpi, classifyBuildingSize } from '../epi/engine/epiEngine';

app.post('/api/epi/calculate', (req, res) => {
  const { buildingInfo, inputs } = req.body;
  const result = calculateEpi(buildingInfo, inputs);
  res.json(result);
});
```

---

## 테스트 실행

```bash
# Vitest
npx vitest run src/engine/epiEngine.test.ts

# Jest
npx jest src/engine/epiEngine.test.ts
```

---

## 주의사항

- `buildingUse: 'nonResidential'`일 때 면적 기준(대형/소형)으로 기본배점이 결정됩니다.
- `baseScore`가 `null`인 항목은 해당 건물 유형에 적용되지 않는 항목입니다 (예: 공동주택 전용 항목).
- `standardScore`가 `null`인 항목은 표준모델에서 점수가 할당되지 않은 항목으로, 사용자가 직접 입력해야 합니다.
- 신재생 부문은 표준모델 점수가 없으므로 모든 항목을 직접 입력받아야 합니다.
