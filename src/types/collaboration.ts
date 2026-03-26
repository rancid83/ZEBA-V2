export type ServiceId = "zeb" | "epi" | "ren";
export type AuthorType = "설계사" | "컨설턴트" | "시스템";
export type AgendaStatus = "진행 중" | "해결";
export type TimelineType = "created" | "comment" | "status";
export type AgendaFilter = "all" | "progress" | "done";

export type AttachmentItem = {
  id: string;
  name: string;
  size: string;
};

export type RecordItem = {
  id: string;
  title: string;
  body: string;
  author: AuthorType;
  time: string;
  attachments: AttachmentItem[];
};

export type TimelineItem = {
  id: string;
  type: TimelineType;
  icon: "sparkles" | "message" | "check";
  label: string;
  time: string;
  title: string;
  body: string;
  author: AuthorType;
  recordId: string | null;
  hasAttachment: boolean;
};

export type AgendaItem = {
  id: string;
  title: string;
  author: AuthorType;
  status: AgendaStatus;
  target: string;
  updatedAt: string;
  records: RecordItem[];
  timeline: TimelineItem[];
};

export type ServiceData = {
  panelTitle: string;
  agendas: AgendaItem[];
};

export type CollaborationByService = Record<ServiceId, ServiceData>;

export type AgendaFormState = {
  title: string;
  target: string;
  body: string;
  author: Exclude<AuthorType, "시스템">;
};

export type RecordFormState = {
  title: string;
  body: string;
};
