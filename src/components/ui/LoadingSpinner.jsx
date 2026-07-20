export default function LoadingSpinner({ size = 'sm', className = '' }) {
  const sizeClass = size === 'lg' ? 'w-6 h-6 border-2' : 'w-4 h-4 border-2';
  return (
    <span
      role="status"
      aria-label="Carregando"
      className={`inline-block ${sizeClass} border-current border-t-transparent rounded-full animate-spin align-[-2px] ${className}`}
    />
  );
}
