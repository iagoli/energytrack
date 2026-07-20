import energytrackLogo from '../assets/energytrack_logo.png';

// Rodapé premium (opção A+B): glass + glow ambiente, marca+tagline,
// links rápidos das 4 páginas e dados institucionais do projeto acadêmico.
// some no PDF via .no-print.
const PAGES = [
  { id: 'aparelhos', label: 'Aparelhos', hint: 'Cadastro' },
  { id: 'painel', label: 'Painel', hint: 'Análise' },
  { id: 'solar', label: 'Energia Solar', hint: 'Simulação' },
  { id: 'relatorio', label: 'Relatório', hint: 'Documento' },
];

const SOURCES = [
  { label: 'ANEEL', note: 'Tarifa & média nacional (166 kWh/mês)' },
  { label: 'CRESESB', note: 'Irradiação solar por região' },
  { label: 'MCTI / SEEG', note: 'Fator de emissão CO₂ (0,0839 kg/kWh)' },
];

function BoltIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z" />
    </svg>
  );
}

export default function Footer({ route, onNavigate, user }) {
  return (
    <footer className="no-print relative mt-16 overflow-hidden border-t border-surface-line">
      {/* glow ambiente (gradiente válido) + faixa superior em gradiente azul→roxo */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, #0a84ff 25%, #bf5af2 75%, transparent)' }}
      />
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            'radial-gradient(70% 130% at 50% 130%, rgba(10,132,255,0.16), rgba(175,82,222,0.10) 45%, transparent 75%)',
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-5 py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1.2fr]">
          {/* Marca + tagline */}
          <div>
            <div className="flex items-center gap-2.5">
              <img src={energytrackLogo} alt="EnergyTrack" className="h-8 w-auto object-contain" />
              <span className="font-semibold text-cloud tracking-tight">EnergyTrack</span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-cloud-soft">
              Monitoramento de consumo residencial — entenda, simule e reduza sua conta de energia com dados reais.
            </p>
            {user?.email && (
              <p className="mt-4 inline-flex items-center gap-2 text-xs text-cloud-muted">
                <span className="grid place-items-center w-6 h-6 rounded-full bg-apple text-white text-[11px] font-semibold">
                  {(user.name || user.email || '?').slice(0, 1).toUpperCase()}
                </span>
                {user.email}
              </p>
            )}
          </div>

          {/* Links rápidos */}
          <nav aria-label="Links do rodapé">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-cloud-muted mb-4">Navegação</h4>
            <ul className="space-y-2.5">
              {PAGES.map((p) => (
                <li key={p.id}>
                  <button
                    onClick={() => onNavigate?.(p.id)}
                    className={`group flex items-center gap-2 text-sm transition-colors ${
                      route === p.id ? 'text-apple-400' : 'text-cloud-soft hover:text-cloud'
                    }`}
                  >
                    <BoltIcon />
                    <span>{p.label}</span>
                    <span className="text-[11px] text-cloud-muted opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
                      {p.hint}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* Dados do projeto */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-cloud-muted mb-4">Projeto acadêmico</h4>
            <p className="text-sm text-cloud-soft leading-relaxed">
              Introdução às Ciências Ambientais · Engenharia de Computação
            </p>
            <ul className="mt-4 space-y-2.5">
              {SOURCES.map((s) => (
                <li key={s.label} className="text-xs">
                  <span className="font-semibold text-cloud">{s.label}</span>
                  <span className="text-cloud-muted"> — {s.note}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Faixa inferior */}
        <div className="mt-10 pt-6 border-t border-surface-line flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-cloud-muted">
            © {new Date().getFullYear()} EnergyTrack · Projeto acadêmico
          </p>
          <p className="text-xs text-cloud-muted flex items-center gap-1.5">
            <BoltIcon />
            Dados de referência oficial — uso educacional
          </p>
        </div>
      </div>
    </footer>
  );
}
