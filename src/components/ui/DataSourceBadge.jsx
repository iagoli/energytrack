// source: 'aneel' | 'fallback-static' | 'manual' | 'cresesb' | 'nasa-power' | 'offline' | 'brasilapi' | 'nominatim'
const STYLES = {
  aneel:            { label: 'ANEEL',         cls: 'bg-blue-100 text-blue-700 border-blue-200' },
  'fallback-static':{ label: 'Estimativa',    cls: 'bg-amber-100 text-amber-700 border-amber-200' },
  manual:           { label: 'Manual',        cls: 'bg-gray-100 text-gray-600 border-gray-200' },
  cresesb:          { label: 'CRESESB',       cls: 'bg-green-100 text-green-700 border-green-200' },
  'nasa-power':     { label: 'NASA POWER',    cls: 'bg-green-100 text-green-700 border-green-200' },
  offline:          { label: 'Offline',       cls: 'bg-red-100 text-red-700 border-red-200' },
  brasilapi:        { label: 'BrasilAPI',     cls: 'bg-purple-100 text-purple-700 border-purple-200' },
  nominatim:        { label: 'OpenStreetMap', cls: 'bg-purple-100 text-purple-700 border-purple-200' },
};

export default function DataSourceBadge({ source, title }) {
  const meta = STYLES[source] || { label: source, cls: 'bg-gray-100 text-gray-600 border-gray-200' };
  return (
    <span
      title={title || `Origem: ${meta.label}`}
      className={`inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full border ${meta.cls}`}
    >
      {meta.label}
    </span>
  );
}
