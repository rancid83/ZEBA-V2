import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ------------------------------------------------------------
// ZEBA — UI 미리보기 (Refined)
// Depth 1: 프로젝트 허브 (프로젝트 카드 + 미니맵)
//   - 상단: 프로젝트 검색 + 상태 필터
//   - 좌측: 플랫폼(마이페이지/설정/구독...)
// Depth 2: 프로젝트 워크스페이스
//   - 상단: 미니맵(아이콘만)
//   - 대시보드: ZEB/EPI/신재생/컨설팅 KPI 카드(목표치 + 현재 + 여유율 + 상태 배지)
//   - 좌측: 기능(모듈) + (협업 초대 아래) 최근 활동
//   - 우측: Depth 3 작업 영역
// ------------------------------------------------------------

type ModuleKey = "zeb" | "epi" | "ren" | "consult";

type ModuleState = "pass" | "fail" | "progress" | "none";

type ProjectStatus = "신규" | "진행중" | "완료";

type Project = {
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

type WorkspaceTab = "zeb" | "epi" | "ren" | "consult" | "collab";

const MODULE_LABEL: Record<WorkspaceTab, string> = {
  zeb: "ZEB 예측",
  epi: "EPI 검토",
  ren: "신재생 검토",
  consult: "컨설팅 연계",
  collab: "협업 초대",
};

function fmt(n: number) {
  return new Intl.NumberFormat("ko-KR").format(n);
}

function nowStamp() {
  const d = new Date();
  const yy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${yy}-${mm}-${dd} ${hh}:${mi}`;
}

function makeId() {
  return Math.random().toString(16).slice(2, 10);
}

function StatusBadge({ status }: { status: ProjectStatus }) {
  if (status === "신규")
    return (
      <Badge variant="secondary" className="rounded-full">
        신규
      </Badge>
    );
  if (status === "완료")
    return (
      <Badge className="rounded-full bg-emerald-600 hover:bg-emerald-600">
        완료
      </Badge>
    );
  return (
    <Badge className="rounded-full bg-slate-900 hover:bg-slate-900">진행중</Badge>
  );
}

function dot(state: ModuleState) {
  if (state === "pass") return "●";
  if (state === "fail") return "⚠";
  if (state === "progress") return "◐";
  return "–";
}

function stateBadge(state: ModuleState) {
  if (state === "pass")
    return (
      <Badge className="rounded-full bg-emerald-600 hover:bg-emerald-600">
        만족
      </Badge>
    );
  if (state === "fail")
    return (
      <Badge className="rounded-full bg-rose-600 hover:bg-rose-600">
        불만족
      </Badge>
    );
  if (state === "progress")
    return (
      <Badge className="rounded-full bg-slate-900 hover:bg-slate-900">진행</Badge>
    );
  return (
    <Badge variant="secondary" className="rounded-full">
      미실행
    </Badge>
  );
}

function marginText(v: number | null) {
  if (v === null || Number.isNaN(v)) return "–";
  const sign = v > 0 ? "+" : "";
  return `${sign}${v}`;
}

function MiniMap({ map, compact }: { map: Project["map"]; compact?: boolean }) {
  const Item = ({ label, state }: { label: string; state: ModuleState }) => (
    <div
      className={`rounded-2xl border bg-white ${compact ? "px-2 py-2" : "px-3 py-2"}`}
    >
      <div className="flex items-center justify-between">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="text-sm font-semibold" aria-label={`${label}:${state}`}>
          {dot(state)}
        </div>
      </div>
      {!compact ? (
        <div className="mt-1 text-[11px] text-muted-foreground">
          {state === "pass"
            ? "만족"
            : state === "fail"
              ? "불만족"
              : state === "progress"
                ? "진행"
                : "미실행"}
        </div>
      ) : null}
    </div>
  );

  return (
    <div className="grid grid-cols-4 gap-2">
      <Item label="ZEB" state={map.zeb} />
      <Item label="EPI" state={map.epi} />
      <Item label="신재생" state={map.ren} />
      <Item label="컨설팅" state={map.consult} />
    </div>
  );
}

function CreateProjectDialog({
  open,
  onOpenChange,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreate: (p: Omit<Project, "id" | "updatedAt" | "map">) => void;
}) {
  const [name, setName] = useState("");
  const [region, setRegion] = useState("서울");
  const [use, setUse] = useState("업무시설");
  const [gfa, setGfa] = useState(12000);
  const [floors, setFloors] = useState(10);
  const [target, setTarget] = useState(3);

  const submit = () => {
    onCreate({
      name: name.trim() || `${region} ${use} (신규)`,
      region,
      use,
      gfa,
      floors,
      targetGrade: target,
      status: "신규",
    });
    onOpenChange(false);
    setName("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[680px] rounded-3xl">
        <DialogHeader>
          <DialogTitle>프로젝트 생성</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label className="text-sm">프로젝트명</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: 성수 업무시설"
              className="rounded-2xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label className="text-sm">지역</Label>
              <Select value={region} onValueChange={setRegion}>
                <SelectTrigger className="rounded-2xl">
                  <SelectValue placeholder="지역 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="서울">서울</SelectItem>
                  <SelectItem value="경기">경기</SelectItem>
                  <SelectItem value="인천">인천</SelectItem>
                  <SelectItem value="부산">부산</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label className="text-sm">용도</Label>
              <Select value={use} onValueChange={setUse}>
                <SelectTrigger className="rounded-2xl">
                  <SelectValue placeholder="용도 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="업무시설">업무시설</SelectItem>
                  <SelectItem value="교육연구시설">교육연구시설</SelectItem>
                  <SelectItem value="공동주택">공동주택</SelectItem>
                  <SelectItem value="상업시설">상업시설</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label className="text-sm">연면적(㎡)</Label>
              <Input
                type="number"
                value={gfa}
                onChange={(e) => setGfa(Number(e.target.value))}
                className="rounded-2xl"
              />
            </div>

            <div className="grid gap-2">
              <Label className="text-sm">층수</Label>
              <Input
                type="number"
                value={floors}
                onChange={(e) => setFloors(Number(e.target.value))}
                className="rounded-2xl"
              />
            </div>

            <div className="grid gap-2 col-span-2">
              <Label className="text-sm">목표 ZEB 등급</Label>
              <Select
                value={String(target)}
                onValueChange={(v) => setTarget(Number(v))}
              >
                <SelectTrigger className="rounded-2xl">
                  <SelectValue placeholder="목표 등급" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1</SelectItem>
                  <SelectItem value="2">2</SelectItem>
                  <SelectItem value="3">3</SelectItem>
                  <SelectItem value="4">4</SelectItem>
                  <SelectItem value="5">5</SelectItem>
                </SelectContent>
              </Select>
              <div className="text-xs text-muted-foreground">
                * 생성 후, 표준모델(시나리오 A)을 기반으로 시나리오 비교를 진행합니다.
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            className="rounded-2xl"
            onClick={() => onOpenChange(false)}
          >
            취소
          </Button>
          <Button className="rounded-2xl" onClick={submit}>
            생성
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function KpiTile({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Card className="rounded-2xl">
      <CardContent className="p-4">
        <div className="text-sm text-muted-foreground">{label}</div>
        <div className="text-2xl font-semibold">{value}</div>
      </CardContent>
    </Card>
  );
}

function WorkspaceLeftButton({
  active,
  label,
  onClick,
  variant,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
  variant?: "default" | "outline";
}) {
  return (
    <Button
      onClick={onClick}
      variant={variant ?? (active ? "default" : "outline")}
      className="w-full rounded-2xl justify-between"
    >
      <span>{label}</span>
      <span className="text-xs text-muted-foreground">열기</span>
    </Button>
  );
}

function PlatformNav({ onGo }: { onGo: (label: string) => void }) {
  return (
    <Card className="rounded-2xl">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">플랫폼</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <Button
          variant="outline"
          className="w-full rounded-2xl justify-between"
          onClick={() => onGo("마이페이지")}
        >
          <span>마이페이지</span>
          <span className="text-xs text-muted-foreground">열기</span>
        </Button>
        <Button
          variant="outline"
          className="w-full rounded-2xl justify-between"
          onClick={() => onGo("설정")}
        >
          <span>설정</span>
          <span className="text-xs text-muted-foreground">열기</span>
        </Button>
        <Button
          variant="outline"
          className="w-full rounded-2xl justify-between"
          onClick={() => onGo("구독")}
        >
          <span>구독</span>
          <span className="text-xs text-muted-foreground">열기</span>
        </Button>
        <Separator />
        <Button
          variant="outline"
          className="w-full rounded-2xl justify-between"
          onClick={() => onGo("도움말")}
        >
          <span>도움말</span>
          <span className="text-xs text-muted-foreground">열기</span>
        </Button>
      </CardContent>
    </Card>
  );
}

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
  return (
    <Card className="rounded-2xl">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-sm">최근 활동</CardTitle>
          {onOpen ? (
            <Button
              size="sm"
              variant="outline"
              className="rounded-2xl"
              onClick={onOpen}
            >
              열기
            </Button>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className={compact ? "space-y-2" : "space-y-3"}>
        {items.slice(0, compact ? 3 : 6).map((it, idx) => (
          <div key={idx} className="rounded-2xl border p-3">
            <div className="text-xs text-muted-foreground">{it.at}</div>
            <div className="mt-1 text-sm">{it.text}</div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

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
    <Card className="rounded-2xl">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="text-sm font-semibold truncate">{title}</div>
            {hint ? (
              <div className="mt-1 text-xs text-muted-foreground line-clamp-1">
                {hint}
              </div>
            ) : null}
          </div>
          <div className="shrink-0">{stateBadge(state)}</div>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-3">
          <div className="rounded-2xl border bg-white p-3">
            <div className="text-xs text-muted-foreground">목표</div>
            <div className="mt-1 text-xl font-semibold">
              {target}
              {unit ? (
                <span className="ml-1 text-sm text-muted-foreground">{unit}</span>
              ) : null}
            </div>
          </div>
          <div className="rounded-2xl border bg-white p-3">
            <div className="text-xs text-muted-foreground">현재</div>
            <div className="mt-1 text-xl font-semibold">
              {current}
              {unit ? (
                <span className="ml-1 text-sm text-muted-foreground">{unit}</span>
              ) : null}
            </div>
          </div>
          <div className="rounded-2xl border bg-white p-3">
            <div className="text-xs text-muted-foreground">여유율</div>
            <div className="mt-1 text-xl font-semibold">
              {margin}
              {unit ? (
                <span className="ml-1 text-sm text-muted-foreground">{unit}</span>
              ) : null}
            </div>
          </div>
        </div>

        <div className="mt-3">
          <Button className="w-full rounded-2xl" onClick={onOpen}>
            열기
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ZEBAProjectHub() {
  const [view, setView] = useState<"home" | "project">("home");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<WorkspaceTab>("zeb");

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | "전체">("전체");
  const [openCreate, setOpenCreate] = useState(false);

  const [projects, setProjects] = useState<Project[]>([
    {
      id: "p-001",
      name: "성수 업무시설",
      region: "서울",
      use: "업무시설",
      gfa: 12800,
      floors: 12,
      targetGrade: 3,
      status: "진행중",
      updatedAt: "2026-03-03 17:20",
      map: { zeb: "pass", epi: "fail", ren: "pass", consult: "none" },
    },
    {
      id: "p-002",
      name: "동탄 교육연구시설",
      region: "경기",
      use: "교육연구시설",
      gfa: 9200,
      floors: 7,
      targetGrade: 4,
      status: "진행중",
      updatedAt: "2026-03-02 11:05",
      map: { zeb: "pass", epi: "pass", ren: "none", consult: "none" },
    },
    {
      id: "p-003",
      name: "여의도 공동주택(가칭)",
      region: "서울",
      use: "공동주택",
      gfa: 18500,
      floors: 20,
      targetGrade: 2,
      status: "신규",
      updatedAt: "2026-03-03 09:12",
      map: { zeb: "none", epi: "none", ren: "none", consult: "none" },
    },
  ]);

  // ------------------------------------------------------------
  // Collab: 파일 업로드/다운로드 (미리보기용 로컬 상태)
  // ------------------------------------------------------------
  type SharedFile = {
    id: string;
    name: string;
    size: number;
    type: string;
    uploadedAt: string;
    blobUrl: string;
  };

  const [sharedFiles, setSharedFiles] = useState<SharedFile[]>([
    {
      id: "f-001",
      name: "설계도면_초안.pdf",
      size: 2_345_000,
      type: "application/pdf",
      uploadedAt: "2026-03-03 14:10",
      blobUrl: "",
    },
  ]);

  const [pickedFile, setPickedFile] = useState<File | null>(null);

  const onPickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setPickedFile(f);
    e.target.value = "";
  };

  const uploadPickedFile = () => {
    if (!pickedFile) return;

    const url = URL.createObjectURL(pickedFile);
    const item: SharedFile = {
      id: `f-${makeId()}`,
      name: pickedFile.name,
      size: pickedFile.size,
      type: pickedFile.type || "application/octet-stream",
      uploadedAt: nowStamp(),
      blobUrl: url,
    };

    setSharedFiles((prev) => [item, ...prev]);
    setPickedFile(null);
  };

  const mockGo = (label: string) => {
    alert(`${label} (미리보기)\n\n- 실제 기능/라우팅은 다음 단계에서 연결`);
  };

  const downloadFile = (f: SharedFile) => {
    if (!f.blobUrl) {
      mockGo(`다운로드(미리보기): ${f.name}`);
      return;
    }

    const a = document.createElement("a");
    a.href = f.blobUrl;
    a.download = f.name;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const removeFile = (f: SharedFile) => {
    if (f.blobUrl) URL.revokeObjectURL(f.blobUrl);
    setSharedFiles((prev) => prev.filter((x) => x.id !== f.id));
  };

  const fmtBytes = (n: number) => {
    if (!n) return "0 B";
    const units = ["B", "KB", "MB", "GB"];
    const idx = Math.min(units.length - 1, Math.floor(Math.log(n) / Math.log(1024)));
    const v = n / Math.pow(1024, idx);
    const fixed = idx === 0 ? 0 : v < 10 ? 1 : 0;
    return `${v.toFixed(fixed)} ${units[idx]}`;
  };

  const selected = useMemo(() => {
    if (!selectedId) return null;
    return projects.find((p) => p.id === selectedId) || null;
  }, [projects, selectedId]);

  const kpi = useMemo(() => {
    const total = projects.length;
    const newCount = projects.filter((p) => p.status === "신규").length;
    const inProgressCount = projects.filter((p) => p.status === "진행중").length;
    const completedCount = projects.filter((p) => p.status === "완료").length;
    return { total, newCount, inProgressCount, completedCount };
  }, [projects]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return projects
      .filter((p) => (statusFilter === "전체" ? true : p.status === statusFilter))
      .filter((p) => {
        if (!q) return true;
        const hay = `${p.name} ${p.region} ${p.use}`.toLowerCase();
        return hay.includes(q);
      })
      .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
  }, [projects, query, statusFilter]);

  const createProject = (base: Omit<Project, "id" | "updatedAt" | "map">) => {
    const p: Project = {
      id: `p-${makeId()}`,
      updatedAt: nowStamp(),
      map: { zeb: "none", epi: "none", ren: "none", consult: "none" },
      ...base,
    };
    setProjects((prev) => [p, ...prev]);
    setSelectedId(p.id);
    setActiveTab("zeb");
    setView("project");
  };

  const openProject = (id: string) => {
    setSelectedId(id);
    setActiveTab("zeb");
    setView("project");
  };

  const moduleOpen = (tab: WorkspaceTab) => {
    setActiveTab(tab);
    mockGo(MODULE_LABEL[tab]);
  };

  const moduleMockMetric = (p: Project) => {
    const zebCurrent =
      p.map.zeb === "pass"
        ? Math.max(1, p.targetGrade - 1)
        : p.map.zeb === "fail"
          ? p.targetGrade + 1
          : p.targetGrade;
    const epiCurrent = p.map.epi === "pass" ? 68 : p.map.epi === "fail" ? 62 : 0;
    const renCurrent = p.map.ren === "pass" ? 21.5 : p.map.ren === "fail" ? 17.0 : 0;

    const zebMargin = p.map.zeb === "none" ? null : Number(p.targetGrade) - Number(zebCurrent);
    const epiMargin = p.map.epi === "none" ? null : Number(epiCurrent) - 65;
    const renMargin = p.map.ren === "none" ? null : Number(renCurrent) - 20;

    return {
      zebCurrent,
      epiCurrent,
      renCurrent,
      zebMargin,
      epiMargin,
      renMargin,
    };
  };

  const activityItems: Activity[] = [
    { at: "2026-03-03 17:20", text: "EPI 점수 업데이트" },
    { at: "2026-03-03 15:40", text: "협업 댓글 추가" },
    { at: "2026-03-03 14:10", text: "파일 업로드 (설계도면)" },
    { at: "2026-03-02 11:05", text: "ZEB 시나리오 A 생성" },
  ];

  const openReport = () => {
    if (view !== "project" || !selected) {
      alert("리포트는 프로젝트 내부에서 출력합니다.\n\n- 프로젝트를 선택해 주세요.");
      return;
    }
    mockGo("리포트 출력");
  };

  const __DEV__ = typeof process !== "undefined" ? process.env?.NODE_ENV !== "production" : true;
  if (__DEV__) {
    console.assert(dot("pass") === "●", "dot(pass) should be ●");
    console.assert(dot("fail") === "⚠", "dot(fail) should be ⚠");
    console.assert(dot("progress") === "◐", "dot(progress) should be ◐");
    console.assert(dot("none") === "–", "dot(none) should be –");

    console.assert(marginText(null) === "–", "marginText(null) should be –");
    console.assert(marginText(3) === "+3", "marginText(3) should be +3");
    console.assert(marginText(-2) === "-2", "marginText(-2) should be -2");

    console.assert(MODULE_LABEL.zeb === "ZEB 예측", "MODULE_LABEL.zeb should exist");
    console.assert(MODULE_LABEL.collab === "협업 초대", "MODULE_LABEL.collab should exist");

    const _m = moduleMockMetric({
      id: "t",
      name: "t",
      region: "서울",
      use: "업무시설",
      gfa: 1000,
      floors: 1,
      targetGrade: 3,
      status: "진행중",
      updatedAt: "2026-03-01 00:00",
      map: { zeb: "pass", epi: "fail", ren: "none", consult: "progress" },
    });
    console.assert(typeof _m.zebCurrent === "number", "mock metric zebCurrent should be number");
    console.assert(_m.epiCurrent === 62, "mock metric epiCurrent should be 62 when fail");
    console.assert(_m.renCurrent === 0, "mock metric renCurrent should be 0 when none");
  }

  return (
    <div className="w-full min-h-screen bg-white flex flex-col">
      {/* Top bar */}
      <div className="h-14 border-b flex items-center justify-between px-6 sticky top-0 bg-white/80 backdrop-blur z-10">
        <div className="flex items-center gap-2">
          <div className="font-semibold">ZEBA</div>
          <div className="text-xs text-muted-foreground">프로젝트 허브</div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-2 rounded-2xl border bg-white px-3 py-2 w-[520px]">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="프로젝트 검색 (이름/지역/용도)"
              className="border-0 shadow-none focus-visible:ring-0"
            />
            <div className="w-px h-6 bg-border" />
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
              <SelectTrigger className="w-[140px] rounded-2xl border-0 shadow-none focus:ring-0">
                <SelectValue placeholder="상태" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="전체">전체</SelectItem>
                <SelectItem value="신규">신규</SelectItem>
                <SelectItem value="진행중">진행중</SelectItem>
                <SelectItem value="완료">완료</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {view === "project" ? (
            <Button variant="outline" className="rounded-2xl" onClick={() => setView("home")}>
              전체 현황
            </Button>
          ) : null}

          <Button variant="outline" className="rounded-2xl" onClick={openReport}>
            리포트 출력
          </Button>
          <Button className="rounded-2xl" onClick={() => setOpenCreate(true)}>
            + 프로젝트 생성
          </Button>
        </div>
      </div>

      <CreateProjectDialog open={openCreate} onOpenChange={setOpenCreate} onCreate={createProject} />

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel */}
        <div className="w-72 border-r p-4 space-y-4">
          <div className="md:hidden space-y-2">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="프로젝트 검색"
              className="rounded-2xl"
            />
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
              <SelectTrigger className="rounded-2xl">
                <SelectValue placeholder="상태" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="전체">전체</SelectItem>
                <SelectItem value="신규">신규</SelectItem>
                <SelectItem value="진행중">진행중</SelectItem>
                <SelectItem value="완료">완료</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {view === "home" ? (
            <>
              <PlatformNav onGo={mockGo} />
            </>
          ) : (
            <>
              <Card className="rounded-2xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">프로젝트 전환</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Select value={selectedId ?? ""} onValueChange={(v) => openProject(v)}>
                    <SelectTrigger className="rounded-2xl">
                      <SelectValue placeholder="프로젝트 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {selected ? (
                    <div className="rounded-2xl border bg-muted/10 p-3">
                      <div className="text-sm font-semibold truncate">{selected.name}</div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {selected.region} · {selected.use} · {fmt(selected.gfa)}㎡
                      </div>
                      <div className="mt-2">
                        <StatusBadge status={selected.status} />
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-2xl border p-3 text-xs text-muted-foreground">
                      프로젝트를 선택하세요.
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="rounded-2xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">기능</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <WorkspaceLeftButton
                    active={activeTab === "zeb"}
                    label={MODULE_LABEL.zeb}
                    onClick={() => setActiveTab("zeb")}
                    variant={activeTab === "zeb" ? "default" : "outline"}
                  />
                  <WorkspaceLeftButton
                    active={activeTab === "epi"}
                    label={MODULE_LABEL.epi}
                    onClick={() => setActiveTab("epi")}
                  />
                  <WorkspaceLeftButton
                    active={activeTab === "ren"}
                    label={MODULE_LABEL.ren}
                    onClick={() => setActiveTab("ren")}
                  />
                  <Separator />
                  <WorkspaceLeftButton
                    active={activeTab === "consult"}
                    label={MODULE_LABEL.consult}
                    onClick={() => setActiveTab("consult")}
                  />
                  <Separator />
                  <WorkspaceLeftButton
                    active={activeTab === "collab"}
                    label={MODULE_LABEL.collab}
                    onClick={() => setActiveTab("collab")}
                  />

                  <div className="pt-2">
                    <RecentActivity items={activityItems} compact onOpen={() => setActiveTab("collab")} />
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Right panel */}
        <div className="flex-1 p-6 overflow-auto">
          {view === "home" ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <KpiTile label="전체 프로젝트" value={kpi.total} />
                <KpiTile label="신규" value={kpi.newCount} />
                <KpiTile label="진행중" value={kpi.inProgressCount} />
                <KpiTile label="완료" value={kpi.completedCount} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filtered.map((p) => (
                  <Card
                    key={p.id}
                    className="rounded-2xl hover:shadow-md transition cursor-pointer"
                    onClick={() => openProject(p.id)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-base truncate">{p.name}</CardTitle>
                        <div className="shrink-0">
                          <StatusBadge status={p.status} />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="text-sm text-muted-foreground">
                        {p.region} / {p.use} / {fmt(p.gfa)}㎡
                      </div>
                      <div className="text-sm">
                        목표 ZEB <span className="font-semibold">{p.targetGrade}</span> · {p.floors}F
                      </div>
                      <MiniMap map={p.map} />
                      <div className="text-xs text-muted-foreground">업데이트 · {p.updatedAt}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filtered.length === 0 ? (
                <div className="mt-6 rounded-2xl border p-8 text-center text-sm text-muted-foreground">
                  프로젝트가 없습니다. 우측 상단에서 <span className="font-medium text-foreground">+ 프로젝트 생성</span>을 눌러 시작하세요.
                </div>
              ) : null}
            </>
          ) : (
            <>
              {!selected ? (
                <div className="rounded-2xl border p-10 text-center text-sm text-muted-foreground">프로젝트를 선택하세요.</div>
              ) : (
                <div className="flex flex-col gap-4 min-h-[760px]">
                  <Card className="rounded-2xl">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-lg font-semibold truncate">{selected.name}</div>
                          <div className="mt-1 text-xs text-muted-foreground">
                            {selected.region} · {selected.use} · {fmt(selected.gfa)}㎡ · {selected.floors}F · 목표 ZEB {selected.targetGrade}
                          </div>
                        </div>
                        <div className="shrink-0 flex items-center gap-2">
                          <StatusBadge status={selected.status} />
                        </div>
                      </div>

                      <div className="mt-4">
                        <MiniMap map={selected.map} compact />
                      </div>

                      <div className="mt-3 text-xs text-muted-foreground">업데이트 · {selected.updatedAt}</div>
                    </CardContent>
                  </Card>

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {(() => {
                      const m = moduleMockMetric(selected);
                      return (
                        <>
                          <ModuleKpiCard
                            title="ZEB"
                            target={selected.targetGrade}
                            current={selected.map.zeb === "none" ? "–" : m.zebCurrent}
                            margin={selected.map.zeb === "none" ? "–" : marginText(m.zebMargin)}
                            unit="등급"
                            state={selected.map.zeb}
                            hint="목표 등급 대비"
                            onOpen={() => moduleOpen("zeb")}
                          />
                          <ModuleKpiCard
                            title="EPI"
                            target={65}
                            current={selected.map.epi === "none" ? "–" : m.epiCurrent}
                            margin={selected.map.epi === "none" ? "–" : marginText(m.epiMargin)}
                            unit="점"
                            state={selected.map.epi}
                            hint="기준 65점"
                            onOpen={() => moduleOpen("epi")}
                          />
                          <ModuleKpiCard
                            title="신재생"
                            target={20}
                            current={selected.map.ren === "none" ? "–" : m.renCurrent}
                            margin={selected.map.ren === "none" ? "–" : marginText(m.renMargin)}
                            unit="%"
                            state={selected.map.ren}
                            hint="의무 공급비율"
                            onOpen={() => moduleOpen("ren")}
                          />
                        </>
                      );
                    })()}
                  </div>

                  <div className="grid grid-cols-1 gap-4 flex-1">
                    <Card className="rounded-2xl">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Depth 3 — 작업 영역</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {activeTab === "collab" ? (
                          <>
                            <div className="text-sm text-muted-foreground">
                              <span className="font-medium text-foreground">협업</span>은 이 영역에서 진행됩니다.
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div className="rounded-2xl border bg-white p-4">
                                <div className="text-sm font-semibold">초대</div>
                                <div className="mt-2 flex gap-2">
                                  <Input placeholder="이메일 또는 팀원명" className="rounded-2xl" />
                                  <Button className="rounded-2xl" onClick={() => mockGo("협업 초대")}>
                                    초대
                                  </Button>
                                </div>
                                <div className="mt-2 text-xs text-muted-foreground">* 초대/권한/링크 공유는 다음 단계에서 연결</div>
                              </div>
                              <div className="rounded-2xl border bg-white p-4">
                                <div className="text-sm font-semibold">코멘트</div>
                                <div className="mt-2">
                                  <Input placeholder="메모/요청사항" className="rounded-2xl" />
                                </div>
                                <div className="mt-2 flex gap-2">
                                  <Button className="rounded-2xl" onClick={() => mockGo("댓글 등록")}>
                                    등록
                                  </Button>
                                  <Button variant="outline" className="rounded-2xl" onClick={() => mockGo("파일 업로드")}>
                                    파일 업로드
                                  </Button>
                                </div>
                              </div>
                            </div>

                            {/* 자료 공유 (업로드/다운로드 레이어) */}
                            <div className="rounded-2xl border bg-white p-4">
                              <div className="flex items-center justify-between gap-2">
                                <div className="text-sm font-semibold">자료 공유</div>

                                <label className="inline-flex items-center gap-2">
                                  <input type="file" className="hidden" onChange={onPickFile} />
                                  <Button variant="outline" className="rounded-2xl" onClick={() => {}}>
                                    파일 선택
                                  </Button>
                                </label>
                              </div>

                              <div className="mt-3 flex flex-col gap-2">
                                <div className="flex flex-wrap items-center gap-2">
                                  <div className="flex-1 min-w-[220px] rounded-2xl border bg-muted/10 px-3 py-2 text-sm text-muted-foreground">
                                    {pickedFile ? (
                                      <span className="text-foreground">
                                        {pickedFile.name}{" "}
                                        <span className="text-muted-foreground">· {fmtBytes(pickedFile.size)}</span>
                                      </span>
                                    ) : (
                                      <span>선택된 파일 없음</span>
                                    )}
                                  </div>
                                  <Button className="rounded-2xl" onClick={uploadPickedFile} disabled={!pickedFile}>
                                    업로드
                                  </Button>
                                </div>

                                <div className="rounded-2xl border bg-white">
                                  <div className="px-3 py-2 text-xs text-muted-foreground border-b">업로드된 파일</div>

                                  <div className="p-3 space-y-2">
                                    {sharedFiles.length === 0 ? (
                                      <div className="text-sm text-muted-foreground">아직 공유된 파일이 없습니다.</div>
                                    ) : (
                                      sharedFiles.map((f) => (
                                        <div key={f.id} className="rounded-2xl border p-3 flex items-start justify-between gap-3">
                                          <div className="min-w-0">
                                            <div className="text-sm font-medium truncate">{f.name}</div>
                                            <div className="mt-1 text-xs text-muted-foreground">
                                              {fmtBytes(f.size)} · {f.uploadedAt}
                                            </div>
                                          </div>

                                          <div className="shrink-0 flex gap-2">
                                            <Button size="sm" className="rounded-2xl" onClick={() => downloadFile(f)}>
                                              다운로드
                                            </Button>
                                            <Button size="sm" variant="outline" className="rounded-2xl" onClick={() => removeFile(f)}>
                                              삭제
                                            </Button>
                                          </div>
                                        </div>
                                      ))
                                    )}
                                  </div>
                                </div>

                                <div className="text-xs text-muted-foreground">
                                  * (미리보기) 현재는 로컬 상태로만 동작합니다. 권한/버전/서버 저장은 다음 단계에서 연결합니다.
                                </div>
                              </div>
                            </div>

                            <RecentActivity items={activityItems} onOpen={() => mockGo("타임라인 보기")} />
                          </>
                        ) : (
                          <>
                            <div className="text-sm text-muted-foreground">
                              <span className="font-medium text-foreground">{MODULE_LABEL[activeTab]}</span> 상세 UI 영역
                            </div>

                            <div className="rounded-2xl border bg-muted/10 p-4 text-sm text-muted-foreground">
                              (미리보기) {MODULE_LABEL[activeTab]} 화면 자리
                            </div>

                            <div className="flex flex-wrap gap-2">
                              <Button className="rounded-2xl" onClick={() => mockGo("작업 시작")}>
                                작업 시작
                              </Button>
                              <Button variant="outline" className="rounded-2xl" onClick={() => mockGo("저장")}>
                                저장
                              </Button>
                              <Button variant="outline" className="rounded-2xl" onClick={() => mockGo("검증")}>
                                검증
                              </Button>
                            </div>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
