import React from 'react';
import { Box, Typography, Link } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { LEGAL_NAV_ITEMS } from '../../content/legalDocuments';

const Footer: React.FC = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 2,
        px: 3,
        mt: 'auto',
        backgroundColor: 'background.default',
        borderTop: 1,
        borderColor: 'divider',
        width: '100%',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 2,
          justifyContent: 'center',
          maxWidth: '100%',
        }}
      >
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            textAlign: 'center',
          }}
        >
          © {new Date().getFullYear()} YARBA
        </Typography>

        <Box
          component="ul"
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            p: 0,
            m: 0,
            gap: 2,
            listStyle: 'none',
          }}
        >
          <Box component="li" sx={{ display: 'inline' }}>
            <Link
              component={RouterLink}
              to="/about"
              color="text.secondary"
              underline="hover"
              fontSize="0.875rem"
            >
              About
            </Link>
          </Box>
          <Box component="li" sx={{ display: 'inline' }}>
            <Link
              component={RouterLink}
              to="/support"
              color="text.secondary"
              underline="hover"
              fontSize="0.875rem"
            >
              Support
            </Link>
          </Box>
          <Box component="li" sx={{ display: 'inline' }}>
            <Link
              component={RouterLink}
              to="/faq"
              color="text.secondary"
              underline="hover"
              fontSize="0.875rem"
            >
              FAQ
            </Link>
          </Box>
          {LEGAL_NAV_ITEMS.map((item) => (
            <Box component="li" key={item.key} sx={{ display: 'inline' }}>
              <Link
                component={RouterLink}
                to={item.path}
                color="text.secondary"
                underline="hover"
                fontSize="0.875rem"
              >
                {item.label}
              </Link>
            </Box>
          ))}
          <Box component="li" sx={{ display: 'inline' }}>
            <Link
              component={RouterLink}
              to="/report"
              color="text.secondary"
              underline="hover"
              fontSize="0.875rem"
            >
              Report Abuse
            </Link>
          </Box>
          <Box component="li" sx={{ display: 'inline' }}>
            <Link
              component={RouterLink}
              to="/contact"
              color="text.secondary"
              underline="hover"
              fontSize="0.875rem"
            >
              Contact
            </Link>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Footer;
