/**
 * Frontend의 용도(usage) + 설비방식(officeSystem) 입력을
 * 백엔드 알고리즘이 인식하는 building_type enum 값으로 정규화한다.
 *
 * 백엔드 매핑: api/main.py의 BUILDING_CODE_DIRS 키와 일치해야 함.
 *   - 초중고
 *   - 업무시설_개별식
 *   - 업무시설_중앙식
 */

export type BuildingType = '초중고' | '업무시설_개별식' | '업무시설_중앙식';

export const BUILDING_TYPES: readonly BuildingType[] = [
  '초중고',
  '업무시설_개별식',
  '업무시설_중앙식',
] as const;

export type OfficeSystem = 'individual' | 'central';

export function resolveBuildingType(
  usage: string | undefined | null,
  officeSystem: OfficeSystem | undefined | null,
): BuildingType {
  const u = (usage ?? '').trim();
  if (u.startsWith('업무시설')) {
    return officeSystem === 'central' ? '업무시설_중앙식' : '업무시설_개별식';
  }
  return '초중고';
}

export function isBuildingType(value: unknown): value is BuildingType {
  return typeof value === 'string' && (BUILDING_TYPES as readonly string[]).includes(value);
}
