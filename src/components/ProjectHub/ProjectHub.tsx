'use client';

import React, { useMemo, useState, useCallback } from 'react';
import Link from 'next/link';
import { PlusOutlined, RightOutlined } from '@ant-design/icons';
import { Button, Modal, Form, Input, Select, Card, Tag, Divider } from 'antd';
import type { ProjectStatus as AntStatus } from 'antd/es/tag';
import styles from './ProjectHub.module.scss';

// ------------------------------------------------------------
// Types (from reactapp)
// ------------------------------------------------------------
type ModuleKey = 'zeb' | 'epi' | 'ren' | 'consult';
type ModuleState = 'pass' | 'fail' | 'progress' | 'none';
export type ProjectStatus = '신규' | '진행중' | '완료';

export type Project = {
  id: string;
  name: string;
  region: string;
  use: string;
  gfa: number;
  floors: number;
  targetGrade: number;
  status: ProjectStatus;
  updatedAt: string;
  map: Record<ModuleKey, ModuleState>;
};

type WorkspaceTab = 'zeb' | 'epi' | 'ren' | 'consult' | 'collab';

const MODULE_LABEL: Record<WorkspaceTab, string> = {
  zeb: 'ZEB 예측',
  epi: 'EPI 검토',
  ren: '신재생 검토',
  consult: '컨설팅 연계',
  collab: '협업 초대',
};

// ------------------------------------------------------------
// Helpers
// ------------------------------------------------------------
function fmt(n: number) {
  return new Intl.NumberFormat('ko-KR').format(n);
}

function nowStamp() {
  const d = new Date();
  const yy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  return `${yy}-${mm}-${dd} ${hh}:${mi}`;
}

function makeId() {
  return Math.random().toString(16).slice(2, 10);
}

function dot(state: ModuleState) {
  if (state === 'pass') return '●';
  if (state === 'fail') return '⚠';
  if (state === 'progress') return '◐';
  return '–';
}

function marginText(v: number | null) {
  if (v === null || Number.isNaN(v)) return '–';
  const sign = v > 0 ? '+' : '';
  return `${sign}${v}`;
}

// ------------------------------------------------------------
// StatusBadge
// ------------------------------------------------------------
function StatusBadge({ status }: { status: ProjectStatus }) {
  const color: Record<ProjectStatus, AntStatus> = {
    신규: 'default',
    진행중: 'processing',
    완료: 'success',
  };
  return <Tag color={color[status]} className={styles.statusBadge}>{status}</Tag>;
}

function StateBadge({ state }: { state: ModuleState }) {
  if (state === 'pass') return <Tag color="success" className={styles.stateBadge}>만족</Tag>;
  if (state === 'fail') return <Tag color="error" className={styles.stateBadge}>불만족</Tag>;
  if (state === 'progress') return <Tag color="processing" className={styles.stateBadge}>진행</Tag>;
  return <Tag className={styles.stateBadge}>미실행</Tag>;
}

// ------------------------------------------------------------
// MiniMap
// ------------------------------------------------------------
function MiniMap({ map, compact }: { map: Project['map']; compact?: boolean }) {
  const Item = ({ label, state }: { label: string; state: ModuleState }) => (
    <div className={compact ? styles.miniMapItemCompact : styles.miniMapItem}>
      <div className={styles.miniMapRow}>
        <span className={styles.miniMapLabel}>{label}</span>
        <span className={styles.miniMapDot} aria-label={`${label}:${state}`}>{dot(state)}</span>
      </div>
      {!compact && (
        <div className={styles.miniMapSub}>
          {state === 'pass' ? '만족' : state === 'fail' ? '불만족' : state === 'progress' ? '진행' : '미실행'}
        </div>
      )}
    </div>
  );

  return (
    <div className={styles.miniMapGrid}>
      <Item label="ZEB" state={map.zeb} />
      <Item label="EPI" state={map.epi} />
      <Item label="신재생" state={map.ren} />
      <Item label="컨설팅" state={map.consult} />
    </div>
  );
}

