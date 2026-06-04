export function parsePortfolioTabIndex(value: string | null, maxIndex: number): number {
  const parsed = Number.parseInt(value ?? '', 10);
  if (Number.isNaN(parsed) || parsed < 0) {
    return 0;
  }
  return Math.min(parsed, maxIndex);
}

export function portfolioTabSearchParam(tabIndex: number): string {
  return `?tab=${tabIndex}`;
}
