import { useEffect, useState } from 'react';
import energytrackLogo from '../assets/energytrack_logo.png';
import { useScrollHint } from '../hooks/useScrollHint';

const PAGES = [
  { id: 'aparelhos', label: 'Aparelhos' },
  { id: 'painel', label: 'Painel' },
  { id: 'solar', label: 'Energia Solar' },
  { id: 'relatorio', label: 'Relatório' },
];

/**
 * Nav superior minimalista estilo Apple:
 * - barra translúcida (glass) fixa
 * - navegação por páginas (state, sem reload)
 * - destaca a página ativa
 * - toggle de tema claro/escuro no canto superior direito
 */
export default function NavBar({ user, logout, route, onNavigate, theme, onToggleTheme }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isLight = theme === 'light';
  const navScroll = useScrollHint();

  return (
    <header
      className={`fixed top-0 inset-x-0 z-40 nav-glass transition-shadow duration-300 ${
        scrolled ? 'shadow-nav' : ''
      }`}
    >
      <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between gap-4">
        {/* Marca */}
        <button
          onClick={() => onNavigate('aparelhos')}
          className="flex items-center gap-2.5 min-w-0 group"
        >
          <img
            src={energytrackLogo}
            alt="EnergyTrack"
            className="h-8 w-auto object-contain shrink-0"
          />
          <span className="font-semibold text-cloud tracking-tight hidden sm:block">
            EnergyTrack
          </span>
        </button>

        {/* Links de página */}
        <nav className="hidden md:flex items-center gap-1">
          {PAGES.map((s) => (
            <button
              key={s.id}
              onClick={() => onNavigate(s.id)}
              className={`relative px-3.5 py-2 text-sm font-medium rounded-full transition-colors duration-200 ${
                route === s.id
                  ? 'text-cloud bg-white/[0.08]'
                  : 'text-cloud-soft hover:text-cloud hover:bg-white/[0.05]'
              }`}
            >
              {s.label}
            </button>
          ))}
        </nav>

        {/* Tema + Usuário + sair */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onToggleTheme}
            aria-label={isLight ? 'Mudar para tema escuro' : 'Mudar para tema claro'}
            title={isLight ? 'Tema escuro' : 'Tema claro'}
            className="grid place-items-center w-9 h-9 rounded-full border border-surface-line bg-white/[0.03] text-cloud-soft hover:text-cloud hover:bg-white/[0.08] transition-colors"
          >
            {isLight ? (
              // lua
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            ) : (
              // sol
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
              </svg>
            )}
          </button>
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt=""
              referrerPolicy="no-referrer"
              className="w-8 h-8 rounded-full ring-1 ring-white/15"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-apple text-white grid place-items-center text-sm font-semibold">
              {(user?.name || user?.email || '?').slice(0, 1).toUpperCase()}
            </div>
          )}
          <button
            onClick={logout}
            className="text-xs font-medium text-cloud-muted hover:text-red-400 transition-colors"
            title="Sair"
          >
            Sair
          </button>
        </div>
      </div>

      {/* Navegação compacta (mobile) — com marcador de scroll nas laterais */}
      <div className="md:hidden relative">
        <nav
          ref={navScroll.ref}
          onScroll={navScroll.update}
          className="flex items-center gap-1 px-3 pb-2 overflow-x-auto no-scrollbar"
        >
          {PAGES.map((s) => (
            <button
              key={s.id}
              onClick={() => onNavigate(s.id)}
              className={`whitespace-nowrap px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                route === s.id
                  ? 'text-cloud bg-white/[0.08]'
                  : 'text-cloud-muted hover:text-cloud'
              }`}
            >
              {s.label}
            </button>
          ))}
        </nav>
        <div className={`pointer-events-none absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-surface to-transparent transition-opacity duration-200 ${navScroll.canLeft ? 'opacity-100' : 'opacity-0'}`} />
        <div className={`pointer-events-none absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-surface to-transparent transition-opacity duration-200 ${navScroll.canRight ? 'opacity-100' : 'opacity-0'}`} />
      </div>
    </header>
  );
}
