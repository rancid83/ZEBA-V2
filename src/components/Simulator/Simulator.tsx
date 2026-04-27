'use client';

import { useState } from 'react';

// ─── DATA ───
const REGION_COEF: Record<string, number> = {
  서울: 1, 인천: 0.97, 경기: 0.99, 강원영서: 1, 강원영동: 0.97,
  대전: 1, 충북: 1, 충남세종: 0.99, 전북: 1.04, 광주: 1.01,
  대구: 1.04, 부산: 0.93, 경남: 1, 울산: 0.93, 경북: 0.98,
  전남: 0.99, 제주: 0.97,
};

const REGION_OPTIONS = [
  { value: '서울', label: '서울 (1.00)' },
  { value: '인천', label: '인천 (0.97)' },
  { value: '경기', label: '경기 (0.99)' },
  { value: '강원영서', label: '강원 영서 (1.00)' },
  { value: '강원영동', label: '강원 영동 (0.97)' },
  { value: '대전', label: '대전 (1.00)' },
  { value: '충북', label: '충북 (1.00)' },
  { value: '충남세종', label: '충남·세종 (0.99)' },
  { value: '전북', label: '전북 (1.04)' },
  { value: '광주', label: '광주 (1.01)' },
  { value: '대구', label: '대구 (1.04)' },
  { value: '부산', label: '부산 (0.93)' },
  { value: '경남', label: '경남 (1.00)' },
  { value: '울산', label: '울산 (0.93)' },
  { value: '경북', label: '경북 (0.98)' },
  { value: '전남', label: '전남 (0.99)' },
  { value: '제주', label: '제주 (0.97)' },
];

const USE_LABEL: Record<string, string> = {
  공공용: '업무시설(공공용)',
  상업용: '업무시설(상업용)',
  교육: '교육연구시설',
};

const UNIT_E: Record<string, number> = {
  공공용: 371.66,
  상업용: 374.47,
  교육: 231.33,
};

// 에너지요구량 회귀계수 (a×연면적 + b)
const EQ_COEF: Record<string, { a: number; b: number; hr: number; cr: number }> = {
  공공용: { a: 64.381, b: 51965,  hr: 0.17, cr: 0.19 },
  상업용: { a: 68.763, b: 27456,  hr: 0.10, cr: 0.05 },
  교육:   { a: 68.568, b: 149822, hr: 0.11, cr: 0.09 },
};

// 지열 용량 회귀계수
const GEO_COEF: Record<string, { hc: number; hd: number; cc: number; cd: number }> = {
  공공용: { hc: 0.0041, hd: 173.82, cc: 0.0039, cd: 132.08 },
  상업용: { hc: 0.0042, hd: 169.23, cc: 0.0066, cd: 204.83 },
  교육:   { hc: 0.0036, hd: 321.09, cc: 0.0048, cd: 290.84 },
};

const ZEB_THR: Record<number, number> = { 1: 100, 2: 80, 3: 60, 4: 40, 5: 20 };

const EPI_ARCH = [
  { n: '외벽의 평균 열관류율',    s: [21, 34] as [number, number], t: '등급' },
  { n: '지붕의 평균 열관류율',    s: [7,  8]  as [number, number], t: '등급' },
  { n: '바닥의 평균 열관류율',    s: [5,  6]  as [number, number], t: '등급' },
  { n: '외피 열교부위 단열 성능', s: [4,  6]  as [number, number], t: '등급' },
  { n: '기밀성 등급',             s: [5,  6]  as [number, number], t: '등급' },
  { n: '기밀성능 강화 조치',      s: [1,  2]  as [number, number], t: '적용여부' },
  { n: '태양열 취득률',           s: [7,  5]  as [number, number], t: '등급' },
];

const EPI_MECH_CEN = [
  { n: '난방 설비',           s: [7,  6]  as [number, number], t: '등급' },
  { n: '냉방 설비',           s: [6,  2]  as [number, number], t: '등급' },
  { n: '공조기 송풍기 효율',  s: [3,  1]  as [number, number], t: '등급' },
  { n: '펌프 효율',           s: [2,  2]  as [number, number], t: '등급' },
  { n: '이코노마이저 적용',   s: [3,  1]  as [number, number], t: '적용여부' },
  { n: '열교환기 효율',       s: [3,  3]  as [number, number], t: '등급' },
  { n: '덕트 및 배관 단열',   s: [2,  1]  as [number, number], t: '적용여부' },
  { n: '열원설비 운전 제어',  s: [2,  1]  as [number, number], t: '적용여부' },
  { n: '공조기 팬 운전 제어', s: [2,  1]  as [number, number], t: '적용여부' },
  { n: '전기 외 에너지 냉방', s: [2,  1]  as [number, number], t: '등급' },
  { n: '급탕용 보일러 효율',  s: [2,  2]  as [number, number], t: '등급' },
  { n: '냉방 순환 펌프 효율', s: [2,  1]  as [number, number], t: '적용여부' },
  { n: '급수 펌프 운전 제어', s: [1,  1]  as [number, number], t: '적용여부' },
  { n: '지하주차장 환기',     s: [1,  1]  as [number, number], t: '적용여부' },
  { n: 'T.A.B 또는 커미셔닝', s: [1,  1]  as [number, number], t: '등급' },
  { n: '지역 난방',           s: [10, 8]  as [number, number], t: '적용여부' },
];

const EPI_MECH_IND = [
  { n: '난방 설비',           s: [7, 6] as [number, number], t: '등급' },
  { n: '냉방 설비',           s: [6, 2] as [number, number], t: '등급' },
  { n: '열교환기 효율',       s: [3, 3] as [number, number], t: '등급' },
  { n: '덕트 및 배관 단열',   s: [2, 1] as [number, number], t: '적용여부' },
  { n: '열원설비 운전 제어',  s: [2, 1] as [number, number], t: '적용여부' },
  { n: '전기 외 에너지 냉방', s: [2, 1] as [number, number], t: '등급' },
  { n: '급탕용 보일러 효율',  s: [2, 2] as [number, number], t: '등급' },
  { n: '급수 펌프 운전 제어', s: [1, 1] as [number, number], t: '적용여부' },
  { n: '지하주차장 환기',     s: [1, 1] as [number, number], t: '적용여부' },
  { n: 'T.A.B 또는 커미셔닝', s: [1, 1] as [number, number], t: '등급' },
  { n: '개별식 보상 점수',    s: [4, 2] as [number, number], t: '적용여부', bonus: true },
];