// ------------------------------------------------------------
// CreateProjectDialog
// ------------------------------------------------------------
function CreateProjectDialog({
  open,
  onOpenChange,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreate: (p: Omit<Project, 'id' | 'updatedAt' | 'map'>) => void;
}) {
  const [form] = Form.useForm();

  const submit = useCallback(() => {
    return form.validateFields().then((values) => {
      const name = values.name?.trim() || `${values.region} ${values.use} (신규)`;
      onCreate({
        name,
        region: values.region,
        use: values.use,
        gfa: values.gfa,
        floors: values.floors,
        targetGrade: values.targetGrade,
        status: '신규',
      });
      onOpenChange(false);
      form.resetFields();
    });
  }, [form, onCreate, onOpenChange]);

  return (
    <Modal
      title="프로젝트 생성"
      open={open}
      onCancel={() => onOpenChange(false)}
      onOk={submit}
      okText="생성"
      cancelText="취소"
      width={520}
      destroyOnClose
      centered
      className={styles.createModal}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          region: '서울',
          use: '업무시설',
          gfa: 12000,
          floors: 10,
          targetGrade: 3,
        }}
      >
        <Form.Item name="name" label="프로젝트명">
          <Input placeholder="예: 성수 업무시설" />
        </Form.Item>
        <div className={styles.formRow}>
          <Form.Item name="region" label="지역" className={styles.formHalf}>
            <Select
              options={[
                { value: '서울', label: '서울' },
                { value: '경기', label: '경기' },
                { value: '인천', label: '인천' },
                { value: '부산', label: '부산' },
              ]}
            />
          </Form.Item>
          <Form.Item name="use" label="용도" className={styles.formHalf}>
            <Select
              options={[
                { value: '업무시설', label: '업무시설' },
                { value: '교육연구시설', label: '교육연구시설' },
                { value: '공동주택', label: '공동주택' },
                { value: '상업시설', label: '상업시설' },
              ]}
            />
          </Form.Item>
        </div>
        <div className={styles.formRow}>
          <Form.Item name="gfa" label="연면적(㎡)" className={styles.formHalf}>
            <Input type="number" min={1} />
          </Form.Item>
          <Form.Item name="floors" label="층수" className={styles.formHalf}>
            <Input type="number" min={1} />
          </Form.Item>
        </div>
        <Form.Item name="targetGrade" label="목표 ZEB 등급">
          <Select
            options={[1, 2, 3, 4, 5].map((n) => ({ value: n, label: `${n}등급` }))}
          />
        </Form.Item>
        <div className={styles.createDialogHint}>
          * 생성 후, 표준모델(시나리오 A)을 기반으로 시나리오 비교를 진행합니다.
        </div>
      </Form>
    </Modal>
  );
}

// ------------------------------------------------------------
// KpiTile
// ------------------------------------------------------------
function KpiTile({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Card className={styles.kpiTile}>
      <div className={styles.kpiLabel}>{label}</div>
      <div className={styles.kpiValue}>{value}</div>
    </Card>
  );
}

// ------------------------------------------------------------
// PlatformNav
// ------------------------------------------------------------
function PlatformNav({ onGo }: { onGo: (label: string) => void }) {
  const items = [
    { label: '마이페이지' },
    { label: '설정' },
    { label: '구독' },
    { label: '도움말', divider: true },
  ];
  return (
    <Card className={styles.panelCard}>
      <div className={styles.panelCardTitle}>플랫폼</div>
      <div className={styles.platformNav}>
        {items.map((it, i) => (
          <React.Fragment key={i}>
            {it.divider && <Divider className={styles.navDivider} />}
            <Button
              type="text"
              block
              className={styles.navButton}
              onClick={() => onGo(it.label)}
            >
              <span>{it.label}</span>
              <span className={styles.navButtonSub}>열기</span>
            </Button>
          </React.Fragment>
        ))}
      </div>
    </Card>
  );
}

// ------------------------------------------------------------
// RecentActivity
// ------------------------------------------------------------
type Activity = { at: string; text: string };

