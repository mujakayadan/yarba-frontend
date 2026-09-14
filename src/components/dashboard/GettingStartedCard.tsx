import React, { useState } from 'react';
import {
  Box,
  Button,
  Collapse,
  IconButton,
  LinearProgress,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import {
  CheckCircle as CompleteIcon,
  ExpandMore as ExpandMoreIcon,
  RadioButtonUnchecked as IncompleteIcon,
} from '@mui/icons-material';

export interface GettingStartedItem {
  label: string;
  description: string;
  complete: boolean;
  action: string;
  path: string;
}

interface GettingStartedCardProps {
  items: GettingStartedItem[];
  onNavigate: (path: string) => void;
}

const REVIEW_ACTION = 'Review';

export const GettingStartedCard: React.FC<GettingStartedCardProps> = ({ items, onNavigate }) => {
  const [expanded, setExpanded] = useState(false);
  const completedCount = items.filter((item) => item.complete).length;
  const nextItem = items.find((item) => !item.complete);

  if (!nextItem) {
    return null;
  }

  const progress = (completedCount / items.length) * 100;
  const progressLabel = `${completedCount} of ${items.length} complete`;

  return (
    <Paper variant="outlined" sx={{ p: { xs: 1.5, sm: 2 }, mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography component="h2" variant="subtitle1" sx={{ fontWeight: 600 }}>
            Get started
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {progressLabel}
          </Typography>
        </Box>
        <IconButton
          aria-expanded={expanded}
          aria-label={expanded ? 'Collapse setup steps' : 'Expand setup steps'}
          onClick={() => setExpanded((open) => !open)}
          size="small"
          sx={{
            mt: -0.5,
            '& .MuiSvgIcon-root': {
              transform: expanded ? 'rotate(180deg)' : 'none',
              transition: (theme) =>
                theme.transitions.create('transform', {
                  duration: theme.transitions.duration.shorter,
                }),
            },
          }}
        >
          <ExpandMoreIcon />
        </IconButton>
      </Box>

      <LinearProgress
        aria-label="Setup progress"
        variant="determinate"
        value={progress}
        sx={{ mt: 1.5, height: 6, borderRadius: 1 }}
      />

      <Collapse in={!expanded} unmountOnExit>
        <Box sx={{ mt: 2 }}>
          <Typography sx={{ fontWeight: 600 }}>{nextItem.label}</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1.5 }}>
            {nextItem.description}
          </Typography>
          <Button
            variant="contained"
            onClick={() => onNavigate(nextItem.path)}
            sx={{ width: { xs: '100%', sm: 'auto' } }}
          >
            {nextItem.action}
          </Button>
        </Box>
      </Collapse>

      <Collapse in={expanded} unmountOnExit>
        <Stack sx={{ mt: 1.5 }} spacing={0.5}>
          {items.map((item) => (
            <Box
              key={item.label}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                minHeight: 44,
              }}
            >
              {item.complete ? (
                <CompleteIcon color="success" fontSize="small" aria-label="Complete" />
              ) : (
                <IncompleteIcon color="disabled" fontSize="small" aria-label="Not complete" />
              )}
              <Typography sx={{ flex: 1, minWidth: 0 }} noWrap title={item.label}>
                {item.label}
              </Typography>
              <Button
                size="small"
                variant={item.complete ? 'text' : 'outlined'}
                aria-label={item.complete ? `${REVIEW_ACTION} ${item.label}` : item.action}
                onClick={() => onNavigate(item.path)}
              >
                {item.complete ? REVIEW_ACTION : item.action}
              </Button>
            </Box>
          ))}
        </Stack>
      </Collapse>
    </Paper>
  );
};
