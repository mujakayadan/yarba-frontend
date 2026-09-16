import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import AuthDocumentPreview from './AuthDocumentPreview';

describe('AuthDocumentPreview', () => {
  it('renders the resume as markup instead of an image', () => {
    const { container } = render(<AuthDocumentPreview mode="login" />);

    expect(screen.getByText('Charlie Bucket')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getByTestId('charlie-portrait').querySelector('svg')).toBeInTheDocument();
    expect(container.querySelector('img')).not.toBeInTheDocument();
  });

  it('renders tailored cover-letter content for registration', () => {
    render(<AuthDocumentPreview mode="register" />);

    expect(screen.getByText('Dear Mr. Wonka,')).toBeInTheDocument();
    expect(screen.queryByText('Tailored in moments')).not.toBeInTheDocument();
    expect(screen.queryByText('Turn experience into opportunity.')).not.toBeInTheDocument();
  });
});
