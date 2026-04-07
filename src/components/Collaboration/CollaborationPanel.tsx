"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { fetchHubData, saveCollaborationData } from "@/services/hubPersistence";
import type {
  AgendaFilter,
  AgendaFormState,
  AgendaItem,
  AgendaStatus,
  AttachmentItem,
  AuthorType,
  CollaborationByService,
  RecordFormState,
  ServiceId,
} from "@/types/collaboration";
import {
  ArrowRight,
  BarChart3,
  Building2,
  CheckCircle2,
  FolderOpen,
  Leaf,
  MessageSquare,
  Paperclip,
  Plus,
  Sparkles,
  X,
} from "./icons";
import { seedCollaborationByService } from "./seedData";
import {
  agendaMatchesFilter,
  attachmentCount,
  bytesLabelFromName,
  classNames,
  createAgenda,
  dashboardTone,
  makeId,
  nowStamp,
  serviceTone,
  shortDate,
  shortDay,
  trimLine,
} from "./utils";

const services: { id: ServiceId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "zeb", label: "ZEB", icon: Building2 },
  { id: "epi", label: "EPI", icon: BarChart3 },
  { id: "ren", label: "신재생", icon: Leaf },
];

const timelineIconMap = {
  sparkles: Sparkles,
  message: MessageSquare,
  check: CheckCircle2,
};

function Breadcrumb() {
  return (
    <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-500">
      <span>프로젝트 허브</span>
      <span aria-hidden="true">&gt;</span>
      <span>성수 업무시설</span>
    </div>
  );
}

interface CollaborationPanelProps {
  initialService?: ServiceId;
  inDrawer?: boolean;
}