const EPI_ELEC = [
  { n: '조명 밀도',            s: [9, 8] as [number, number], t: '등급' },
  { n: '전압 강하',            s: [1, 1] as [number, number], t: '등급' },
  { n: '전력 제어 설비 적용',  s: [2, 1] as [number, number], t: '적용여부' },
  { n: '조명 자동 제어',       s: [1, 1] as [number, number], t: '적용여부' },
  { n: '조명',                 s: [1, 1] as [number, number], t: '적용여부' },
  { n: '일괄 소등 스위치',     s: [1, 1] as [number, number], t: '적용여부' },
  { n: '전력량계 설치',        s: [1, 2] as [number, number], t: '적용여부' },
  { n: 'BEMS 적용',            s: [3, 3] as [number, number], t: '등급' },
  { n: '역률자동조절 장치',    s: [1, 1] as [number, number], t: '적용여부' },
  { n: '대기전력차단장치',     s: [2, 2] as [number, number], t: '등급' },
  { n: '승강기 회생제동 장치', s: [2, 1] as [number, number], t: '적용여부' },
];

const EPI_COEF: Record<string, number> = { 중앙식: 0.8, 개별식: 1.0 };

// ─── TYPES ───
type EpiItem = { n: string; s: [number, number]; t: string; bonus?: boolean };

interface RenewableResult {
  건축면적: number; 지붕면적: number; 지붕kW: number; 지붕생산: number;
  입면면적: number; 입면kW: number; 입면생산: number;
  PV총생산: number; unitE: number; regionC: number; 예상사용량: number;
  공급비율: number; 지붕kW_zeb: number; 입면kW_zeb: number;
}

interface GeoResult {
  전체요구량: number; 난방요구량: number; 냉방요구량: number;
  난방용량: number; 냉방용량: number;
}

interface ZEBResult {
  필요생산량: number; PV달성률: number; PV충족: boolean; 부족량: number;
}

interface EPIResult {
  규모: string; idx: number; coef: number; 기계: EpiItem[];
  건축합계: number; 기계합계: number; 전기합계: number; EPI총점: number;
}

interface CalcResult {
  rv: RenewableResult; geo: GeoResult; zv: ZEBResult; ev: EPIResult;
  input: { region: string; use: string; area: number; floors: number; grade: number; hvac: string };
}

// ─── HELPERS ───
function fmt(n: number, d = 0) {
  return n.toLocaleString('ko-KR', { maximumFractionDigits: d, minimumFractionDigits: d });
}

function calcRenewable(area: number, floors: number, use: string, region: string): RenewableResult {
  const 건축면적 = area / floors;
  const 지붕면적 = 건축면적 * 0.7;
  const 지붕kW   = 지붕면적 * 0.20;
  const 지붕생산 = 지붕kW * 1358 * 0.95;
  const 입면면적 = Math.sqrt(건축면적) * (3.3 * floors) * 0.7;
  const 입면kW   = 입면면적 * 0.20;
  const 입면생산 = 입면kW * 923;
  const PV총생산 = 지붕생산 + 입면생산;
  const unitE    = UNIT_E[use] ?? 374.47;
  const regionC  = REGION_COEF[region] ?? 1;
  const 예상사용량 = area * unitE * regionC;
  const 공급비율  = (PV총생산 / 예상사용량) * 100;
  return {
    건축면적, 지붕면적, 지붕kW, 지붕생산, 입면면적, 입면kW, 입면생산,
    PV총생산, unitE, regionC, 예상사용량, 공급비율,
    지붕kW_zeb: 지붕생산 / (1358 * 0.95),
    입면kW_zeb: 입면생산 / 923,
  };
}

function calcGeo(area: number, use: string): GeoResult {
  const c = EQ_COEF[use];
  const g = GEO_COEF[use];
  const 전체요구량 = c.a * area + c.b;
  const 난방요구량 = 전체요구량 * c.hr;
  const 냉방요구량 = 전체요구량 * c.cr;
  return {
    전체요구량, 난방요구량, 냉방요구량,
    난방용량: g.hc * 난방요구량 + g.hd,
    냉방용량: g.cc * 냉방요구량 + g.cd,
  };
}

function calcZEB(rv: RenewableResult, grade: number): ZEBResult {
  const 필요생산량 = rv.예상사용량 * (ZEB_THR[grade] / 100);
  const PV달성률  = (rv.PV총생산 / 필요생산량) * 100;
  return {
    필요생산량, PV달성률,
    PV충족: rv.PV총생산 >= 필요생산량,
    부족량: Math.max(0, 필요생산량 - rv.PV총생산),
  };
}

function calcEPI(area: number, hvac: string): EPIResult {
  const 규모  = area >= 3000 ? '대형' : '소형';
  const idx  = 규모 === '대형' ? 0 : 1;
  const coef = EPI_COEF[hvac];
  const 기계  = hvac === '중앙식' ? EPI_MECH_CEN : EPI_MECH_IND;
  const sum  = (arr: EpiItem[]) => arr.reduce((a, v) => a + v.s[idx] * coef, 0);
  const 건축합계 = sum(EPI_ARCH);
  const 기계합계 = sum(기계);
  const 전기합계 = sum(EPI_ELEC);
  return { 규모, idx, coef, 기계, 건축합계, 기계합계, 전기합계, EPI총점: 건축합계 + 기계합계 + 전기합계 };
}

