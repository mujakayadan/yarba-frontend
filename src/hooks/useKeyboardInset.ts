import { useEffect } from 'react';

export const KEYBOARD_INSET_VAR = '--keyboard-inset';

const FOCUSABLE_SELECTOR = 'input, textarea, select, [contenteditable="true"]';

export function useKeyboardInset(): void {
  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) {
      return;
    }

    const syncInset = () => {
      const inset = Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop);
      document.documentElement.style.setProperty(KEYBOARD_INSET_VAR, `${Math.round(inset)}px`);
    };

    const onFocusIn = (event: FocusEvent) => {
      const target = event.target;
      if (!(target instanceof HTMLElement) || !target.matches(FOCUSABLE_SELECTOR)) {
        return;
      }
      window.setTimeout(() => {
        target.scrollIntoView({ block: 'center', inline: 'nearest' });
      }, 300);
    };

    viewport.addEventListener('resize', syncInset);
    viewport.addEventListener('scroll', syncInset);
    document.addEventListener('focusin', onFocusIn);
    syncInset();

    return () => {
      viewport.removeEventListener('resize', syncInset);
      viewport.removeEventListener('scroll', syncInset);
      document.removeEventListener('focusin', onFocusIn);
      document.documentElement.style.removeProperty(KEYBOARD_INSET_VAR);
    };
  }, []);
}
