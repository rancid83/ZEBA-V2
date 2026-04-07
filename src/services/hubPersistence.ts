import type { CollaborationByService } from '@/types/collaboration';
import type { OpsRecord, Project } from '@/types/projectHubData';
import type { ZebMultiScenarioWorkspaceState } from '@/types/zebMultiScenario';

export type HubDataSlug = 'collaboration' | 'consulting' | 'epi-seed' | 'renewable';

export async function fetchProjects(): Promise<Project[]> {
  const res = await fetch('/api/projects', { cache: 'no-store' });
  if (!res.ok) throw new Error('fetchProjects failed');
  const data = (await res.json()) as { projects?: Project[] };
  return data.projects ?? [];
}

export async function createProjectApi(body: Partial<Project>): Promise<Project> {
  const res = await fetch('/api/projects', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error('createProjectApi failed');
  const data = (await res.json()) as { project: Project };
  return data.project;
}

export async function updateProjectApi(project: Project): Promise<Project> {
  const res = await fetch(`/api/projects/${encodeURIComponent(project.id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(project),
  });
  if (!res.ok) throw new Error('updateProjectApi failed');
  const data = (await res.json()) as { project: Project };
  return data.project;
}

export async function deleteProjectApi(id: string): Promise<void> {
  const res = await fetch(`/api/projects/${encodeURIComponent(id)}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('deleteProjectApi failed');
}

export async function appendOpsRecordApi(
  projectId: string,
  payload: { title: string; summary: string },
): Promise<{ project: Project; record: OpsRecord }> {
  const res = await fetch(`/api/projects/${encodeURIComponent(projectId)}/ops-records`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('appendOpsRecordApi failed');
  return (await res.json()) as { project: Project; record: OpsRecord };
}

export async function updateOpsRecordApi(
  projectId: string,
  recordId: string,
  payload: { title: string; summary: string },
): Promise<{ project: Project; record: OpsRecord }> {
  const res = await fetch(
    `/api/projects/${encodeURIComponent(projectId)}/ops-records/${encodeURIComponent(recordId)}`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    },
  );
  if (!res.ok) throw new Error('updateOpsRecordApi failed');
  return (await res.json()) as { project: Project; record: OpsRecord };
}

export async function deleteOpsRecordApi(
  projectId: string,
  recordId: string,
): Promise<{ project: Project }> {
  const res = await fetch(
    `/api/projects/${encodeURIComponent(projectId)}/ops-records/${encodeURIComponent(recordId)}`,
    { method: 'DELETE' },
  );
  if (!res.ok) throw new Error('deleteOpsRecordApi failed');
  return (await res.json()) as { project: Project };
}

export async function updateZebWorkspaceApi(
  projectId: string,
  workspace: ZebMultiScenarioWorkspaceState,
): Promise<{ project: Project }> {
  const res = await fetch(`/api/projects/${encodeURIComponent(projectId)}/zeb-workspace`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(workspace),
  });
  if (!res.ok) throw new Error('updateZebWorkspaceApi failed');
  return (await res.json()) as { project: Project };
}

export async function fetchHubData(slug: HubDataSlug): Promise<unknown> {
  const res = await fetch(`/api/hub-data/${slug}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`fetchHubData ${slug} failed`);
  return res.json();
}

export async function saveHubData(slug: HubDataSlug, data: unknown): Promise<void> {
  const res = await fetch(`/api/hub-data/${slug}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`saveHubData ${slug} failed`);
}

export async function saveCollaborationData(data: CollaborationByService): Promise<void> {
  await saveHubData('collaboration', data);
}
