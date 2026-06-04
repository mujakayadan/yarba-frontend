/** Single source of truth for brand hex values used in theme and website defaults. */
export const brandColors = {
  primaryMain: '#3F72AF',
  primaryLight: '#4C84CF',
  primaryDark: '#2C5282',
  secondaryMain: '#5E60CE',
  secondaryLight: '#7B78E5',
  secondaryDark: '#4C4BB0',
  accentMain: '#E05B49',
  accentLight: '#E87A6B',
  accentDark: '#C94A3A',
  backgroundDefault: '#F7FAFC',
  backgroundPaper: '#FFFFFF',
  textPrimary: '#2D3748',
  textSecondary: '#5A6578',
  errorMain: '#E56565',
  warningMain: '#ED8936',
  infoMain: '#0E9AA7',
  successMain: '#3D9A6E',
  star: '#F6AD55',
} as const;

export const defaultWebsiteColors = {
  primary_color: brandColors.primaryMain,
  secondary_color: brandColors.textPrimary,
} as const;

/**
 * Original MainLayout gradients (git HEAD) — mauve → soft sky blue, not theme primary/secondary.
 * @see rgb(142, 92, 150) → rgb(122, 172, 216)
 */
export const legacyNavGradient = {
  start: 'rgb(142, 92, 150)',
  end: 'rgb(122, 172, 216)',
} as const;

/** Top app bar — horizontal */
export const headerGradient = () =>
  `linear-gradient(to right, ${legacyNavGradient.start}, ${legacyNavGradient.end})`;

/** Side drawer (default appearance) — diagonal */
export const drawerGradient = () =>
  `linear-gradient(to bottom right, ${legacyNavGradient.start}, ${legacyNavGradient.end})`;
