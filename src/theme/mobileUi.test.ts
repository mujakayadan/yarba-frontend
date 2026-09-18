import { describe, expect, it } from 'vitest';
import { compactDialogPaperSx, TOUCH_TARGET_MIN_PX, touchTargetSx } from './mobileUi';

describe('mobileUi', () => {
  it('uses a 44px minimum touch target', () => {
    expect(TOUCH_TARGET_MIN_PX).toBe(44);
    expect(touchTargetSx.minHeight).toBe(44);
    expect(touchTargetSx.minWidth).toBe(44);
  });

  it('pads compact dialogs with safe-area and keyboard insets', () => {
    expect(compactDialogPaperSx.pt).toContain('--safe-area-inset-top');
    expect(compactDialogPaperSx.pb).toContain('--keyboard-inset');
  });
});
