'use client';

import React, { useMemo, useState } from 'react';

type ProjectOption = {
  id: string;
  name: string;
  region: string;
  use: string;
  gfa: number;
  floors: number;
};

type ConsultingCompany = {
  id: number;
  name: string;
  fields: string[];
  response: string;
  projects: number;
  coffeeChat: boolean;
  intro: string;
};

type RequestCard = {
  id: number;
  projectId: string;
  project: string;
  region: string;
  use: string;
  gfa: number;
  floors: number;
  visibility: '공개 의뢰' | '선택 공개';
  specialties: string[];
  customSpecialty: string;
  summary: string;
};

type RequestLog = {
  id: number;
  companyId: number;
  projectId: string | number;
  companyName: string;
  type: '커피챗 보내기' | '컨설팅 계약 요청';
  opinion: string;
  status: '요청' | '응답 완료';
};

type ChatMessage = { author: string; text: string };

const consultingCompanies: ConsultingCompany[] = [
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
];

const specialtyOptions = [
  'ZEB 인증',
  '지자체 녹색건축설계 기준 검토(신재생에너지설비 의무 설치 비율)',
  '건축물의 에너지절약설계검토 (EPI)',
  '그 밖의 인증',
];

const requestTypeOptions: Array<'커피챗 보내기' | '컨설팅 계약 요청'> = [
  '커피챗 보내기',
  '컨설팅 계약 요청',
];

const responseModeOptions = [
  { id: 'coffeechat', label: '커피챗 회신' },
  { id: 'contract', label: '계약 검토 회신' },
] as const;

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-teal-100 bg-white shadow-sm ${className}`.trim()}>
      {children}
    </div>
  );
}

function SectionTitle({ title, desc }: { title: string; desc?: string }) {
  return (
    <div className="mb-3">
      <div className="text-sm font-semibold text-slate-900">{title}</div>
      {desc ? <div className="mt-1 text-xs text-slate-500">{desc}</div> : null}
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <Card className="p-4">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="mt-2 text-xl font-semibold text-slate-900">{value}</div>
    </Card>
  );
}

function Pill({
  children,
  active = false,
  onClick,
}: {
  children: React.ReactNode;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-xs transition ${
        active
          ? 'bg-teal-700 text-white'
          : 'border border-teal-100 bg-white text-slate-600 hover:bg-teal-50'
      }`}
    >
      {children}
    </button>
  );
}

function SoftBadge({
  children,
  active = false,
  onClick,
}: {
  children: React.ReactNode;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] transition ${
        active
          ? 'border-teal-700 bg-teal-700 text-white'
          : 'border-teal-100 bg-teal-50 text-slate-600 hover:bg-slate-100'
      }`}
    >
      {children}
    </button>
  );
}

function InfoBadge({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] ${
        dark ? 'border-white/20 bg-white/10 text-white' : 'border-teal-100 bg-teal-50 text-slate-600'
      }`}
    >
      {children}
    </span>
  );
}

