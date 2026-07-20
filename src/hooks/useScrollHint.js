import { useEffect, useRef, useState } from 'react';

/**
 * Detecta se um container rolável horizontalmente tem conteúdo além das bordas,
 * para exibir um marcador de "tem mais" (fade) nas laterais — padrão Apple.
 * Retorna: ref, canLeft (rolável p/ esq.), canRight (rolável p/ dir.).
 */
export function useScrollHint() {
  const ref = useRef(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const update = () => {
    const el = ref.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft < max - 4);
  };

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    update();
    el.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      el.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { ref, canLeft, canRight, update };
}
