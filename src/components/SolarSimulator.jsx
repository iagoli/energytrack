import { useEffect, useState } from 'react';
import { SOLAR_IRRADIATION, PANEL_POWER_W, PANEL_COST_BRL, PANEL_EFFICIENCY } from '../constants';
import {
  calcTotals,
  calcSolarPanelsFromIrradiation,
  calcPaybackMonths,
} from '../utils/calculations';
import { fetchCepData } from '../services/cep';
import { fetchIrradiacao, regionFromUf } from '../services/cresesb';
import LoadingSpinner from './ui/LoadingSpinner';
import ErrorBanner from './ui/ErrorBanner';
import DataSourceBadge from './ui/DataSourceBadge';

function ResultCard({ icon, label, value, sub, accent }) {
  const map = {
    amber:  'border-t-amber-400 text-amber-600',
    blue:   'border-t-apple text-apple-400',
    violet: 'border-t-violet-galaxy text-violet-galaxy',
    green:  'border-t-emerald-400 text-emerald-600',
    teal:   'border-t-cyan-400 text-cyan-600',
  };
  return (
    <div className={`surface border-t-4 ${map[accent]} p-5`}>
      <div className="text-3xl mb-2">{icon}</div>
      <div className="text-[11px] uppercase tracking-wide mb-1 text-cloud-muted">{label}</div>
      <div className="text-2xl font-bold text-cloud">{value}</div>
      {sub && <div className="text-xs text-cloud-muted mt-0.5">{sub}</div>}
    </div>
  );
}

function maskCep(v) {
  const d = String(v).replace(/\D/g, '').slice(0, 8);
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
}

