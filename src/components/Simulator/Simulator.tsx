'use client';

import { useState } from 'react';

// ─── DATA TABLES ───
const ENERGY_USAGE: Record<string, number> = {
  '업무시설(상업용)': 374.47,
  '업무시설(공공용)': 371.66,
  '교육연구시설': 231.33,
};

const REGION_COEF: Record<string, number> = {
  '서울': 1, '인천': 0.97, '경기': 0.99, '강원 영서': 1, '강원 영동': 0.97,
  '대전': 1, '충북': 1, '전북': 1.04, '충남·세종': 0.99, '광주': 1.01,
  '대구': 1.04, '부산': 0.93, '경남': 1, '울산': 0.93, '경북': 0.98,
  '전남': 0.99, '제주': 0.97,
};

const ZEB_THRESHOLD: Record<number, number> = { 1: 100, 2: 80, 3: 60, 4: 40, 5: 20 };

const EPI_ITEMS = {
  건축: [
    { name: '외벽의 평균 열관류율', score: [21, 34] as [number, number], type: '등급' },
    { name: '지붕의 평균 열관류율', score: [7, 8] as [number, number], type: '등급' },
    { name: '바닥의 평균 열관류율', score: [5, 6] as [number, number], type: '등급' },
    { name: '외피 열교부위 단열 성능', score: [4, 6] as [number, number], type: '등급' },
    { name: '기밀성 등급', score: [5, 6] as [number, number], type: '등급' },
    { name: '기밀성능 강화 조치', score: [1, 2] as [number, number], type: '적용여부' },
    { name: '태양열 취득률', score: [7, 5] as [number, number], type: '등급' },
  ],
  기계_중앙: [
    { name: '난방 설비', score: [7, 6] as [number, number], type: '등급' },
    { name: '냉방 설비', score: [6, 2] as [number, number], type: '등급' },
    { name: '공조기 송풍기 효율', score: [3, 1] as [number, number], type: '등급' },
    { name: '펌프 효율', score: [2, 2] as [number, number], type: '등급' },
    { name: '이코노마이저 적용', score: [3, 1] as [number, number], type: '적용여부' },
    { name: '열교환기 효율', score: [3, 3] as [number, number], type: '등급' },
    { name: '덕트 및 배관 단열', score: [2, 1] as [number, number], type: '적용여부' },
    { name: '열원설비 운전 제어', score: [2, 1] as [number, number], type: '적용여부' },
    { name: '공조기 팬 운전 제어', score: [2, 1] as [number, number], type: '적용여부' },
    { name: '전기 외 에너지 냉방', score: [2, 1] as [number, number], type: '등급' },
    { name: '급탕용 보일러 효율', score: [2, 2] as [number, number], type: '등급' },
    { name: '냉방 순환 펌프 효율', score: [2, 1] as [number, number], type: '적용여부' },
    { name: '급수 펌프 운전 제어', score: [1, 1] as [number, number], type: '적용여부' },
    { name: '지하주차장 환기', score: [1, 1] as [number, number], type: '적용여부' },
    { name: 'T.A.B 또는 커미셔닝', score: [1, 1] as [number, number], type: '등급' },
    { name: '지역 난방', score: [10, 8] as [number, number], type: '적용여부' },
  ],
  기계_개별: [
    { name: '난방 설비', score: [7, 6] as [number, number], type: '등급' },
    { name: '냉방 설비', score: [6, 2] as [number, number], type: '등급' },
    { name: '열교환기 효율', score: [3, 3] as [number, number], type: '등급' },
    { name: '덕트 및 배관 단열', score: [2, 1] as [number, number], type: '적용여부' },
    { name: '열원설비 운전 제어', score: [2, 1] as [number, number], type: '적용여부' },
    { name: '전기 외 에너지 냉방', score: [2, 1] as [number, number], type: '등급' },
    { name: '급탕용 보일러 효율', score: [2, 2] as [number, number], type: '등급' },
    { name: '급수 펌프 운전 제어', score: [1, 1] as [number, number], type: '적용여부' },
    { name: '지하주차장 환기', score: [1, 1] as [number, number], type: '적용여부' },
    { name: 'T.A.B 또는 커미셔닝', score: [1, 1] as [number, number], type: '등급' },
    { name: '개별식 보상 점수', score: [4, 2] as [number, number], type: '적용여부', bonus: true },
  ],
  전기: [
    { name: '조명 밀도', score: [9, 8] as [number, number], type: '등급' },
    { name: '전압 강하', score: [1, 1] as [number, number], type: '등급' },
    { name: '전력 제어 설비 적용', score: [2, 1] as [number, number], type: '적용여부' },
    { name: '조명 자동 제어', score: [1, 1] as [number, number], type: '적용여부' },
    { name: '조명', score: [1, 1] as [number, number], type: '적용여부' },
    { name: '일괄 소등 스위치', score: [1, 1] as [number, number], type: '적용여부' },
    { name: '전력량계 설치', score: [1, 2] as [number, number], type: '적용여부' },
    { name: 'BEMS 적용', score: [3, 3] as [number, number], type: '등급' },
    { name: '역률자동조절 장치', score: [1, 1] as [number, number], type: '적용여부' },
    { name: '대기전력차단장치', score: [2, 2] as [number, number], type: '등급' },
    { name: '승강기 회생제동 장치', score: [2, 1] as [number, number], type: '적용여부' },
  ],
};