function RecentActivity({
  items,
  compact,
  onOpen,
}: {
  items: Activity[];
  compact?: boolean;
  onOpen?: () => void;
}) {
  const list = items.slice(0, compact ? 3 : 6);
  return (
    <Card className={styles.panelCard}>
      <div className={styles.panelCardHeader}>
        <div className={styles.panelCardTitle}>최근 활동</div>
        {onOpen && (
          <Button type="link" size="small" onClick={onOpen}>
            열기
          </Button>
        )}
      </div>
      <div className={compact ? styles.activityListCompact : styles.activityList}>
        {list.map((it, idx) => (
          <div key={idx} className={styles.activityItem}>
            <div className={styles.activityAt}>{it.at}</div>
            <div className={styles.activityText}>{it.text}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ------------------------------------------------------------
// WorkspaceLeftButton
// ------------------------------------------------------------
function WorkspaceLeftButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <Button
      type={active ? 'primary' : 'default'}
      block
      className={styles.workspaceButton}
      onClick={onClick}
    >
      <span>{label}</span>
      <span className={styles.navButtonSub}>열기</span>
    </Button>
  );
}

// ------------------------------------------------------------
// ModuleKpiCard
// ------------------------------------------------------------
function ModuleKpiCard({
  title,
  target,
  current,
  margin,
  unit,
  state,
  hint,
  onOpen,
}: {
  title: string;
  target: React.ReactNode;
  current: React.ReactNode;
  margin: React.ReactNode;
  unit?: string;
  state: ModuleState;
  hint?: string;
  onOpen: () => void;
}) {
  return (
    <Card className={styles.moduleKpiCard}>
      <div className={styles.moduleKpiHeader}>
        <div className={styles.moduleKpiTitleWrap}>
          <div className={styles.moduleKpiTitle}>{title}</div>
          {hint && <div className={styles.moduleKpiHint}>{hint}</div>}
        </div>
        <StateBadge state={state} />
      </div>
      <div className={styles.moduleKpiGrid}>
        <div className={styles.moduleKpiCell}>
          <div className={styles.moduleKpiCellLabel}>목표</div>
          <div className={styles.moduleKpiCellValue}>
            {target}
            {unit && <span className={styles.moduleKpiUnit}>{unit}</span>}
          </div>
        </div>
        <div className={styles.moduleKpiCell}>
          <div className={styles.moduleKpiCellLabel}>현재</div>
          <div className={styles.moduleKpiCellValue}>
            {current}
            {unit && <span className={styles.moduleKpiUnit}>{unit}</span>}
          </div>
        </div>
        <div className={styles.moduleKpiCell}>
          <div className={styles.moduleKpiCellLabel}>여유율</div>
          <div className={styles.moduleKpiCellValue}>
            {margin}
            {unit && <span className={styles.moduleKpiUnit}>{unit}</span>}
          </div>
        </div>
      </div>
      <Button type="primary" block className={styles.moduleKpiOpenBtn} onClick={onOpen}>
        열기
      </Button>
    </Card>
  );
}

// ------------------------------------------------------------
// Default projects + SharedFile type
// ------------------------------------------------------------
const DEFAULT_PROJECTS: Project[] = [
  {
    id: 'p-001',
    name: '성수 업무시설',
    region: '서울',
    use: '업무시설',
    gfa: 12800,
    floors: 12,
    targetGrade: 3,
    status: '진행중',
    updatedAt: '2026-03-03 17:20',
    map: { zeb: 'pass', epi: 'fail', ren: 'pass', consult: 'none' },
  },
  {
    id: 'p-002',
    name: '동탄 교육연구시설',
    region: '경기',
    use: '교육연구시설',
    gfa: 9200,
    floors: 7,
    targetGrade: 4,
    status: '진행중',
    updatedAt: '2026-03-02 11:05',
    map: { zeb: 'pass', epi: 'pass', ren: 'none', consult: 'none' },
  },
  {
    id: 'p-003',
    name: '여의도 공동주택(가칭)',
    region: '서울',
    use: '공동주택',
    gfa: 18500,
    floors: 20,
    targetGrade: 2,
    status: '신규',
    updatedAt: '2026-03-03 09:12',
    map: { zeb: 'none', epi: 'none', ren: 'none', consult: 'none' },
  },
];

type SharedFile = {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: string;
  blobUrl: string;
};

function fmtBytes(n: number) {
  if (!n) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const idx = Math.min(units.length - 1, Math.floor(Math.log(n) / Math.log(1024)));
  const v = n / Math.pow(1024, idx);
  const fixed = idx === 0 ? 0 : v < 10 ? 1 : 0;
  return `${v.toFixed(fixed)} ${units[idx]}`;
}

const activityItems: Activity[] = [
  { at: '2026-03-03 17:20', text: 'EPI 점수 업데이트' },
  { at: '2026-03-03 15:40', text: '협업 댓글 추가' },
  { at: '2026-03-03 14:10', text: '파일 업로드 (설계도면)' },
  { at: '2026-03-02 11:05', text: 'ZEB 시나리오 A 생성' },
];

// ------------------------------------------------------------
// Main: ZEBAProjectHub
// ------------------------------------------------------------
export default function ProjectHub() {
  const [view, setView] = useState<'home' | 'project'>('home');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('zeb');

  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | '전체'>('전체');
  const [openCreate, setOpenCreate] = useState(false);

  const [projects, setProjects] = useState<Project[]>(DEFAULT_PROJECTS);
  const [sharedFiles, setSharedFiles] = useState<SharedFile[]>([
    {
      id: 'f-001',
      name: '설계도면_초안.pdf',
      size: 2_345_000,
      type: 'application/pdf',
      uploadedAt: '2026-03-03 14:10',
      blobUrl: '',
    },
  ]);
  const [pickedFile, setPickedFile] = useState<File | null>(null);

  const mockGo = useCallback((label: string) => {
    alert(`${label} (미리보기)\n\n- 실제 기능/라우팅은 다음 단계에서 연결`);
  }, []);

  const onPickFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setPickedFile(f);
    e.target.value = '';
  }, []);

  const uploadPickedFile = useCallback(() => {
    if (!pickedFile) return;
    const url = URL.createObjectURL(pickedFile);
    setSharedFiles((prev) => [
      {
        id: `f-${makeId()}`,
        name: pickedFile.name,
        size: pickedFile.size,
        type: pickedFile.type || 'application/octet-stream',
        uploadedAt: nowStamp(),
        blobUrl: url,
      },
      ...prev,
    ]);
    setPickedFile(null);
  }, [pickedFile]);

  const downloadFile = useCallback((f: SharedFile) => {
    if (!f.blobUrl) {
      mockGo(`다운로드(미리보기): ${f.name}`);
      return;
    }
    const a = document.createElement('a');
    a.href = f.blobUrl;
    a.download = f.name;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }, [mockGo]);

  const removeFile = useCallback((f: SharedFile) => {
    if (f.blobUrl) URL.revokeObjectURL(f.blobUrl);
    setSharedFiles((prev) => prev.filter((x) => x.id !== f.id));
  }, []);

  const selected = useMemo(
    () => (selectedId ? projects.find((p) => p.id === selectedId) ?? null : null),
    [projects, selectedId]
  );

  const kpi = useMemo(() => {
    const total = projects.length;
    const active = projects.filter((p) => p.status === '진행중').length;
    const done = projects.filter((p) => p.status === '완료').length;
    const need = projects.filter(
      (p) => p.map.epi === 'fail' || p.map.ren === 'fail' || p.map.zeb === 'fail'
    ).length;
    return { total, active, done, need };
  }, [projects]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return projects
      .filter((p) => (statusFilter === '전체' ? true : p.status === statusFilter))
      .filter((p) => {
        if (!q) return true;
        return `${p.name} ${p.region} ${p.use}`.toLowerCase().includes(q);
      })
      .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
  }, [projects, query, statusFilter]);

  const createProject = useCallback((base: Omit<Project, 'id' | 'updatedAt' | 'map'>) => {
    const p: Project = {
      id: `p-${makeId()}`,
      updatedAt: nowStamp(),
      map: { zeb: 'none', epi: 'none', ren: 'none', consult: 'none' },
      ...base,
    };
    setProjects((prev) => [p, ...prev]);
    setSelectedId(p.id);
    setActiveTab('zeb');
    setView('project');
  }, []);

  const openProject = useCallback((id: string) => {
    setSelectedId(id);
    setActiveTab('zeb');
    setView('project');
  }, []);

  const moduleOpen = useCallback(
    (tab: WorkspaceTab) => {
      setActiveTab(tab);
      mockGo(MODULE_LABEL[tab]);
    },
    [mockGo]
  );

  const moduleMockMetric = useCallback((p: Project) => {
    const zebCurrent =
      p.map.zeb === 'pass'
        ? Math.max(1, p.targetGrade - 1)
        : p.map.zeb === 'fail'
          ? p.targetGrade + 1
          : p.targetGrade;
    const epiCurrent = p.map.epi === 'pass' ? 68 : p.map.epi === 'fail' ? 62 : 0;
    const renCurrent = p.map.ren === 'pass' ? 21.5 : p.map.ren === 'fail' ? 17.0 : 0;
    const zebMargin = p.map.zeb === 'none' ? null : Number(p.targetGrade) - Number(zebCurrent);
    const epiMargin = p.map.epi === 'none' ? null : Number(epiCurrent) - 65;
    const renMargin = p.map.ren === 'none' ? null : Number(renCurrent) - 20;
    return {
      zebCurrent,
      epiCurrent,
      renCurrent,
      zebMargin,
      epiMargin,
      renMargin,
    };
  }, []);

  const openReport = useCallback(() => {
    if (view !== 'project' || !selected) {
      alert('리포트는 프로젝트 내부에서 출력합니다.\n\n- 프로젝트를 선택해 주세요.');
      return;
    }
    mockGo('리포트 출력');
  }, [view, selected, mockGo]);

  return (
    <div className={styles.hubRoot}>
      {/* Top bar */}
      <div className={styles.topBar}>
        <div className={styles.topBarLeft}>
          <Link href="/landing" className={styles.topBarLogo}>
            <img alt="ZEBA" src="/assets/images/logo-company.png" className={styles.topBarLogoImg} />
          </Link>
          <span className={styles.topBarSub}>프로젝트 허브</span>
        </div>

        <div className={styles.topBarRight}>
          <div className={styles.searchWrap}>
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="프로젝트 검색 (이름/지역/용도)"
              className={styles.searchInput}
              allowClear
            />
            <div className={styles.searchDivider} />
            <Select
              value={statusFilter}
              onChange={(v) => setStatusFilter(v as ProjectStatus | '전체')}
              className={styles.statusSelect}
              options={[
                { value: '전체', label: '전체' },
                { value: '신규', label: '신규' },
                { value: '진행중', label: '진행중' },
                { value: '완료', label: '완료' },
              ]}
            />
          </div>

          {view === 'project' && (
            <Button className={styles.topBarBtn} onClick={() => setView('home')}>
              전체 현황
            </Button>
          )}
          <Button className={styles.topBarBtn} onClick={openReport}>
            리포트 출력
          </Button>
          <Button type="primary" className={styles.createButton} onClick={() => setOpenCreate(true)}>
            <PlusOutlined /> 프로젝트 생성
          </Button>
        </div>
      </div>

      <CreateProjectDialog open={openCreate} onOpenChange={setOpenCreate} onCreate={createProject} />

      {/* Body */}
      <div className={styles.body}>
        {/* Left panel */}
        <div className={styles.leftPanel}>
          <div className={styles.leftPanelMobile}>
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="프로젝트 검색"
            />
            <Select
              value={statusFilter}
              onChange={(v) => setStatusFilter(v as ProjectStatus | '전체')}
              className={styles.leftPanelSelect}
              options={[
                { value: '전체', label: '전체' },
                { value: '신규', label: '신규' },
                { value: '진행중', label: '진행중' },
                { value: '완료', label: '완료' },
              ]}
            />
          </div>

          {view === 'home' ? (
            <PlatformNav onGo={mockGo} />
          ) : (
            <>
              <Card className={styles.panelCard}>
                <div className={styles.panelCardTitle}>프로젝트 전환</div>
                <Select
                  value={selectedId ?? undefined}
                  onChange={(v) => openProject(v)}
                  className={styles.projectSelect}
                  placeholder="프로젝트 선택"
                  options={projects.map((p) => ({ value: p.id, label: p.name }))}
                />
                {selected ? (
                  <div className={styles.selectedSummary}>
                    <div className={styles.selectedName}>{selected.name}</div>
                    <div className={styles.selectedMeta}>
                      {selected.region} · {selected.use} · {fmt(selected.gfa)}㎡
                    </div>
                    <StatusBadge status={selected.status} />
                  </div>
                ) : (
                  <div className={styles.selectedPlaceholder}>프로젝트를 선택하세요.</div>
                )}
              </Card>

              <Card className={styles.panelCard}>
                <div className={styles.panelCardTitle}>기능</div>
                <div className={styles.workspaceButtons}>
                  <WorkspaceLeftButton
                    active={activeTab === 'zeb'}
                    label={MODULE_LABEL.zeb}
                    onClick={() => setActiveTab('zeb')}
                  />
                  <WorkspaceLeftButton
                    active={activeTab === 'epi'}
                    label={MODULE_LABEL.epi}
                    onClick={() => setActiveTab('epi')}
                  />
                  <WorkspaceLeftButton
                    active={activeTab === 'ren'}
                    label={MODULE_LABEL.ren}
                    onClick={() => setActiveTab('ren')}
                  />
                  <Divider className={styles.navDivider} />
                  <WorkspaceLeftButton
                    active={activeTab === 'consult'}
                    label={MODULE_LABEL.consult}
                    onClick={() => setActiveTab('consult')}
                  />
                  <Divider className={styles.navDivider} />
                  <WorkspaceLeftButton
                    active={activeTab === 'collab'}
                    label={MODULE_LABEL.collab}
                    onClick={() => setActiveTab('collab')}
                  />
                  <div className={styles.recentActivityWrap}>
                    <RecentActivity
                      items={activityItems}
                      compact
                      onOpen={() => setActiveTab('collab')}
                    />
                  </div>
                </div>
              </Card>
            </>
          )}
        </div>

        {/* Right panel */}
        <div className={styles.rightPanel}>
          {view === 'home' ? (
            <>
              <div className={styles.kpiRow}>
                <KpiTile label="전체 프로젝트" value={kpi.total} />
                <KpiTile label="진행중" value={kpi.active} />
                <KpiTile label="완료" value={kpi.done} />
                <KpiTile label="보완 필요" value={kpi.need} />
              </div>

              <div className={styles.projectGrid}>
                {filtered.map((p) => (
                  <Card
                    key={p.id}
                    className={styles.projectCard}
                    hoverable
                    onClick={() => openProject(p.id)}
                  >
                    <div className={styles.projectCardHeader}>
                      <div className={styles.projectCardTitle}>{p.name}</div>
                      <StatusBadge status={p.status} />
                    </div>
                    <div className={styles.projectCardMeta}>
                      {p.region} / {p.use} / {fmt(p.gfa)}㎡
                    </div>
                    <div className={styles.projectCardGrade}>
                      목표 ZEB <strong>{p.targetGrade}</strong> · {p.floors}F
                    </div>
                    <MiniMap map={p.map} />
                    <div className={styles.projectCardUpdated}>업데이트 · {p.updatedAt}</div>
                  </Card>
                ))}
              </div>

              {filtered.length === 0 && (
                <div className={styles.emptyState}>
                  프로젝트가 없습니다. 우측 상단에서 <strong>+ 프로젝트 생성</strong>을 눌러 시작하세요.
                </div>
              )}
            </>
          ) : (
            <>
              {!selected ? (
                <div className={styles.emptyState}>프로젝트를 선택하세요.</div>
              ) : (
                <div className={styles.workspaceContent}>
                  <Card className={styles.workspaceHeaderCard}>
                    <div className={styles.workspaceHeaderRow}>
                      <div>
                        <div className={styles.workspaceHeaderName}>{selected.name}</div>
                        <div className={styles.workspaceHeaderMeta}>
                          {selected.region} · {selected.use} · {fmt(selected.gfa)}㎡ · {selected.floors}F · 목표 ZEB {selected.targetGrade}
                        </div>
                      </div>
                      <StatusBadge status={selected.status} />
                    </div>
                    <div className={styles.workspaceMiniMap}>
                      <MiniMap map={selected.map} compact />
                    </div>
                    <div className={styles.workspaceHeaderUpdated}>업데이트 · {selected.updatedAt}</div>
                  </Card>

                  <div className={styles.moduleKpiRow}>
                    {(() => {
                      const m = moduleMockMetric(selected);
                      return (
                        <>
                          <ModuleKpiCard
                            title="ZEB"
                            target={selected.targetGrade}
                            current={selected.map.zeb === 'none' ? '–' : m.zebCurrent}
                            margin={selected.map.zeb === 'none' ? '–' : marginText(m.zebMargin)}
                            unit="등급"
                            state={selected.map.zeb}
                            hint="목표 등급 대비"
                            onOpen={() => moduleOpen('zeb')}
                          />
                          <ModuleKpiCard
                            title="EPI"
                            target={65}
                            current={selected.map.epi === 'none' ? '–' : m.epiCurrent}
                            margin={selected.map.epi === 'none' ? '–' : marginText(m.epiMargin)}
                            unit="점"
                            state={selected.map.epi}
                            hint="기준 65점"
                            onOpen={() => moduleOpen('epi')}
                          />
                          <ModuleKpiCard
                            title="신재생"
                            target={20}
                            current={selected.map.ren === 'none' ? '–' : m.renCurrent}
                            margin={selected.map.ren === 'none' ? '–' : marginText(m.renMargin)}
                            unit="%"
                            state={selected.map.ren}
                            hint="의무 공급비율"
                            onOpen={() => moduleOpen('ren')}
                          />
                        </>
                      );
                    })()}
                  </div>

                  <Card className={styles.depth3Card}>
                    <div className={styles.depth3Title}>Depth 3 — 작업 영역</div>
                    <div className={styles.depth3Body}>
                      {activeTab === 'collab' ? (
                        <>
                          <p className={styles.depth3Intro}>
                            <strong>협업</strong>은 이 영역에서 진행됩니다.
                          </p>
                          <div className={styles.collabGrid}>
                            <div className={styles.collabBlock}>
                              <div className={styles.collabBlockTitle}>초대</div>
                              <div className={styles.collabBlockRow}>
                                <Input placeholder="이메일 또는 팀원명" />
                                <Button type="primary" onClick={() => mockGo('협업 초대')}>
                                  초대
                                </Button>
                              </div>
                              <div className={styles.collabHint}>* 초대/권한/링크 공유는 다음 단계에서 연결</div>
                            </div>
                            <div className={styles.collabBlock}>
                              <div className={styles.collabBlockTitle}>코멘트</div>
                              <Input placeholder="메모/요청사항" />
                              <div className={styles.collabBlockRow}>
                                <Button type="primary" onClick={() => mockGo('댓글 등록')}>
                                  등록
                                </Button>
                                <Button onClick={() => mockGo('파일 업로드')}>파일 업로드</Button>
                              </div>
                            </div>
                          </div>

                          <div className={styles.sharedFilesBlock}>
                            <div className={styles.sharedFilesHeader}>
                              <span className={styles.collabBlockTitle}>자료 공유</span>
                              <label>
                                <input type="file" className={styles.hiddenInput} onChange={onPickFile} />
                                <Button type="default">파일 선택</Button>
                              </label>
                            </div>
                            <div className={styles.pickedFileRow}>
                              <div className={styles.pickedFileDisplay}>
                                {pickedFile ? (
                                  <span>{pickedFile.name} · {fmtBytes(pickedFile.size)}</span>
                                ) : (
                                  <span className={styles.muted}>선택된 파일 없음</span>
                                )}
                              </div>
                              <Button type="primary" onClick={uploadPickedFile} disabled={!pickedFile}>
                                업로드
                              </Button>
                            </div>
                            <div className={styles.uploadedList}>
                              <div className={styles.uploadedListHeader}>업로드된 파일</div>
                              <div className={styles.uploadedListBody}>
                                {sharedFiles.length === 0 ? (
                                  <div className={styles.muted}>아직 공유된 파일이 없습니다.</div>
                                ) : (
                                  sharedFiles.map((f) => (
                                    <div key={f.id} className={styles.uploadedItem}>
                                      <div>
                                        <div className={styles.uploadedItemName}>{f.name}</div>
                                        <div className={styles.uploadedItemMeta}>
                                          {fmtBytes(f.size)} · {f.uploadedAt}
                                        </div>
                                      </div>
                                      <div className={styles.uploadedItemActions}>
                                        <Button size="small" onClick={() => downloadFile(f)}>
                                          다운로드
                                        </Button>
                                        <Button size="small" danger onClick={() => removeFile(f)}>
                                          삭제
                                        </Button>
                                      </div>
                                    </div>
                                  ))
                                )}
                              </div>
                            </div>
                            <div className={styles.collabHint}>
                              * (미리보기) 현재는 로컬 상태로만 동작합니다. 권한/버전/서버 저장은 다음 단계에서 연결합니다.
                            </div>
                          </div>

                          <RecentActivity items={activityItems} onOpen={() => mockGo('타임라인 보기')} />
                        </>
                      ) : (
                        <>
                          <p className={styles.depth3Intro}>
                            <strong>{MODULE_LABEL[activeTab]}</strong> 상세 UI 영역
                          </p>
                          <div className={styles.modulePlaceholder}>
                            (미리보기) {MODULE_LABEL[activeTab]} 화면 자리
                          </div>
                          <div className={styles.moduleActions}>
                            <Button type="primary" onClick={() => mockGo('작업 시작')}>
                              작업 시작
                            </Button>
                            <Button onClick={() => mockGo('저장')}>저장</Button>
                            <Button onClick={() => mockGo('검증')}>검증</Button>
                          </div>
                        </>
                      )}
                    </div>
                  </Card>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
