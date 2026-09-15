import { createElement } from 'react';
import { act, fireEvent, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { KEYBOARD_INSET_VAR, useKeyboardInset } from './useKeyboardInset';

function Probe() {
  useKeyboardInset();
  return null;
}

describe('useKeyboardInset', () => {
  afterEach(() => {
    vi.useRealTimers();
    document.documentElement.style.removeProperty(KEYBOARD_INSET_VAR);
    Reflect.deleteProperty(window, 'visualViewport');
  });

  it('no-ops when visualViewport is missing', () => {
    render(createElement(Probe));
    expect(document.documentElement.style.getPropertyValue(KEYBOARD_INSET_VAR)).toBe('');
  });

  it('sets a CSS variable from the obscured viewport height', () => {
    const viewport = {
      height: 500,
      offsetTop: 0,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };
    Object.defineProperty(window, 'visualViewport', { configurable: true, value: viewport });
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 844 });

    render(createElement(Probe));

    expect(document.documentElement.style.getPropertyValue(KEYBOARD_INSET_VAR)).toBe('344px');
  });

  it('scrolls a focused field toward the center after the keyboard opens', () => {
    vi.useFakeTimers();
    const viewport = {
      height: 500,
      offsetTop: 0,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };
    Object.defineProperty(window, 'visualViewport', { configurable: true, value: viewport });
    const scrollIntoView = vi.fn();
    HTMLElement.prototype.scrollIntoView = scrollIntoView;

    render(createElement(Probe));
    const field = document.createElement('textarea');
    document.body.appendChild(field);
    fireEvent.focusIn(field);
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(scrollIntoView).toHaveBeenCalled();
    field.remove();
  });
});
