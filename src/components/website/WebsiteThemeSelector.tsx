import React from 'react';
import { Box, Card, CardActionArea, CardContent, CardMedia, Chip, Typography } from '@mui/material';
import { CheckCircle } from '@mui/icons-material';
import Grid from '../../mui/Grid';

export interface WebsiteThemeOption {
  name: string;
  value: string;
  previewImage: string;
  description: string;
}

export const WEBSITE_THEMES: WebsiteThemeOption[] = [
  {
    name: 'Modern',
    value: 'modern',
    previewImage: '/assets/modern_preview.svg',
    description: 'Clean, professional layout with timelines and project cards.',
  },
  {
    name: 'Developer',
    value: 'threejs',
    previewImage: '/assets/threejs_preview.svg',
    description: 'Dark developer aesthetic with animated accents and code-inspired styling.',
  },
  {
    name: 'Bento',
    value: 'bento',
    previewImage: '/assets/bento_preview.svg',
    description: 'Playful bento-grid layout with bold cards and soft gradients.',
  },
  {
    name: 'Neon',
    value: 'neon',
    previewImage: '/assets/neon_preview.svg',
    description: 'Cyberpunk-inspired theme with glowing panels and grid backgrounds.',
  },
];

interface WebsiteThemeSelectorProps {
  selectedTheme: string;
  onChange: (theme: string) => void;
}

export const WebsiteThemeSelector: React.FC<WebsiteThemeSelectorProps> = ({
  selectedTheme,
  onChange,
}) => (
  <Grid container spacing={2}>
    {WEBSITE_THEMES.map((theme) => {
      const selected = selectedTheme === theme.value;

      return (
        <Grid item xs={12} sm={6} key={theme.value}>
          <Card
            variant="outlined"
            sx={{
              height: '100%',
              borderColor: selected ? 'primary.main' : 'divider',
              borderWidth: selected ? 2 : 1,
              boxShadow: selected ? 2 : 0,
            }}
          >
            <CardActionArea
              onClick={() => onChange(theme.value)}
              aria-pressed={selected}
              sx={{ height: '100%', alignItems: 'stretch' }}
            >
              <Box sx={{ position: 'relative' }}>
                <CardMedia
                  component="img"
                  height="180"
                  image={theme.previewImage}
                  alt={`${theme.name} portfolio theme preview`}
                  sx={{ objectFit: 'cover' }}
                />
                {selected && (
                  <Chip
                    icon={<CheckCircle />}
                    label="Selected"
                    color="primary"
                    size="small"
                    sx={{ position: 'absolute', top: 12, right: 12 }}
                  />
                )}
              </Box>
              <CardContent>
                <Typography variant="h6" component="h3" gutterBottom>
                  {theme.name}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: 'text.secondary',
                  }}
                >
                  {theme.description}
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
      );
    })}
  </Grid>
);

export default WebsiteThemeSelector;
