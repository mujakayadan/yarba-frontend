import { describe, expect, it } from 'vitest';
import {
  formatLegalDocumentContent,
  LEGAL_DOCUMENT_BACKEND_TYPES,
  LEGAL_DOCUMENTS,
  LEGAL_VERSION,
} from './legalDocuments';

describe('legalDocuments', () => {
  it('formats the displayed Terms into the backend seed text', () => {
    const content = formatLegalDocumentContent(LEGAL_DOCUMENTS.terms);

    expect(LEGAL_DOCUMENTS.terms.version).toBe(LEGAL_VERSION);
    expect(content).toContain('Terms of Service');
    expect(content).toContain('6. Public portfolio websites');
    expect(content).toContain('yarba.app subdomain');
    expect(content.length).toBeGreaterThan(2000);
    expect(LEGAL_DOCUMENT_BACKEND_TYPES.terms).toBe('terms');
  });
});
