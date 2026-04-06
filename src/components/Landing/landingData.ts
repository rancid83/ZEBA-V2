import {
  SafetyCertificateOutlined,
  FileTextOutlined,
  LinkOutlined,
} from '@ant-design/icons';

/** 랜딩 헤더·푸터 네비 → 슬라이드 덱 시작 인덱스 (PresentationSlides) */
export type LandingNavSlideSection = 'service' | 'diagnosis' | 'flow';

export const landingNavSlideStart: Record<LandingNavSlideSection, number> = {
  service: 0,
  diagnosis: 2,
  flow: 3,
};

export const platformCards = [
  {
    icon: SafetyCertificateOutlined,
    title: '설계 판단',
    body: '설계 초기 단계에서 ZEB 목표 등급과 법규 리스크를 먼저 판단합니다.',
  },
  {
    icon: FileTextOutlined,
    title: '사전 검토',
    body: 'EPI와 신재생 의무비율을 사후 대응이 아닌 설계 도구로 구조화합니다.',
  },
  {
    icon: LinkOutlined,
    title: '실행 연결',
    body: '판단 이후의 용역 이행은 검증된 전문가 연계와 내역 전달로 이어집니다.',
  },
];

export const flow = [
  '사업 개요 입력',
  '표준모델 생성',
  '법규 여유율 확인',
  '설비 조합 비교',
  '컨설턴트 연결',
];

export const services = [
  {
    title: 'ZEB 예측',
    body: '랜딩의 간편 예측은 체험형 판단 서비스이고, 프로젝트 기반 예측은 설계 의사결정 서비스입니다.',
    badge: '핵심 기능',
  },
  {
    title: '법규 검토',
    body: 'EPI와 신재생 의무비율을 설계 단계에서 미리 검토해 세움터 이전 판단을 돕습니다.',
    badge: '사전 검토',
  },
  {
    title: '실행 지원',
    body: '전문가 연계와 설계 내역 전달을 통해 판단 이후의 실무 수행이 자연스럽게 이어집니다.',
    badge: '실무 수행',
  },
];

export const specRows = [
  {
    category: '패시브',
    items: 4,
    summary: '외피 성능 기준 충족',
    details: ['외벽 열관류율 기준 반영', '창호 성능 기준 반영', '단열 구성 표준화'],
  },
  {
    category: '액티브',
    items: 5,
    summary: '설비 효율 중심 구성',
    details: ['냉난방 효율 기준 반영', '급탕·환기 조건 검토', '설비 효율 보정값 적용'],
  },
  {
    category: '신재생',
    items: 4,
    summary: '태양광 중심 제안',
    details: ['태양광 우선 조합 제안', '목표 등급 기준 자립률 반영', '기본 의무비율 판단 지원'],
  },
];

export const serviceStructureList = [
  [
    '01 ZEB 간편 예측',
    '랜딩에서 빠르게 등급 가능성과 방향성을 확인하는 체험형 판단 서비스',
  ],
  [
    '02 프로젝트 기반 ZEB 예측',
    '표준모델 카드 생성, 시나리오 복제, 다중 비교가 가능한 설계 의사결정 서비스',
  ],
  [
    '03 법규 사전 검토',
    'EPI와 신재생 의무비율을 설계 단계에서 미리 검토하는 구조',
  ],
  [
    '04 전문가 연계 및 전달',
    '판단 이후 용역 이행을 위한 내역 전달과 실무 길잡이 제공',
  ],
];

export const collabGridItems = [
  ['현 단계', '설계 · 인허가 중심'],
  ['잠재 기능', '협업 · 기록 · 전달'],
  ['장기 방향', '공정 전반 락인 구조'],
];

export const collabOutlookItems = [
  '설계 판단 결과가 프로젝트 맥락으로 남음',
  '법규 검토와 실행 이력이 다음 단계로 전달됨',
  '협업 스페이스와 아카이빙이 향후 락인 구조를 형성함',
];

export function computeSummary(grossFloorArea: string, floors: string) {
  const areaNum = Number(grossFloorArea || 12000);
  const floorNum = Number(floors || 10);
  const selfSufficiency = Math.max(
    24,
    Math.min(48, Math.round(30 + areaNum / 1300 - floorNum * 0.2))
  );
  const predictedGrade =
    selfSufficiency >= 40
      ? '4등급'
      : selfSufficiency >= 28
        ? '5등급'
        : '등급 미달 우려';
  const production = selfSufficiency >= 40 ? 80.5 : 33.8;
  const demand = selfSufficiency >= 40 ? 120.5 : 129.0;
  return {
    predictedGrade,
    selfSufficiency,
    production,
    demand,
    stability: selfSufficiency >= 40 ? '달성 가능' : '추가 검토 필요',
    guidance:
      selfSufficiency >= 40
        ? '표준모델 기준으로 목표 등급 달성이 가능한 수준입니다. 상세 시나리오 비교는 프로젝트 생성 후 진행됩니다.'
        : '목표 등급 달성을 위해 신재생 설비 또는 액티브 성능에 대한 추가 검토가 필요합니다.',
  };
}

export function computeBars(summary: ReturnType<typeof computeSummary>) {
  return [
    {
      label: '법규 기준',
      subtitle: '지자체 에너지 절약 기준',
      production: 8.1,
      demand: 185.8,
      grade: '-',
      ratio: 4.2,
    },
    {
      label: '의무 등급',
      subtitle: '[STEP-1] 의무 등급',
      production: 33.8,
      demand: 129.0,
      grade: '5등급',
      ratio: 20.8,
    },
    {
      label: '목표 등급',
      subtitle: '[STEP-2] 목표 등급',
      production: summary.production,
      demand: summary.demand,
      grade: summary.predictedGrade,
      ratio: summary.selfSufficiency,
    },
  ];
}
