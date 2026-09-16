import { Box } from '@mui/material';

const CharliePortrait = () => (
  <Box
    data-testid="charlie-portrait"
    sx={{
      width: { xs: 76, sm: 84 },
      minHeight: 112,
      flexShrink: 0,
      alignSelf: 'stretch',
      display: 'flex',
      alignItems: 'flex-end',
      overflow: 'hidden',
      borderRadius: 1.25,
      bgcolor: '#EDF4FC',
      border: '1px solid rgba(63, 114, 175, 0.12)',
    }}
  >
    <svg
      viewBox="0 0 96 116"
      width="100%"
      height="100%"
      aria-hidden="true"
      focusable="false"
      preserveAspectRatio="xMidYMax meet"
    >
      <circle cx="78" cy="20" r="25" fill="#D9E9FA" />
      <circle cx="17" cy="92" r="31" fill="#E2EEFB" />

      <path d="M20 116c2-24 14-35 28-35s26 11 28 35H20Z" fill="#E05B49" />
      <path d="M36 85c3 6 8 9 12 9s9-3 12-9l-4-9H40l-4 9Z" fill="#F0B37E" />

      <circle cx="29" cy="51" r="9" fill="#F4C08D" />
      <circle cx="67" cy="51" r="9" fill="#F4C08D" />
      <ellipse cx="48" cy="50" rx="24" ry="30" fill="#F7C995" />

      <path
        d="M25 46c0-24 13-35 28-33 13 2 21 12 20 31-8-3-14-10-17-18-7 9-18 15-31 16v4Z"
        fill="#7A4828"
      />
      <path
        d="M27 36c2-14 12-24 25-24 8 0 15 4 19 10-11-4-19-2-25 2-6 4-12 9-19 12Z"
        fill="#96572C"
      />

      <circle cx="39" cy="50" r="2.1" fill="#29364A" />
      <circle cx="57" cy="50" r="2.1" fill="#29364A" />
      <path d="M47 54c-1 3-1 5 2 5" fill="none" stroke="#B86F51" strokeWidth="1.6" />
      <path
        d="M39 64c5 5 13 5 18 0"
        fill="none"
        stroke="#7C3F35"
        strokeWidth="2"
        strokeLinecap="round"
      />

      <path d="M34 93c8 6 20 6 28 0" fill="none" stroke="#C94A3A" strokeWidth="2" />
    </svg>
  </Box>
);

export default CharliePortrait;
