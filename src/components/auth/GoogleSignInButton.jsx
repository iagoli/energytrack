import { useEffect, useRef, useState } from 'react';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const GSI_SRC = 'https://accounts.google.com/gsi/client';

// Promise compartilhada entre montagens (StrictMode, HMR, múltiplas instâncias).
// Garante que esperamos o evento `load` real do script, não apenas a presença
// da tag no DOM.
let gsiLoadPromise = null;

function ensureGsiLoaded() {
  if (typeof window === 'undefined') return Promise.reject(new Error('SSR'));
  if (window.google?.accounts?.id) return Promise.resolve();
  if (gsiLoadPromise) return gsiLoadPromise;

  gsiLoadPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${GSI_SRC}"]`);
    if (existing) {
      // Tag já no DOM (de um mount anterior). Esperamos o load event ou,
      // se já carregou, conferimos pelo window.google.
      if (window.google?.accounts?.id) return resolve();
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('Falha ao carregar Google Identity Services')));
      return;
    }
    const s = document.createElement('script');
    s.src = GSI_SRC;
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('Falha ao carregar Google Identity Services'));
    document.head.appendChild(s);
  });

  // Se falhar uma vez, resetamos para permitir retry numa próxima montagem.
  gsiLoadPromise.catch(() => { gsiLoadPromise = null; });
  return gsiLoadPromise;
}

export default function GoogleSignInButton({ onCredential, onError }) {
  const containerRef = useRef(null);
  const onCredentialRef = useRef(onCredential);
  const onErrorRef = useRef(onError);
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState(null);

  // Mantém refs sempre apontando para a última versão dos callbacks
  // sem forçar o useEffect principal a re-rodar.
  useEffect(() => { onCredentialRef.current = onCredential; }, [onCredential]);
  useEffect(() => { onErrorRef.current = onError; }, [onError]);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;
    let cancelled = false;

    ensureGsiLoaded()
      .then(() => {
        if (cancelled) return;
        const gid = window.google?.accounts?.id;
        if (!gid) throw new Error('Google Identity Services não disponível.');
        if (!containerRef.current) return;

        // Limpa qualquer renderização prévia para o re-mount do StrictMode
        // ou HMR não acumular botões duplicados.
        containerRef.current.innerHTML = '';

        gid.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: (res) => {
            if (res?.credential) onCredentialRef.current?.(res.credential);
            else onErrorRef.current?.('Resposta do Google sem credential.');
          },
        });
        gid.renderButton(containerRef.current, {
          theme: 'outline',
          size: 'large',
          width: 280,
          text: 'signin_with',
          shape: 'pill',
        });
        setReady(true);
      })
      .catch((e) => {
        if (cancelled) return;
        setLoadError(e.message);
        onErrorRef.current?.(e.message);
      });

    return () => { cancelled = true; };
    // Deps vazias intencionalmente: callbacks via ref. Quase tudo aqui é
    // efeito colateral no DOM e só precisa acontecer uma vez por montagem.
  }, []);

  if (!GOOGLE_CLIENT_ID) {
    return (
      <div className="text-xs text-gray-500 border border-dashed border-gray-300 rounded-xl px-4 py-3 text-left space-y-1.5">
        <div className="font-semibold text-gray-600 text-center">
          🔒 Login com Google ainda não configurado
        </div>
        <p>
          O Client ID do Google precisa ser obtido no Google Cloud Console e adicionado ao{' '}
          <code className="bg-gray-100 px-1 rounded text-[11px]">.env</code> como{' '}
          <code className="bg-gray-100 px-1 rounded text-[11px]">VITE_GOOGLE_CLIENT_ID</code>{' '}
          e <code className="bg-gray-100 px-1 rounded text-[11px]">GOOGLE_CLIENT_ID</code>.
        </p>
        <p>
          Passo a passo no arquivo{' '}
          <code className="bg-gray-100 px-1 rounded text-[11px]">GOOGLE_SETUP.md</code> do projeto.
        </p>
        <p className="text-gray-400">
          Enquanto isso, você pode entrar normalmente com email/senha logo acima.
        </p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="text-xs text-red-600 border border-red-200 bg-red-50 rounded-xl px-4 py-3 text-center">
        Não foi possível carregar o botão do Google: {loadError}
      </div>
    );
  }

  return (
    <div className="flex justify-center min-h-[44px] items-center">
      <div ref={containerRef} />
      {!ready && (
        <span className="text-xs text-gray-400">Carregando botão do Google…</span>
      )}
    </div>
  );
}
