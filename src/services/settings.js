import { fetchJson } from './http';

export async function getSettings() {
  const res = await fetchJson('/api/settings');
  return res.settings;
}

export async function saveSettings(patch) {
  const res = await fetchJson('/api/settings', { method: 'PUT', body: patch });
  return res.settings;
}

export async function importLegacyData({ appliances, settings }) {
  return fetchJson('/api/import', {
    method: 'POST',
    body: { appliances, settings },
  });
}