const EPI_COEF: Record<string, number> = { '중앙식': 0.8, '개별식': 1.0 };

interface CalcResult {
  지역: string; 용도: string; 연면적: number; 층수: number; 설비: string;
  zebGrade: number; 규모: string; 건축면적: number; 지붕면적: number;
  지붕kW: number; 입면면적: number; 입면kW: number; 지붕생산: number;
  입면생산: number; PV총생산: number; 단위: number; 지역계수: number;
  예상사용량: number; PV공급비율: number; zebTarget: number; 필요생산량: number;
  충족여부: boolean; 부족량: number; zeb지붕kW: number; zeb입면kW: number;
  배점계수: number; 규모idx: number;
  기계항목: typeof EPI_ITEMS.기계_개별;
  건축합계: number; 기계합계: number; 전기합계: number; EPI총점: number;
}

function fmt(n: number, d = 0) {
  return n.toLocaleString('ko-KR', { maximumFractionDigits: d, minimumFractionDigits: d });
}

function EPITable({
  title, items, idx, coef,
}: {
  title: string;
  items: { name: string; score: [number, number]; type: string; bonus?: boolean }[];
  idx: number;
  coef: number;
}) {
  const total = items.reduce((a, v) => a + v.score[idx] * coef, 0);
  return (
    <div style={{ marginBottom: 18 }}>
      <div className="epi-section-label">{title}</div>
      <table className="data-table">
        <thead>
          <tr>
            <th>항목</th><th>기본배점</th><th>산출방식</th>
            <th>적용점수 (×{coef})</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => {
            const base = item.score[idx];
            const score = base * coef;
            return (
              <tr key={i}>
                <td className="td-name">{item.name}{item.bonus ? ' ⭐' : ''}</td>
                <td>{base}</td>
                <td>{item.type === '등급' ? '등급' : '적용여부'}</td>
                <td className="td-teal">{score.toFixed(1)}</td>
              </tr>
            );
          })}
          <tr>
            <td className="td-name td-total" colSpan={3}>소계</td>
            <td className="td-total">{total.toFixed(1)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default function Simulator() {
  const [services, setServices] = useState<Set<string>>(new Set(['신재생', 'ZEB', 'EPI']));
  const [지역, set지역] = useState('서울');
  const [용도, set용도] = useState('업무시설(공공용)');
  const [연면적, set연면적] = useState(12000);
  const [층수, set층수] = useState(10);
  const [설비, set설비] = useState('개별식');
  const [zebGrade, setZebGrade] = useState(4);
  const [result, setResult] = useState<CalcResult | null>(null);

  function toggleService(s: string) {
    setServices(prev => {
      const next = new Set(prev);
      if (next.has(s)) next.delete(s); else next.add(s);
      return next;
    });
  }

  function calculate() {
    const 건축면적 = 연면적 / 층수;
    const 지붕면적 = 건축면적 * 0.7;
    const 지붕kW = 지붕면적 * 0.20;
    const 입면면적 = Math.sqrt(건축면적) * (3.3 * 층수) * 0.7;
    const 입면kW = 입면면적 * 0.20;
    const 지붕생산 = 지붕kW * 1358 * 0.95;
    const 입면생산 = 입면kW * 923 * 6.12;
    const PV총생산 = 지붕생산 + 입면생산;

    const 단위 = ENERGY_USAGE[용도] ?? 374.47;
    const 지역계수 = REGION_COEF[지역] ?? 1;
    const 예상사용량 = 연면적 * 단위 * 지역계수;
    const PV공급비율 = (PV총생산 / 예상사용량) * 100;

    const zebTarget = ZEB_THRESHOLD[zebGrade];
    const 필요생산량 = 예상사용량 * (zebTarget / 100);
    const 충족여부 = PV총생산 >= 필요생산량;
    const 부족량 = Math.max(0, 필요생산량 - PV총생산);

    const zeb지붕kW = 지붕생산 / (1358 * 0.95);
    const zeb입면kW = 입면생산 / (923 * 6.12);

    const 규모 = 연면적 >= 3000 ? '대형' : '소형';
    const 규모idx = 규모 === '대형' ? 0 : 1;
    const 배점계수 = EPI_COEF[설비];
    const 기계항목 = 설비 === '중앙식' ? EPI_ITEMS.기계_중앙 : EPI_ITEMS.기계_개별;
    const sumScores = (arr: { score: [number, number] }[]) =>
      arr.reduce((a, v) => a + v.score[규모idx] * 배점계수, 0);
    const 건축합계 = sumScores(EPI_ITEMS.건축);
    const 기계합계 = sumScores(기계항목);
    const 전기합계 = sumScores(EPI_ITEMS.전기);
    const EPI총점 = 건축합계 + 기계합계 + 전기합계;

    setResult({
      지역, 용도, 연면적, 층수, 설비, zebGrade, 규모,
      건축면적, 지붕면적, 지붕kW, 입면면적, 입면kW,
      지붕생산, 입면생산, PV총생산,
      단위, 지역계수, 예상사용량,
      PV공급비율, zebTarget, 필요생산량, 충족여부, 부족량,
      zeb지붕kW, zeb입면kW,
      배점계수, 규모idx, 기계항목,
      건축합계, 기계합계, 전기합계, EPI총점,
    });
  }

  const has신 = services.has('신재생');
  const hasZEB = services.has('ZEB');
  const hasEPI = services.has('EPI');
  const needEquip = hasZEB || hasEPI;
  const needGrade = hasZEB;

  const 지열디폴트 = result ? {
    냉방용량: Math.round(result.건축면적 * 0.07),
    난방용량: Math.round(result.건축면적 * 0.05),
    냉방COP: 4.5,
    난방COP: 3.8,
  } : null;

  return (
    <>
      <style>{`
        .sim-root {
          background: #0d0f14;
          color: #e2e8f0;
          font-family: 'Pretendard', -apple-system, sans-serif;
          min-height: 100vh;
          line-height: 1.6;
        }
        .sim-header {
          border-bottom: 1px solid #252a38;
          padding: 20px 40px;
          display: flex;
          align-items: center;
          gap: 16px;
          background: #13161e;
          position: sticky;
          top: 0;
          z-index: 100;
        }
        .header-badge {
          background: rgba(45,212,191,0.12);
          border: 1px solid #2dd4bf;
          color: #2dd4bf;
          font-size: 10px;
          font-weight: 600;
          padding: 3px 8px;
          border-radius: 4px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }
        .sim-header h1 { font-size: 16px; font-weight: 600; color: #e2e8f0; }
        .sim-header p { font-size: 12px; color: #64748b; margin-left: auto; }
        .sim-layout {
          display: grid;
          grid-template-columns: 360px 1fr;
          min-height: calc(100vh - 65px);
        }
        .input-panel {
          background: #13161e;
          border-right: 1px solid #252a38;
          padding: 32px 28px;
          overflow-y: auto;
          position: sticky;
          top: 65px;
          height: calc(100vh - 65px);
        }
        .panel-title {
          font-size: 11px;
          font-weight: 600;
          color: #64748b;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          margin-bottom: 20px;
        }
        .service-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
          margin-bottom: 28px;
        }
        .svc-btn {
          background: #1a1e29;
          border: 1px solid #2e3547;
          color: #94a3b8;
          padding: 10px 6px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          text-align: center;
          font-family: inherit;
        }
        .svc-btn:hover { border-color: #2dd4bf; color: #2dd4bf; }
        .svc-btn.active {
          background: rgba(45,212,191,0.12);
          border-color: #2dd4bf;
          color: #2dd4bf;
          font-weight: 600;
        }
        .field-group { margin-bottom: 20px; }
        .field-group.disabled { opacity: 0.35; pointer-events: none; }
        .field-label {
          font-size: 12px;
          font-weight: 500;
          color: #94a3b8;
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .field-tag {
          font-size: 9px;
          padding: 2px 5px;
          border-radius: 3px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }
        .tag-req { background: rgba(45,212,191,0.12); color: #2dd4bf; }
        .tag-opt { background: #252a38; color: #64748b; }
        .field-input {
          width: 100%;
          background: #1a1e29;
          border: 1px solid #2e3547;
          color: #e2e8f0;
          padding: 10px 14px;
          border-radius: 8px;
          font-size: 13px;
          font-family: inherit;
          transition: border-color 0.2s;
          outline: none;
        }
        .field-input:focus { border-color: #2dd4bf; }
        .stepper {
          display: flex;
          align-items: center;
          background: #1a1e29;
          border: 1px solid #2e3547;
          border-radius: 8px;
          overflow: hidden;
        }
        .stepper-btn {
          width: 40px; height: 40px;
          background: none; border: none;
          color: #94a3b8;
          cursor: pointer;
          font-size: 18px;
          transition: all 0.15s;
          display: flex; align-items: center; justify-content: center;
        }
        .stepper-btn:hover { background: #252a38; color: #2dd4bf; }
        .stepper-val {
          flex: 1;
          text-align: center;
          font-size: 14px;
          font-weight: 600;
          font-family: 'JetBrains Mono', monospace;
          color: #e2e8f0;
          background: none;
          border: none;
          outline: none;
        }
        .toggle-group {
          display: grid;
          grid-template-columns: 1fr 1fr;
          background: #1a1e29;
          border: 1px solid #2e3547;
          border-radius: 8px;
          overflow: hidden;
        }
        .toggle-btn {
          padding: 10px;
          border: none;
          background: none;
          color: #94a3b8;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          font-family: inherit;
        }
        .toggle-btn.active { background: #2dd4bf; color: #0a0f14; font-weight: 700; }
        .calc-btn {
          width: 100%;
          background: #2dd4bf;
          color: #0a0f14;
          border: none;
          padding: 14px;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          margin-top: 8px;
          font-family: inherit;
          transition: all 0.2s;
          letter-spacing: 0.03em;
        }
        .calc-btn:hover { background: #14b8a6; transform: translateY(-1px); }
        .calc-btn:active { transform: translateY(0); }
        .result-panel { padding: 32px 36px; overflow-y: auto; }
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 300px;
          color: #64748b;
          gap: 12px;
        }
        .empty-state .icon { font-size: 40px; opacity: 0.4; }
        .empty-state p { font-size: 13px; }
        .result-section { margin-bottom: 36px; }
        .section-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 20px;
          padding-bottom: 12px;
          border-bottom: 1px solid #252a38;
        }
        .section-icon {
          width: 32px; height: 32px;
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          font-size: 15px;
        }
        .icon-teal { background: rgba(45,212,191,0.12); }
        .icon-blue { background: rgba(96,165,250,0.1); }
        .icon-yellow { background: rgba(251,191,36,0.1); }
        .section-title { font-size: 15px; font-weight: 700; color: #e2e8f0; }
        .section-sub { font-size: 11px; color: #64748b; margin-left: auto; font-family: 'JetBrains Mono', monospace; }
        .cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 12px;
        }
        .result-card {
          background: #13161e;
          border: 1px solid #252a38;
          border-radius: 10px;
          padding: 16px 18px;
          transition: border-color 0.2s;
        }
        .result-card:hover { border-color: #2e3547; }
        .result-card.highlight { border-color: #2dd4bf; background: rgba(45,212,191,0.06); }
        .card-label { font-size: 11px; color: #64748b; margin-bottom: 8px; font-weight: 500; }
        .card-value {
          font-size: 20px;
          font-weight: 700;
          font-family: 'JetBrains Mono', monospace;
          color: #e2e8f0;
          line-height: 1.2;
        }
        .card-unit { font-size: 11px; color: #64748b; margin-top: 4px; }
        .card-value.teal { color: #2dd4bf; }
        .card-value.yellow { color: #fbbf24; }
        .card-value.green { color: #4ade80; }
        .card-value.red { color: #f87171; }
        .card-value.blue { color: #60a5fa; }
        .formula-box {
          background: #1a1e29;
          border: 1px solid #252a38;
          border-radius: 8px;
          padding: 14px 16px;
          margin-bottom: 14px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px;
          color: #94a3b8;
          line-height: 1.8;
        }
        .formula-box .hl { color: #2dd4bf; font-weight: 600; }
        .formula-box .num { color: #fbbf24; }
        .formula-box .comment { color: #64748b; }
        .data-table { width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 12px; }
        .data-table th {
          background: #1a1e29;
          color: #64748b;
          font-weight: 600;
          padding: 8px 12px;
          text-align: left;
          border-bottom: 1px solid #252a38;
          letter-spacing: 0.05em;
          font-size: 11px;
          text-transform: uppercase;
        }
        .data-table td {
          padding: 9px 12px;
          border-bottom: 1px solid #252a38;
          color: #94a3b8;
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px;
        }
        .data-table tr:last-child td { border-bottom: none; }
        .data-table tr:hover td { background: #1a1e29; }
        .td-name { font-family: inherit !important; color: #e2e8f0 !important; }
        .td-teal { color: #2dd4bf !important; font-weight: 600; }
        .td-total {
          color: #2dd4bf !important;
          font-weight: 700 !important;
          background: rgba(45,212,191,0.06) !important;
        }
        .epi-section-label {
          font-size: 12px; color: #64748b; margin-bottom: 8px;
          font-weight: 600; letter-spacing: .05em; text-transform: uppercase;
        }
        .type-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(45,212,191,0.12);
          border: 1px solid #2dd4bf;
          color: #2dd4bf;
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 700;
          margin-bottom: 16px;
          letter-spacing: 0.03em;
        }
        .warn-box {
          background: rgba(251,191,36,0.1);
          border: 1px solid rgba(251,191,36,0.3);
          border-radius: 8px;
          padding: 10px 14px;
          font-size: 11px;
          color: #fbbf24;
          margin-bottom: 14px;
          display: flex;
          gap: 8px;
          align-items: flex-start;
        }
        .progress-wrap {
          background: #1a1e29;
          border-radius: 100px;
          height: 6px;
          margin-top: 6px;
          overflow: hidden;
        }
        .progress-bar {
          height: 100%;
          border-radius: 100px;
          background: linear-gradient(90deg, #14b8a6, #2dd4bf);
          transition: width 0.6s ease;
        }
        .progress-bar.yellow { background: linear-gradient(90deg, #d97706, #fbbf24); }
        .sync-flow {
          display: flex;
          align-items: center;
          gap: 12px;
          background: #1a1e29;
          border: 1px dashed #2e3547;
          border-radius: 10px;
          padding: 14px 18px;
          margin-bottom: 16px;
          font-size: 12px;
          color: #94a3b8;
          flex-wrap: wrap;
        }
        .sync-arrow { color: #2dd4bf; font-size: 18px; }
        .step3-wrap {
          background: #1a1e29;
          border: 1px solid #2e3547;
          border-radius: 12px;
          padding: 20px 22px;
          margin-bottom: 20px;
        }
        .step3-section-title {
          font-size: 12px;
          font-weight: 700;
          color: #94a3b8;
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }
        .inject-badge {
          font-size: 9px;
          padding: 2px 7px;
          border-radius: 20px;
          font-weight: 600;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          background: #252a38;
          color: #64748b;
        }
        .inject-badge.calc {
          background: rgba(45,212,191,0.12);
          color: #2dd4bf;
          border: 1px solid rgba(45,212,191,0.3);
        }
        .inject-badge.pending {
          background: rgba(251,191,36,0.1);
          color: #fbbf24;
          border: 1px solid rgba(251,191,36,0.3);
        }
        .step3-form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
          gap: 10px;
          margin-bottom: 10px;
        }
        .step3-field {
          background: #13161e;
          border: 1px solid #252a38;
          border-radius: 8px;
          padding: 10px 12px;
        }
        .step3-label {
          font-size: 10px;
          color: #64748b;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.07em;
          margin-bottom: 5px;
        }
        .step3-value {
          font-size: 14px;
          font-weight: 700;
          font-family: 'JetBrains Mono', monospace;
          margin-bottom: 4px;
          color: #e2e8f0;
        }
        .step3-value.calc { color: #2dd4bf; border-left: 2px solid #2dd4bf; padding-left: 6px; }
        .step3-value.pending { color: #fbbf24; border-left: 2px solid #fbbf24; padding-left: 6px; }
        .step3-value.user { color: #64748b; border-left: 2px solid #2e3547; padding-left: 6px; font-style: italic; }
        .step3-source { font-size: 9px; color: #64748b; font-family: 'JetBrains Mono', monospace; }
        .step3-formula {
          font-size: 11px;
          color: #64748b;
          font-family: 'JetBrains Mono', monospace;
          background: #0d0f14;
          border: 1px solid #252a38;
          border-radius: 6px;
          padding: 8px 12px;
          line-height: 1.8;
          margin-bottom: 4px;
        }
        .step3-warn {
          font-size: 11px;
          color: #fbbf24;
          background: rgba(251,191,36,0.1);
          border: 1px solid rgba(251,191,36,0.25);
          border-radius: 6px;
          padding: 7px 12px;
          margin-top: 8px;
        }
        .sim-divider { height: 1px; background: #252a38; margin: 28px 0; }
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600&display=swap');
      `}</style>

      <div className="sim-root">
        <header className="sim-header">
          <span className="header-badge">DEV</span>
          <h1>간편진단 로직 시뮬레이터</h1>
          <p>신재생 / EPI / ZEB 연산 로직 테스트 · 실개발 참고용</p>
        </header>

        <div className="sim-layout">
          {/* ── 입력 패널 ── */}
          <div className="input-panel">
            <div className="panel-title">STEP 1 · 서비스 선택</div>
            <div className="service-grid">
              {['신재생', 'ZEB', 'EPI'].map(s => (
                <button
                  key={s}
                  className={`svc-btn${services.has(s) ? ' active' : ''}`}
                  onClick={() => toggleService(s)}
                >{s}</button>
              ))}
            </div>

            <div className="panel-title">STEP 2 · 입력 정보</div>

            <div className={`field-group${!has신 && !hasZEB ? ' disabled' : ''}`}>
              <div className="field-label">지역 / 주소 <span className="field-tag tag-req">신재생·ZEB</span></div>
              <select className="field-input" value={지역} onChange={e => set지역(e.target.value)}>
                {Object.keys(REGION_COEF).map(r => (
                  <option key={r} value={r}>{r} ({REGION_COEF[r]})</option>
                ))}
              </select>
            </div>

            <div className={`field-group${!has신 && !hasZEB ? ' disabled' : ''}`}>
              <div className="field-label">용도 <span className="field-tag tag-req">신재생·ZEB</span></div>
              <select className="field-input" value={용도} onChange={e => set용도(e.target.value)}>
                <option value="업무시설(상업용)">업무시설 (상업용)</option>
                <option value="업무시설(공공용)">업무시설 (공공용)</option>
                <option value="교육연구시설">교육연구시설</option>
              </select>
            </div>

            <div className="field-group">
              <div className="field-label">연면적 <span className="field-tag tag-req">공통</span></div>
              <input
                className="field-input" type="number" value={연면적} min={0}
                onChange={e => set연면적(parseFloat(e.target.value) || 0)}
              />
            </div>

            <div className="field-group">
              <div className="field-label">층수 <span className="field-tag tag-req">ZEB·신재생PV</span></div>
              <div className="stepper">
                <button className="stepper-btn" onClick={() => set층수(v => Math.max(1, v - 1))}>−</button>
                <input
                  className="stepper-val" type="number" value={층수} min={1}
                  onChange={e => set층수(parseInt(e.target.value) || 1)}
                />
                <button className="stepper-btn" onClick={() => set층수(v => v + 1)}>+</button>
              </div>
            </div>

            <div className={`field-group${!needEquip ? ' disabled' : ''}`}>
              <div className="field-label">설비 방식 <span className="field-tag tag-req">ZEB·EPI</span></div>
              <div className="toggle-group">
                <button className={`toggle-btn${설비 === '개별식' ? ' active' : ''}`} onClick={() => set설비('개별식')}>개별식</button>
                <button className={`toggle-btn${설비 === '중앙식' ? ' active' : ''}`} onClick={() => set설비('중앙식')}>중앙식</button>
              </div>
            </div>

            <div className={`field-group${!needGrade ? ' disabled' : ''}`}>
              <div className="field-label">ZEB 목표 등급 <span className="field-tag tag-req">ZEB</span></div>
              <select className="field-input" value={zebGrade} onChange={e => setZebGrade(parseInt(e.target.value))}>
                <option value={1}>1등급 (100% 이상)</option>
                <option value={2}>2등급 (80% 이상)</option>
                <option value={3}>3등급 (60% 이상)</option>
                <option value={4}>4등급 (40% 이상)</option>
                <option value={5}>5등급 (20% 이상)</option>
              </select>
            </div>

            <button className="calc-btn" onClick={calculate}>⚡ 예측 시작</button>
          </div>

          {/* ── 결과 패널 ── */}
          <div className="result-panel">
            {!result ? (
              <div className="empty-state">
                <div className="icon">⚡</div>
                <p>왼쪽 패널에서 파라미터를 입력하고<br /><strong style={{ color: '#94a3b8' }}>예측 시작</strong>을 눌러주세요</p>
              </div>
            ) : (
              <>
                {/* SECTION 1: 신재생 */}
                {has신 && (
                  <>
                    <div className="result-section">
                      <div className="section-header">
                        <div className="section-icon icon-teal">☀️</div>
                        <div className="section-title">신재생 · 재생에너지 공급 비율</div>
                        <span className="section-sub">PV 최대 생산량 기준</span>
                      </div>
                      <div className="formula-box">
                        <span className="comment">{'// 예상 에너지사용량'}</span><br />
                        <span className="hl">예상사용량</span> = <span className="num">{fmt(result.연면적)}</span> ㎡ × <span className="num">{result.단위}</span> kWh/㎡·yr × <span className="num">{result.지역계수}</span> ({result.지역})<br />
                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; = <span className="hl">{fmt(result.예상사용량, 0)} kWh/yr</span><br /><br />
                        <span className="comment">{'// PV 지붕 (고정식 45°)'}</span><br />
                        건축면적 = {fmt(result.연면적)}/{result.층수} = <span className="num">{fmt(result.건축면적, 1)}</span> ㎡<br />
                        지붕면적 = {fmt(result.건축면적, 1)} × 0.7 = <span className="num">{fmt(result.지붕면적, 1)}</span> ㎡ → <span className="num">{fmt(result.지붕kW, 1)}</span> kW<br />
                        지붕생산 = {fmt(result.지붕kW, 1)} × 1358 × 0.95 = <span className="hl">{fmt(result.지붕생산, 0)}</span> kWh/yr<br /><br />
                        <span className="comment">{'// PV 입면 (BIPV 수직 90°)'}</span><br />
                        입면면적 = √{fmt(result.건축면적, 1)} × (3.3×{result.층수}) × 0.7 = <span className="num">{fmt(result.입면면적, 1)}</span> ㎡ → <span className="num">{fmt(result.입면kW, 1)}</span> kW<br />
                        입면생산 = {fmt(result.입면kW, 1)} × 923 × 6.12 = <span className="hl">{fmt(result.입면생산, 0)}</span> kWh/yr<br /><br />
                        <span className="comment">{'// 공급 비율'}</span><br />
                        비율 = ({fmt(result.지붕생산, 0)} + {fmt(result.입면생산, 0)}) / {fmt(result.예상사용량, 0)} × 100 = <span className="hl">{result.PV공급비율.toFixed(2)}%</span>
                      </div>
                      <div className="cards-grid">
                        <div className="result-card">
                          <div className="card-label">예상 에너지사용량</div>
                          <div className="card-value">{fmt(result.예상사용량 / 1000000, 2)}</div>
                          <div className="card-unit">GWh/yr ({fmt(result.예상사용량, 0)} kWh)</div>
                        </div>
                        <div className="result-card">
                          <div className="card-label">PV 지붕 용량</div>
                          <div className="card-value blue">{fmt(result.지붕kW, 1)}</div>
                          <div className="card-unit">kW → {fmt(result.지붕생산 / 1000, 1)} MWh/yr</div>
                        </div>
                        <div className="result-card">
                          <div className="card-label">PV 입면(BIPV) 용량</div>
                          <div className="card-value blue">{fmt(result.입면kW, 1)}</div>
                          <div className="card-unit">kW → {fmt(result.입면생산 / 1000, 1)} MWh/yr</div>
                        </div>
                        <div className="result-card highlight">
                          <div className="card-label">PV 총 생산량</div>
                          <div className="card-value teal">{fmt(result.PV총생산 / 1000, 1)}</div>
                          <div className="card-unit">MWh/yr</div>
                          <div className="progress-wrap">
                            <div className="progress-bar" style={{ width: `${Math.min(result.PV공급비율 * 3, 100)}%` }} />
                          </div>
                        </div>
                        <div className="result-card highlight">
                          <div className="card-label">재생에너지 공급 비율</div>
                          <div className={`card-value ${result.PV공급비율 >= 20 ? 'green' : 'red'}`}>{result.PV공급비율.toFixed(2)}</div>
                          <div className="card-unit">% (의무: 30% 이상)</div>
                          <div className="progress-wrap">
                            <div className={`progress-bar${result.PV공급비율 >= 30 ? '' : ' yellow'}`} style={{ width: `${Math.min(result.PV공급비율 / 30 * 100, 100)}%` }} />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="sim-divider" />
                  </>
                )}

                {/* SECTION 2: ZEB */}
                {hasZEB && 지열디폴트 && (
                  <>
                    <div className="result-section">
                      <div className="section-header">
                        <div className="section-icon icon-blue">🔋</div>
                        <div className="section-title">ZEB · Step 3 파라미터 주입 (신재생 → ZEB 동기화)</div>
                        <span className="section-sub">ZEB {result.zebGrade}등급 목표 · {result.zebTarget}% 이상</span>
                      </div>
                      <div className="sync-flow">
                        <span>① 신재생 계산 완료</span>
                        <span className="sync-arrow">→</span>
                        <span>② 에너지원별 환산</span>
                        <span className="sync-arrow">→</span>
                        <span>③ ZEB Step3 파라미터 자동 주입</span>
                        <span className="sync-arrow">→</span>
                        <span>④ ZEB 성능 분석</span>
                      </div>

                      <div className="step3-wrap">
                        <div className="step3-section-title">📋 ZEB Step 3 · 기본 정보 <span className="inject-badge">초기 입력값 참조</span></div>
                        <div className="step3-form-grid">
                          {[
                            ['지역', result.지역, '← 초기 입력값'],
                            ['용도', result.용도, '← 초기 입력값'],
                            ['연면적', `${fmt(result.연면적)} ㎡`, '← 초기 입력값'],
                            ['층수', `${result.층수} 층`, '← 초기 입력값'],
                            ['ZEB 목표 등급', `${result.zebGrade}등급 (${result.zebTarget}%↑)`, '← 초기 입력값'],
                            ['설비 방식', result.설비, '← 초기 입력값'],
                          ].map(([label, value, source]) => (
                            <div className="step3-field" key={label}>
                              <div className="step3-label">{label}</div>
                              <div className="step3-value">{value}</div>
                              <div className="step3-source">{source}</div>
                            </div>
                          ))}
                        </div>

                        <div className="step3-section-title" style={{ marginTop: 20 }}>
                          ☀️ 태양광 (PV) · Row 1 — 지붕 (고정식)
                          <span className="inject-badge calc">신재생 계산값 환산</span>
                        </div>
                        <div className="step3-form-grid">
                          {[
                            ['방위', '남', '← 고정 호출값', 'calc'],
                            ['기울기', '45° (지붕)', '← 고정 호출값', 'calc'],
                            ['용량', `${fmt(result.zeb지붕kW, 1)} kW`, '← 지붕생산 / (1358×0.95)', 'calc'],
                            ['효율', '20%', '← 고정 호출값', 'calc'],
                          ].map(([label, value, source, cls]) => (
                            <div className="step3-field" key={label}>
                              <div className="step3-label">{label}</div>
                              <div className={`step3-value ${cls}`}>{value}</div>
                              <div className="step3-source">{source}</div>
                            </div>
                          ))}
                        </div>
                        <div className="step3-formula">
                          지붕면적 = {fmt(result.건축면적, 1)}㎡ × 0.7 = {fmt(result.지붕면적, 1)}㎡ &nbsp;→&nbsp;
                          용량 = {fmt(result.지붕면적, 1)} × 0.20 = <b>{fmt(result.지붕kW, 1)} kW</b> &nbsp;→&nbsp;
                          생산량 = {fmt(result.지붕kW, 1)} × 1358 × 0.95 = <b>{fmt(result.지붕생산, 0)} kWh/yr</b>
                        </div>

                        <div className="step3-section-title" style={{ marginTop: 20 }}>
                          ☀️ 태양광 (PV) · Row 2 — 입면 (BIPV)
                          <span className="inject-badge calc">신재생 계산값 환산</span>
                        </div>
                        <div className="step3-form-grid">
                          {[
                            ['방위', '남', '← 고정 호출값', 'calc'],
                            ['기울기', '90° (수직)', '← 고정 호출값', 'calc'],
                            ['용량', `${fmt(result.zeb입면kW, 1)} kW`, '← 입면생산 / (923×6.12)', 'calc'],
                            ['효율', '20%', '← 고정 호출값', 'calc'],
                          ].map(([label, value, source, cls]) => (
                            <div className="step3-field" key={label}>
                              <div className="step3-label">{label}</div>
                              <div className={`step3-value ${cls}`}>{value}</div>
                              <div className="step3-source">{source}</div>
                            </div>
                          ))}
                        </div>
                        <div className="step3-formula">
                          입면면적 = √{fmt(result.건축면적, 1)} × (3.3×{result.층수}) × 0.7 = {fmt(result.입면면적, 1)}㎡ &nbsp;→&nbsp;
                          용량 = {fmt(result.입면면적, 1)} × 0.20 = <b>{fmt(result.입면kW, 1)} kW</b> &nbsp;→&nbsp;
                          생산량 = {fmt(result.입면kW, 1)} × 923 × 6.12 = <b>{fmt(result.입면생산, 0)} kWh/yr</b>
                        </div>

                        <div className="step3-section-title" style={{ marginTop: 20 }}>
                          🌡️ 지열 시스템 (수직밀폐형)
                          <span className="inject-badge pending">디폴트값 적용 · 엑셀 확인 필요</span>
                        </div>
                        <div className="step3-form-grid">
                          {[
                            ['연료', '전기', '← 고정 호출값', 'calc'],
                            ['냉방 용량', `${fmt(지열디폴트.냉방용량)} kW`, '⚠ 디폴트값 (엑셀 미확보)', 'pending'],
                            ['난방 용량', `${fmt(지열디폴트.난방용량)} kW`, '⚠ 디폴트값 (엑셀 미확보)', 'pending'],
                            ['냉방 COP', String(지열디폴트.냉방COP), '⚠ 디폴트값 (엑셀 미확보)', 'pending'],
                            ['난방 COP', String(지열디폴트.난방COP), '⚠ 디폴트값 (엑셀 미확보)', 'pending'],
                          ].map(([label, value, source, cls]) => (
                            <div className="step3-field" key={label}>
                              <div className="step3-label">{label}</div>
                              <div className={`step3-value ${cls}`}>{value}</div>
                              <div className="step3-source">{source}</div>
                            </div>
                          ))}
                        </div>
                        <div className="step3-warn">
                          ⚠️ 지열 냉·난방 용량 및 COP는 <b>용도별_디폴트값_취합.xlsx</b> 확보 후 반영 필요. 현재는 추정값.
                        </div>

                        <div className="step3-section-title" style={{ marginTop: 20 }}>
                          ⚡ 연료전지 <span className="inject-badge calc">고정 호출값</span>
                        </div>
                        <div className="step3-form-grid">
                          {[
                            ['유형', 'SOFC', '← 고정 호출값', 'calc'],
                            ['열효율', '53%', '← 고정 호출값', 'calc'],
                            ['발전 효율', '35.5%', '← 고정 호출값', 'calc'],
                            ['용량', '유저 직접 입력', '설치공간·급탕 검토 필요', 'user'],
                          ].map(([label, value, source, cls]) => (
                            <div className="step3-field" key={label}>
                              <div className="step3-label">{label}</div>
                              <div className={`step3-value ${cls}`}>{value}</div>
                              <div className="step3-source">{source}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="step3-section-title" style={{ marginTop: 24 }}>📊 ZEB 달성 분석 결과</div>
                      <div className="cards-grid">
                        <div className="result-card">
                          <div className="card-label">예상 에너지사용량</div>
                          <div className="card-value">{fmt(result.예상사용량 / 1000, 1)}</div>
                          <div className="card-unit">MWh/yr</div>
                        </div>
                        <div className="result-card">
                          <div className="card-label">ZEB {result.zebGrade}등급 필요 생산량</div>
                          <div className="card-value yellow">{fmt(result.필요생산량 / 1000, 1)}</div>
                          <div className="card-unit">MWh/yr ({result.zebTarget}%)</div>
                        </div>
                        <div className="result-card">
                          <div className="card-label">PV 총 생산량</div>
                          <div className="card-value blue">{fmt(result.PV총생산 / 1000, 1)}</div>
                          <div className="card-unit">MWh/yr (지붕+입면)</div>
                        </div>
                        <div className="result-card highlight" style={{ gridColumn: 'span 3' }}>
                          <div className="card-label">PV 단독 ZEB 달성 여부</div>
                          <div className={`card-value ${result.충족여부 ? 'green' : 'red'}`} style={{ fontSize: 15, marginBottom: 8 }}>
                            {result.충족여부
                              ? `✅ ZEB ${result.zebGrade}등급 달성 가능 (PV 단독)`
                              : `❌ PV 단독 불가 · 지열 또는 연료전지 추가 필요 (부족량 ${fmt(result.부족량 / 1000, 1)} MWh/yr)`}
                          </div>
                          <div className="progress-wrap">
                            <div
                              className={`progress-bar${result.충족여부 ? '' : ' yellow'}`}
                              style={{ width: `${Math.min((result.PV총생산 / result.필요생산량) * 100, 100)}%` }}
                            />
                          </div>
                          <div className="card-unit" style={{ marginTop: 6 }}>
                            PV 달성률 {Math.min((result.PV총생산 / result.필요생산량) * 100, 100).toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="sim-divider" />
                  </>
                )}

                {/* SECTION 3: EPI */}
                {hasEPI && (
                  <div className="result-section">
                    <div className="section-header">
                      <div className="section-icon icon-yellow">📊</div>
                      <div className="section-title">EPI · 기준 모델 추천</div>
                      <span className="section-sub">배점계수 {result.배점계수} 적용</span>
                    </div>
                    <div className="type-badge">
                      🏢 {result.규모} ({result.규모 === '대형' ? '연면적 ≥ 3,000㎡' : '연면적 < 3,000㎡'})
                      &nbsp;·&nbsp; ⚙️ {result.설비}
                      &nbsp;→&nbsp; EPI 타입: <strong>{result.규모}_{result.설비}</strong>
                    </div>
                    <div className="warn-box">
                      ⚠️ 신재생 부문(난방/냉방/급탕/조명 신재생 적용) 배점계수는 엑셀 미정의 상태로 아래 합계에서 제외됩니다. 기획 확인 필요.
                    </div>
                    <div className="cards-grid" style={{ marginBottom: 20 }}>
                      <div className="result-card">
                        <div className="card-label">건축 부문 합계</div>
                        <div className="card-value blue">{fmt(result.건축합계, 1)}</div>
                        <div className="card-unit">점 (기본배점 × {result.배점계수})</div>
                      </div>
                      <div className="result-card">
                        <div className="card-label">기계 부문 합계</div>
                        <div className="card-value blue">{fmt(result.기계합계, 1)}</div>
                        <div className="card-unit">점 ({result.설비} 항목 기준)</div>
                      </div>
                      <div className="result-card">
                        <div className="card-label">전기 부문 합계</div>
                        <div className="card-value blue">{fmt(result.전기합계, 1)}</div>
                        <div className="card-unit">점</div>
                      </div>
                      <div className="result-card highlight">
                        <div className="card-label">EPI 기준 모델 총점</div>
                        <div className="card-value teal">{fmt(result.EPI총점, 1)}</div>
                        <div className="card-unit">점 (신재생 부문 제외)</div>
                      </div>
                    </div>
                    <EPITable title="건축 부문" items={EPI_ITEMS.건축} idx={result.규모idx} coef={result.배점계수} />
                    <EPITable title={`기계 부문 (${result.설비})`} items={result.기계항목} idx={result.규모idx} coef={result.배점계수} />
                    <EPITable title="전기 부문" items={EPI_ITEMS.전기} idx={result.규모idx} coef={result.배점계수} />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
