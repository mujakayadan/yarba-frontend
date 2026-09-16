import React from 'react';
import { AppBar, Toolbar } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { headerGradient } from '../../theme/tokens';
import { brandedAppBarHeight, SAFE_AREA } from '../../theme/safeArea';

const BrandedAuthAppBar: React.FC = () => (
  <AppBar
    position="sticky"
    sx={{
      backgroundColor: 'transparent',
      backgroundImage: headerGradient(),
      boxShadow: 3,
      pt: SAFE_AREA.top,
      height: brandedAppBarHeight,
    }}
  >
    <Toolbar
      sx={{
        minHeight: { xs: 56, sm: 56, md: 64 },
        width: '100%',
        maxWidth: 1200,
        mx: 'auto',
        pl: { xs: `max(8px, ${SAFE_AREA.left})`, sm: 2 },
        pr: { xs: `max(8px, ${SAFE_AREA.right})`, sm: 2 },
      }}
    >
      <RouterLink to="/" aria-label="YARBA home" style={{ display: 'flex', alignItems: 'center' }}>
        <img src="/logo.svg" alt="YARBA" style={{ height: 44, width: 'auto' }} />
      </RouterLink>
    </Toolbar>
  </AppBar>
);

export default BrandedAuthAppBar;
