import type { AgendaFilter, AgendaFormState, AgendaItem, AgendaStatus, RecordItem, ServiceId } from "@/types/collaboration";

export function classNames(...items: Array<string | false | null | undefined>) {
  return items.filter(Boolean).join(" ");
}

export function trimLine(text: string, limit = 46) {
  if (!text) return "";
  return text.length > limit ? `${text.slice(0, limit)}...` : text;
}

export function nowStamp() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
}

export function shortDate(stamp: string) {
  if (!stamp) return "";
  return stamp.slice(5, 10).replace("-", ".");
}

export function shortDay(stamp: string) {
  if (!stamp) return "";
  return stamp.slice(5, 10).replace("-", ".");
}

export function makeId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

export function bytesLabelFromName(name: string) {
  const fallback = "320 KB";
  if (!name) return fallback;
  const ext = name.split(".").pop()?.toLowerCase();
  if (ext === "pdf") return "1.2 MB";
  if (ext === "xlsx") return "420 KB";
  if (ext === "dwg") return "2.4 MB";
  if (ext === "png" || ext === "jpg" || ext === "jpeg") return "860 KB";
  return fallback;
}

export function agendaMatchesFilter(agenda: AgendaItem, filterKey: AgendaFilter) {
  if (filterKey === "all") return true;
  if (filterKey === "progress") return agenda.status === "진행 중";
  if (filterKey === "done") return agenda.status === "해결";
  return true;
}

export function attachmentCount(records: RecordItem[]) {
  return records.reduce((sum, record) => sum + record.attachments.length, 0);
}

export function dashboardTone(key: AgendaFilter) {
  if (key === "progress") {
    return {
      base: "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100",
      active: "border-amber-500 bg-amber-500 text-white",
    };
  }
  if (key === "done") {
    return {
      base: "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
      active: "border-emerald-500 bg-emerald-500 text-white",
    };
  }
  return {
    base: "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
    active: "border-slate-800 bg-slate-800 text-white",
  };
}

export function serviceTone(active: boolean, id: ServiceId) {
  if (!active) return "border-slate-200 bg-white text-slate-500 hover:bg-slate-50";
  if (id === "zeb") return "border-teal-200 bg-teal-50 text-teal-700";
  if (id === "epi") return "border-indigo-200 bg-indigo-50 text-indigo-700";
  return "border-emerald-200 bg-emerald-50 text-emerald-700";
}

export function createAgenda(serviceId: ServiceId, payload: AgendaFormState): AgendaItem {
  const stamp = nowStamp();
  const title = payload.title.trim();
  const target = payload.target.trim() || "기타 일반 질의";
  const body = payload.body.trim();
  const author = payload.author;
  const recordId = body ? makeId(`${serviceId}-record`) : null;

  return {
    id: makeId(`${serviceId}-agenda`),
    title,
    author,
    status: "진행 중" as AgendaStatus,
    target,
    updatedAt: stamp,
    records: body
      ? [
          {
            id: recordId ?? makeId(`${serviceId}-record`),
            title,
            body,
            author,
            time: stamp,
            attachments: [],
          },
        ]
      : [],
    timeline: [
      {
        id: makeId(`${serviceId}-event`),
        type: "created" as const,
        icon: "sparkles" as const,
        label: "협의 안건 등록",
        time: shortDate(stamp),
        title,
        body: "",
        author,
        recordId: null,
        hasAttachment: false,
      },
      ...(body
        ? [
            {
              id: makeId(`${serviceId}-event`),
              type: "comment" as const,
              icon: "message" as const,
              label: "협의 기록 추가",
              time: shortDate(stamp),
              title,
              body,
              author,
              recordId,
              hasAttachment: false,
            },
          ]
        : []),
    ],
  };
}
