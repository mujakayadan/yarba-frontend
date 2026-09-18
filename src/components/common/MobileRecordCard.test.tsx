import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MobileRecordCard, MoreOptionsButton } from './MobileRecordCard';
import { ResponsiveRecordList } from './ResponsiveRecordList';

describe('MobileRecordCard', () => {
  it('opens from the title and keeps actions separate', () => {
    const onOpen = vi.fn();
    const onView = vi.fn();

    render(
      <MobileRecordCard
        title="Founding Engineer"
        subtitle="Unknown Company"
        meta="Updated Sep 13, 2026"
        onOpen={onOpen}
        actions={
          <button type="button" onClick={onView}>
            View
          </button>
        }
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /Founding Engineer/ }));
    expect(onOpen).toHaveBeenCalledOnce();

    fireEvent.click(screen.getByRole('button', { name: 'View' }));
    expect(onView).toHaveBeenCalledOnce();
    expect(onOpen).toHaveBeenCalledOnce();
  });

  it('gives overflow menus a 44px minimum hit area', () => {
    render(
      <MoreOptionsButton label="More resume options" onClick={() => undefined}>
        ···
      </MoreOptionsButton>
    );

    expect(screen.getByRole('button', { name: 'More resume options' })).toHaveStyle({
      minHeight: '44px',
      minWidth: '44px',
    });
  });
});

describe('ResponsiveRecordList', () => {
  it('renders both the table and the card list', () => {
    render(
      <ResponsiveRecordList
        table={<table aria-label="resumes table" />}
        cards={<div>Founding Engineer card</div>}
      />
    );

    expect(screen.getByRole('table', { name: 'resumes table' })).toBeInTheDocument();
    expect(screen.getByText('Founding Engineer card')).toBeInTheDocument();
  });
});
