/**
 * EpiCalculator.tsx
 * 
 * EPI 배점 계산기 전체 UI 컴포넌트 예시
 * 프로젝트에 맞게 스타일/구조를 수정해서 사용하세요.
 */

import React, { useState } from 'react';
import { GRADED_RATIOS, SECTION_LABELS } from '../data/epiData';
import { useEpiCalculator } from '../hooks/useEpiCalculator';
import type { SectionKey } from '../types/epi.types';

// ─────────────────────────────────────────────
// 서브 컴포넌트: 건물 정보 입력
// ─────────────────────────────────────────────

interface BuildingInfoFormProps {
  buildingInfo: ReturnType<typeof useEpiCalculator>['buildingInfo'];
  onChange: ReturnType<typeof useEpiCalculator>['setBuildingInfo'];
}

export function BuildingInfoForm({ buildingInfo, onChange }: BuildingInfoFormProps) {
  return (
    <div className="building-info-form">
      <h2>건물 기본 정보</h2>

      <div className="form-group">
        <label htmlFor="area">연면적 (㎡)</label>
        <input
          id="area"
          type="number"
          min={500}
          value={buildingInfo.area}
          onChange={(e) => onChange({ area: Number(e.target.value) })}
        />
        <span className="hint">
          {buildingInfo.area >= 3000
            ? '대형 (3,000㎡ 이상)'
            : '소형 (500~3,000㎡)'}
        </span>
      </div>

      <div className="form-group">
        <label>건물 용도</label>
        <select
          value={buildingInfo.buildingUse}
          onChange={(e) =>
            onChange({ buildingUse: e.target.value as typeof buildingInfo.buildingUse })
          }
        >
          <option value="nonResidential">비주거 (업무·상업 등)</option>
          <option value="house1">공동주택 1</option>
          <option value="house2">공동주택 2</option>
        </select>
      </div>

      <div className="form-group">
        <label>냉난방 방식</label>
        <select
          value={buildingInfo.hvacType}
          onChange={(e) =>
            onChange({ hvacType: e.target.value as typeof buildingInfo.hvacType })
          }
        >
          <option value="central">중앙식</option>
          <option value="individual">개별식</option>
        </select>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// 서브 컴포넌트: 부문별 체크리스트
// ─────────────────────────────────────────────

interface SectionChecklistProps {
  sectionResult: ReturnType<typeof useEpiCalculator>['result']['sections'][number];
  onItemChange: ReturnType<typeof useEpiCalculator>['setItemInput'];
  inputs: ReturnType<typeof useEpiCalculator>['inputs'];
}

export function SectionChecklist({
  sectionResult,
  onItemChange,
  inputs,
}: SectionChecklistProps) {
  const [collapsed, setCollapsed] = useState(false);
  const sectionKey = sectionResult.section;
  const sectionInputs = inputs[sectionKey];

  return (
    <div className="section-checklist">
      <div
        className="section-header"
        onClick={() => setCollapsed((c) => !c)}
        style={{ cursor: 'pointer' }}
      >
        <h3>{sectionResult.sectionLabel}</h3>
        <div className="section-summary">
          <span>취득: {sectionResult.totalEarned.toFixed(1)}점</span>
          {sectionResult.totalStandard !== null && (
            <span> / 표준: {sectionResult.totalStandard.toFixed(1)}점</span>
          )}
          <span className="toggle-icon">{collapsed ? '▶' : '▼'}</span>
        </div>
      </div>

      {!collapsed && (
        <table className="checklist-table">
          <thead>
            <tr>
              <th>No</th>
              <th>항목</th>
              <th>기본배점(a)</th>
              <th>입력</th>
              <th>취득점수</th>
              <th>표준모델</th>
            </tr>
          </thead>
          <tbody>
            {sectionResult.items.map((item) => {
              const input = sectionInputs?.[item.no];
              const value = input?.value ?? null;

              return (
                <tr
                  key={item.no}
                  className={!item.isApplicable ? 'not-applicable' : ''}
                >
                  <td>{item.no}</td>
                  <td>{item.name}</td>
                  <td>{item.isApplicable ? item.baseScore : '-'}</td>
                  <td>
                    {!item.isApplicable ? (
                      <span className="na">해당없음</span>
                    ) : item.scoreType === 'graded' ? (
                      /* graded: 배점비율(b) 선택 */
                      <select
                        value={value !== null ? String(value) : ''}
                        onChange={(e) => {
                          const v = e.target.value;
                          onItemChange(
                            sectionKey as SectionKey,
                            item.no,
                            v === '' ? null : (Number(v) as typeof GRADED_RATIOS[number]),
                          );
                        }}
                      >
                        <option value="">선택</option>
                        {GRADED_RATIOS.map((r) => (
                          <option key={r} value={r}>
                            {r} ({(r * 100).toFixed(0)}%)
                          </option>
                        ))}
                      </select>
                    ) : (
                      /* boolean: 적용 여부 */
                      <label className="toggle-label">
                        <input
                          type="checkbox"
                          checked={value === true}
                          onChange={(e) =>
                            onItemChange(
                              sectionKey as SectionKey,
                              item.no,
                              e.target.checked,
                            )
                          }
                        />
                        {value === true ? '적용' : '미적용'}
                      </label>
                    )}
                  </td>
                  <td className="score-cell">
                    {item.isApplicable ? item.earnedScore.toFixed(1) : '-'}
                  </td>
                  <td className="std-score">
                    {item.standardScore !== null
                      ? item.standardScore.toFixed(1)
                      : '-'}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={2}>소계</td>
              <td>{sectionResult.totalBase.toFixed(1)}</td>
              <td />
              <td>{sectionResult.totalEarned.toFixed(1)}</td>
              <td>
                {sectionResult.totalStandard !== null
                  ? sectionResult.totalStandard.toFixed(1)
                  : '-'}
              </td>
            </tr>
          </tfoot>
        </table>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// 서브 컴포넌트: 최종 결과 요약
// ─────────────────────────────────────────────

interface ResultSummaryProps {
  result: ReturnType<typeof useEpiCalculator>['result'];
  benchmarkScore: number;
  achievementRate: number;
}

export function ResultSummary({
  result,
  benchmarkScore,
  achievementRate,
}: ResultSummaryProps) {
  const { buildingInfo, sizeType, totalEarned, totalStandard } = result;

  return (
    <div className="result-summary">
      <h2>EPI 점수 결과</h2>

      <div className="summary-grid">
        <div className="summary-card">
          <span className="label">건물 규모</span>
          <span className="value">
            {sizeType === 'large' ? '대형' : '소형'}
            &nbsp;({buildingInfo.hvacType === 'central' ? '중앙식' : '개별식'})
          </span>
        </div>

        <div className="summary-card highlight">
          <span className="label">취득 점수</span>
          <span className="value large">{totalEarned.toFixed(1)}점</span>
        </div>

        <div className="summary-card">
          <span className="label">표준모델 기준점수</span>
          <span className="value">{benchmarkScore}점</span>
        </div>

        <div className="summary-card">
          <span className="label">표준모델 달성률</span>
          <span
            className="value"
            style={{ color: achievementRate >= 100 ? '#16a34a' : '#dc2626' }}
          >
            {achievementRate.toFixed(1)}%
          </span>
        </div>

        {totalStandard !== null && (
          <div className="summary-card">
            <span className="label">표준모델 계산 합계</span>
            <span className="value">{totalStandard.toFixed(1)}점</span>
          </div>
        )}
      </div>

      {/* 부문별 점수 바 차트 */}
      <div className="section-bars">
        {result.sections.map((s) => (
          <div key={s.section} className="section-bar-row">
            <span className="section-label">{s.sectionLabel}</span>
            <div className="bar-track">
              <div
                className="bar-fill"
                style={{
                  width:
                    s.totalBase > 0
                      ? `${Math.min((s.totalEarned / s.totalBase) * 100, 100)}%`
                      : '0%',
                }}
              />
            </div>
            <span className="bar-score">
              {s.totalEarned.toFixed(1)} / {s.totalBase}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// 메인 컴포넌트
// ─────────────────────────────────────────────

export function EpiCalculator() {
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
    <div className="epi-calculator">
      <header className="epi-header">
        <h1>EPI 에너지성능지표 배점 계산기</h1>
        <div className="header-actions">
          <button onClick={applyStandardDefaults}>표준모델 기본값 적용</button>
          <button onClick={reset} className="secondary">초기화</button>
        </div>
      </header>

      <div className="epi-body">
        {/* 좌측: 입력 영역 */}
        <div className="epi-inputs">
          <BuildingInfoForm
            buildingInfo={buildingInfo}
            onChange={setBuildingInfo}
          />

          {result.sections.map((sectionResult) => (
            <SectionChecklist
              key={sectionResult.section}
              sectionResult={sectionResult}
              onItemChange={setItemInput}
              inputs={inputs}
            />
          ))}
        </div>

        {/* 우측: 결과 영역 */}
        <div className="epi-result">
          <ResultSummary
            result={result}
            benchmarkScore={benchmarkScore}
            achievementRate={achievementRate}
          />
        </div>
      </div>
    </div>
  );
}
