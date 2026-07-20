import { useEffect, useState } from 'react';
import {
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';
import { AVERAGE_CONSUMPTION_BR, UFS } from '../constants';
import { calcItemKwh, calcTotals, generateRecommendations } from '../utils/calculations';
import { fetchDistribuidoras, fetchTarifa } from '../services/aneel';
import LoadingSpinner from './ui/LoadingSpinner';
import ErrorBanner from './ui/ErrorBanner';
import DataSourceBadge from './ui/DataSourceBadge';

// Paleta de gráficos estilo Apple (cores de sistema: azul, verde, laranja,
// rosa, ciano, roxo, amarelo) em vez do arco-íris genérico.
const COLORS = [
  '#0071e3', '#34c759', '#ff9f0a', '#ff375f', '#5ac8fa', '#af52de',
  '#ffd60a', '#30d158', '#64d2ff', '#bf5af2', '#ff6482', '#0a84ff',
  '#30b0c7', '#bf5af2',
];

function StatCard({ label, value, unit, accent, highlight }) {
  const accentMap = {
    blue:   'border-l-galaxy-500',
    violet: 'border-l-violet-galaxy',
    amber:  'border-l-amber-400',
    red:    'border-l-red-400',
    green:  'border-l-emerald-400',
  };
  const textMap = {
    blue:   'text-apple-400',
    violet: 'text-violet-galaxy',
    amber:  'text-amber-600',
    red:    'text-red-500',
    green:  'text-emerald-600',
  };
  return (
    <div className={`surface border-l-4 ${accentMap[accent]} p-5`}>
      <div className="text-[11px] text-cloud-muted uppercase tracking-wide mb-1.5">{label}</div>
      <div className={`text-2xl font-bold ${highlight ? textMap[accent] : 'text-cloud'}`}>{value}</div>
      <div className="text-xs text-cloud-muted mt-0.5">{unit}</div>
    </div>
  );
}

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white/[0.03] border border-surface-line rounded-xl shadow-card px-3 py-2 text-sm">
      <p className="font-semibold text-cloud-soft">{payload[0].payload.fullName}</p>
      <p className="text-apple-400">{payload[0].value} kWh/mês</p>
    </div>
  );
};

