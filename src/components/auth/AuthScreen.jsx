import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../hooks/useTheme';
import { importLegacyData } from '../../services/settings';
import GoogleSignInButton from './GoogleSignInButton';
import LoadingSpinner from '../ui/LoadingSpinner';
import ErrorBanner from '../ui/ErrorBanner';
import energytrackLogo from '../../assets/energytrack_logo.png';

// Coleta o que estava no localStorage do navegador (versão guest), no formato
// aceito por POST /api/import. Retorna null se não houver nada relevante.
function gatherLegacyData() {
  try {
    const appliances = JSON.parse(localStorage.getItem('et_appliances') || '[]');
    const tariff       = parseFloat(localStorage.getItem('et_tariff') || 'NaN');
    const uf           = JSON.parse(localStorage.getItem('et_uf') || 'null');
    const distribuidora = JSON.parse(localStorage.getItem('et_distribuidora') || 'null');
    const cep          = JSON.parse(localStorage.getItem('et_cep') || '" "');
    const location     = JSON.parse(localStorage.getItem('et_location') || 'null');
    const solarRegion  = JSON.parse(localStorage.getItem('et_region') || '"sudeste"');

    const normalizedAppliances = (Array.isArray(appliances) ? appliances : [])
      .filter((a) => a?.applianceId && a?.nome && a?.potencia_w > 0)
      .map((a) => ({
        applianceId: a.applianceId,
        nome:        a.nome,
        icone:       a.icone || null,
        potencia_w:  Number(a.potencia_w),
        horas_dia:   Number(a.horas_dia),
        dias_mes:    Number(a.dias_mes),
      }));

    if (!normalizedAppliances.length && !uf && !cep) return null;

    return {
      appliances: normalizedAppliances,
      settings: {
        tariff: Number.isFinite(tariff) ? tariff : undefined,
        tariffSource: 'manual',
        uf:            uf || undefined,
        distribuidora: distribuidora || undefined,
        cep:           cep || undefined,
        solarRegion:   solarRegion || undefined,
        location:      location || undefined,
      },
    };
  } catch {
    return null;
  }
}

function clearLegacyLocalStorage() {
  ['et_appliances','et_tariff','et_uf','et_distribuidora','et_cep','et_location','et_region']
    .forEach((k) => { try { localStorage.removeItem(k); } catch {} });
}

function ThemeToggle({ theme, onToggle }) {
  const isLight = theme === 'light';
  return (
    <button
      onClick={onToggle}
      aria-label={isLight ? 'Mudar para tema escuro' : 'Mudar para tema claro'}
      title={isLight ? 'Tema escuro' : 'Tema claro'}
      className="grid place-items-center w-9 h-9 rounded-full border border-surface-line bg-white/[0.03] text-cloud-soft hover:text-cloud hover:bg-white/[0.08] transition-colors"
    >
      {isLight ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </svg>
      )}
    </button>
  );
}

export default function AuthScreen() {
  const { login, register, loginWithGoogle } = useAuth();
  const { theme, toggle: toggleTheme } = useTheme();
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [name, setName]         = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);

  async function maybeImportLegacy() {
    const legacy = gatherLegacyData();
    if (!legacy) return;
    try {
      await importLegacyData(legacy);
      clearLegacyLocalStorage();
    } catch (e) {
      console.warn('[auth] falha ao importar dados antigos:', e.message);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === 'register') {
        await register({ email, password, name: name || undefined });
      } else {
        await login({ email, password });
      }
      await maybeImportLegacy();
    } catch (err) {
      setError(err.body?.issues
        ? err.body.issues.map((i) => i.message).join(' · ')
        : err.message || 'Falha ao autenticar.');
      setLoading(false);
    }
  }

  async function handleGoogleCredential(credential) {
    setError(null);
    setLoading(true);
    try {
      await loginWithGoogle(credential);
      await maybeImportLegacy();
    } catch (err) {
      setError(err.message || 'Falha no login com Google.');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-space-deep text-cloud p-4 relative overflow-hidden">
      {/* brilho ambiente */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(60% 50% at 50% 0%, rgba(0,113,227,0.12), transparent 60%), radial-gradient(40% 40% at 90% 10%, rgba(175,82,222,0.08), transparent 60%)',
        }}
      />
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle theme={theme} onToggle={toggleTheme} />
      </div>

      <div className="w-full max-w-sm surface p-7 space-y-5 relative">
        <div className="text-center">
          <img src={energytrackLogo} alt="EnergyTrack" className="h-16 w-auto mx-auto object-contain" />
          <p className="text-sm text-cloud-muted mt-2">Monitoramento de Energia Residencial</p>
        </div>

        <div className="flex gap-1 p-1 rounded-xl bg-white/[0.04] border border-surface-line">
          {['login','register'].map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(null); }}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
                mode === m
                  ? 'bg-apple text-white shadow-glow'
                  : 'text-cloud-soft hover:text-cloud'
              }`}
            >
              {m === 'login' ? 'Entrar' : 'Criar conta'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === 'register' && (
            <label className="block">
              <span className="text-xs text-cloud-muted">Nome</span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full border border-surface-line bg-white/[0.03] rounded-xl px-3 py-2 text-sm text-cloud focus:outline-none focus:ring-2 focus:ring-apple/40 focus:border-apple/50"
                autoComplete="name"
                placeholder="Seu nome"
              />
            </label>
          )}
          <label className="block">
            <span className="text-xs text-cloud-muted">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full border border-surface-line bg-white/[0.03] rounded-xl px-3 py-2 text-sm text-cloud focus:outline-none focus:ring-2 focus:ring-apple/40 focus:border-apple/50"
              autoComplete="email"
              placeholder="voce@exemplo.com"
            />
          </label>
          <label className="block">
            <span className="text-xs text-cloud-muted">Senha {mode === 'register' && '(mín. 8 caracteres)'}</span>
            <input
              type="password"
              required
              minLength={mode === 'register' ? 8 : undefined}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full border border-surface-line bg-white/[0.03] rounded-xl px-3 py-2 text-sm text-cloud focus:outline-none focus:ring-2 focus:ring-apple/40 focus:border-apple/50"
              autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
              placeholder="••••••••"
            />
          </label>

          {error && <ErrorBanner message={error} severity="error" />}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-apple hover:brightness-110 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl transition-all flex items-center justify-center gap-2"
          >
            {loading && <LoadingSpinner />}
            {mode === 'register' ? 'Criar conta' : 'Entrar'}
          </button>
        </form>

        <div className="flex items-center gap-3 text-xs text-cloud-muted">
          <div className="flex-1 h-px bg-surface-line" />
          ou
          <div className="flex-1 h-px bg-surface-line" />
        </div>

        <GoogleSignInButton
          onCredential={handleGoogleCredential}
          onError={(msg) => setError(msg)}
        />

        <p className="text-[11px] text-cloud-muted text-center leading-relaxed">
          Ao criar uma conta, seus aparelhos e preferências são salvos no servidor e ficam disponíveis em qualquer dispositivo.
        </p>
      </div>

      <p className="text-xs text-cloud-muted mt-4">
        EnergyTrack · Projeto acadêmico
      </p>
    </div>
  );
}
