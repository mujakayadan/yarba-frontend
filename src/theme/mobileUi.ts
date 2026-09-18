import { SAFE_AREA } from './safeArea';

/** Minimum Apple HIG / Material touch target on interactive controls. */
export const TOUCH_TARGET_MIN_PX = 44;

export const touchTargetSx = {
  minHeight: TOUCH_TARGET_MIN_PX,
  minWidth: TOUCH_TARGET_MIN_PX,
} as const;

export const compactDialogPaperSx = {
  pt: SAFE_AREA.top,
  pl: SAFE_AREA.left,
  pr: SAFE_AREA.right,
  pb: `calc(${SAFE_AREA.bottom} + var(--keyboard-inset, 0px))`,
} as const;
