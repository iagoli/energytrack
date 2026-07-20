// Aviso padrão exibido dentro das páginas (Painel, Solar, Relatório) quando
// ainda não há aparelhos cadastrados. Fica logo abaixo da hero/arte da página,
// então NÃO precisa de espaçamento para a navbar. Opcionalmente mostra um botão
// que leva o usuário direto para a aba de cadastro.
export default function EmptyState({ icon = '📭', title, description, onNavigate }) {
  return (
    <div className="surface p-10 sm:p-12 text-center">
      <span className="text-5xl block mb-4">{icon}</span>
      <h2 className="text-xl font-bold text-cloud mb-2">{title}</h2>
      {description && <p className="text-cloud-muted text-sm max-w-md mx-auto">{description}</p>}
      {onNavigate && (
        <button
          onClick={() => onNavigate('aparelhos')}
          className="mt-6 inline-flex items-center gap-2 bg-apple hover:brightness-110 text-white font-semibold px-5 py-2.5 rounded-full transition-all shadow-card"
        >
          ➕ Cadastrar aparelhos
        </button>
      )}
    </div>
  );
}
