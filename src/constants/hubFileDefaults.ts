/** `data/*.json` 이 없을 때 서버가 생성하는 기본값 — 클라이언트에서도 폴백으로 사용 가능 */

export const defaultConsultingHubData = {
  consultingCompanies: [
    {
      id: 1,
      name: 'A 에너지컨설팅',
      fields: ['ZEB 인증', '건축물의 에너지절약설계검토 (EPI)'],
      response: '평균 3시간',
      projects: 12,
      coffeeChat: true,
      intro: '공공업무 및 ZEB 예비인증 대응 경험이 많은 기업',
    },
    {
      id: 2,
      name: 'B 녹색건축기술',
      fields: ['지자체 녹색건축설계 기준 검토(신재생에너지설비 의무 설치 비율)'],
      response: '평균 5시간',
      projects: 8,
      coffeeChat: true,
      intro: '서울시 녹색건축물 설계 기준 및 태양광·지열 검토 특화',
    },
    {
      id: 3,
      name: 'C 인증솔루션랩',
      fields: ['그 밖의 인증', 'ZEB 인증'],
      response: '평균 1일',
      projects: 15,
      coffeeChat: false,
      intro: '녹색건축인증, BF 인증, 저영향개발 사전협의 등 복합 대응 가능',
    },
  ],
  specialtyOptions: [
    'ZEB 인증',
    '지자체 녹색건축설계 기준 검토(신재생에너지설비 의무 설치 비율)',
    '건축물의 에너지절약설계검토 (EPI)',
    '그 밖의 인증',
  ],
  requestTypeOptions: ['커피챗 보내기', '컨설팅 계약 요청'],
  responseModeOptions: [
    { id: 'coffeechat', label: '커피챗 회신' },
    { id: 'contract', label: '계약 검토 회신' },
  ],
  uiDefaults: {
    requestLogs: [
      {
        id: 1,
        companyId: 1,
        projectId: 'seed-project',
        companyName: 'A 에너지컨설팅',
        type: '커피챗 보내기' as const,
        opinion: '예비인증 가능 범위와 예상 일정 확인 요청',
        status: '요청' as const,
      },
    ],
    chatMessages: [
      {
        author: '설계사',
        text: '초기 허가 대응 기준으로 검토 가능 범위를 먼저 확인하고 싶습니다.',
      },
      {
        author: '컨설팅 기업',
        text: '가능합니다. ZEB 예비인증 범위와 EPI 범위를 나눠서 설명드리겠습니다.',
      },
    ],
    uploadedFiles: ['배치도_v1.pdf', '에너지개요_초안.xlsx'],
    requestSummary: '목표 ZEB 3등급 및 초기 허가 대응 검토 필요',
    selectedSpecialties: ['ZEB 인증', '건축물의 에너지절약설계검토 (EPI)'],
  },
};

export const defaultRenewableHubData = {
  regionFactor: {
    서울: 1.0,
    인천: 1.02,
    대전: 1.01,
    광주: 0.99,
    대구: 0.98,
    부산: 0.97,
    강원: 1.06,
    제주: 0.96,
    경기: 1.0,
  },
  unitEnergyUse: {
    업무시설: 120,
    교육연구시설: 110,
    공동주택: 95,
    판매시설: 140,
    문화집회시설: 130,
  },
  unitProduction: {
    태양광: { unit: 1250, adj: 1.0 },
    지열히트펌프: { unit: 850, adj: 0.95 },
    연료전지: { unit: 4200, adj: 0.92 },
  },
  donutColors: ['#0f766e', '#14b8a6', '#f59e0b'],
};