function Modal({
  open,
  title,
  subtitle,
  children,
  onClose,
}: {
  open: boolean;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-teal-900/20 p-4">
      <div className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-teal-100 px-6 py-4">
          <div>
            <div className="text-base font-semibold text-slate-900">{title}</div>
            {subtitle ? <div className="mt-1 text-xs text-slate-500">{subtitle}</div> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-teal-100 px-3 py-1.5 text-xs text-slate-600"
          >
            닫기
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

function buildRequestCardData({
  selectedProject,
  selectedSpecialties,
  customSpecialty,
  visibility,
  requestSummary,
}: {
  selectedProject: ProjectOption | null;
  selectedSpecialties: string[];
  customSpecialty: string;
  visibility: 'public' | 'selected';
  requestSummary: string;
}): RequestCard | null {
  if (!selectedProject) return null;
  return {
    id: Date.now(),
    projectId: selectedProject.id,
    project: selectedProject.name,
    region: selectedProject.region,
    use: selectedProject.use,
    gfa: selectedProject.gfa,
    floors: selectedProject.floors,
    visibility: visibility === 'public' ? '공개 의뢰' : '선택 공개',
    specialties: selectedSpecialties,
    customSpecialty,
    summary: requestSummary,
  };
}

function formatProjectMeta(project: ProjectOption | null) {
  if (!project) return '프로젝트 정보 없음';
  return `${project.region} · ${project.use} · ${project.gfa.toLocaleString()}㎡ · ${project.floors}F`;
}

function getCompanyName(companyId: number | null) {
  return consultingCompanies.find((item) => item.id === companyId)?.name || '미지정 기업';
}

export default function ConsultingConnection({ currentProject }: { currentProject: ProjectOption }) {
  const projectsMock: ProjectOption[] = useMemo(
    () => [
      currentProject,
      {
        id: 'p-002',
        name: '동탄 교육연구시설',
        region: '경기',
        use: '교육연구시설',
        gfa: 9200,
        floors: 7,
      },
      {
        id: 'p-003',
        name: '여의도 공동주택(가칭)',
        region: '서울',
        use: '공동주택',
        gfa: 18500,
        floors: 20,
      },
    ],
    [currentProject],
  );

  const [userType, setUserType] = useState<'architect' | 'consulting'>('architect');
  const [architectTab, setArchitectTab] = useState<'search' | 'request' | 'collab'>('search');
  const [consultingTab, setConsultingTab] = useState<'inbox' | 'response' | 'collab'>('inbox');

  const [projectId, setProjectId] = useState(projectsMock[0].id);
  const selectedProject = useMemo(
    () => projectsMock.find((project) => project.id === projectId) || null,
    [projectId, projectsMock],
  );

  const [visibility, setVisibility] = useState<'public' | 'selected'>('public');
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([
    'ZEB 인증',
    '건축물의 에너지절약설계검토 (EPI)',
  ]);
  const [customSpecialty, setCustomSpecialty] = useState('');
  const [requestSummary, setRequestSummary] = useState(
    '목표 ZEB 3등급 및 초기 허가 대응 검토 필요',
  );
  const [requestCards, setRequestCards] = useState<RequestCard[]>([]);
  const [activeRequestId, setActiveRequestId] = useState<number | null>(null);
  const [searchTriggeredRequestId, setSearchTriggeredRequestId] = useState<number | null>(null);

  const [selectedCompanyIds, setSelectedCompanyIds] = useState<number[]>([]);
  const [quoteMode, setQuoteMode] = useState<'compare'>('compare');

  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [requestTargetCompanyId, setRequestTargetCompanyId] = useState<number | null>(null);
  const [selectedRequestType, setSelectedRequestType] =
    useState<'커피챗 보내기' | '컨설팅 계약 요청'>('커피챗 보내기');
  const [requestOpinion, setRequestOpinion] = useState('검토 가능 범위와 예상 일정 확인 요청');
  const [requestLogs, setRequestLogs] = useState<RequestLog[]>([
    {
      id: 1,
      companyId: 1,
      projectId: 'seed-project',
      companyName: 'A 에너지컨설팅',
      type: '커피챗 보내기',
      opinion: '예비인증 가능 범위와 예상 일정 확인 요청',
      status: '요청',
    },
  ]);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      author: '설계사',
      text: '초기 허가 대응 기준으로 검토 가능 범위를 먼저 확인하고 싶습니다.',
    },
    {
      author: '컨설팅 기업',
      text: '가능합니다. ZEB 예비인증 범위와 EPI 범위를 나눠서 설명드리겠습니다.',
    },
  ]);
  const [draftMessage, setDraftMessage] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState(['배치도_v1.pdf', '에너지개요_초안.xlsx']);
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null);
  const [responseMode, setResponseMode] = useState<'coffeechat' | 'contract'>('coffeechat');

  const activeRequest =
    requestCards.find((request) => request.id === activeRequestId) || requestCards[0] || null;

  const searchableSpecialties = useMemo(() => {
    if (!activeRequest) return [];
    const base = activeRequest.specialties.filter((item) => item !== '그 밖의 인증');
    if (activeRequest.specialties.includes('그 밖의 인증') && activeRequest.customSpecialty.trim()) {
      return [...base, activeRequest.customSpecialty.trim()];
    }
    return base;
  }, [activeRequest]);

  const filteredCompanies = useMemo(() => {
    if (!activeRequest || searchTriggeredRequestId !== activeRequest.id) return [];
    if (searchableSpecialties.length === 0) return [];
    return consultingCompanies.filter(
      (company) =>
        searchableSpecialties.some((specialty) =>
          company.fields.some((field) => field.includes(specialty) || specialty.includes(field)),
        ) ||
        (activeRequest.specialties.includes('그 밖의 인증') &&
          company.fields.includes('그 밖의 인증')),
    );
  }, [activeRequest, searchableSpecialties, searchTriggeredRequestId]);

  const selectedCompanies = useMemo(
    () => filteredCompanies.filter((company) => selectedCompanyIds.includes(company.id)),
    [filteredCompanies, selectedCompanyIds],
  );

  const inboxRequests = useMemo(() => {
    return requestCards.map((request) => {
      const relatedLogs = requestLogs.filter((log) => log.projectId === request.id);
      const latestLog = relatedLogs[0] || null;
      return {
        id: request.id,
        project: request.project,
        specialties: request.specialties,
        customSpecialty: request.customSpecialty,
        summary: request.summary,
        visibility: request.visibility,
        stage: relatedLogs.length === 0 ? '응답 대기' : latestLog.status,
        logs: relatedLogs,
      };
    });
  }, [requestCards, requestLogs]);

  const selectedInboxRequest =
    inboxRequests.find((request) => request.id === selectedRequestId) || inboxRequests[0] || null;

  const selectedInboxProject = useMemo(() => {
    if (!selectedInboxRequest) return null;
    const requestCard = requestCards.find((item) => item.id === selectedInboxRequest.id);
    if (!requestCard) return null;
    return {
      id: requestCard.projectId,
      name: requestCard.project,
      region: requestCard.region,
      use: requestCard.use,
      gfa: requestCard.gfa,
      floors: requestCard.floors,
    };
  }, [selectedInboxRequest, requestCards]);

  const toggleSpecialty = (option: string) => {
    setSelectedSpecialties((prev) =>
      prev.includes(option) ? prev.filter((item) => item !== option) : [...prev, option],
    );
  };

  const toggleCompanySelection = (companyId: number) => {
    setSelectedCompanyIds((prev) =>
      prev.includes(companyId) ? prev.filter((id) => id !== companyId) : [...prev, companyId],
    );
  };

  const buildRequestCard = () => {
    if (selectedSpecialties.length === 0) return;
    const nextCard = buildRequestCardData({
      selectedProject,
      selectedSpecialties,
      customSpecialty,
      visibility,
      requestSummary,
    });
    if (!nextCard) return;
    setRequestCards((prev) => [nextCard, ...prev]);
    setActiveRequestId(nextCard.id);
    setSearchTriggeredRequestId(nextCard.id);
    setSelectedRequestId(nextCard.id);
    setSelectedCompanyIds([]);
  };

  const moveToRequestCompare = () => {
    if (!activeRequest || selectedCompanyIds.length === 0) return;
    setArchitectTab('request');
    setQuoteMode('compare');
  };

  const openRequestModal = (companyId: number) => {
    setRequestTargetCompanyId(companyId);
    setSelectedRequestType('커피챗 보내기');
    setRequestOpinion('검토 가능 범위와 예상 일정 확인 요청');
    setRequestModalOpen(true);
  };

  const submitRequest = () => {
    const company = consultingCompanies.find((item) => item.id === requestTargetCompanyId);
    if (!company || !activeRequest || !selectedRequestType || !requestOpinion.trim()) return;
    const log: RequestLog = {
      id: Date.now(),
      companyId: company.id,
      projectId: activeRequest.id,
      companyName: company.name,
      type: selectedRequestType,
      opinion: requestOpinion,
      status: '요청',
    };
    setRequestLogs((prev) => [log, ...prev]);
    setChatMessages((prev) => [
      ...prev,
      { author: '설계사', text: `[${company.name}] ${selectedRequestType} · ${requestOpinion}` },
    ]);
    setSelectedRequestId(activeRequest.id);
    setRequestModalOpen(false);
  };

  const sendConsultingResponse = () => {
    if (!selectedInboxRequest) return;
    setRequestLogs((prev) =>
      prev.map((log) =>
        log.projectId === selectedInboxRequest.id ? { ...log, status: '응답 완료' } : log,
      ),
    );
    setChatMessages((prev) => [
      ...prev,
      {
        author: '컨설팅 기업',
        text:
          responseMode === 'coffeechat'
            ? '커피챗 가능 일정과 검토 범위를 회신했습니다.'
            : '계약 검토 가능 범위와 예상 견적 조건을 회신했습니다.',
      },
    ]);
  };

  const sendMessage = () => {
    if (!draftMessage.trim()) return;
    setChatMessages((prev) => [
      ...prev,
      { author: userType === 'architect' ? '설계사' : '컨설팅 기업', text: draftMessage },
    ]);
    setDraftMessage('');
  };

  const addMockFile = () => {
    const next = userType === 'architect' ? '설계도면_업로드.pdf' : '검토의견서_회신.docx';
    setUploadedFiles((prev) => [next, ...prev]);
  };

  const selectedProjectMeta = formatProjectMeta(selectedProject);
  const selectedInboxProjectMeta = selectedInboxProject
    ? formatProjectMeta(selectedInboxProject)
    : '프로젝트 정보 없음';

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 rounded-3xl border border-teal-100 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-xl font-semibold text-slate-900">ZEBA 컨설팅 연결 와이어프레임</div>
            <div className="mt-1 text-sm text-slate-500">
              용역 카드 생성 → 기업 선택 → 의뢰 요청 → 응답 및 협업으로 이어지는 구조
            </div>
          </div>
          <div className="flex gap-2">
            <Pill active={userType === 'architect'} onClick={() => setUserType('architect')}>
              설계사 화면
            </Pill>
            <Pill active={userType === 'consulting'} onClick={() => setUserType('consulting')}>
              컨설팅 기업 화면
            </Pill>
          </div>
        </div>

        <Modal
          open={requestModalOpen}
          title="의뢰 액션"
          subtitle="의뢰 분류를 선택하고 내용을 입력한 뒤 요청 버튼으로 전송"
          onClose={() => setRequestModalOpen(false)}
        >
          <div className="space-y-5">
            <div className="rounded-2xl bg-teal-50 p-4 text-sm text-slate-700">
              대상 기업:{' '}
              <span className="font-semibold text-slate-900">{getCompanyName(requestTargetCompanyId)}</span>
            </div>
            <div>
              <div className="mb-2 text-xs font-medium text-slate-500">의뢰 분류</div>
              <div className="flex flex-wrap gap-2">
                {requestTypeOptions.map((item) => (
                  <SoftBadge
                    key={item}
                    active={selectedRequestType === item}
                    onClick={() => setSelectedRequestType(item)}
                  >
                    {item}
                  </SoftBadge>
                ))}
              </div>
            </div>
            <div>
              <div className="mb-2 text-xs font-medium text-slate-500">의뢰 내용</div>
              <textarea
                value={requestOpinion}
                onChange={(e) => setRequestOpinion(e.target.value)}
                className="min-h-[140px] w-full rounded-2xl border border-teal-100 p-4 text-sm outline-none focus:border-teal-400"
                placeholder="실무 질의 또는 계약 요청 내용을 입력하세요"
              />
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={submitRequest}
                className="rounded-xl bg-teal-700 px-4 py-2 text-sm text-white"
              >
                요청
              </button>
            </div>
          </div>
        </Modal>

        {userType === 'architect' ? (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-4">
              <Kpi label="생성된 용역 카드" value={`${requestCards.length}개`} />
              <Kpi label="검색된 컨설팅 기업" value={`${filteredCompanies.length}개`} />
              <Kpi label="선택된 기업" value={`${selectedCompanyIds.length}개`} />
              <Kpi label="의뢰 요청" value={`${requestLogs.length}건`} />
            </div>

            <div className="flex gap-2">
              <Pill active={architectTab === 'search'} onClick={() => setArchitectTab('search')}>
                depth 1 검색
              </Pill>
              <Pill active={architectTab === 'request'} onClick={() => setArchitectTab('request')}>
                depth 2 의뢰
              </Pill>
              <Pill active={architectTab === 'collab'} onClick={() => setArchitectTab('collab')}>
                depth 3 협업
              </Pill>
            </div>

            {architectTab === 'search' ? (
              <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
                <Card className="p-5">
                  <SectionTitle
                    title="용역 내역 입력"
                    desc="프로젝트를 선택하면 기본 정보가 자동으로 연결됩니다."
                  />
                  <div className="space-y-4">
                    <div>
                      <div className="mb-2 text-xs font-medium text-slate-500">프로젝트</div>
                      <select
                        value={projectId}
                        onChange={(e) => setProjectId(e.target.value)}
                        className="w-full rounded-xl border border-teal-100 px-3 py-2 text-sm outline-none focus:border-teal-400"
                      >
                        {projectsMock.map((project) => (
                          <option key={project.id} value={project.id}>
                            {project.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="rounded-2xl border border-teal-100 bg-teal-50 p-4">
                      <div className="text-xs font-medium text-slate-500">불러온 기본 정보</div>
                      <div className="mt-2 text-sm font-semibold text-slate-900">{selectedProject?.name}</div>
                      <div className="mt-1 text-xs text-slate-600">{selectedProjectMeta}</div>
                    </div>

                    <div>
                      <div className="mb-2 text-xs font-medium text-slate-500">의뢰 공개 범위</div>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setVisibility('selected')}
                          className={`rounded-xl border px-3 py-2 text-sm ${
                            visibility === 'selected'
                              ? 'border-teal-700 bg-teal-700 text-white'
                              : 'border-teal-100 bg-white text-slate-700'
                          }`}
                        >
                          선택 공개
                        </button>
                        <button
                          type="button"
                          onClick={() => setVisibility('public')}
                          className={`rounded-xl border px-3 py-2 text-sm ${
                            visibility === 'public'
                              ? 'border-teal-700 bg-teal-700 text-white'
                              : 'border-teal-100 bg-white text-slate-700'
                          }`}
                        >
                          공개 의뢰
                        </button>
                      </div>
                    </div>

                    <div>
                      <div className="mb-2 text-xs font-medium text-slate-500">전문 분야 (복수 선택)</div>
                      <div className="flex flex-wrap gap-2">
                        {specialtyOptions.map((option) => (
                          <SoftBadge
                            key={option}
                            active={selectedSpecialties.includes(option)}
                            onClick={() => toggleSpecialty(option)}
                          >
                            {option}
                          </SoftBadge>
                        ))}
                      </div>
                    </div>

                    {selectedSpecialties.includes('그 밖의 인증') ? (
                      <div>
                        <div className="mb-2 text-xs font-medium text-slate-500">기타 인증 직접 입력</div>
                        <input
                          value={customSpecialty}
                          onChange={(e) => setCustomSpecialty(e.target.value)}
                          placeholder="예: 녹색건축인증, BF 인증"
                          className="w-full rounded-xl border border-teal-100 px-3 py-2 text-sm outline-none focus:border-teal-400"
                        />
                      </div>
                    ) : null}

                    <div>
                      <div className="mb-2 text-xs font-medium text-slate-500">용역 요약</div>
                      <textarea
                        value={requestSummary}
                        onChange={(e) => setRequestSummary(e.target.value)}
                        className="min-h-[120px] w-full rounded-2xl border border-teal-100 p-4 text-sm outline-none focus:border-teal-400"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={buildRequestCard}
                      className="w-full rounded-xl bg-teal-700 px-4 py-2.5 text-sm text-white"
                    >
                      용역 카드 생성
                    </button>
                  </div>
                </Card>

                <div className="space-y-4">
                  <Card className="p-5">
                    <SectionTitle title="생성된 용역 카드" desc="프로젝트 기본 정보가 함께 저장됩니다." />
                    <div className="space-y-3">
                      {requestCards.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
                          아직 생성된 용역 카드가 없습니다.
                        </div>
                      ) : (
                        requestCards.map((request) => {
                          const isActive = activeRequestId === request.id;
                          return (
                            <button
                              type="button"
                              key={request.id}
                              onClick={() => {
                                setActiveRequestId(request.id);
                                setSelectedRequestId(request.id);
                                setSelectedCompanyIds([]);
                              }}
                              className={`w-full rounded-2xl border p-4 text-left ${
                                isActive ? 'border-teal-700 bg-teal-700 text-white' : 'border-teal-100 bg-white'
                              }`}
                            >
                              <div>
                                <div className="text-sm font-semibold">{request.project}</div>
                                <div
                                  className={`mt-1 text-xs ${
                                    isActive ? 'text-slate-300' : 'text-slate-500'
                                  }`}
                                >
                                  {request.region} · {request.use} · {request.gfa.toLocaleString()}㎡ ·{' '}
                                  {request.floors}F
                                </div>
                                <div
                                  className={`mt-1 text-xs ${
                                    isActive ? 'text-slate-300' : 'text-slate-500'
                                  }`}
                                >
                                  {request.visibility}
                                </div>
                              </div>
                              <div className="mt-3 flex flex-wrap gap-2">
                                {request.specialties.map((field) => (
                                  <span
                                    key={field}
                                    className={`rounded-full px-2.5 py-1 text-[11px] ${
                                      isActive ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-600'
                                    }`}
                                  >
                                    {field}
                                  </span>
                                ))}
                                {request.customSpecialty ? (
                                  <span
                                    className={`rounded-full px-2.5 py-1 text-[11px] ${
                                      isActive ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-600'
                                    }`}
                                  >
                                    {request.customSpecialty}
                                  </span>
                                ) : null}
                              </div>
                            </button>
                          );
                        })
                      )}
                    </div>
                  </Card>

                  <Card className="p-5">
                    <SectionTitle
                      title="검색 결과"
                      desc="다중 선택 후 하단 의뢰 버튼을 눌러 depth 2 견적 비교 단계로 이동"
                    />
                    {!activeRequest ? (
                      <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
                        먼저 용역 카드를 생성해주세요.
                      </div>
                    ) : (
                      <>
                        <div className="grid gap-4 xl:grid-cols-2">
                          {filteredCompanies.map((company) => {
                            const isSelected = selectedCompanyIds.includes(company.id);
                            return (
                              <button
                                type="button"
                                key={company.id}
                                onClick={() => toggleCompanySelection(company.id)}
                                className={`rounded-2xl border p-4 text-left transition ${
                                  isSelected
                                    ? 'border-teal-700 bg-teal-700 text-white'
                                    : 'border-teal-100 bg-white hover:border-slate-300'
                                }`}
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div>
                                    <div className="text-sm font-semibold">{company.name}</div>
                                    <div
                                      className={`mt-1 text-xs ${
                                        isSelected ? 'text-slate-300' : 'text-slate-500'
                                      }`}
                                    >
                                      {company.intro}
                                    </div>
                                  </div>
                                  <InfoBadge dark={isSelected}>{company.projects}건</InfoBadge>
                                </div>
                                <div className="mt-3 flex flex-wrap gap-2">
                                  {company.fields.slice(0, 2).map((field) => (
                                    <span
                                      key={field}
                                      className={`rounded-full px-2.5 py-1 text-[11px] ${
                                        isSelected ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-600'
                                      }`}
                                    >
                                      {field}
                                    </span>
                                  ))}
                                </div>
                                <div
                                  className={`mt-4 text-xs ${
                                    isSelected ? 'text-slate-300' : 'text-slate-500'
                                  }`}
                                >
                                  {company.response} · 커피챗 {company.coffeeChat ? '가능' : '불가'}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                        <div className="mt-4 flex justify-end">
                          <button
                            type="button"
                            onClick={moveToRequestCompare}
                            disabled={selectedCompanyIds.length === 0}
                            className={`rounded-xl px-4 py-2 text-sm ${
                              selectedCompanyIds.length > 0
                                ? 'bg-teal-700 text-white'
                                : 'bg-teal-100 text-teal-700'
                            }`}
                          >
                            의뢰
                          </button>
                        </div>
                      </>
                    )}
                  </Card>
                </div>
              </div>
            ) : null}

            {architectTab === 'request' ? (
              <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
                <Card className="p-5">
                  <SectionTitle
                    title="의뢰 액션"
                    desc="선택한 컨설팅 기업별로 팝업을 열어 의뢰 분류와 내용을 요청"
                  />
                  <div className="space-y-3">
                    {selectedCompanies.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">
                        depth 1에서 컨설팅 기업을 먼저 선택해주세요.
                      </div>
                    ) : (
                      selectedCompanies.map((company) => (
                        <button
                          type="button"
                          key={company.id}
                          onClick={() => openRequestModal(company.id)}
                          className="w-full rounded-xl border border-teal-100 bg-white px-3 py-3 text-left text-sm text-slate-700 hover:bg-teal-50"
                        >
                          {company.name} 의뢰하기
                        </button>
                      ))
                    )}
                  </div>
                </Card>

                <div className="space-y-4">
                  {quoteMode === 'compare' ? (
                    <Card className="p-5">
                      <SectionTitle
                        title="견적 비교"
                        desc="depth 1에서 선택한 컨설팅 기업만 비교 대상으로 노출"
                      />
                      <div className="grid gap-4 md:grid-cols-3">
                        {selectedCompanies.map((company, idx) => (
                          <div key={company.id} className="rounded-2xl border border-teal-100 p-4">
                            <div className="text-sm font-semibold text-slate-900">{company.name}</div>
                            <div className="mt-3 text-xs text-slate-500">예상 비용</div>
                            <div className="mt-1 text-lg font-semibold text-slate-900">
                              {(idx + 2) * 300}만원
                            </div>
                            <div className="mt-3 text-xs text-slate-500">예상 기간</div>
                            <div className="mt-1 text-sm font-medium text-slate-900">{idx + 2}주</div>
                            <div className="mt-4 flex justify-end">
                              <button
                                type="button"
                                onClick={() => openRequestModal(company.id)}
                                className="rounded-xl border border-teal-100 px-3 py-2 text-xs text-slate-700"
                              >
                                의뢰 액션
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  ) : null}

                  <Card className="p-5">
                    <SectionTitle
                      title="요청 로그"
                      desc="의뢰 액션 팝업에서 생성된 요청 이력을 프로젝트 기준으로 표시"
                    />
                    <div className="space-y-3 rounded-2xl border border-teal-100 bg-teal-50 p-4">
                      {requestLogs.filter((log) => log.projectId === activeRequest?.id).length === 0 ? (
                        <div className="rounded-xl bg-white p-4 text-sm text-slate-500">
                          아직 요청 이력이 없습니다.
                        </div>
                      ) : (
                        requestLogs
                          .filter((log) => log.projectId === activeRequest?.id)
                          .map((log) => (
                            <div key={log.id} className="rounded-xl bg-white p-3">
                              <div className="flex items-center justify-between gap-3">
                                <div className="text-xs font-medium text-slate-700">{log.companyName}</div>
                                <InfoBadge>{log.status}</InfoBadge>
                              </div>
                              <div className="mt-2 flex flex-wrap gap-2">
                                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] text-slate-600">
                                  {log.type}
                                </span>
                              </div>
                              <div className="mt-3 text-sm text-slate-700">{log.opinion}</div>
                            </div>
                          ))
                      )}
                    </div>
                  </Card>
                </div>
              </div>
            ) : null}

            {architectTab === 'collab' ? (
              <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
                <Card className="p-5">
                  <SectionTitle title="참여자" desc="실무 협업용 최소 구조" />
                  <div className="space-y-3 text-sm text-slate-700">
                    <div className="rounded-xl bg-teal-50 p-3">설계사 PM</div>
                    <div className="rounded-xl bg-teal-50 p-3">컨설팅 기업 담당자</div>
                    <div className="rounded-xl bg-teal-50 p-3">보조 실무자</div>
                  </div>
                </Card>

                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <Kpi label="파일 수" value={`${uploadedFiles.length}개`} />
                    <Kpi label="최근 댓글" value={`${chatMessages.length}건`} />
                    <Kpi label="진행 상태" value="검토 중" />
                  </div>

                  <div className="grid gap-4 xl:grid-cols-2">
                    <Card className="p-5">
                      <SectionTitle title="댓글" desc="짧은 대화만 가능하게 단순화" />
                      <div className="space-y-3 rounded-2xl border border-teal-100 bg-teal-50 p-4">
                        {chatMessages.map((msg, idx) => (
                          <div key={`${msg.author}-${idx}`} className="rounded-xl bg-white p-3">
                            <div className="text-xs text-slate-500">{msg.author}</div>
                            <div className="mt-1 text-sm text-slate-800">{msg.text}</div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 flex gap-2">
                        <input
                          value={draftMessage}
                          onChange={(e) => setDraftMessage(e.target.value)}
                          placeholder="댓글 입력"
                          className="flex-1 rounded-xl border border-teal-100 px-3 py-2 text-sm outline-none focus:border-teal-400"
                        />
                        <button
                          type="button"
                          onClick={sendMessage}
                          className="rounded-xl bg-teal-700 px-4 py-2 text-sm text-white"
                        >
                          등록
                        </button>
                      </div>
                    </Card>

                    <Card className="p-5">
                      <SectionTitle
                        title="파일 업로드 / 다운로드"
                        desc="메일 대신 협업 공간에서 자료를 주고받는 구조"
                      />
                      <button
                        type="button"
                        onClick={addMockFile}
                        className="mb-4 rounded-xl bg-teal-700 px-4 py-2 text-sm text-white"
                      >
                        파일 업로드
                      </button>
                      <div className="space-y-3">
                        {uploadedFiles.map((file, idx) => (
                          <div
                            key={`${file}-${idx}`}
                            className="flex items-center justify-between rounded-2xl border border-teal-100 p-3"
                          >
                            <div>
                              <div className="text-sm font-medium text-slate-900">{file}</div>
                              <div className="mt-1 text-xs text-slate-500">
                                업로드자: {idx % 2 === 0 ? '설계사' : '컨설팅 기업'}
                              </div>
                            </div>
                            <button
                              type="button"
                              className="rounded-xl border border-teal-100 px-3 py-1.5 text-xs text-slate-700"
                            >
                              다운로드
                            </button>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-4">
              <Kpi label="신규 의뢰 프로젝트" value={`${inboxRequests.length}건`} />
              <Kpi
                label="요청 상태"
                value={`${requestLogs.filter((item) => item.status === '요청').length}건`}
              />
              <Kpi
                label="응답 완료"
                value={`${requestLogs.filter((item) => item.status === '응답 완료').length}건`}
              />
              <Kpi label="진행 가능" value={`${inboxRequests.filter((item) => item.logs.length > 0).length}건`} />
            </div>

            <div className="flex gap-2">
              <Pill active={consultingTab === 'inbox'} onClick={() => setConsultingTab('inbox')}>
                depth 1 인박스
              </Pill>
              <Pill active={consultingTab === 'response'} onClick={() => setConsultingTab('response')}>
                depth 2 응답
              </Pill>
              <Pill active={consultingTab === 'collab'} onClick={() => setConsultingTab('collab')}>
                depth 3 협업
              </Pill>
            </div>

            {consultingTab === 'inbox' ? (
              <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
                <Card className="p-5">
                  <SectionTitle title="의뢰 현황" desc="설계사에서 생성된 의뢰 카드를 프로젝트 단위로 확인" />
                  <div className="space-y-3">
                    {inboxRequests.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
                        아직 수신된 의뢰가 없습니다.
                      </div>
                    ) : (
                      inboxRequests.map((request) => {
                        const isSelected = selectedInboxRequest?.id === request.id;
                        return (
                          <button
                            type="button"
                            key={request.id}
                            onClick={() => setSelectedRequestId(request.id)}
                            className={`w-full rounded-2xl border p-4 text-left ${
                              isSelected ? 'border-teal-700 bg-teal-700 text-white' : 'border-teal-100 bg-white'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <div className="text-sm font-semibold">{request.project}</div>
                                <div className={`mt-1 text-xs ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                                  {request.visibility}
                                </div>
                              </div>
                              <InfoBadge dark={isSelected}>{request.stage}</InfoBadge>
                            </div>
                            <div className={`mt-3 text-sm ${isSelected ? 'text-white' : 'text-slate-700'}`}>
                              {request.summary}
                            </div>
                            <div className="mt-3 flex flex-wrap gap-2">
                              {request.specialties.map((field) => (
                                <span
                                  key={field}
                                  className={`rounded-full px-2.5 py-1 text-[11px] ${
                                    isSelected ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-600'
                                  }`}
                                >
                                  {field}
                                </span>
                              ))}
                              {request.customSpecialty ? (
                                <span
                                  className={`rounded-full px-2.5 py-1 text-[11px] ${
                                    isSelected ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-600'
                                  }`}
                                >
                                  {request.customSpecialty}
                                </span>
                              ) : null}
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                </Card>

                <Card className="p-5">
                  <SectionTitle title="의뢰 상세" desc="선택된 프로젝트의 기본 정보와 요청 로그를 함께 확인" />
                  {!selectedInboxRequest ? (
                    <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
                      확인할 의뢰가 없습니다.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="rounded-2xl border border-teal-100 bg-teal-50 p-4">
                        <div className="text-xs font-medium text-slate-500">프로젝트 기본 정보</div>
                        <div className="mt-2 text-sm font-semibold text-slate-900">
                          {selectedInboxRequest.project}
                        </div>
                        <div className="mt-1 text-xs text-slate-600">{selectedInboxProjectMeta}</div>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="rounded-2xl border border-teal-100 p-4">
                          <div className="text-xs font-medium text-slate-500">요약</div>
                          <div className="mt-2 text-sm text-slate-800">{selectedInboxRequest.summary}</div>
                        </div>
                        <div className="rounded-2xl border border-teal-100 p-4">
                          <div className="text-xs font-medium text-slate-500">전문 분야</div>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {selectedInboxRequest.specialties.map((field) => (
                              <span
                                key={field}
                                className="rounded-full bg-teal-50 px-2.5 py-1 text-[11px] text-slate-700"
                              >
                                {field}
                              </span>
                            ))}
                            {selectedInboxRequest.customSpecialty ? (
                              <span className="rounded-full bg-teal-50 px-2.5 py-1 text-[11px] text-slate-700">
                                {selectedInboxRequest.customSpecialty}
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-teal-100 p-4">
                        <div className="mb-3 text-xs font-medium text-slate-500">요청 로그</div>
                        <div className="space-y-3">
                          {selectedInboxRequest.logs.length === 0 ? (
                            <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
                              아직 수신된 액션 요청이 없습니다.
                            </div>
                          ) : (
                            selectedInboxRequest.logs.map((log) => (
                              <div key={log.id} className="rounded-xl bg-slate-50 p-4">
                                <div className="flex items-center justify-between gap-3">
                                  <div className="text-sm font-semibold text-slate-900">{log.companyName}</div>
                                  <InfoBadge>{log.status}</InfoBadge>
                                </div>
                                <div className="mt-2 text-xs text-slate-500">{log.type}</div>
                                <div className="mt-2 text-sm text-slate-700">{log.opinion}</div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </Card>
              </div>
            ) : null}

            {consultingTab === 'response' ? (
              <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
                <Card className="p-5">
                  <SectionTitle title="응답 액션" desc="선택된 의뢰에 대해 응답 유형을 선택하고 상태를 갱신" />
                  <div className="space-y-4">
                    <div>
                      <div className="mb-2 text-xs font-medium text-slate-500">응답 방식</div>
                      <div className="flex flex-wrap gap-2">
                        {responseModeOptions.map((option) => (
                          <SoftBadge
                            key={option.id}
                            active={responseMode === option.id}
                            onClick={() => setResponseMode(option.id)}
                          >
                            {option.label}
                          </SoftBadge>
                        ))}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={sendConsultingResponse}
                      disabled={!selectedInboxRequest}
                      className={`w-full rounded-xl px-4 py-2.5 text-sm ${
                        selectedInboxRequest ? 'bg-teal-700 text-white' : 'bg-teal-100 text-teal-700'
                      }`}
                    >
                      응답 완료 처리
                    </button>
                  </div>
                </Card>

                <div className="space-y-4">
                  <Card className="p-5">
                    <SectionTitle title="응답 대상 의뢰" desc="현재 선택된 의뢰 기준으로 회신 대상을 확인" />
                    {!selectedInboxRequest ? (
                      <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
                        선택된 의뢰가 없습니다.
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-teal-100 bg-teal-50 p-4">
                        <div className="text-sm font-semibold text-slate-900">{selectedInboxRequest.project}</div>
                        <div className="mt-1 text-xs text-slate-600">{selectedInboxProjectMeta}</div>
                        <div className="mt-3 text-sm text-slate-700">{selectedInboxRequest.summary}</div>
                      </div>
                    )}
                  </Card>

                  <Card className="p-5">
                    <SectionTitle title="상태 로그" desc="응답 완료 처리 시 관련 요청 상태가 일괄 갱신" />
                    <div className="space-y-3 rounded-2xl border border-teal-100 bg-teal-50 p-4">
                      {selectedInboxRequest?.logs.length ? (
                        selectedInboxRequest.logs.map((log) => (
                          <div key={log.id} className="rounded-xl bg-white p-3">
                            <div className="flex items-center justify-between gap-3">
                              <div className="text-xs font-medium text-slate-700">{log.companyName}</div>
                              <InfoBadge>{log.status}</InfoBadge>
                            </div>
                            <div className="mt-2 text-sm text-slate-700">{log.opinion}</div>
                          </div>
                        ))
                      ) : (
                        <div className="rounded-xl bg-white p-4 text-sm text-slate-500">
                          표시할 로그가 없습니다.
                        </div>
                      )}
                    </div>
                  </Card>
                </div>
              </div>
            ) : null}

            {consultingTab === 'collab' ? (
              <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
                <Card className="p-5">
                  <SectionTitle title="협업 참여자" desc="응답 이후 자료 공유와 커뮤니케이션으로 전환" />
                  <div className="space-y-3 text-sm text-slate-700">
                    <div className="rounded-xl bg-teal-50 p-3">컨설팅 PM</div>
                    <div className="rounded-xl bg-teal-50 p-3">설계사 담당자</div>
                    <div className="rounded-xl bg-teal-50 p-3">검토 실무자</div>
                  </div>
                </Card>

                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <Kpi label="파일 수" value={`${uploadedFiles.length}개`} />
                    <Kpi label="대화 수" value={`${chatMessages.length}건`} />
                    <Kpi label="현재 상태" value="응답 후 협의" />
                  </div>

                  <div className="grid gap-4 xl:grid-cols-2">
                    <Card className="p-5">
                      <SectionTitle title="협의 기록" desc="컨설팅 기업 관점의 대화 입력" />
                      <div className="space-y-3 rounded-2xl border border-teal-100 bg-teal-50 p-4">
                        {chatMessages.map((msg, idx) => (
                          <div key={`${msg.author}-consulting-${idx}`} className="rounded-xl bg-white p-3">
                            <div className="text-xs text-slate-500">{msg.author}</div>
                            <div className="mt-1 text-sm text-slate-800">{msg.text}</div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 flex gap-2">
                        <input
                          value={draftMessage}
                          onChange={(e) => setDraftMessage(e.target.value)}
                          placeholder="협의 메시지 입력"
                          className="flex-1 rounded-xl border border-teal-100 px-3 py-2 text-sm outline-none focus:border-teal-400"
                        />
                        <button
                          type="button"
                          onClick={sendMessage}
                          className="rounded-xl bg-teal-700 px-4 py-2 text-sm text-white"
                        >
                          등록
                        </button>
                      </div>
                    </Card>

                    <Card className="p-5">
                      <SectionTitle title="자료 공유" desc="검토서, 도면, 회신 자료를 주고받는 영역" />
                      <button
                        type="button"
                        onClick={addMockFile}
                        className="mb-4 rounded-xl bg-teal-700 px-4 py-2 text-sm text-white"
                      >
                        파일 업로드
                      </button>
                      <div className="space-y-3">
                        {uploadedFiles.map((file, idx) => (
                          <div
                            key={`${file}-consulting-${idx}`}
                            className="flex items-center justify-between rounded-2xl border border-teal-100 p-3"
                          >
                            <div>
                              <div className="text-sm font-medium text-slate-900">{file}</div>
                              <div className="mt-1 text-xs text-slate-500">
                                업로드자: {idx % 2 === 0 ? '컨설팅 기업' : '설계사'}
                              </div>
                            </div>
                            <button
                              type="button"
                              className="rounded-xl border border-teal-100 px-3 py-1.5 text-xs text-slate-700"
                            >
                              다운로드
                            </button>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
