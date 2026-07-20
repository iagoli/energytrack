import { fetchJson } from './http';

export async function listAppliances() {
  const res = await fetchJson('/api/appliances');
  return res.appliances;
}

export async function createAppliance(data) {
  return fetchJson('/api/appliances', { method: 'POST', body: data });
}

export async function updateAppliance(id, data) {
  return fetchJson(`/api/appliances/${id}`, { method: 'PATCH', body: data });
}

export async function deleteAppliance(id) {
  return fetchJson(`/api/appliances/${id}`, { method: 'DELETE' });
}
