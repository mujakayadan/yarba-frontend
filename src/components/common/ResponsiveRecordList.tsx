import React from 'react';
import { Box, Stack } from '@mui/material';

interface ResponsiveRecordListProps {
  table: React.ReactNode;
  cards: React.ReactNode;
}

export const ResponsiveRecordList: React.FC<ResponsiveRecordListProps> = ({ table, cards }) => (
  <>
    <Box sx={{ display: { xs: 'none', md: 'block' } }}>{table}</Box>
    <Stack spacing={1.5} sx={{ display: { xs: 'flex', md: 'none' }, mb: 3 }}>
      {cards}
    </Stack>
  </>
);
