export default function ErrorBanner({ message, severity = 'warning', onRetry }) {
  const palette =
    severity === 'error'
      ? 'bg-red-50 border-red-200 text-red-700'
      : 'bg-amber-50 border-amber-200 text-amber-800';

  const icon = severity === 'error' ? '⛔' : '⚠️';

  return (
    <div className={`rounded-xl border ${palette} px-3 py-2 text-sm flex items-start gap-2`}>
      <span aria-hidden="true">{icon}</span>
      <span className="flex-1">{message}</span>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-xs font-semibold underline hover:no-underline shrink-0"
        >
          Tentar novamente
        </button>
      )}
    </div>
  );
}