export default function CollaborationPanel({ initialService = "zeb", inDrawer = false }: CollaborationPanelProps) {
  const [collaborationByService, setCollaborationByService] = useState<CollaborationByService>(
    seedCollaborationByService
  );
  const hydrateRef = useRef(true);
  const [activeService, setActiveService] = useState<ServiceId>(initialService);

  useEffect(() => {
    fetchHubData("collaboration")
      .then((d) => {
        hydrateRef.current = false;
        setCollaborationByService(d as CollaborationByService);
      })
      .catch(() => {
        hydrateRef.current = false;
      });
  }, []);

  useEffect(() => {
    if (hydrateRef.current) return;
    const t = setTimeout(() => {
      void saveCollaborationData(collaborationByService).catch(() => {});
    }, 1200);
    return () => clearTimeout(t);
  }, [collaborationByService]);

  // 드로워 모드: 부모(ProjectHub)가 탭을 바꾸면 activeService 동기화
  useEffect(() => {
    if (inDrawer) setActiveService(initialService);
  }, [initialService, inDrawer]);
  const [activeAgendaByService, setActiveAgendaByService] = useState<Record<ServiceId, string>>({
    zeb: "zeb-1",
    epi: "epi-1",
    ren: "ren-1",
  });
  const [panelOpen, setPanelOpen] = useState(true);
  const [showAgendaModal, setShowAgendaModal] = useState(false);
  const [agendaForm, setAgendaForm] = useState<AgendaFormState>({
    title: "",
    target: "",
    body: "",
    author: "설계사",
  });
  const [recordForm, setRecordForm] = useState<RecordFormState>({ title: "", body: "" });
  const [recordAuthor, setRecordAuthor] = useState<Exclude<AuthorType, "시스템">>("설계사");
  const [attachmentInput, setAttachmentInput] = useState("");
  const [pendingAttachments, setPendingAttachments] = useState<AttachmentItem[]>([]);
  const [agendaFilter, setAgendaFilter] = useState<AgendaFilter>("all");
  const [lastAction, setLastAction] = useState("버튼을 눌러 더미 데이터 동작을 확인해보세요.");
  const [focusRecordId, setFocusRecordId] = useState<string | null>(null);
  const recordRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const serviceData = collaborationByService[activeService];
  const activeAgendaId = activeAgendaByService[activeService];
  const activeAgenda = serviceData.agendas.find((item) => item.id === activeAgendaId) ?? serviceData.agendas[0];

  const projectSummary = useMemo(() => {
    const all = Object.values(collaborationByService).flatMap((item) => item.agendas);
    return {
      total: all.length,
      inProgress: all.filter((item) => item.status === "진행 중").length,
      resolved: all.filter((item) => item.status === "해결").length,
    };
  }, [collaborationByService]);

  const dashboardItems = useMemo(
    () => [
      { key: "all" as AgendaFilter, label: "전체", value: projectSummary.total },
      { key: "progress" as AgendaFilter, label: "진행", value: projectSummary.inProgress },
      { key: "done" as AgendaFilter, label: "완료", value: projectSummary.resolved },
    ],
    [projectSummary]
  );

  const filteredAgendas = useMemo(
    () => serviceData.agendas.filter((agenda) => agendaMatchesFilter(agenda, agendaFilter)),
    [serviceData.agendas, agendaFilter]
  );

  const sortedTimeline = useMemo(() => [...activeAgenda.timeline].reverse(), [activeAgenda.timeline]);
  const sortedRecords = useMemo(() => [...activeAgenda.records].reverse(), [activeAgenda.records]);

  useEffect(() => {
    if (!focusRecordId) return;
    const node = recordRefs.current[focusRecordId];
    if (!node) return;
    node.scrollIntoView({ behavior: "smooth", block: "center" });
    const timeout = setTimeout(() => setFocusRecordId(null), 1800);
    return () => clearTimeout(timeout);
  }, [focusRecordId, activeAgenda.id]);

  function updateAgenda(serviceId: ServiceId, agendaId: string, updater: (agenda: AgendaItem) => AgendaItem) {
    setCollaborationByService((prev) => ({
      ...prev,
      [serviceId]: {
        ...prev[serviceId],
        agendas: prev[serviceId].agendas.map((agenda) =>
          agenda.id === agendaId ? updater(agenda) : agenda
        ),
      },
    }));
  }

  function handleServiceChange(serviceId: ServiceId) {
    setActiveService(serviceId);
    setPendingAttachments([]);
    setAttachmentInput("");
    const label = services.find((item) => item.id === serviceId)?.label ?? serviceId;
    setLastAction(`${label} 서비스로 전환했습니다.`);
  }

  function handleAgendaFilterChange(filterKey: AgendaFilter) {
    setAgendaFilter(filterKey);
    const nextAgenda = serviceData.agendas.find((agenda) => agendaMatchesFilter(agenda, filterKey));
    if (nextAgenda) {
      setActiveAgendaByService((prev) => ({ ...prev, [activeService]: nextAgenda.id }));
      const label = dashboardItems.find((item) => item.key === filterKey)?.label ?? filterKey;
      setLastAction(`안건 필터를 ${label}로 변경했습니다.`);
    } else {
      setLastAction("선택한 필터에 해당하는 안건이 없습니다.");
    }
  }

  function handleCreateAgenda() {
    if (!agendaForm.title.trim()) return;
    const newAgenda = createAgenda(activeService, agendaForm);
    setCollaborationByService((prev) => ({
      ...prev,
      [activeService]: {
        ...prev[activeService],
        agendas: [newAgenda, ...prev[activeService].agendas],
      },
    }));
    setActiveAgendaByService((prev) => ({ ...prev, [activeService]: newAgenda.id }));
    setShowAgendaModal(false);
    setAgendaForm({ title: "", target: "", body: "", author: "설계사" });
    setLastAction(`새 협의 안건 '${newAgenda.title}'을 등록했습니다.`);
  }

  function handleAddPendingAttachment() {
    if (!attachmentInput.trim()) return;
    const nextFileName = attachmentInput.trim();
    const newAttachment: AttachmentItem = {
      id: makeId(`${activeService}-attach`),
      name: nextFileName,
      size: bytesLabelFromName(nextFileName),
    };
    setPendingAttachments((prev) => [...prev, newAttachment]);
    setAttachmentInput("");
    setLastAction(`첨부 예정 파일 '${nextFileName}'을 추가했습니다.`);
  }

  function removePendingAttachment(id: string) {
    setPendingAttachments((prev) => prev.filter((item) => item.id !== id));
  }

  function handleAddRecord() {
    if (!recordForm.title.trim() || !recordForm.body.trim()) return;
    const stamp = nowStamp();
    const attachments = [...pendingAttachments];
    const newRecord = {
      id: makeId(`${activeService}-record`),
      title: recordForm.title.trim(),
      body: recordForm.body.trim(),
      author: recordAuthor as AuthorType,
      time: stamp,
      attachments,
    };

    updateAgenda(activeService, activeAgenda.id, (agenda) => ({
      ...agenda,
      updatedAt: stamp,
      records: [...agenda.records, newRecord],
      timeline: [
        ...agenda.timeline,
        {
          id: makeId(`${activeService}-event`),
          type: "comment" as const,
          icon: "message" as const,
          label: "협의 기록 추가",
          time: shortDate(stamp),
          title: newRecord.title,
          body: newRecord.body,
          author: newRecord.author,
          recordId: newRecord.id,
          hasAttachment: attachments.length > 0,
        },
      ],
    }));

    setRecordForm({ title: "", body: "" });
    setPendingAttachments([]);
    setFocusRecordId(newRecord.id);
    setLastAction(
      attachments.length > 0
        ? `협의 기록 '${newRecord.title}'과 첨부 파일 ${attachments.length}개를 함께 등록했습니다.`
        : `협의 기록 '${newRecord.title}'을 추가했습니다.`
    );
  }

  function handleToggleStatus() {
    const stamp = nowStamp();
    const nextStatus: AgendaStatus = activeAgenda.status === "해결" ? "진행 중" : "해결";

    updateAgenda(activeService, activeAgenda.id, (agenda) => ({
      ...agenda,
      status: nextStatus,
      updatedAt: stamp,
      timeline: [
        ...agenda.timeline,
        {
          id: makeId(`${activeService}-event`),
          type: "status" as const,
          icon: (nextStatus === "해결" ? "check" : "sparkles") as "check" | "sparkles",
          label: "상태 변경",
          time: shortDate(stamp),
          title: nextStatus === "해결" ? "완료로 상태 변경" : "진행으로 상태 변경",
          body:
            nextStatus === "해결"
              ? "협의 안건이 완료 상태로 변경되었습니다."
              : "협의 안건이 다시 진행 상태로 변경되었습니다.",
          author: "시스템" as AuthorType,
          recordId: null,
          hasAttachment: false,
        },
      ],
    }));

    setLastAction(`안건 상태를 ${nextStatus === "해결" ? "완료" : "진행"}로 변경했습니다.`);
  }

  function resetMockup() {
    setCollaborationByService(seedCollaborationByService);
    setActiveService("zeb");
    setActiveAgendaByService({ zeb: "zeb-1", epi: "epi-1", ren: "ren-1" });
    setPanelOpen(true);
    setShowAgendaModal(false);
    setAgendaForm({ title: "", target: "", body: "", author: "설계사" });
    setRecordForm({ title: "", body: "" });
    setRecordAuthor("설계사");
    setAttachmentInput("");
    setPendingAttachments([]);
    setAgendaFilter("all");
    setFocusRecordId(null);
    setLastAction("더미 데이터를 초기 상태로 되돌렸습니다.");
  }

  // ─── 드로워 모드 렌더 ───────────────────────────────────────────
  if (inDrawer) {
    return (
      <div className="text-slate-900">
        {/* 패널 헤더: 서비스명 + 필터 요약 + 안건 등록 */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
          <div>
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
              Service Collaboration
            </div>
            <div className="mt-1 text-base font-semibold">{serviceData.panelTitle}</div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {dashboardItems.map((item) => {
              const tone = dashboardTone(item.key);
              const active = agendaFilter === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => handleAgendaFilterChange(item.key)}
                  className={classNames(
                    "rounded-xl border px-3 py-1.5 text-sm transition",
                    active ? tone.active : tone.base
                  )}
                >
                  <span className="text-[11px] opacity-80">{item.label} </span>
                  <span className="font-semibold">{item.value}</span>
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => setShowAgendaModal(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-800 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-slate-700"
            >
              <Plus className="h-3.5 w-3.5" />
              안건 등록
            </button>
          </div>
        </div>

        {/* 드로워 폭을 더 활용하도록 가운데 상세 영역을 우선 확보한다. */}
        <div className="grid grid-cols-1 xl:grid-cols-[260px_minmax(0,1fr)_220px]">
          {/* Col 1: 안건 리스트 */}
          <section className="min-h-[320px] border-b border-slate-200 bg-white p-4 xl:min-h-[560px] xl:border-b-0 xl:border-r">
            <div className="mb-3 flex items-center justify-between">
              <div className="text-sm font-semibold">협의 안건 리스트</div>
            </div>
            <div className="space-y-3">
              {filteredAgendas.length > 0 ? (
                filteredAgendas.map((agenda) => {
                  const selected = agenda.id === activeAgenda.id;
                  const tone = agenda.status === "해결" ? dashboardTone("done") : dashboardTone("progress");
                  return (
                    <button
                      key={agenda.id}
                      type="button"
                      onClick={() => {
                        setActiveAgendaByService((prev) => ({ ...prev, [activeService]: agenda.id }));
                        setPendingAttachments([]);
                        setAttachmentInput("");
                      }}
                      className={classNames(
                        "w-full rounded-3xl border p-4 text-left transition",
                        selected ? "border-slate-300 bg-slate-50 shadow-sm" : "border-slate-200 bg-white hover:bg-slate-50"
                      )}
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={classNames("rounded-full border px-2.5 py-1 text-[11px] font-medium", tone.base)}>
                          {agenda.status === "해결" ? "완료" : "진행"}
                        </span>
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] text-slate-600">
                          {agenda.author}
                        </span>
                      </div>
                      <div className="mt-3 text-sm font-semibold leading-6 text-slate-900">{agenda.title}</div>
                      <div className="mt-2 text-[12px] text-slate-500">{agenda.target}</div>
                      <div className="mt-3 flex items-center gap-4 text-sm text-slate-500">
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-4 w-4" />
                          <span>{agenda.records.length}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Paperclip className="h-4 w-4" />
                          <span>{attachmentCount(agenda.records)}</span>
                        </div>
                        <div className="text-[12px]">{shortDay(agenda.updatedAt)}</div>
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
                  선택한 필터에 해당하는 안건이 없습니다.
                </div>
              )}
            </div>
          </section>

          {/* Col 2: 안건 상세 + 기록 폼 */}
          <section className="min-h-[560px] overflow-y-auto border-b border-slate-200 bg-white xl:h-[560px] xl:border-b-0 xl:border-r">
            <div className="border-b border-slate-200 px-5 py-4">
              <div className="flex items-center gap-2">
                <div className="text-base font-semibold">{activeAgenda.title}</div>
                <button
                  type="button"
                  onClick={handleToggleStatus}
                  className={classNames(
                    "rounded-full border px-2.5 py-1 text-[11px] font-medium transition hover:opacity-80",
                    activeAgenda.status === "해결" ? dashboardTone("done").base : dashboardTone("progress").base
                  )}
                >
                  {activeAgenda.status === "해결" ? "완료" : "진행"}
                </button>
              </div>
              <div className="mt-1.5 flex flex-wrap items-center gap-2 text-sm text-slate-500">
                <span>{activeAgenda.target}</span>
                <span>·</span>
                <span>업데이트 {activeAgenda.updatedAt}</span>
              </div>
            </div>

            <div className="flex min-h-full flex-col px-5 py-5">
              {/* 기록 폼 */}
              <div className="shrink-0 rounded-3xl border border-slate-200 p-4">
                <div className="text-sm font-semibold">협의 기록 작성</div>
                <div className="mt-3 grid gap-3">
                  <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_140px]">
                    <input
                      value={recordForm.title}
                      onChange={(e) => setRecordForm((prev) => ({ ...prev, title: e.target.value }))}
                      placeholder="제목 입력"
                      className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none"
                    />
                    <select
                      value={recordAuthor}
                      onChange={(e) => setRecordAuthor(e.target.value as Exclude<AuthorType, "시스템">)}
                      className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none"
                    >
                      <option value="설계사">설계사</option>
                      <option value="컨설턴트">컨설턴트</option>
                    </select>
                  </div>
                  <textarea
                    value={recordForm.body}
                    onChange={(e) => setRecordForm((prev) => ({ ...prev, body: e.target.value }))}
                    placeholder="내용 입력"
                    rows={4}
                    className="resize-none rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none"
                  />
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleAddRecord}
                      className="rounded-2xl border border-slate-800 bg-slate-800 px-4 py-2 text-sm font-medium text-white"
                    >
                      협의 기록 추가
                    </button>
                  </div>
                </div>
              </div>

              {/* 첨부 */}
              <div className="mt-4 shrink-0 rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-4">
                <div className="text-sm font-semibold">자료 공유</div>
                <div className="mt-1 text-sm text-slate-500">
                  여기서 올린 파일은 다음 협의 기록과 함께 하나의 이벤트로 묶입니다.
                </div>
                <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-[minmax(0,1fr)_auto]">
                  <input
                    value={attachmentInput}
                    onChange={(e) => setAttachmentInput(e.target.value)}
                    placeholder="예: 검토의견서_v2.pdf"
                    className="min-w-0 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddPendingAttachment}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700"
                  >
                    <Paperclip className="h-4 w-4" />
                    첨부 추가
                  </button>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {pendingAttachments.length > 0 ? (
                    pendingAttachments.map((file) => (
                      <div key={file.id} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700">
                        <Paperclip className="h-3.5 w-3.5" />
                        <span>{file.name}</span>
                        <span className="text-slate-400">{file.size}</span>
                        <button type="button" onClick={() => removePendingAttachment(file.id)} className="text-slate-400 hover:text-slate-700">
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-slate-400">아직 첨부 예정 파일이 없습니다.</div>
                  )}
                </div>
              </div>

              {/* 기록 목록 */}
              <div className="mt-4 min-h-[360px] flex-[9] rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <div className="mb-3 text-sm font-semibold">최근 협의 기록</div>
                <div className="space-y-3">
                  {sortedRecords.length > 0 ? (
                    sortedRecords.map((record) => {
                      const highlighted = focusRecordId === record.id;
                      return (
                        <div
                          key={record.id}
                          ref={(node) => { recordRefs.current[record.id] = node; }}
                          className={classNames("rounded-3xl border bg-white p-4 transition", highlighted ? "border-teal-300 ring-2 ring-teal-100" : "border-slate-200")}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <div className="flex h-8 w-8 items-center justify-center rounded-2xl bg-slate-50 text-slate-600">
                                <MessageSquare className="h-4 w-4" />
                              </div>
                              <div className="text-sm font-semibold">{record.title}</div>
                              {record.attachments.length > 0 && <Paperclip className="h-4 w-4 text-slate-400" />}
                              <span className="rounded-full bg-slate-50 px-2.5 py-1 text-[11px] text-slate-500">{record.author}</span>
                            </div>
                            <div className="text-[12px] text-slate-400">{record.time}</div>
                          </div>
                          <div className="mt-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm leading-7 text-slate-700">{record.body}</div>
                          {record.attachments.length > 0 && (
                            <div className="mt-3 space-y-2">
                              {record.attachments.map((file) => (
                                <div key={file.id} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-3 py-2.5">
                                  <div className="flex items-center gap-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-2xl bg-slate-50 text-slate-600">
                                      <FolderOpen className="h-4 w-4" />
                                    </div>
                                    <div>
                                      <div className="text-sm font-medium text-slate-800">{file.name}</div>
                                      <div className="text-[12px] text-slate-500">{file.size}</div>
                                    </div>
                                  </div>
                                  <button type="button" className="rounded-2xl border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
                                    다운로드
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="rounded-3xl border border-dashed border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-500">
                      아직 협의 기록이 없습니다.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Col 3: 타임라인 */}
          <section className="min-h-[280px] overflow-y-auto bg-white p-4 xl:h-[560px]">
            <div className="mb-3 text-sm font-semibold">타임라인</div>
            <div className="space-y-3">
              {sortedTimeline.map((event) => {
                const Icon = timelineIconMap[event.icon];
                const isClickable = !!event.recordId;
                return (
                  <button
                    key={event.id}
                    type="button"
                    disabled={!isClickable}
                    onClick={() => { if (event.recordId) setFocusRecordId(event.recordId); }}
                    className={classNames(
                      "w-full rounded-3xl border p-3 text-left transition",
                      isClickable ? "border-slate-200 bg-white hover:bg-slate-50 cursor-pointer" : "border-slate-100 bg-slate-50 cursor-default"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] text-slate-400">{event.label}</span>
                          <span className="text-[11px] text-slate-300">·</span>
                          <span className="text-[11px] text-slate-400">{event.time}</span>
                        </div>
                        <div className="mt-1 text-sm font-semibold text-slate-800 leading-5">{trimLine(event.title, 28)}</div>
                        {event.body && <div className="mt-1 text-[12px] text-slate-500 leading-5">{trimLine(event.body, 40)}</div>}
                        <div className="mt-1.5 flex items-center gap-2">
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-500">{event.author}</span>
                          {event.hasAttachment && <Paperclip className="h-3.5 w-3.5 text-slate-400" />}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        </div>

        {/* 안건 등록 모달 */}
        {showAgendaModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30">
            <div className="w-[480px] rounded-[28px] bg-white p-6 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="text-lg font-semibold">협의 안건 등록</div>
                <button type="button" onClick={() => setShowAgendaModal(false)} className="rounded-2xl p-1.5 text-slate-400 hover:bg-slate-100">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="mt-4 space-y-3">
                <input value={agendaForm.title} onChange={(e) => setAgendaForm((prev) => ({ ...prev, title: e.target.value }))} placeholder="안건 제목" className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400" />
                <input value={agendaForm.target} onChange={(e) => setAgendaForm((prev) => ({ ...prev, target: e.target.value }))} placeholder="대상 항목 (예: 시나리오 B · 옥상 PV)" className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400" />
                <select value={agendaForm.author} onChange={(e) => setAgendaForm((prev) => ({ ...prev, author: e.target.value as Exclude<AuthorType, "시스템"> }))} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none">
                  <option value="설계사">설계사</option>
                  <option value="컨설턴트">컨설턴트</option>
                </select>
                <textarea value={agendaForm.body} onChange={(e) => setAgendaForm((prev) => ({ ...prev, body: e.target.value }))} placeholder="첫 번째 협의 기록 내용 (선택)" rows={4} className="w-full resize-none rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400" />
                <div className="flex justify-end gap-3">
                  <button type="button" onClick={() => setShowAgendaModal(false)} className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50">취소</button>
                  <button type="button" onClick={handleCreateAgenda} className="rounded-2xl border border-slate-800 bg-slate-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700">등록</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ─── 풀페이지 모드 렌더 (/collaboration 페이지용) ──────────────
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-[1600px] px-6 py-6">
        <div className="rounded-[28px] border border-slate-200 bg-white shadow-sm">
          {/* Header */}
          <div className="border-b border-slate-200 px-6 py-5">
            <div className="text-xs font-medium uppercase tracking-[0.24em] text-slate-400">
              ZEBA MVP · Collaboration Preview
            </div>
            <Breadcrumb />
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-500">
              <span>depth 2 현황 화면 하단 고정 협업 패널</span>
              <span>·</span>
              <span>서비스 전환 시 패널은 유지되고 내용만 변경</span>
              <span>·</span>
              <span>기록과 첨부를 하나의 이벤트로 묶음</span>
            </div>
          </div>

          <div className="grid grid-cols-[280px_minmax(0,1fr)]">
            {/* Sidebar */}
            <aside className="border-r border-slate-200 bg-white p-5">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-sm font-semibold">서비스 전환</div>
                <div className="mt-3 space-y-2">
                  {services.map((service) => {
                    const Icon = service.icon;
                    const active = activeService === service.id;
                    return (
                      <button
                        key={service.id}
                        type="button"
                        onClick={() => handleServiceChange(service.id)}
                        className={classNames(
                          "flex w-full items-center justify-between rounded-2xl border px-3 py-3 text-left transition",
                          serviceTone(active, service.id)
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          <span className="text-sm font-medium">{service.label}</span>
                        </div>
                        <ArrowRight className="h-4 w-4 opacity-60" />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-4 rounded-3xl border border-slate-200 bg-white p-4">
                <div className="text-sm font-semibold">워킹 목업 제어</div>
                <div className="mt-3 space-y-2 text-sm text-slate-600">
                  <div className="rounded-2xl bg-slate-50 px-3 py-3">협의 안건 등록 버튼 작동</div>
                  <div className="rounded-2xl bg-slate-50 px-3 py-3">기록 + 첨부 묶음 등록</div>
                  <div className="rounded-2xl bg-slate-50 px-3 py-3">타임라인 클릭 시 해당 기록 포커싱</div>
                </div>
                <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-600">
                  {lastAction}
                </div>
                <button
                  type="button"
                  onClick={resetMockup}
                  className="mt-3 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  더미 데이터 초기화
                </button>
              </div>
            </aside>

            {/* Main */}
            <main className="p-5">
              <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
                {/* Dashboard Summary */}
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
                      Depth 3 Workspace
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      {dashboardItems.map((item) => {
                        const tone = dashboardTone(item.key);
                        const active = agendaFilter === item.key;
                        return (
                          <button
                            key={item.key}
                            type="button"
                            onClick={() => handleAgendaFilterChange(item.key)}
                            className={classNames(
                              "rounded-2xl border px-4 py-3 text-sm transition",
                              active ? tone.active : tone.base
                            )}
                          >
                            <div className="text-[11px] opacity-80">{item.label}</div>
                            <div className="mt-1 text-lg font-semibold leading-none">{item.value}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPanelOpen((prev) => !prev)}
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    {panelOpen ? "협업 패널 접기" : "협업 패널 펼치기"}
                  </button>
                </div>

                {panelOpen && (
                  <div className="mt-5 overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
                    {/* Panel Header */}
                    <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                      <div>
                        <div className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
                          Service Collaboration
                        </div>
                        <div className="mt-1 text-lg font-semibold">{serviceData.panelTitle}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setShowAgendaModal(true);
                          setLastAction("협의 안건 등록 팝업을 열었습니다.");
                        }}
                        className="inline-flex items-center gap-2 rounded-2xl border border-slate-800 bg-slate-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
                      >
                        <Plus className="h-4 w-4" />
                        협의 안건 등록
                      </button>
                    </div>

                    {/* Three-column grid */}
                    <div className="grid grid-cols-[2fr_6.5fr_1.8fr]">
                      {/* Col 1: Agenda List */}
                      <section className="min-h-[560px] border-r border-slate-200 bg-white p-4">
                        <div className="mb-3 flex items-center justify-between">
                          <div className="text-sm font-semibold">협의 안건 리스트</div>
                          <div className="text-xs text-slate-400">상시 노출</div>
                        </div>
                        <div className="space-y-3">
                          {filteredAgendas.length > 0 ? (
                            filteredAgendas.map((agenda) => {
                              const selected = agenda.id === activeAgenda.id;
                              const tone =
                                agenda.status === "해결" ? dashboardTone("done") : dashboardTone("progress");
                              return (
                                <button
                                  key={agenda.id}
                                  type="button"
                                  onClick={() => {
                                    setActiveAgendaByService((prev) => ({
                                      ...prev,
                                      [activeService]: agenda.id,
                                    }));
                                    setPendingAttachments([]);
                                    setAttachmentInput("");
                                    setLastAction(`안건 '${agenda.title}'을 선택했습니다.`);
                                  }}
                                  className={classNames(
                                    "w-full rounded-3xl border p-4 text-left transition",
                                    selected
                                      ? "border-slate-300 bg-slate-50 shadow-sm"
                                      : "border-slate-200 bg-white hover:bg-slate-50"
                                  )}
                                >
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span
                                      className={classNames(
                                        "rounded-full border px-2.5 py-1 text-[11px] font-medium",
                                        tone.base
                                      )}
                                    >
                                      {agenda.status === "해결" ? "완료" : "진행"}
                                    </span>
                                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] text-slate-600">
                                      {agenda.author}
                                    </span>
                                  </div>
                                  <div className="mt-3 text-sm font-semibold leading-6 text-slate-900">
                                    {agenda.title}
                                  </div>
                                  <div className="mt-2 text-[12px] text-slate-500">{agenda.target}</div>
                                  <div className="mt-3 flex items-center gap-4 text-sm text-slate-500">
                                    <div className="flex items-center gap-1">
                                      <MessageSquare className="h-4 w-4" />
                                      <span>{agenda.records.length}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Paperclip className="h-4 w-4" />
                                      <span>{attachmentCount(agenda.records)}</span>
                                    </div>
                                    <div className="text-[12px]">{shortDay(agenda.updatedAt)}</div>
                                  </div>
                                </button>
                              );
                            })
                          ) : (
                            <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
                              선택한 필터에 해당하는 안건이 없습니다.
                            </div>
                          )}
                        </div>
                      </section>

                      {/* Col 2: Agenda Detail + Record Form */}
                      <section className="h-[560px] overflow-y-auto border-r border-slate-200 bg-white">
                        {/* Agenda Header */}
                        <div className="border-b border-slate-200 px-5 py-4">
                          <div className="flex flex-wrap items-start justify-between gap-4">
                            <div>
                              <div className="flex items-center gap-2">
                                <div className="text-lg font-semibold">{activeAgenda.title}</div>
                                <button
                                  type="button"
                                  onClick={handleToggleStatus}
                                  className={classNames(
                                    "rounded-full border px-2.5 py-1 text-[11px] font-medium transition hover:opacity-80",
                                    activeAgenda.status === "해결"
                                      ? dashboardTone("done").base
                                      : dashboardTone("progress").base
                                  )}
                                >
                                  {activeAgenda.status === "해결" ? "완료" : "진행"}
                                </button>
                              </div>
                              <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-500">
                                <span>{activeAgenda.target}</span>
                                <span>·</span>
                                <span>최근 업데이트 {activeAgenda.updatedAt}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex min-h-full flex-col px-5 py-5">
                          {/* Record Form */}
                          <div className="shrink-0 rounded-3xl border border-slate-200 p-4">
                            <div className="text-sm font-semibold">협의 기록 작성</div>
                            <div className="mt-3 grid gap-3">
                              <div className="grid grid-cols-[1fr_140px] gap-3">
                                <input
                                  value={recordForm.title}
                                  onChange={(e) =>
                                    setRecordForm((prev) => ({ ...prev, title: e.target.value }))
                                  }
                                  placeholder="제목 입력"
                                  className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none"
                                />
                                <select
                                  value={recordAuthor}
                                  onChange={(e) =>
                                    setRecordAuthor(e.target.value as Exclude<AuthorType, "시스템">)
                                  }
                                  className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none"
                                >
                                  <option value="설계사">설계사</option>
                                  <option value="컨설턴트">컨설턴트</option>
                                </select>
                              </div>
                              <textarea
                                value={recordForm.body}
                                onChange={(e) =>
                                  setRecordForm((prev) => ({ ...prev, body: e.target.value }))
                                }
                                placeholder="내용 입력"
                                rows={4}
                                className="resize-none rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none"
                              />
                              <div className="flex justify-end">
                                <button
                                  type="button"
                                  onClick={handleAddRecord}
                                  className="rounded-2xl border border-slate-800 bg-slate-800 px-4 py-2 text-sm font-medium text-white"
                                >
                                  협의 기록 추가
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Attachment Section */}
                          <div className="mt-4 shrink-0 rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-4">
                            <div className="text-sm font-semibold">자료 공유</div>
                            <div className="mt-1 text-sm text-slate-500">
                              작성자 선택은 상단과 동기화되며, 여기서 올린 파일은 다음 협의 기록과 함께
                              하나의 이벤트로 묶입니다.
                            </div>
                            <div className="mt-3 grid grid-cols-[minmax(0,1fr)_auto] gap-2">
                              <input
                                value={attachmentInput}
                                onChange={(e) => setAttachmentInput(e.target.value)}
                                placeholder="예: 검토의견서_v2.pdf"
                                className="min-w-0 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none"
                              />
                              <button
                                type="button"
                                onClick={handleAddPendingAttachment}
                                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700"
                              >
                                <Paperclip className="h-4 w-4" />
                                첨부 추가
                              </button>
                            </div>
                            <div className="mt-3 flex flex-wrap gap-2">
                              {pendingAttachments.length > 0 ? (
                                pendingAttachments.map((file) => (
                                  <div
                                    key={file.id}
                                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700"
                                  >
                                    <Paperclip className="h-3.5 w-3.5" />
                                    <span>{file.name}</span>
                                    <span className="text-slate-400">{file.size}</span>
                                    <button
                                      type="button"
                                      onClick={() => removePendingAttachment(file.id)}
                                      className="text-slate-400 hover:text-slate-700"
                                    >
                                      <X className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                ))
                              ) : (
                                <div className="text-xs text-slate-400">
                                  아직 첨부 예정 파일이 없습니다.
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Record List */}
                          <div className="mt-4 min-h-[360px] flex-[9] rounded-3xl border border-slate-200 bg-slate-50 p-4">
                            <div className="mb-3 text-sm font-semibold">최근 협의 기록</div>
                            <div className="space-y-3">
                              {sortedRecords.length > 0 ? (
                                sortedRecords.map((record) => {
                                  const highlighted = focusRecordId === record.id;
                                  return (
                                    <div
                                      key={record.id}
                                      ref={(node) => {
                                        recordRefs.current[record.id] = node;
                                      }}
                                      className={classNames(
                                        "rounded-3xl border bg-white p-4 transition",
                                        highlighted
                                          ? "border-teal-300 ring-2 ring-teal-100"
                                          : "border-slate-200"
                                      )}
                                    >
                                      <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-center gap-2">
                                          <div className="flex h-8 w-8 items-center justify-center rounded-2xl bg-slate-50 text-slate-600">
                                            <MessageSquare className="h-4 w-4" />
                                          </div>
                                          <div className="text-sm font-semibold">{record.title}</div>
                                          {record.attachments.length > 0 && (
                                            <Paperclip className="h-4 w-4 text-slate-400" />
                                          )}
                                          <span className="rounded-full bg-slate-50 px-2.5 py-1 text-[11px] text-slate-500">
                                            {record.author}
                                          </span>
                                        </div>
                                        <div className="text-[12px] text-slate-400">{record.time}</div>
                                      </div>
                                      <div className="mt-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm leading-7 text-slate-700">
                                        {record.body}
                                      </div>
                                      {record.attachments.length > 0 && (
                                        <div className="mt-3 space-y-2">
                                          {record.attachments.map((file) => (
                                            <div
                                              key={file.id}
                                              className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-3 py-2.5"
                                            >
                                              <div className="flex items-center gap-3">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-2xl bg-slate-50 text-slate-600">
                                                  <FolderOpen className="h-4 w-4" />
                                                </div>
                                                <div>
                                                  <div className="text-sm font-medium text-slate-800">
                                                    {file.name}
                                                  </div>
                                                  <div className="text-[12px] text-slate-500">
                                                    {file.size}
                                                  </div>
                                                </div>
                                              </div>
                                              <button
                                                type="button"
                                                onClick={() =>
                                                  setLastAction(
                                                    `자료 '${file.name}' 다운로드 버튼을 눌렀습니다.`
                                                  )
                                                }
                                                className="rounded-2xl border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                                              >
                                                다운로드
                                              </button>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })
                              ) : (
                                <div className="rounded-3xl border border-dashed border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-500">
                                  아직 협의 기록이 없습니다.
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </section>

                      {/* Col 3: Timeline */}
                      <section className="h-[560px] overflow-y-auto bg-white p-4">
                        <div className="mb-3 text-sm font-semibold">타임라인</div>
                        <div className="space-y-3">
                          {sortedTimeline.map((event) => {
                            const Icon = timelineIconMap[event.icon];
                            const isClickable = !!event.recordId;
                            return (
                              <button
                                key={event.id}
                                type="button"
                                disabled={!isClickable}
                                onClick={() => {
                                  if (event.recordId) {
                                    setFocusRecordId(event.recordId);
                                    setLastAction(`타임라인 '${event.title}'을 클릭했습니다.`);
                                  }
                                }}
                                className={classNames(
                                  "w-full rounded-3xl border p-3 text-left transition",
                                  isClickable
                                    ? "border-slate-200 bg-white hover:bg-slate-50 cursor-pointer"
                                    : "border-slate-100 bg-slate-50 cursor-default"
                                )}
                              >
                                <div className="flex items-start gap-3">
                                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
                                    <Icon className="h-4 w-4" />
                                  </div>
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-[11px] text-slate-400">{event.label}</span>
                                      <span className="text-[11px] text-slate-300">·</span>
                                      <span className="text-[11px] text-slate-400">{event.time}</span>
                                    </div>
                                    <div className="mt-1 text-sm font-semibold text-slate-800 leading-5">
                                      {trimLine(event.title, 28)}
                                    </div>
                                    {event.body && (
                                      <div className="mt-1 text-[12px] text-slate-500 leading-5">
                                        {trimLine(event.body, 40)}
                                      </div>
                                    )}
                                    <div className="mt-1.5 flex items-center gap-2">
                                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-500">
                                        {event.author}
                                      </span>
                                      {event.hasAttachment && (
                                        <Paperclip className="h-3.5 w-3.5 text-slate-400" />
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </section>
                    </div>
                  </div>
                )}
              </div>
            </main>
          </div>
        </div>
      </div>

      {/* Agenda Modal */}
      {showAgendaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="w-[480px] rounded-[28px] bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="text-lg font-semibold">협의 안건 등록</div>
              <button
                type="button"
                onClick={() => setShowAgendaModal(false)}
                className="rounded-2xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-4 space-y-3">
              <input
                value={agendaForm.title}
                onChange={(e) => setAgendaForm((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="안건 제목"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
              />
              <input
                value={agendaForm.target}
                onChange={(e) => setAgendaForm((prev) => ({ ...prev, target: e.target.value }))}
                placeholder="대상 항목 (예: 시나리오 B · 옥상 PV)"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
              />
              <select
                value={agendaForm.author}
                onChange={(e) =>
                  setAgendaForm((prev) => ({
                    ...prev,
                    author: e.target.value as Exclude<AuthorType, "시스템">,
                  }))
                }
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none"
              >
                <option value="설계사">설계사</option>
                <option value="컨설턴트">컨설턴트</option>
              </select>
              <textarea
                value={agendaForm.body}
                onChange={(e) => setAgendaForm((prev) => ({ ...prev, body: e.target.value }))}
                placeholder="첫 번째 협의 기록 내용 (선택)"
                rows={4}
                className="w-full resize-none rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
              />
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAgendaModal(false)}
                  className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={handleCreateAgenda}
                  className="rounded-2xl border border-slate-800 bg-slate-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
                >
                  등록
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
