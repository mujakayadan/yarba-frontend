/** Capacitor SystemBars injects `--safe-area-inset-*`; `env()` remains the web fallback. */
export const SAFE_AREA = {
  top: 'var(--safe-area-inset-top, env(safe-area-inset-top, 0px))',
  right: 'var(--safe-area-inset-right, env(safe-area-inset-right, 0px))',
  bottom: 'var(--safe-area-inset-bottom, env(safe-area-inset-bottom, 0px))',
  left: 'var(--safe-area-inset-left, env(safe-area-inset-left, 0px))',
} as const;

export const brandedAppBarHeight = {
  xs: `calc(56px + ${SAFE_AREA.top})`,
  sm: `calc(56px + ${SAFE_AREA.top})`,
  md: `calc(64px + ${SAFE_AREA.top})`,
} as const;
