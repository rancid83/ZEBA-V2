export type ScenarioId = 'A' | 'B' | 'C';
export type ScenarioStatus = 'draft' | 'saved' | 'final';

export type Spec = {
  passive: { wallU: number; windowU: number; roofU: number; floorU: number };
  active: { ehpCOP: number; ventilationEff: number; lightingLPD: number; boilerEff: number };
  renewable: { pvArea: number; pvEff: number; fuelCellKW: number };
};

export type Result = {
  zebGrade: number;
  selfSuff: number;
  prod: number;
  demand: number;
  costTotal: number;
  costBreakdown: { passive: number; active: number; renewable: number };
};

export type Scenario = {
  id: ScenarioId;
  name: string;
  isStandard: boolean;
  status: ScenarioStatus;
  note: string;
  savedAt?: string;
  spec: Spec;
  result: Result;
  updatedAt: string;
  analyzed: boolean;
};

export type SavedScenarioRecord = {
  recordId: string;
  sourceId: ScenarioId;
  name: string;
  status: ScenarioStatus;
  savedAt: string;
  note: string;
  snapshot: Scenario;
};

/** 프로젝트에 저장되는 ZEB 다중시나리오 UI 상태 */
export type ZebMultiScenarioWorkspaceState = {
  compareMode: boolean;
  baseline: ScenarioId;
  selected: ScenarioId;
  managerNote: string;
  scenarios: Scenario[];
  savedLibrary: SavedScenarioRecord[];
  selectedSavedRecordId: string;
};