// ─── SUB-COMPONENTS ───
function EPITable({ title, items, idx, coef }: {
  title: string; items: EpiItem[]; idx: number; coef: number;
}) {
  const total = items.reduce((a, v) => a + v.s[idx] * coef, 0);
  return (
    <div style={{ marginBottom: 18 }}>
      <div className="s-epi-lbl">{title}</div>
      <table className="s-dtable">
        <thead>
          <tr>
            <th>항목</th><th>기본배점</th><th>산출방식</th><th>적용점수(×{coef})</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr key={i}>
              <td className="s-td-name">{item.n}{item.bonus ? ' ★' : ''}</td>
              <td>{item.s[idx]}</td>
              <td>{item.t}</td>
              <td className="s-td-teal">{(item.s[idx] * coef).toFixed(1)}</td>
            </tr>
          ))}
          <tr>
            <td className="s-td-name s-td-total" colSpan={3}>소계</td>
            <td className="s-td-total">{total.toFixed(1)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function PF({ label, val, cls, src }: { label: string; val: string; cls: string; src: string }) {
  return (
    <div className="s-pfield">
      <div className="s-pfield-lbl">{label}</div>
      <div className={`s-pfield-val ${cls}`}>{val}</div>
      <div className="s-pfield-src">{src}</div>
    </div>
  );
}

// ─── MAIN COMPONENT ───
export default function Simulator() {
  const [svcs, setSvcs] = useState({ re: true, zeb: true, epi: true });
  const [region, setRegion] = useState('서울');
  const [use, setUse]       = useState('공공용');
  const [area, setArea]     = useState(12000);
  const [floors, setFloors] = useState(10);
  const [grade, setGrade]   = useState(4);
  const [hvac, setHvac]     = useState('개별식');
  const [result, setResult] = useState<CalcResult | null>(null);

  function toggleSvc(k: keyof typeof svcs) {
    setSvcs(prev => ({ ...prev, [k]: !prev[k] }));
  }

  function run() {
    const rv  = calcRenewable(area, floors, use, region);
    const geo = calcGeo(area, use);
    const zv  = calcZEB(rv, grade);
    const ev  = calcEPI(area, hvac);
    setResult({ rv, geo, zv, ev, input: { region, use, area, floors, grade, hvac } });
  }

  const { re, zeb, epi } = svcs;
  const needRZ    = re || zeb;
  const needGrade = zeb;
  const needHvac  = zeb || epi;

  const regionLabel = REGION_OPTIONS.find(r => r.value === region)?.label.split('(')[0].trim() ?? region;

  return (
    <>
      <style>{`
        .s-root {
          --bg:#0b0d12; --surface:#111318; --surface2:#181c24; --surface3:#1e222d;
          --border:#252b38; --border2:#2e3547;
          --teal:#2dd4bf; --teal-dim:rgba(45,212,191,0.10);
          --blue:#60a5fa; --blue-dim:rgba(96,165,250,0.10);
          --amber:#fbbf24; --amber-dim:rgba(251,191,36,0.10);
          --green:#4ade80; --red:#f87171;
          --text:#e2e8f0; --text2:#94a3b8; --text3:#64748b;
          background:var(--bg); color:var(--text);
          font-family:'Pretendard','Noto Sans KR',-apple-system,sans-serif;
          font-size:14px; line-height:1.6; min-height:100vh;
        }
        .s-topbar {
          background:var(--surface); border-bottom:1px solid var(--border);
          display:flex; align-items:center; gap:14px; padding:0 28px; height:56px;
          position:sticky; top:0; z-index:200;
        }
        .s-logo { font-family:'JetBrains Mono',monospace; font-size:13px; color:var(--teal); letter-spacing:.12em; }
        .s-slash { color:var(--border2); }
        .s-topbar-title { font-size:13px; font-weight:500; color:var(--text2); }
        .s-topbar-badge {
          font-family:monospace; font-size:9px; padding:3px 8px; border-radius:3px;
          letter-spacing:.1em; background:var(--teal-dim); border:1px solid var(--teal);
          color:var(--teal); margin-left:auto;
        }
        .s-body { display:grid; grid-template-columns:320px 1fr; min-height:calc(100vh - 56px); }
        .s-left {
          background:var(--surface); border-right:1px solid var(--border);
          overflow-y:auto; position:sticky; top:56px; height:calc(100vh - 56px);
        }
        .s-panel-section { padding:20px 22px; border-bottom:1px solid var(--border); }
        .s-panel-label {
          font-family:monospace; font-size:10px; color:var(--text3); letter-spacing:.12em;
          margin-bottom:14px; display:flex; align-items:center; gap:6px;
        }
        .s-panel-label::before { content:''; width:3px; height:10px; background:var(--teal); border-radius:2px; display:inline-block; }
        .s-svc-row { display:flex; gap:8px; }
        .s-svc-chip {
          flex:1; padding:9px 6px; border-radius:7px;
          border:1px solid var(--border2); background:var(--surface2);
          color:var(--text3); font-size:12px; font-weight:500;
          cursor:pointer; transition:all .18s; text-align:center; font-family:inherit;
        }
        .s-svc-chip:hover { border-color:var(--teal); color:var(--teal); }
        .s-svc-chip.on { background:var(--teal-dim); border-color:var(--teal); color:var(--teal); font-weight:600; }
        .s-fgroup { margin-bottom:14px; }
        .s-fgroup.dim { opacity:.3; pointer-events:none; }
        .s-flabel { font-size:11px; font-weight:500; color:var(--text2); margin-bottom:6px; display:flex; align-items:center; gap:6px; }
        .s-ftag { font-size:9px; padding:2px 6px; border-radius:3px; font-family:monospace; letter-spacing:.04em; }
        .s-ftag-r { background:var(--teal-dim); color:var(--teal); }
        .s-finput {
          width:100%; background:var(--surface2); border:1px solid var(--border2);
          color:var(--text); padding:9px 12px; border-radius:7px; font-size:13px;
          font-family:inherit; outline:none; transition:border-color .18s; appearance:none;
        }
        .s-finput:focus { border-color:var(--teal); }
        .s-stepper { display:flex; align-items:center; background:var(--surface2); border:1px solid var(--border2); border-radius:7px; overflow:hidden; }
        .s-stepper-btn { width:38px; height:38px; background:none; border:none; color:var(--text3); cursor:pointer; font-size:16px; transition:all .15s; display:flex; align-items:center; justify-content:center; }
        .s-stepper-btn:hover { background:var(--surface3); color:var(--teal); }
        .s-stepper-val { flex:1; text-align:center; font-size:14px; font-weight:500; font-family:monospace; color:var(--text); background:none; border:none; outline:none; }
        .s-toggle-row { display:grid; grid-template-columns:1fr 1fr; background:var(--surface2); border:1px solid var(--border2); border-radius:7px; overflow:hidden; }
        .s-toggle-opt { padding:9px; border:none; background:none; color:var(--text3); font-size:12px; font-weight:500; cursor:pointer; font-family:inherit; transition:all .18s; }
        .s-toggle-opt.on { background:var(--teal); color:#0a0e14; font-weight:700; }
        .s-run-btn {
          width:100%; background:var(--teal); color:#0a0e14; border:none;
          padding:13px; border-radius:8px; font-size:13px; font-weight:700;
          cursor:pointer; font-family:inherit; letter-spacing:.04em;
          transition:all .18s; margin-top:4px;
        }
        .s-run-btn:hover { background:#14b8a6; transform:translateY(-1px); }
        .s-run-btn:active { transform:none; }
        .s-right { padding:28px 32px; overflow-y:auto; }
        .s-empty { display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:400px; gap:16px; color:var(--text3); }
        .s-empty-icon { width:56px; height:56px; border-radius:14px; background:var(--surface2); border:1px solid var(--border); display:flex; align-items:center; justify-content:center; font-size:22px; }
        .s-res-section { margin-bottom:40px; }
        .s-res-header { display:flex; align-items:center; gap:10px; margin-bottom:20px; padding-bottom:12px; border-bottom:1px solid var(--border); }
        .s-res-icon { width:32px; height:32px; border-radius:8px; display:flex; align-items:center; justify-content:center; font-size:14px; }
        .s-res-title { font-size:15px; font-weight:600; }
        .s-res-sub { font-size:11px; color:var(--text3); margin-left:auto; font-family:monospace; }
        .s-cards { display:grid; grid-template-columns:repeat(auto-fill,minmax(190px,1fr)); gap:10px; margin-bottom:16px; }
        .s-card { background:var(--surface); border:1px solid var(--border); border-radius:10px; padding:14px 16px; transition:border-color .18s; }
        .s-card:hover { border-color:var(--border2); }
        .s-card.hl       { border-color:var(--teal);  background:rgba(45,212,191,0.04); }
        .s-card.hl-blue  { border-color:var(--blue);  background:var(--blue-dim); }
        .s-card.hl-amber { border-color:var(--amber); background:var(--amber-dim); }
        .s-card-lbl  { font-size:11px; color:var(--text3); margin-bottom:6px; font-weight:500; }
        .s-card-val  { font-size:20px; font-weight:700; font-family:monospace; line-height:1.2; }
        .s-card-unit { font-size:11px; color:var(--text3); margin-top:4px; }
        .c-teal  { color:var(--teal); }
        .c-blue  { color:var(--blue); }
        .c-amber { color:var(--amber); }
        .c-green { color:var(--green); }
        .c-red   { color:var(--red); }
        .c-text  { color:var(--text); }
        .s-formula { background:var(--surface2); border:1px solid var(--border); border-radius:8px; padding:14px 16px; margin-bottom:14px; font-family:monospace; font-size:12px; color:var(--text2); line-height:1.9; }
        .s-formula .hl  { color:var(--teal); font-weight:500; }
        .s-formula .num { color:var(--amber); }
        .s-formula .cm  { color:var(--text3); }
        .s-prog-wrap { background:var(--surface2); border-radius:100px; height:5px; margin-top:6px; overflow:hidden; }
        .s-prog-bar  { height:100%; border-radius:100px; transition:width .6s ease; }
        .prog-teal  { background:var(--teal); }
        .prog-amber { background:var(--amber); }
        .prog-red   { background:var(--red); }
        .s-divider { height:1px; background:var(--border); margin:32px 0; }
        .s-step3-wrap { background:var(--surface2); border:1px solid var(--border); border-radius:12px; padding:20px; margin-bottom:16px; }
        .s-step3-title { font-size:11px; font-weight:600; color:var(--text2); margin-bottom:10px; display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
        .s-badge { font-size:9px; padding:2px 7px; border-radius:20px; font-family:monospace; font-weight:600; letter-spacing:.04em; white-space:nowrap; }
        .badge-pass  { background:var(--surface3); color:var(--text3); }
        .badge-calc  { background:var(--teal-dim); border:1px solid rgba(45,212,191,.3); color:var(--teal); }
        .badge-fixed { background:var(--blue-dim); border:1px solid rgba(96,165,250,.3); color:var(--blue); }
        .s-pfields { display:grid; grid-template-columns:repeat(auto-fill,minmax(140px,1fr)); gap:8px; margin-bottom:8px; }
        .s-pfield { background:var(--surface); border:1px solid var(--border); border-radius:8px; padding:9px 11px; }
        .s-pfield-lbl { font-size:9px; color:var(--text3); font-weight:600; text-transform:uppercase; letter-spacing:.07em; margin-bottom:4px; }
        .s-pfield-val { font-size:13px; font-weight:600; font-family:monospace; margin-bottom:2px; }
        .pv-pass  { color:var(--text2); }
        .pv-calc  { color:var(--teal);  border-left:2px solid var(--teal);  padding-left:5px; }
        .pv-fixed { color:var(--blue);  border-left:2px solid var(--blue);  padding-left:5px; }
        .pv-user  { color:var(--text3); border-left:2px solid var(--border2); padding-left:5px; font-style:italic; }
        .s-pfield-src { font-size:9px; color:var(--text3); font-family:monospace; }
        .s-step3-formula { font-size:11px; color:var(--text3); font-family:monospace; background:var(--bg); border:1px solid var(--border); border-radius:6px; padding:8px 12px; line-height:1.9; margin-bottom:4px; }
        .s-sync-flow { display:flex; align-items:center; gap:10px; background:var(--surface2); border:1px dashed var(--border2); border-radius:8px; padding:12px 16px; margin-bottom:16px; font-size:11px; color:var(--text2); flex-wrap:wrap; }
        .s-sync-arrow { color:var(--teal); font-size:16px; }
        .s-epi-type-badge { display:inline-flex; align-items:center; gap:8px; background:var(--teal-dim); border:1px solid var(--teal); color:var(--teal); padding:5px 14px; border-radius:20px; font-size:12px; font-weight:600; margin-bottom:14px; }
        .s-warn-box { background:var(--amber-dim); border:1px solid rgba(251,191,36,.3); border-radius:7px; padding:9px 13px; font-size:11px; color:var(--amber); margin-bottom:14px; }
        .s-epi-lbl { font-size:11px; color:var(--text3); margin-bottom:7px; font-weight:600; letter-spacing:.05em; text-transform:uppercase; }
        .s-dtable { width:100%; border-collapse:collapse; font-size:12px; margin-bottom:18px; }
        .s-dtable th { background:var(--surface2); color:var(--text3); font-weight:600; padding:7px 10px; text-align:left; border-bottom:1px solid var(--border); font-size:10px; text-transform:uppercase; letter-spacing:.04em; }
        .s-dtable td { padding:8px 10px; border-bottom:1px solid var(--border); color:var(--text2); font-family:monospace; font-size:12px; }
        .s-dtable tr:last-child td { border-bottom:none; }
        .s-dtable tr:hover td { background:var(--surface2); }
        .s-td-name  { font-family:inherit !important; color:var(--text) !important; }
        .s-td-teal  { color:var(--teal) !important; font-weight:600; }
        .s-td-total { color:var(--teal) !important; font-weight:700 !important; background:rgba(45,212,191,.05) !important; }
        .s-status { display:flex; align-items:center; gap:10px; padding:11px 14px; border-radius:8px; font-size:13px; margin-bottom:8px; }
        .s-status-ok   { background:rgba(74,222,128,.08);  border:1px solid rgba(74,222,128,.25);  color:var(--green); }
        .s-status-fail { background:rgba(248,113,113,.08); border:1px solid rgba(248,113,113,.25); color:var(--red); }
        .s-root ::-webkit-scrollbar { width:4px; }
        .s-root ::-webkit-scrollbar-track { background:transparent; }
        .s-root ::-webkit-scrollbar-thumb { background:var(--border2); border-radius:4px; }
      `}</style>

      <div className="s-root">
        <header className="s-topbar">
          <span className="s-logo">ENERGY</span>
          <span className="s-slash">/</span>
          <span className="s-topbar-title">건물 에너지 간편 진단</span>
          <span className="s-topbar-badge">SIMULATOR v2</span>
        </header>

        <div className="s-body">
          {/* ── LEFT PANEL ── */}
          <div className="s-left">
            <div className="s-panel-section">
              <div className="s-panel-label">STEP 1 · 서비스 선택</div>
              <div className="s-svc-row">
                {(['re', 'zeb', 'epi'] as const).map(k => (
                  <button key={k} className={`s-svc-chip${svcs[k] ? ' on' : ''}`} onClick={() => toggleSvc(k)}>
                    {k === 're' ? '신재생' : k === 'zeb' ? 'ZEB' : 'EPI'}
                  </button>
                ))}
              </div>
            </div>

            <div className="s-panel-section" style={{ paddingBottom: 28 }}>
              <div className="s-panel-label">STEP 2 · 입력 정보</div>

              <div className={`s-fgroup${!needRZ ? ' dim' : ''}`}>
                <div className="s-flabel">지역 <span className="s-ftag s-ftag-r">신재생·ZEB</span></div>
                <select className="s-finput" value={region} onChange={e => setRegion(e.target.value)}>
                  {REGION_OPTIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>

              <div className={`s-fgroup${!needRZ ? ' dim' : ''}`}>
                <div className="s-flabel">건물 용도 <span className="s-ftag s-ftag-r">신재생·ZEB</span></div>
                <select className="s-finput" value={use} onChange={e => setUse(e.target.value)}>
                  <option value="공공용">업무시설 (공공용)</option>
                  <option value="상업용">업무시설 (상업용)</option>
                  <option value="교육">교육연구시설</option>
                </select>
              </div>

              <div className="s-fgroup">
                <div className="s-flabel">연면적 <span className="s-ftag s-ftag-r">공통</span></div>
                <input
                  className="s-finput" type="number" value={area} min={500} step={100}
                  onChange={e => setArea(parseFloat(e.target.value) || 12000)}
                />
              </div>

              <div className={`s-fgroup${!needRZ ? ' dim' : ''}`}>
                <div className="s-flabel">층수 <span className="s-ftag s-ftag-r">신재생·ZEB</span></div>
                <div className="s-stepper">
                  <button className="s-stepper-btn" onClick={() => setFloors(v => Math.max(1, v - 1))}>−</button>
                  <input className="s-stepper-val" type="number" value={floors} min={1}
                    onChange={e => setFloors(parseInt(e.target.value) || 1)} />
                  <button className="s-stepper-btn" onClick={() => setFloors(v => v + 1)}>+</button>
                </div>
              </div>

              <div className={`s-fgroup${!needGrade ? ' dim' : ''}`}>
                <div className="s-flabel">ZEB 목표 등급 <span className="s-ftag s-ftag-r">ZEB</span></div>
                <select className="s-finput" value={grade} onChange={e => setGrade(parseInt(e.target.value))}>
                  {[1, 2, 3, 4, 5].map(g => (
                    <option key={g} value={g}>{g}등급 ({ZEB_THR[g]}% 이상)</option>
                  ))}
                </select>
              </div>

              <div className={`s-fgroup${!needHvac ? ' dim' : ''}`}>
                <div className="s-flabel">설비 방식 <span className="s-ftag s-ftag-r">ZEB·EPI</span></div>
                <div className="s-toggle-row">
                  <button className={`s-toggle-opt${hvac === '개별식' ? ' on' : ''}`} onClick={() => setHvac('개별식')}>개별식</button>
                  <button className={`s-toggle-opt${hvac === '중앙식' ? ' on' : ''}`} onClick={() => setHvac('중앙식')}>중앙식</button>
                </div>
              </div>

              <button className="s-run-btn" onClick={run}>⚡ 진단 시작</button>
            </div>
          </div>

          {/* ── RIGHT PANEL ── */}
          <div className="s-right">
            {!result ? (
              <div className="s-empty">
                <div className="s-empty-icon">⚡</div>
                <p style={{ fontSize: 13, textAlign: 'center', lineHeight: 1.8 }}>
                  서비스를 선택하고 입력 정보를 입력한 뒤<br />
                  <strong style={{ color: '#94a3b8' }}>진단 시작</strong>을 눌러주세요
                </p>
              </div>
            ) : (
              <>
                {/* ── 신재생 섹션 ── */}
                {re && (() => {
                  const { rv, input } = result;
                  const pct    = rv.공급비율.toFixed(2);
                  const pctCls = rv.공급비율 >= 30 ? 'c-green' : rv.공급비율 >= 20 ? 'c-amber' : 'c-red';
                  const barW   = Math.min(rv.공급비율 / 30 * 100, 100).toFixed(1);
                  const barCls = rv.공급비율 >= 30 ? 'prog-teal' : rv.공급비율 >= 20 ? 'prog-amber' : 'prog-red';
                  return (
                    <>
                      <div className="s-res-section">
                        <div className="s-res-header">
                          <div className="s-res-icon" style={{ background: 'rgba(45,212,191,0.10)' }}>☀</div>
                          <div className="s-res-title">신재생 · 재생에너지 공급 비율</div>
                          <span className="s-res-sub">PV 최대 생산량 기준</span>
                        </div>
                        <div className="s-formula">
                          <span className="cm">// 예상 에너지사용량</span><br />
                          <span className="hl">예상사용량</span> = <span className="num">{fmt(input.area)}</span>㎡ × <span className="num">{rv.unitE}</span> kWh/㎡·yr × <span className="num">{rv.regionC}</span> ({regionLabel})<br />
                          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; = <span className="hl">{fmt(rv.예상사용량, 0)} kWh/yr</span><br /><br />
                          <span className="cm">// PV 지붕 (고정식 45°)</span><br />
                          건축면적 = {fmt(input.area)}/{input.floors} = <span className="num">{fmt(rv.건축면적, 1)}</span>㎡<br />
                          지붕면적 = {fmt(rv.건축면적, 1)} × 0.7 = <span className="num">{fmt(rv.지붕면적, 1)}</span>㎡ → <span className="num">{fmt(rv.지붕kW, 1)}</span> kW<br />
                          지붕생산 = {fmt(rv.지붕kW, 1)} × 1358 × 0.95 = <span className="hl">{fmt(rv.지붕생산, 0)}</span> kWh/yr<br /><br />
                          <span className="cm">// PV 입면 (BIPV 수직 90°)</span><br />
                          X=√{fmt(rv.건축면적, 1)}, Y=3.3×{input.floors} → 입면면적 = <span className="num">{fmt(rv.입면면적, 1)}</span>㎡ → <span className="num">{fmt(rv.입면kW, 1)}</span> kW<br />
                          입면생산 = {fmt(rv.입면kW, 1)} × 923 = <span className="hl">{fmt(rv.입면생산, 0)}</span> kWh/yr<br /><br />
                          <span className="cm">// 공급 비율</span><br />
                          비율 = ({fmt(rv.지붕생산, 0)} + {fmt(rv.입면생산, 0)}) / {fmt(rv.예상사용량, 0)} × 100 = <span className="hl">{pct}%</span>
                        </div>
                        <div className="s-cards">
                          <div className="s-card">
                            <div className="s-card-lbl">예상 에너지사용량</div>
                            <div className="s-card-val c-text">{fmt(rv.예상사용량 / 1000000, 2)}</div>
                            <div className="s-card-unit">GWh/yr ({fmt(rv.예상사용량, 0)} kWh)</div>
                          </div>
                          <div className="s-card">
                            <div className="s-card-lbl">PV 지붕 용량</div>
                            <div className="s-card-val c-blue">{fmt(rv.지붕kW, 1)}</div>
                            <div className="s-card-unit">kW → {fmt(rv.지붕생산 / 1000, 1)} MWh/yr</div>
                          </div>
                          <div className="s-card">
                            <div className="s-card-lbl">PV 입면(BIPV) 용량</div>
                            <div className="s-card-val c-blue">{fmt(rv.입면kW, 1)}</div>
                            <div className="s-card-unit">kW → {fmt(rv.입면생산 / 1000, 1)} MWh/yr</div>
                          </div>
                          <div className="s-card hl">
                            <div className="s-card-lbl">PV 총 생산량</div>
                            <div className="s-card-val c-teal">{fmt(rv.PV총생산 / 1000, 1)}</div>
                            <div className="s-card-unit">MWh/yr</div>
                            <div className="s-prog-wrap">
                              <div className="s-prog-bar prog-teal" style={{ width: `${Math.min(rv.공급비율 * 3, 100).toFixed(1)}%` }} />
                            </div>
                          </div>
                          <div className="s-card hl">
                            <div className="s-card-lbl">재생에너지 공급 비율</div>
                            <div className={`s-card-val ${pctCls}`}>{pct}</div>
                            <div className="s-card-unit">% (의무기준 30% 이상)</div>
                            <div className="s-prog-wrap">
                              <div className={`s-prog-bar ${barCls}`} style={{ width: `${barW}%` }} />
                            </div>
                          </div>
                        </div>
                      </div>
                      {(zeb || epi) && <div className="s-divider" />}
                    </>
                  );
                })()}

                {/* ── ZEB 섹션 ── */}
                {zeb && (() => {
                  const { rv, geo, zv, input } = result;
                  const gLabel = ['', '100%', '80%', '60%', '40%', '20%'][input.grade];
                  const pvPct  = Math.min(zv.PV달성률, 100).toFixed(1);
                  const gC     = EQ_COEF[input.use];
                  const gG     = GEO_COEF[input.use];
                  return (
                    <>
                      <div className="s-res-section">
                        <div className="s-res-header">
                          <div className="s-res-icon" style={{ background: 'rgba(96,165,250,0.10)' }}>⚡</div>
                          <div className="s-res-title">ZEB · Step 3 파라미터 주입 (신재생 → ZEB 동기화)</div>
                          <span className="s-res-sub">ZEB {input.grade}등급 · {gLabel} 이상</span>
                        </div>
                        <div className="s-sync-flow">
                          <span>① 신재생 계산 완료</span><span className="s-sync-arrow">→</span>
                          <span>② 에너지원별 환산</span><span className="s-sync-arrow">→</span>
                          <span>③ ZEB Step3 자동 주입</span><span className="s-sync-arrow">→</span>
                          <span>④ ZEB 성능 분석</span>
                        </div>

                        <div className="s-step3-wrap">
                          <div className="s-step3-title">기본 정보 <span className="s-badge badge-pass">초기 입력값 참조</span></div>
                          <div className="s-pfields">
                            <PF label="지역"         val={regionLabel}              cls="pv-pass" src="← 초기 입력값" />
                            <PF label="용도"         val={USE_LABEL[input.use]}     cls="pv-pass" src="← 초기 입력값" />
                            <PF label="연면적"       val={`${fmt(input.area)} ㎡`}  cls="pv-pass" src="← 초기 입력값" />
                            <PF label="층수"         val={`${input.floors} 층`}     cls="pv-pass" src="← 초기 입력값" />
                            <PF label="ZEB 목표 등급" val={`${input.grade}등급 (${gLabel}↑)`} cls="pv-pass" src="← 초기 입력값" />
                            <PF label="설비 방식"    val={input.hvac}               cls="pv-pass" src="← 초기 입력값" />
                          </div>
                        </div>

                        <div className="s-step3-wrap">
                          <div className="s-step3-title">태양광 PV · Row 1 — 지붕 (고정식) <span className="s-badge badge-calc">신재생 계산값 환산</span></div>
                          <div className="s-pfields">
                            <PF label="방위"   val="남"                             cls="pv-fixed" src="← 고정 호출값" />
                            <PF label="기울기" val="45° (지붕)"                     cls="pv-fixed" src="← 고정 호출값" />
                            <PF label="용량"   val={`${fmt(rv.지붕kW_zeb, 1)} kW`} cls="pv-calc"  src="← 지붕생산/(1358×0.95)" />
                            <PF label="효율"   val="20%"                            cls="pv-fixed" src="← 고정 호출값" />
                          </div>
                          <div className="s-step3-formula">
                            건축면적 {fmt(rv.건축면적, 1)}㎡ × 0.7 = {fmt(rv.지붕면적, 1)}㎡ →
                            용량 = {fmt(rv.지붕면적, 1)} × 0.20 = <b>{fmt(rv.지붕kW, 1)} kW</b> →
                            생산량 = {fmt(rv.지붕kW, 1)} × 1358 × 0.95 = <b>{fmt(rv.지붕생산, 0)} kWh/yr</b>
                          </div>
                        </div>

                        <div className="s-step3-wrap">
                          <div className="s-step3-title">태양광 PV · Row 2 — 입면 (BIPV) <span className="s-badge badge-calc">신재생 계산값 환산</span></div>
                          <div className="s-pfields">
                            <PF label="방위"   val="남"                             cls="pv-fixed" src="← 고정 호출값" />
                            <PF label="기울기" val="90° (수직)"                     cls="pv-fixed" src="← 고정 호출값" />
                            <PF label="용량"   val={`${fmt(rv.입면kW_zeb, 1)} kW`} cls="pv-calc"  src="← 입면생산/923" />
                            <PF label="효율"   val="20%"                            cls="pv-fixed" src="← 고정 호출값" />
                          </div>
                          <div className="s-step3-formula">
                            X=√{fmt(rv.건축면적, 1)}, Y=3.3×{input.floors} → 입면면적={fmt(rv.입면면적, 1)}㎡ →
                            용량 = {fmt(rv.입면면적, 1)} × 0.20 = <b>{fmt(rv.입면kW, 1)} kW</b> →
                            생산량 = {fmt(rv.입면kW, 1)} × 923 = <b>{fmt(rv.입면생산, 0)} kWh/yr</b>
                          </div>
                        </div>

                        <div className="s-step3-wrap">
                          <div className="s-step3-title">지열시스템 (수직밀폐형) <span className="s-badge badge-calc">용도별 선형회귀 자동 산출</span></div>
                          <div className="s-pfields">
                            <PF label="연료"      val="전기"                       cls="pv-fixed" src="← 환산 호출값" />
                            <PF label="난방 용량" val={`${fmt(geo.난방용량, 1)} kW`} cls="pv-calc" src={`${gG.hc}×난방요구량+${gG.hd}`} />
                            <PF label="냉방 용량" val={`${fmt(geo.냉방용량, 1)} kW`} cls="pv-calc" src={`${gG.cc}×냉방요구량+${gG.cd}`} />
                            <PF label="난방 COP"  val="4.2"                        cls="pv-fixed" src="← 디폴트 고정값" />
                            <PF label="냉방 COP"  val="5.0"                        cls="pv-fixed" src="← 디폴트 고정값" />
                            <PF label="보정계수"  val="1.26"                       cls="pv-fixed" src="← 고정값" />
                            <PF label="단위생산량" val="864 kWh/kW·yr"             cls="pv-fixed" src="← 고정값" />
                          </div>
                          <div className="s-step3-formula">
                            전체요구량 = {gC.a} × {fmt(input.area)} + {fmt(gC.b)} = <b>{fmt(geo.전체요구량, 0)} kWh/yr</b><br />
                            난방요구량 = {fmt(geo.전체요구량, 0)} × {(gC.hr * 100).toFixed(0)}% = <b>{fmt(geo.난방요구량, 0)} kWh/yr</b><br />
                            냉방요구량 = {fmt(geo.전체요구량, 0)} × {(gC.cr * 100).toFixed(0)}% = <b>{fmt(geo.냉방요구량, 0)} kWh/yr</b><br />
                            난방용량 = {gG.hc} × {fmt(geo.난방요구량, 0)} + {gG.hd} = <b>{fmt(geo.난방용량, 1)} kW</b><br />
                            냉방용량 = {gG.cc} × {fmt(geo.냉방요구량, 0)} + {gG.cd} = <b>{fmt(geo.냉방용량, 1)} kW</b>
                          </div>
                        </div>

                        <div className="s-step3-wrap">
                          <div className="s-step3-title">연료전지 <span className="s-badge badge-fixed">유형·효율 고정값</span></div>
                          <div className="s-pfields">
                            <PF label="유형"       val="SOFC"              cls="pv-fixed" src="← 환산 호출값" />
                            <PF label="열효율"     val="53%"               cls="pv-fixed" src="← 환산 호출값" />
                            <PF label="발전효율"   val="35.5%"             cls="pv-fixed" src="← 환산 호출값" />
                            <PF label="보정계수"   val="8.71"              cls="pv-fixed" src="← 고정값" />
                            <PF label="단위생산량" val="9,198 kWh/kW·yr"  cls="pv-fixed" src="← 고정값" />
                            <PF label="용량 (kW)"  val="유저 직접 입력"   cls="pv-user"  src="설치공간·급탕 검토" />
                          </div>
                        </div>

                        <div style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', marginBottom: 12, marginTop: 4 }}>
                          ZEB 달성 분석 결과
                        </div>
                        <div className="s-cards">
                          <div className="s-card">
                            <div className="s-card-lbl">예상 에너지사용량</div>
                            <div className="s-card-val c-text">{fmt(rv.예상사용량 / 1000, 1)}</div>
                            <div className="s-card-unit">MWh/yr</div>
                          </div>
                          <div className="s-card hl-amber">
                            <div className="s-card-lbl">ZEB {input.grade}등급 필요 생산량</div>
                            <div className="s-card-val c-amber">{fmt(zv.필요생산량 / 1000, 1)}</div>
                            <div className="s-card-unit">MWh/yr ({gLabel})</div>
                          </div>
                          <div className="s-card hl-blue">
                            <div className="s-card-lbl">PV 총 생산량</div>
                            <div className="s-card-val c-blue">{fmt(rv.PV총생산 / 1000, 1)}</div>
                            <div className="s-card-unit">MWh/yr (지붕+입면)</div>
                          </div>
                        </div>
                        <div className={`s-status ${zv.PV충족 ? 's-status-ok' : 's-status-fail'}`}>
                          {zv.PV충족
                            ? `✓ ZEB ${input.grade}등급 달성 가능 (PV 단독)`
                            : `✗ PV 단독 불가 · 지열 또는 연료전지 추가 필요 (부족량 ${fmt(zv.부족량 / 1000, 1)} MWh/yr)`}
                        </div>
                        <div style={{ fontSize: 11, color: '#64748b', marginTop: 6 }}>
                          PV 달성률 {pvPct}%
                          <div className="s-prog-wrap" style={{ marginTop: 5 }}>
                            <div className={`s-prog-bar ${zv.PV충족 ? 'prog-teal' : 'prog-amber'}`} style={{ width: `${pvPct}%` }} />
                          </div>
                        </div>
                      </div>
                      {epi && <div className="s-divider" />}
                    </>
                  );
                })()}

                {/* ── EPI 섹션 ── */}
                {epi && (() => {
                  const { ev, input } = result;
                  const { 규모, idx, coef, 기계, 건축합계, 기계합계, 전기합계, EPI총점 } = ev;
                  return (
                    <div className="s-res-section">
                      <div className="s-res-header">
                        <div className="s-res-icon" style={{ background: 'rgba(251,191,36,0.10)' }}>📊</div>
                        <div className="s-res-title">EPI · 기준 모델 추천</div>
                        <span className="s-res-sub">배점계수 {coef} 적용</span>
                      </div>
                      <div className="s-epi-type-badge">
                        {규모} (연면적 {규모 === '대형' ? '≥' : '<'} 3,000㎡) · {input.hvac}
                        &nbsp;→&nbsp; EPI 타입: {규모}_{input.hvac}
                      </div>
                      <div className="s-warn-box">
                        ⚠ 신재생 부문(난방/냉방/급탕/조명 신재생)은 배점계수 미정의로 아래 합계에서 제외됩니다.
                      </div>
                      <div className="s-cards" style={{ marginBottom: 20 }}>
                        <div className="s-card">
                          <div className="s-card-lbl">건축 부문</div>
                          <div className="s-card-val c-blue">{건축합계.toFixed(1)}</div>
                          <div className="s-card-unit">점 (기본배점 × {coef})</div>
                        </div>
                        <div className="s-card">
                          <div className="s-card-lbl">기계 부문</div>
                          <div className="s-card-val c-blue">{기계합계.toFixed(1)}</div>
                          <div className="s-card-unit">점 ({input.hvac} 항목)</div>
                        </div>
                        <div className="s-card">
                          <div className="s-card-lbl">전기 부문</div>
                          <div className="s-card-val c-blue">{전기합계.toFixed(1)}</div>
                          <div className="s-card-unit">점</div>
                        </div>
                        <div className="s-card hl">
                          <div className="s-card-lbl">EPI 기준 모델 총점</div>
                          <div className="s-card-val c-teal">{EPI총점.toFixed(1)}</div>
                          <div className="s-card-unit">점 (신재생 제외)</div>
                        </div>
                      </div>
                      <EPITable title="건축 부문"                  items={EPI_ARCH} idx={idx} coef={coef} />
                      <EPITable title={`기계 부문 (${input.hvac})`} items={기계}    idx={idx} coef={coef} />
                      <EPITable title="전기 부문"                  items={EPI_ELEC} idx={idx} coef={coef} />
                    </div>
                  );
                })()}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