export default function SolarSimulator({
  userAppliances, tariff,
  solarRegion, setSolarRegion,
  cep, setCep,
  location, setLocation,
}) {
  const [loadingCep, setLoadingCep]   = useState(false);
  const [cepError, setCepError]       = useState(null);
  const [irrData, setIrrData]         = useState(null);
  const [loadingIrr, setLoadingIrr]   = useState(false);
  const [irrError, setIrrError]       = useState(null);

  const irradiation =
    irrData?.irradiacaoMedia ?? SOLAR_IRRADIATION[solarRegion]?.value ?? 4.8;
  const irradiationSource =
    irrData?.source || (irrData ? 'fallback-static' : 'fallback-static');

  async function lookupCep(value) {
    const clean = String(value).replace(/\D/g, '');
    setCepError(null);
    if (clean.length !== 8) {
      setLocation(null);
      return;
    }
    setLoadingCep(true);
    const res = await fetchCepData(clean);
    setLoadingCep(false);
    if (res.data) {
      setLocation(res.data);
      setSolarRegion(regionFromUf(res.data.uf));
    } else {
      setLocation(null);
      setCepError(res.fallbackReason || 'CEP não encontrado.');
    }
  }

  async function lookupIrradiacao(lat, lng) {
    setIrrError(null);
    setLoadingIrr(true);
    const res = await fetchIrradiacao(lat, lng);
    setLoadingIrr(false);
    if (res.data) {
      setIrrData(res.data);
    } else {
      setIrrData(null);
      setIrrError(res.fallbackReason || 'Falha ao obter irradiação solar.');
    }
  }

  useEffect(() => {
    if (location?.lat != null && location?.lng != null) {
      lookupIrradiacao(location.lat, location.lng);
    } else {
      setIrrData(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location?.lat, location?.lng]);

  function handleCepChange(e) {
    const masked = maskCep(e.target.value);
    setCep(masked);
    lookupCep(masked);
  }

  function handleRetryCep() {
    if (cep) lookupCep(cep);
  }

  function handleRetryIrr() {
    if (location?.lat != null) lookupIrradiacao(location.lat, location.lng);
  }

  if (userAppliances.length === 0) {
    return (
      <div className="surface p-12 text-center">
        <span className="text-5xl block mb-4">☀️</span>
        <h2 className="text-xl font-bold text-cloud mb-2">Cadastre aparelhos primeiro</h2>
        <p className="text-cloud-muted text-sm">Volte à seção de aparelhos e adicione seus eletrodomésticos.</p>
      </div>
    );
  }

  const { totalKwh, totalCost } = calcTotals(userAppliances, tariff);
  const numPanels        = calcSolarPanelsFromIrradiation(totalKwh, irradiation);
  const monthlySavings   = totalCost;
  const totalInstallCost = numPanels * PANEL_COST_BRL;
  const paybackMonths    = calcPaybackMonths(numPanels, monthlySavings);
  const paybackYears     = paybackMonths ? (paybackMonths / 12).toFixed(1) : null;
  const kwhPerPanelDay   = ((PANEL_POWER_W / 1000) * irradiation * PANEL_EFFICIENCY).toFixed(2);
  const kwhAnual         = totalKwh * 12;
  const annualCO2KgReal  = kwhAnual * 0.0839;
  const liquidReturn25y  = (monthlySavings * 12 * 25) - totalInstallCost;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-apple rounded-3xl p-7 sm:p-8 text-white shadow-card-lg">
        <h2 className="text-xl sm:text-2xl font-bold mb-1.5">Simulador de Energia Solar Fotovoltaica</h2>
        <p className="text-white/80 text-sm">
          Baseado no seu consumo atual de{' '}
          <strong className="text-white">{totalKwh.toFixed(1)} kWh/mês</strong>, calculamos o sistema ideal para sua residência.
        </p>
      </div>

      {/* CEP + Region selector */}
      <div className="surface p-6 space-y-5">
        <div>
          <h3 className="font-semibold text-cloud mb-1">Localização</h3>
          <p className="text-xs text-cloud-muted mb-4">
            Informe seu CEP para usar irradiação real por coordenadas, ou selecione uma região para uma estimativa rápida.
          </p>

          <div className="flex flex-wrap items-end gap-3">
            <label className="text-sm text-cloud-soft flex flex-col gap-1.5">
              CEP
              <input
                type="text"
                inputMode="numeric"
                placeholder="00000-000"
                value={cep || ''}
                onChange={handleCepChange}
                className="border border-surface-line rounded-xl px-3 py-2 text-sm w-36 focus:outline-none focus:ring-2 focus:ring-apple/40 focus:border-apple/50"
              />
            </label>
            {loadingCep && <span className="text-apple-400 pb-2"><LoadingSpinner /></span>}
            {location && !loadingCep && (
              <div className="text-sm pb-2">
                <span className="text-cloud font-semibold">{location.cidade}/{location.uf}</span>
                <span className="text-cloud-muted ml-1">({location.lat.toFixed(2)}, {location.lng.toFixed(2)})</span>
                <DataSourceBadge source={location.coordsSource} />
              </div>
            )}
          </div>
          {cepError && (
            <div className="mt-3">
              <ErrorBanner message={cepError} severity="warning" onRetry={handleRetryCep} />
            </div>
          )}
        </div>

        <div className="border-t border-surface-line pt-4">
          <h4 className="font-semibold text-cloud-soft mb-1 text-sm">Ou selecione uma região (fallback)</h4>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-3">
            {Object.entries(SOLAR_IRRADIATION).map(([key, { label, value }]) => (
              <button
                key={key}
                onClick={() => { setSolarRegion(key); setIrrData(null); setLocation(null); setCep(''); }}
                className={`p-3 rounded-2xl border text-sm font-medium transition-all ${
                  !irrData && solarRegion === key
                    ? 'border-apple/50 bg-white/[0.03]/[0.06] text-apple-300 shadow-card'
                    : 'border-surface-line text-cloud-soft hover:border-apple/40 hover:bg-white/[0.03]/[0.06]'
                }`}
              >
                <div className="font-semibold">{label}</div>
                <div className="text-xs text-cloud-muted mt-1 font-normal">{value} kWh/m²/dia</div>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white/[0.03]/[0.06] border border-apple/30 rounded-2xl px-4 py-3 flex flex-wrap items-center justify-between gap-2">
          <div className="text-sm text-apple-300 flex items-center gap-2 flex-wrap">
            <span>Irradiação aplicada:</span>
            <strong>{irradiation.toFixed(2)} kWh/m²/dia</strong>
            <DataSourceBadge source={irradiationSource} />
            {loadingIrr && <LoadingSpinner className="text-apple-400" />}
          </div>
          <span className="text-xs text-apple-400">
            {irrData ? 'via NASA POWER (CRESESB)' : `região ${SOLAR_IRRADIATION[solarRegion]?.label || 'padrão'} (média estimada)`}
          </span>
        </div>

        {irrError && (
          <ErrorBanner message={irrError} severity="warning" onRetry={handleRetryIrr} />
        )}
      </div>

      {/* Result cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <ResultCard
          icon="🔆" label="Painéis necessários" accent="amber"
          value={`${numPanels} painéis`}
          sub={`${PANEL_POWER_W} W cada · ${(numPanels * PANEL_POWER_W / 1000).toFixed(1)} kWp total`}
        />
        <ResultCard
          icon="💰" label="Investimento estimado" accent="blue"
          value={`R$ ${totalInstallCost.toLocaleString('pt-BR')}`}
          sub={`R$ ${PANEL_COST_BRL.toLocaleString('pt-BR')} por painel instalado`}
        />
        <ResultCard
          icon="📅" label="Payback estimado" accent="violet"
          value={paybackYears ? `${paybackYears} anos` : 'N/D'}
          sub={paybackMonths ? `≈ ${Math.round(paybackMonths)} meses` : undefined}
        />
        <ResultCard
          icon="💸" label="Economia mensal" accent="green"
          value={`R$ ${monthlySavings.toFixed(2)}`}
          sub={`R$ ${(monthlySavings * 12).toFixed(2)} por ano`}
        />
        <ResultCard
          icon="🌿" label="Redução de CO₂" accent="teal"
          value={`${annualCO2KgReal.toFixed(1)} kg`}
          sub={`por ano (${(annualCO2KgReal / 1000).toFixed(3)} tCO₂)`}
        />

        <div className="surface border-t-4 border-t-apple p-5">
          <div className="text-lg mb-2">ℹ️</div>
          <div className="text-sm font-semibold text-cloud mb-2">Como calculamos</div>
          <ul className="text-xs text-cloud-soft space-y-1">
            <li>• Irradiação: {irradiation.toFixed(2)} kWh/m²/dia ({irrData ? 'NASA POWER' : 'média regional'})</li>
            <li>• Eficiência do sistema: {(PANEL_EFFICIENCY * 100).toFixed(0)}%</li>
            <li>• Geração/painel/dia: {kwhPerPanelDay} kWh</li>
            <li>• Consumo diário: {(totalKwh / 30).toFixed(2)} kWh</li>
            <li>• Fórmula: Painéis = ⌈consumo_diário / geração_painel⌉</li>
          </ul>
        </div>
      </div>

      {/* 25-year projection */}
      <div className="bg-apple rounded-3xl p-7 sm:p-8 text-white shadow-card-lg">
        <h3 className="font-bold text-lg mb-5">Projeção de 25 anos (vida útil do sistema)</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div className="bg-white/[0.03]/[0.08] rounded-2xl p-5 backdrop-blur-sm">
            <div className="text-3xl font-bold">{(annualCO2KgReal * 25 / 1000).toFixed(1)} t</div>
            <div className="text-white/70 text-sm mt-1">de CO₂ evitado</div>
          </div>
          <div className="bg-white/[0.03]/[0.08] rounded-2xl p-5 backdrop-blur-sm">
            <div className="text-3xl font-bold">R$ {(monthlySavings * 12 * 25).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</div>
            <div className="text-white/70 text-sm mt-1">total economizado</div>
          </div>
          <div className="bg-white/[0.03]/[0.08] rounded-2xl p-5 backdrop-blur-sm">
            <div className={`text-3xl font-bold ${liquidReturn25y >= 0 ? 'text-yellow-300' : 'text-red-300'}`}>
              R$ {Math.abs(liquidReturn25y).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
            </div>
            <div className="text-white/70 text-sm mt-1">
              {liquidReturn25y >= 0 ? 'retorno líquido' : 'ainda a recuperar'}
            </div>
          </div>
        </div>

        <p className="text-xs text-white/60 mt-5">
          * Estimativas com base em preços e consumo atuais, sem correção monetária ou reajuste tarifário.
          Reajustes na tarifa de energia tendem a reduzir ainda mais o payback real.
        </p>
      </div>
    </div>
  );
}
