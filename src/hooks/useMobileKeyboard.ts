import { useEffect } from 'react';

// Safari's visual viewport shrinks around the keyboard while the layout viewport
// can retain its original height. Hide secondary navigation while writing.
export function useMobileKeyboard() {
  useEffect(() => {
    const viewport = window.visualViewport;
    let frame = 0;
    const update = () => {
      const active = document.activeElement;
      const editing = active instanceof HTMLTextAreaElement || active instanceof HTMLInputElement;
      const covered = viewport ? window.innerHeight - viewport.height : 0;
      document.documentElement.dataset.keyboard = editing && covered > 150 ? 'open' : 'closed';
    };
    const afterFocus = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(update); };
    viewport?.addEventListener('resize', update);
    document.addEventListener('focusin', afterFocus);
    document.addEventListener('focusout', afterFocus);
    return () => {
      cancelAnimationFrame(frame);
      viewport?.removeEventListener('resize', update);
      document.removeEventListener('focusin', afterFocus);
      document.removeEventListener('focusout', afterFocus);
      delete document.documentElement.dataset.keyboard;
    };
  }, []);
}
