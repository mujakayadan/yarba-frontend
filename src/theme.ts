import { createAppTheme } from './theme/createAppTheme';

/** Default light theme; prefer AppThemeProvider for runtime dark mode. */
const theme = createAppTheme('light');

export { createAppTheme } from './theme/createAppTheme';
export { brandColors, defaultWebsiteColors } from './theme/tokens';
export default theme;
