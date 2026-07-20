import { useEffect, useRef, useState } from 'react';

/**
 * Revela o conteúdo com efeito "fade-in + slide-up" suave e física de mola
 * (overshoot) quando entra no viewport — estilo Apple.
 *
 * Mantém a assinatura do Reveal antigo (as/direction/delay/once/className).
 *  - direction: 'up' | 'left' | 'right'
 *  - delay:     1..6 → .spring-delay-N
 *  - once:      se false, a animação RE-TOCA ao reentrar na viewport
 *              (incluindo ao rolar de baixo para cima / do fim ao início).
 */
export default function Reveal({
  as: Tag = 'div',
  direction = 'up',
  delay = 0,
  once = false,
  className = '',
  threshold = 0.15,
  children,
  ...rest
}) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          if (once) observer.unobserve(entry.target);
        } else if (!once) {
          // ao sair da viewport, reseta → a animação toca de novo ao voltar
          setVisible(false);
        }
      },
      { threshold, rootMargin: '0px 0px -8% 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [once, threshold]);

  const base =
    direction === 'left' ? 'spring-left' : direction === 'right' ? 'spring-right' : 'spring-reveal';
  const delayCls = delay ? `spring-delay-${Math.min(delay, 6)}` : '';

  return (
    <Tag
      ref={ref}
      className={`${base} ${visible ? 'is-visible' : ''} ${delayCls} ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  );
}
