import React from 'react';
import { Box, ButtonBase, IconButton, Paper, Typography } from '@mui/material';
import { touchTargetSx } from '../../theme/mobileUi';

const CardCopy: React.FC<{
  title: string;
  subtitle?: string;
  meta?: string;
  children?: React.ReactNode;
}> = ({ title, subtitle, meta, children }) => (
  <>
    <Typography
      component="h3"
      variant="subtitle1"
      sx={{ fontWeight: 600, overflowWrap: 'anywhere' }}
    >
      {title}
    </Typography>
    {subtitle ? (
      <Typography variant="body2" sx={{ color: 'text.secondary', overflowWrap: 'anywhere' }}>
        {subtitle}
      </Typography>
    ) : null}
    {meta ? (
      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
        {meta}
      </Typography>
    ) : null}
    {children}
  </>
);

interface MobileRecordCardProps {
  title: string;
  subtitle?: string;
  meta?: string;
  onOpen?: () => void;
  menuButton?: React.ReactNode;
  actions?: React.ReactNode;
  children?: React.ReactNode;
}

export const MobileRecordCard: React.FC<MobileRecordCardProps> = ({
  title,
  subtitle,
  meta,
  onOpen,
  menuButton,
  actions,
  children,
}) => (
  <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
    <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
      {onOpen ? (
        <ButtonBase
          onClick={onOpen}
          sx={{
            flex: 1,
            minWidth: 0,
            display: 'block',
            textAlign: 'left',
            px: 2,
            py: 1.5,
            minHeight: 44,
          }}
        >
          <CardCopy title={title} subtitle={subtitle} meta={meta}>
            {children}
          </CardCopy>
        </ButtonBase>
      ) : (
        <Box sx={{ flex: 1, minWidth: 0, px: 2, py: 1.5 }}>
          <CardCopy title={title} subtitle={subtitle} meta={meta}>
            {children}
          </CardCopy>
        </Box>
      )}
      {menuButton ? (
        <Box sx={{ pr: 0.5, pt: 0.5 }} onClick={(event) => event.stopPropagation()}>
          {menuButton}
        </Box>
      ) : null}
    </Box>
    {actions ? (
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 1,
          px: 2,
          pb: 1.5,
        }}
        onClick={(event) => event.stopPropagation()}
      >
        {actions}
      </Box>
    ) : null}
  </Paper>
);

interface MoreOptionsButtonProps {
  label: string;
  onClick: (event: React.MouseEvent<HTMLElement>) => void;
  children: React.ReactNode;
}

export const MoreOptionsButton: React.FC<MoreOptionsButtonProps> = ({
  label,
  onClick,
  children,
}) => (
  <IconButton aria-label={label} onClick={onClick} sx={touchTargetSx}>
    {children}
  </IconButton>
);
