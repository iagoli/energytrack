import { SOLAR_IRRADIATION, AVERAGE_CONSUMPTION_BR, CO2_EMISSION_FACTOR } from '../constants';
import { calcItemKwh, calcTotals, calcSolarPanels, calcPaybackMonths } from '../utils/calculations';
import energytrackLogo from '../assets/energytrack_logo.png';
import EmptyState from './ui/EmptyState';

export default function ExportReport({ userAppliances, tariff, solarRegion, onNavigate }) {
  if (userAppliances.length === 0) {
    return (
      <EmptyState
        icon="📄"
        title="Nenhum dado para exportar"
        description="Cadastre seus aparelhos para gerar um relatório completo com resumo, tabela de consumo e simulação solar."
        onNavigate={onNavigate}
      />
    );
  }

  const { totalKwh, totalCost, totalCO2 } = calcTotals(userAppliances, tariff);
  const numPanels      = calcSolarPanels(totalKwh, solarRegion);
  const monthlySavings = totalCost;
  const paybackMonths  = calcPaybackMonths(numPanels, monthlySavings);
  const today          = new Date().toLocaleDateString('pt-BR', { dateStyle: 'long' });
  const aboveAvg       = totalKwh > AVERAGE_CONSUMPTION_BR;

  const sortedAppliances = [...userAppliances].sort(
    (a, b) => calcItemKwh(b) - calcItemKwh(a)
  );
  const totalUnits = userAppliances.reduce((s, a) => s + (a.quantidade ?? 1), 0);

  return (
    <div className="space-y-4">
      {/* Print button */}
      <div className="no-print flex items-center justify-between bg-white rounded-2xl shadow-sm p-4">
        <div>
          <h2 className="font-semibold text-gray-700">Relatório de Consumo</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Imprima ou salve como PDF usando o recurso de impressão do seu navegador (Ctrl+P).
          </p>
        </div>
        <button
          onClick={() => window.print()}
          className="bg-galaxy hover:brightness-105 text-white font-semibold px-5 py-2.5 rounded-full flex items-center gap-2 transition-all shadow-card"
        >
          🖨️ Imprimir / Salvar PDF
        </button>
      </div>

      {/* Report */}
      <div id="print-report" className="bg-white rounded-2xl shadow-sm p-8 space-y-8">
        {/* Header */}
        <div className="text-center border-b border-gray-200 pb-6">
          <img
            src={energytrackLogo}
            alt="EnergyTrack"
            className="h-24 mx-auto mb-2 object-contain"
          />
          <h2 className="text-gray-600 text-lg mt-1">Relatório de Consumo de Energia Residencial</h2>
          <p className="text-gray-400 text-sm mt-2">Gerado em {today}</p>
        </div>

        {/* Summary */}
        <section>
          <h3 className="text-lg font-bold text-gray-700 mb-3 flex items-center gap-2">
            <span>📊</span> Resumo do Consumo
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Consumo mensal',    value: `${totalKwh.toFixed(2)} kWh`,       bg: 'bg-green-50',  text: 'text-green-700' },
              { label: 'Custo estimado',    value: `R$ ${totalCost.toFixed(2)}`,        bg: 'bg-blue-50',   text: 'text-blue-700'  },
              { label: 'Emissão de CO₂',   value: `${totalCO2.toFixed(2)} kg`,         bg: 'bg-amber-50',  text: 'text-amber-700' },
              {
                label: 'vs. Média BR',
                value: `${((totalKwh / AVERAGE_CONSUMPTION_BR) * 100).toFixed(0)}%`,
                bg:   aboveAvg ? 'bg-red-50'     : 'bg-emerald-50',
                text: aboveAvg ? 'text-red-700'  : 'text-emerald-700',
              },
            ].map(({ label, value, bg, text }) => (
              <div key={label} className={`${bg} rounded-xl p-4 text-center`}>
                <div className={`text-xl font-bold ${text}`}>{value}</div>
                <div className="text-xs text-gray-500 mt-1">{label}</div>
              </div>
            ))}
          </div>

          <div className={`mt-3 rounded-xl p-3 text-sm ${aboveAvg ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
            {aboveAvg
              ? `⚠️ Consumo ${(totalKwh - AVERAGE_CONSUMPTION_BR).toFixed(0)} kWh acima da média nacional de 166 kWh/mês (ANEEL).`
              : `✅ Consumo ${(AVERAGE_CONSUMPTION_BR - totalKwh).toFixed(0)} kWh abaixo da média nacional de 166 kWh/mês (ANEEL).`}
          </div>
        </section>

        {/* Appliance table */}
        <section>
          <h3 className="text-lg font-bold text-gray-700 mb-3 flex items-center gap-2">
            <span>🏠</span> Lista de Eletrodomésticos
          </h3>
          {/* Tabela no desktop; cards empilhados no mobile */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                  {['Aparelho', 'Qtd', 'Potência (W)', 'h/dia', 'Dias/mês', 'kWh/mês', 'Custo (R$)', 'CO₂ (kg)'].map((h) => (
                    <th key={h} className="border border-gray-200 px-3 py-2 font-medium text-left">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedAppliances.map((a) => {
                  const qty = a.quantidade ?? 1;
                  const kwh = calcItemKwh(a);
                  return (
                    <tr key={a.id} className="even:bg-gray-50 hover:bg-blue-50 transition-colors">
                      <td className="border border-gray-200 px-3 py-2">
                        {a.icone} {a.nome}
                      </td>
                      <td className="border border-gray-200 px-3 py-2 text-center font-semibold">{qty}</td>
                      <td className="border border-gray-200 px-3 py-2 text-center">{a.potencia_w}</td>
                      <td className="border border-gray-200 px-3 py-2 text-center">{a.horas_dia}</td>
                      <td className="border border-gray-200 px-3 py-2 text-center">{a.dias_mes}</td>
                      <td className="border border-gray-200 px-3 py-2 text-center font-semibold text-green-600">
                        {kwh.toFixed(2)}
                      </td>
                      <td className="border border-gray-200 px-3 py-2 text-center text-gray-700">
                        {(kwh * tariff).toFixed(2)}
                      </td>
                      <td className="border border-gray-200 px-3 py-2 text-center text-gray-700">
                        {(kwh * CO2_EMISSION_FACTOR).toFixed(3)}
                      </td>
                    </tr>
                  );
                })}
                <tr className="bg-gray-100 font-bold">
                  <td className="border border-gray-200 px-3 py-2" colSpan={5}>
                    TOTAL ({userAppliances.length} {userAppliances.length === 1 ? 'tipo' : 'tipos'} · {totalUnits} {totalUnits === 1 ? 'unidade' : 'unidades'})
                  </td>
                  <td className="border border-gray-200 px-3 py-2 text-center text-green-700">
                    {totalKwh.toFixed(2)}
                  </td>
                  <td className="border border-gray-200 px-3 py-2 text-center text-gray-800">
                    {totalCost.toFixed(2)}
                  </td>
                  <td className="border border-gray-200 px-3 py-2 text-center text-gray-800">
                    {totalCO2.toFixed(3)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Versão mobile: cards empilhados */}
          <ul className="sm:hidden space-y-3">
            {sortedAppliances.map((a) => {
              const qty = a.quantidade ?? 1;
              const kwh = calcItemKwh(a);
              return (
                <li key={a.id} className="border border-gray-200 rounded-xl p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-gray-700 truncate">{a.icone} {a.nome}</span>
                    <span className="shrink-0 text-xs font-semibold text-gray-500">{qty}×</span>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-gray-500">
                    <span>Potência: <b className="text-gray-700">{a.potencia_w} W</b></span>
                    <span>Uso: <b className="text-gray-700">{a.horas_dia} h/d · {a.dias_mes} d/m</b></span>
                    <span>kWh/mês: <b className="text-green-600">{kwh.toFixed(2)}</b></span>
                    <span>Custo: <b className="text-gray-700">R$ {(kwh * tariff).toFixed(2)}</b></span>
                    <span className="col-span-2">CO₂: <b className="text-gray-700">{(kwh * CO2_EMISSION_FACTOR).toFixed(3)} kg</b></span>
                  </div>
                </li>
              );
            })}
            <li className="border border-gray-300 rounded-xl p-3 bg-gray-100 font-bold text-sm text-gray-700 flex items-center justify-between">
              <span>TOTAL ({userAppliances.length} {userAppliances.length === 1 ? 'tipo' : 'tipos'} · {totalUnits} {totalUnits === 1 ? 'unidade' : 'unidades'})</span>
              <span className="text-right">
                {totalKwh.toFixed(2)} kWh · R$ {totalCost.toFixed(2)} · {totalCO2.toFixed(3)} kg
              </span>
            </li>
          </ul>
        </section>

        {/* Solar simulation */}
        <section>
          <h3 className="text-lg font-bold text-gray-700 mb-3 flex items-center gap-2">
            <span>☀️</span> Simulação de Energia Solar
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            {[
              { label: 'Região',               value: SOLAR_IRRADIATION[solarRegion]?.label,         bg: 'bg-amber-50',   text: 'text-amber-700' },
              { label: 'Painéis (350 W)',       value: `${numPanels} painéis`,                        bg: 'bg-amber-50',   text: 'text-amber-700' },
              { label: 'Economia mensal',       value: `R$ ${monthlySavings.toFixed(2)}`,             bg: 'bg-green-50',   text: 'text-green-700' },
              { label: 'Payback estimado',      value: paybackMonths ? `${(paybackMonths/12).toFixed(1)} anos` : 'N/D', bg: 'bg-blue-50', text: 'text-blue-700' },
            ].map(({ label, value, bg, text }) => (
              <div key={label} className={`${bg} rounded-xl p-3`}>
                <div className="text-xs text-gray-500">{label}</div>
                <div className={`font-bold mt-1 ${text}`}>{value}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <div className="border-t border-gray-200 pt-4 text-xs text-gray-400 text-center space-y-1">
          <p>
            Fator de emissão CO₂: {CO2_EMISSION_FACTOR} kgCO₂/kWh (MCTI/SEEG) ·
            Tarifa: R$ {Number(tariff).toFixed(2)}/kWh ·
            Média BR: 166 kWh/mês (ANEEL)
          </p>
          <p className="font-medium text-gray-500">
            EnergyTrack — Projeto de Introdução às Ciências Ambientais · Engenharia de Computação
          </p>
        </div>
      </div>
    </div>
  );
}
