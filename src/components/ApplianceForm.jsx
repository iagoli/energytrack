import { useMemo, useState } from 'react';
import { APPLIANCE_LIST } from '../constants';
import catalog from '../data/applianceCatalog.json';
import { calcKwh } from '../utils/calculations';
import { useScrollHint } from '../hooks/useScrollHint';
import ErrorBanner from './ui/ErrorBanner';
import LoadingSpinner from './ui/LoadingSpinner';

// Achatamos o catálogo em uma lista plana de modelos (com categoria) para
// busca e para manter compatibilidade com o backend (cada modelo vira um "appliance").
const CATALOG_MODELS = catalog.categories.flatMap((cat) =>
  cat.models.map((m) => ({ ...m, categoriaId: cat.id, categoriaLabel: cat.label }))
);

export default function ApplianceForm({ userAppliances, onAdd, onUpdate, onRemove }) {
  const [activeCat, setActiveCat] = useState(catalog.categories[0].id);
  const [search, setSearch]       = useState('');
  const [modal, setModal]         = useState(null);
  const [formData, setFormData]   = useState({ potencia_w: 0, horas_dia: 1, dias_mes: 30, quantidade: 1 });
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState(null);
  const tabs = useScrollHint();

  const q = search.trim().toLowerCase();
  const models = useMemo(() => {
    if (q) {
      return CATALOG_MODELS.filter((m) => m.nome.toLowerCase().includes(q));
    }
    return CATALOG_MODELS.filter((m) => m.categoriaId === activeCat);
  }, [activeCat, q]);

  function openAdd(model) {
    setError(null);
    setModal({ mode: 'add', appliance: model });
    setFormData({ potencia_w: model.potencia_w, horas_dia: 1, dias_mes: 30, quantidade: 1 });
  }

  function openEdit(entry) {
    setError(null);
    setModal({ mode: 'edit', id: entry.id, nome: entry.nome, icone: entry.icone });
    setFormData({
      potencia_w: entry.potencia_w,
      horas_dia:  entry.horas_dia,
      dias_mes:   entry.dias_mes,
      quantidade: entry.quantidade ?? 1,
    });
  }

  async function handleConfirm() {
    const p = Number(formData.potencia_w);
    const h = Number(formData.horas_dia);
    const d = Number(formData.dias_mes);
    const qty = Math.max(1, Math.floor(Number(formData.quantidade) || 1));

    setSaving(true);
    setError(null);
    try {
      if (modal.mode === 'add') {
        await onAdd({
          applianceId: modal.appliance.id,
          nome:        modal.appliance.nome,
          icone:       modal.appliance.icone || '🔌',
          potencia_w:  p,
          horas_dia:   h,
          dias_mes:    d,
          quantidade:  qty,
        });
      } else {
        await onUpdate(modal.id, { potencia_w: p, horas_dia: h, dias_mes: d, quantidade: qty });
      }
      setModal(null);
    } catch (e) {
      setError(e.body?.issues?.map((i) => i.message).join(' · ') || e.message || 'Erro ao salvar.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    setError(null);
    try { await onRemove(id); } catch (e) { setError(e.message || 'Erro ao remover.'); }
  }

  const totalKwh = userAppliances.reduce(
    (s, a) => s + calcKwh(a.potencia_w, a.horas_dia, a.dias_mes) * (a.quantidade ?? 1),
    0
  );

  const previewQty = Math.max(1, Number(formData.quantidade) || 1);
  const previewUnitKwh = calcKwh(Number(formData.potencia_w), Number(formData.horas_dia), Number(formData.dias_mes));
  const previewKwh = previewUnitKwh * previewQty;

  return (
    <div className="space-y-6">
      {error && <ErrorBanner message={error} severity="error" onRetry={() => setError(null)} />}

      {/* Seletor de modelo: categoria + busca + grade de modelos */}
      <div className="surface p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <h3 className="font-semibold text-cloud">Escolha seus aparelhos</h3>
          <input
            type="text"
            placeholder="Buscar por nome..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-surface-line rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-apple/40 focus:border-apple/50 w-full sm:w-56 bg-white/[0.03] text-cloud placeholder:text-cloud-muted"
          />
        </div>

        {/* Abas de categoria — com marcador de scroll nas laterais */}
        <div className="relative mb-5">
          <div
            ref={tabs.ref}
            onScroll={tabs.update}
            className="no-scrollbar flex gap-2 overflow-x-auto pb-1"
          >
            {catalog.categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => { setActiveCat(cat.id); setSearch(''); }}
                className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  !q && activeCat === cat.id
                    ? 'bg-apple text-white shadow-glow'
                    : 'bg-white/[0.04] text-cloud-soft hover:text-cloud hover:bg-white/[0.08]'
                }`}
              >
                {cat.icon} {cat.label}
              </button>
            ))}
          </div>
          {/* fades indicando conteúdo além das bordas */}
          <div
            className={`pointer-events-none absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-surface to-transparent transition-opacity duration-200 ${
              tabs.canLeft ? 'opacity-100' : 'opacity-0'
            }`}
          />
          <div
            className={`pointer-events-none absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-surface to-transparent transition-opacity duration-200 ${
              tabs.canRight ? 'opacity-100' : 'opacity-0'
            }`}
          />
        </div>

        <div className="flex flex-wrap gap-3 justify-center">
          {models.map((m) => (
            <button
              key={m.id}
              onClick={() => openAdd(m)}
              className="group flex flex-col items-center gap-1.5 p-4 w-32 sm:w-36 rounded-2xl border border-surface-line bg-white/[0.03] hover:border-apple/50 hover:bg-white/[0.06] transition-all"
            >
              <span className="text-3xl transition-transform duration-300 group-hover:scale-110">{m.icone}</span>
              <span className="text-xs text-cloud-soft group-hover:text-cloud leading-tight font-medium text-center">
                {m.nome}
              </span>
              <span className="text-[11px] text-cloud-muted">{m.potencia_w} W</span>
              <span className="text-xs text-apple-400 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                + Adicionar
              </span>
            </button>
          ))}
          {models.length === 0 && (
            <p className="col-span-full text-center text-cloud-muted py-8">Nenhum modelo encontrado.</p>
          )}
        </div>

        {q && (
          <button
            onClick={() => setSearch('')}
            className="mt-4 text-xs text-cloud-muted hover:text-cloud underline"
          >
            Limpar busca
          </button>
        )}
      </div>

      {/* Lista do usuário */}
      {userAppliances.length > 0 && (
        <div className="surface p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-cloud">
              Meus aparelhos{' '}
              <span className="text-sm font-normal text-cloud-muted">({userAppliances.length})</span>
            </h3>
            <span className="text-sm font-semibold text-apple-400 bg-white/[0.06] px-3 py-1 rounded-full">
              Total: {totalKwh.toFixed(1)} kWh/mês
            </span>
          </div>

          {/* Tabela no desktop; cards empilhados no mobile */}
          <div className="hidden sm:block overflow-x-auto -mx-2 px-2">
            <table className="w-full text-sm min-w-[640px]">
              <thead>
                <tr className="text-left text-cloud-muted text-xs uppercase tracking-wide border-b border-surface-line">
                  <th className="pb-3 font-medium">Aparelho</th>
                  <th className="pb-3 font-medium text-center">Qtd</th>
                  <th className="pb-3 font-medium text-center">Potência (W)</th>
                  <th className="pb-3 font-medium text-center">h/dia</th>
                  <th className="pb-3 font-medium text-center">Dias/mês</th>
                  <th className="pb-3 font-medium text-center">kWh/mês</th>
                  <th className="pb-3 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {userAppliances.map((a) => {
                  const qty = a.quantidade ?? 1;
                  const kwh = calcKwh(a.potencia_w, a.horas_dia, a.dias_mes) * qty;
                  return (
                    <tr key={a.id} className="border-b border-surface-line last:border-0 hover:bg-white/[0.04] transition-colors">
                      <td className="py-3">
                        <span className="mr-2">{a.icone}</span>
                        <span className="text-cloud">{a.nome}</span>
                      </td>
                      <td className="py-3 text-center">
                        <span className="inline-block min-w-[2rem] px-2 py-0.5 rounded-full bg-white/[0.06] text-apple-300 font-semibold text-xs">
                          {qty}×
                        </span>
                      </td>
                      <td className="py-3 text-center text-cloud-soft">{a.potencia_w}</td>
                      <td className="py-3 text-center text-cloud-soft">{a.horas_dia}</td>
                      <td className="py-3 text-center text-cloud-soft">{a.dias_mes}</td>
                      <td className="py-3 text-center font-semibold text-apple-400">{kwh.toFixed(2)}</td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => openEdit(a)}
                          className="text-cloud-muted hover:text-apple-400 px-2 py-1 rounded-lg hover:bg-white/[0.06] transition-colors"
                          title="Editar"
                        >✏️</button>
                        <button
                          onClick={() => handleDelete(a.id)}
                          className="text-cloud-muted hover:text-red-500 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors ml-1"
                          title="Remover"
                        >🗑️</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Versão mobile: cards empilhados */}
          <ul className="sm:hidden space-y-3">
            {userAppliances.map((a) => {
              const qty = a.quantidade ?? 1;
              const kwh = calcKwh(a.potencia_w, a.horas_dia, a.dias_mes) * qty;
              return (
                <li key={a.id} className="flex items-start gap-3 p-3 rounded-2xl border border-surface-line bg-white/[0.03]">
                  <span className="text-2xl leading-none mt-0.5">{a.icone}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-cloud font-medium truncate">{a.nome}</span>
                      <span className="shrink-0 inline-block px-2 py-0.5 rounded-full bg-white/[0.06] text-apple-300 font-semibold text-xs">{qty}×</span>
                    </div>
                    <div className="mt-1.5 grid grid-cols-4 gap-1 text-[11px] text-cloud-muted">
                      <span>{a.potencia_w} W</span>
                      <span>{a.horas_dia} h/d</span>
                      <span>{a.dias_mes} d/m</span>
                      <span className="text-apple-400 font-semibold">{kwh.toFixed(2)} kWh</span>
                    </div>
                    <div className="mt-2 flex gap-2">
                      <button
                        onClick={() => openEdit(a)}
                        className="text-cloud-muted hover:text-apple-400 text-xs px-2 py-1 rounded-lg hover:bg-white/[0.06] transition-colors"
                      >✏️ Editar</button>
                      <button
                        onClick={() => handleDelete(a.id)}
                        className="text-cloud-muted hover:text-red-500 text-xs px-2 py-1 rounded-lg hover:bg-red-50 transition-colors"
                      >🗑️ Remover</button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Estado vazio */}
      {userAppliances.length === 0 && (
        <div className="text-center py-10 text-cloud-muted">
          <p className="text-4xl mb-2">👆</p>
          <p>Clique em um modelo acima para adicionar. A potência já vem preenchida.</p>
        </div>
      )}

      {/* Modal simplificado: só horas/dia + quantidade (potência já definida) */}
      {modal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
          onClick={(e) => e.target === e.currentTarget && !saving && setModal(null)}
        >
          <div className="bg-space-raised rounded-3xl shadow-card-lg p-6 w-full max-w-sm border border-surface-line">
            <div className="flex items-center gap-3 mb-5">
              <span className="text-3xl">{modal.mode === 'add' ? modal.appliance.icone : modal.icone}</span>
              <div>
                <h3 className="font-bold text-cloud text-base leading-tight">
                  {modal.mode === 'add' ? modal.appliance.nome : modal.nome}
                </h3>
                <p className="text-xs text-cloud-muted mt-0.5">Quase lá — só o tempo de uso</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-cloud-soft block mb-1.5">Quantidade na residência</label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, quantidade: Math.max(1, Number(formData.quantidade) - 1) })}
                    className="w-9 h-9 rounded-xl border border-surface-line text-cloud-soft hover:bg-white/[0.04] text-lg leading-none font-semibold"
                    aria-label="Diminuir"
                  >−</button>
                  <input
                    type="number"
                    value={formData.quantidade}
                    onChange={(e) => setFormData({ ...formData, quantidade: e.target.value })}
                    className="flex-1 border border-surface-line rounded-xl px-3 py-2 text-sm text-center text-cloud bg-white/[0.03] focus:outline-none focus:ring-2 focus:ring-apple/40 focus:border-apple/50"
                    min="1" max="100" step="1"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, quantidade: Math.min(100, Number(formData.quantidade) + 1) })}
                    className="w-9 h-9 rounded-xl border border-surface-line text-cloud-soft hover:bg-white/[0.04] text-lg leading-none font-semibold"
                    aria-label="Aumentar"
                  >+</button>
                </div>
                <p className="text-xs text-cloud-muted mt-1.5">Quantas unidades você tem deste aparelho?</p>
              </div>

              <div>
                <label className="text-sm font-medium text-cloud-soft block mb-1.5">
                  Horas de uso por dia
                  <span className="text-cloud-muted font-normal"> (potência já definida: {modal.mode === 'add' ? modal.appliance.potencia_w : formData.potencia_w} W)</span>
                </label>
                <input
                  type="number"
                  value={formData.horas_dia}
                  onChange={(e) => setFormData({ ...formData, horas_dia: e.target.value })}
                  className="w-full border border-surface-line rounded-xl px-3 py-2 text-sm text-cloud bg-white/[0.03] focus:outline-none focus:ring-2 focus:ring-apple/40 focus:border-apple/50"
                  min="0.1" max="24" step="0.1"
                />
                <p className="text-xs text-cloud-muted mt-1.5">Ex.: 0,25 = 15 minutos. Use decimais.</p>
              </div>

              <div>
                <label className="text-sm font-medium text-cloud-soft block mb-1.5">Dias de uso por mês</label>
                <input
                  type="number"
                  value={formData.dias_mes}
                  onChange={(e) => setFormData({ ...formData, dias_mes: e.target.value })}
                  className="w-full border border-surface-line rounded-xl px-3 py-2 text-sm text-cloud bg-white/[0.03] focus:outline-none focus:ring-2 focus:ring-apple/40 focus:border-apple/50"
                  min="1" max="31"
                />
              </div>

              <div className="bg-white/[0.06] rounded-xl p-3 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-cloud-soft">Consumo estimado:</span>
                  <span className="font-bold text-apple-400 text-base">{previewKwh.toFixed(2)} kWh/mês</span>
                </div>
                {previewQty > 1 && (
                  <div className="text-xs text-cloud-muted text-right">
                    {previewUnitKwh.toFixed(2)} kWh × {previewQty} unidade{previewQty > 1 ? 's' : ''}
                  </div>
                )}
              </div>

              {error && <ErrorBanner message={error} severity="error" />}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setModal(null)}
                disabled={saving}
                className="flex-1 border border-surface-line text-cloud-soft py-2.5 rounded-full hover:bg-white/[0.04] text-sm font-semibold transition-colors disabled:opacity-50"
              >Cancelar</button>
              <button
                onClick={handleConfirm}
                disabled={saving}
                className="flex-1 bg-apple text-white py-2.5 rounded-full hover:brightness-105 font-semibold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {saving && <LoadingSpinner />}
                {modal.mode === 'add' ? '+ Adicionar' : '✓ Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