export default function Dashboard({
  userAppliances, tariff, tariffSource, setTariff,
  uf, setUf, distribuidora, setDistribuidora,
}) {
  const [chartType, setChartType]             = useState('pie');
  const [distList, setDistList]               = useState([]);
  const [tariffMeta, setTariffMeta]           = useState(null);
  const [loadingTariff, setLoadingTariff]     = useState(false);
  const [tariffError, setTariffError]         = useState(null);

  useEffect(() => {
    if (!uf) { setDistList([]); return; }
    let alive = true;
    fetchDistribuidoras(uf).then((res) => {
      if (!alive) return;
      setDistList(res.data || []);
      const stillValid = (res.data || []).some(
        (d) => d.sigAgente === distribuidora || d.label === distribuidora
      );
      if (!stillValid && res.data?.length) {
        setDistribuidora(res.data[0].sigAgente);
      }
    });
    return () => { alive = false; };
  }, [uf]); // eslint-disable-line react-hooks/exhaustive-deps

  async function loadTariff() {
    if (!uf || !distribuidora) return;
    setLoadingTariff(true);
    setTariffError(null);
    const res = await fetchTarifa(uf, distribuidora);
    setLoadingTariff(false);
    if (res.data?.tariff) {
      setTariff(Number(res.data.tariff), res.data.source || 'aneel');
      setTariffMeta({
        vigencia: res.data.vigencia,
        distribuidora: res.data.distribuidora,
      });
    }
    if (res.isFallback && res.fallbackReason) {
      setTariffError(res.fallbackReason);
    }
  }

  useEffect(() => {
    if (uf && distribuidora) loadTariff();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uf, distribuidora]);

  function handleManualTariff(value) {
    setTariff(Math.max(0.01, Number(value)), 'manual');
    setTariffMeta(null);
    setTariffError(null);
  }

  if (userAppliances.length === 0) {
    return (
      <div className="surface p-12 text-center">
        <span className="text-5xl block mb-4">📊</span>
        <h2 className="text-xl font-bold text-cloud mb-2">Nenhum aparelho cadastrado</h2>
        <p className="text-cloud-muted text-sm">Volte à seção anterior e adicione seus eletrodomésticos.</p>
      </div>
    );
  }

  const { totalKwh, totalCost, totalCO2 } = calcTotals(userAppliances, tariff);
  const recommendations = generateRecommendations(userAppliances, tariff);

  const chartData = [...userAppliances]
    .map((a) => {
      const qty   = a.quantidade ?? 1;
      const label = qty > 1 ? `${qty}× ${a.nome}` : a.nome;
      return {
        name:     label.length > 22 ? label.slice(0, 22) + '…' : label,
        fullName: qty > 1 ? `${a.nome} (${qty} unidades)` : a.nome,
        icone:    a.icone,
        kWh:      parseFloat(calcItemKwh(a).toFixed(2)),
      };
    })
    .sort((a, b) => b.kWh - a.kWh);

  const comparisonPct = ((totalKwh / AVERAGE_CONSUMPTION_BR) * 100).toFixed(0);
  const aboveAvg      = totalKwh > AVERAGE_CONSUMPTION_BR;
  const diffKwh       = Math.abs(totalKwh - AVERAGE_CONSUMPTION_BR).toFixed(0);
  const maxBar        = Math.max(totalKwh, AVERAGE_CONSUMPTION_BR);

  return (
    <div className="space-y-6">
      {/* Tariff editor */}
      <div className="surface p-6 no-print space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-cloud-soft flex items-center gap-2 flex-wrap">
            Tarifa atual:{' '}
            <span className="font-bold text-apple-400">R$ {Number(tariff).toFixed(4)}/kWh</span>
            <DataSourceBadge source={tariffSource} />
            {loadingTariff && <LoadingSpinner className="text-apple-400 ml-1" />}
          </div>
          {tariffMeta?.vigencia && (
            <span className="text-xs text-cloud-muted">
              Vigência: {new Date(tariffMeta.vigencia).toLocaleDateString('pt-BR')}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <label className="text-sm text-cloud-soft flex flex-col gap-1.5">
            UF
            <select
              value={uf || ''}
              onChange={(e) => setUf(e.target.value || null)}
              className="border border-surface-line rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-apple/40 focus:border-apple/50 bg-white/[0.03]"
            >
              <option value="">— selecione —</option>
              {UFS.map((u) => (
                <option key={u.sigla} value={u.sigla}>{u.sigla} — {u.nome}</option>
              ))}
            </select>
          </label>

          <label className="text-sm text-cloud-soft flex flex-col gap-1.5 sm:col-span-2">
            Distribuidora
            <select
              value={distribuidora || ''}
              onChange={(e) => setDistribuidora(e.target.value || null)}
              disabled={!uf || distList.length === 0}
              className="border border-surface-line rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-apple/40 focus:border-apple/50 bg-white/[0.03] disabled:bg-white/[0.04] disabled:text-cloud-muted"
            >
              {!uf && <option value="">Selecione uma UF primeiro</option>}
              {uf && distList.length === 0 && <option value="">Carregando…</option>}
              {distList.map((d) => (
                <option key={d.sigAgente} value={d.sigAgente}>{d.label}</option>
              ))}
            </select>
          </label>
        </div>

        {tariffError && (
          <ErrorBanner message={tariffError} severity="warning" onRetry={loadTariff} />
        )}

        <label className="flex items-center gap-3 text-sm text-cloud-soft pt-2 border-t border-surface-line">
          Ou ajuste manualmente (R$/kWh):
          <input
            type="number"
            value={tariff}
            onChange={(e) => handleManualTariff(e.target.value)}
            className="border border-surface-line rounded-xl px-2 py-1 text-sm w-24 focus:outline-none focus:ring-2 focus:ring-apple/40 focus:border-apple/50"
            step="0.01" min="0.01"
          />
        </label>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Consumo mensal" value={totalKwh.toFixed(1)} unit="kWh/mês" accent="blue" />
        <StatCard label="Custo estimado" value={`R$ ${totalCost.toFixed(2)}`} unit="por mês" accent="violet" />
        <StatCard label="Emissão de CO₂" value={`${totalCO2.toFixed(1)} kg`} unit="kgCO₂/mês (MCTI)" accent="amber" />
        <StatCard
          label="vs. Média Nacional"
          value={`${comparisonPct}%`}
          unit={`da média ANEEL (166 kWh/mês)`}
          accent={aboveAvg ? 'red' : 'green'}
          highlight
        />
      </div>

      {/* National comparison */}
      <div className="surface p-6">
        <h3 className="font-semibold text-cloud mb-5">Comparativo com a Média Brasileira</h3>
        <div className="space-y-3.5 mb-5">
          {[
            { label: 'Seu consumo', kwh: totalKwh, color: aboveAvg ? 'bg-red-400' : 'bg-apple/70' },
            { label: 'Média nacional (ANEEL)', kwh: AVERAGE_CONSUMPTION_BR, color: 'bg-ink-muted' },
          ].map(({ label, kwh, color }) => (
            <div key={label} className="flex items-center gap-3">
              <span className="text-sm text-cloud-soft w-44 shrink-0">{label}</span>
              <div className="flex-1 bg-white/[0.04] rounded-full h-3 overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${Math.min(100, (kwh / maxBar) * 100)}%` }} />
              </div>
              <span className="text-sm font-bold text-cloud w-20 text-right shrink-0">{kwh.toFixed(0)} kWh</span>
            </div>
          ))}
        </div>

        <div className={`rounded-xl p-3.5 text-sm ${aboveAvg ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-700'}`}>
          {aboveAvg
            ? `⚠️ Seu consumo está ${diffKwh} kWh acima da média nacional. Confira as recomendações abaixo!`
            : `✅ Parabéns! Seu consumo está ${diffKwh} kWh abaixo da média nacional. Continue assim!`}
        </div>
      </div>

      {/* Chart */}
      <div className="surface p-6">
        <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
          <h3 className="font-semibold text-cloud">Distribuição do Consumo por Aparelho</h3>
          <div className="flex rounded-full overflow-hidden border border-surface-line text-sm">
            {['pie', 'bar'].map((t) => (
              <button
                key={t}
                onClick={() => setChartType(t)}
                className={`px-4 py-1.5 transition-colors ${chartType === t ? 'bg-apple text-white' : 'text-cloud-soft hover:bg-white/[0.04]'}`}
              >
                {t === 'pie' ? 'Pizza' : 'Barras'}
              </button>
            ))}
          </div>
        </div>

        {chartType === 'pie' ? (
          <div className="flex flex-col lg:flex-row items-center gap-6">
            <div className="w-full lg:w-72 shrink-0">
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="kWh"
                    nameKey="name"
                    cx="50%" cy="50%"
                    outerRadius={110}
                    label={({ percent }) => percent > 0.05 ? `${(percent * 100).toFixed(0)}%` : ''}
                    labelLine={false}
                  >
                    {chartData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2.5 w-full">
              {chartData.map((item, i) => (
                <div key={i} className="flex items-center gap-2.5 text-sm">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-base shrink-0 leading-none">{item.icone}</span>
                  <span className="text-cloud-soft min-w-0 break-words">{item.fullName}</span>
                  <span className="font-semibold text-cloud shrink-0 ml-auto whitespace-nowrap">{item.kWh} kWh</span>
                  <span className="text-cloud-muted text-xs shrink-0 whitespace-nowrap">
                    ({totalKwh > 0 ? ((item.kWh / totalKwh) * 100).toFixed(1) : 0}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={chartData} margin={{ left: 0, right: 10, top: 5, bottom: 80 }}>
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#8a8a90' }} angle={-35} textAnchor="end" height={90} />
              <YAxis tick={{ fontSize: 11, fill: '#8a8a90' }} tickFormatter={(v) => `${v} kWh`} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(77,124,255,0.06)' }} />
              <Bar dataKey="kWh" name="kWh/mês" radius={[6, 6, 0, 0]}>
                {chartData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Recommendations */}
      <div className="surface p-6">
        <h3 className="font-semibold text-cloud mb-1.5">Recomendações Personalizadas</h3>
        <p className="text-xs text-cloud-muted mb-5">Ordenadas pelo maior potencial de economia.</p>

        <div className="space-y-3">
          {recommendations.map((rec, i) => (
            <div key={rec.id} className="flex gap-4 p-4 rounded-2xl border border-surface-line hover:border-apple/40 hover:bg-white/[0.06]/40 transition-colors">
              <span className="text-2xl shrink-0">{rec.icone}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 bg-apple text-white rounded-full text-xs grid place-items-center font-bold shrink-0">{i + 1}</span>
                    <h4 className="font-semibold text-cloud">{rec.titulo}</h4>
                  </div>
                  <span className="text-xs bg-white/[0.06] text-apple-300 px-2 py-0.5 rounded-full shrink-0 font-medium">
                    -{rec.economiaKwh.toFixed(1)} kWh/mês
                  </span>
                </div>
                <p className="text-sm text-cloud-soft mt-1 ml-7">{rec.descricao}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
