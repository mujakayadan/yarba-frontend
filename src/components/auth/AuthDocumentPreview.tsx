import { keyframes } from '@emotion/react';
import { Box, Chip, Paper, Stack, Typography } from '@mui/material';
import CharliePortrait from './CharliePortrait';

type AuthDocumentPreviewProps = {
  mode: 'login' | 'register';
};

const enter = keyframes`
  from {
    opacity: 0;
    transform: translateY(24px) rotate(-2deg) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translateY(0) rotate(-1deg) scale(1);
  }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0) rotate(-1deg); }
  50% { transform: translateY(-8px) rotate(0deg); }
`;

const typeLine = keyframes`
  from { clip-path: inset(0 100% 0 0); }
  to { clip-path: inset(0 0 0 0); }
`;

const documentSx = {
  position: 'relative',
  zIndex: 1,
  width: '100%',
  maxWidth: 372,
  color: '#24344D',
  bgcolor: '#FFFFFF',
  borderRadius: 1.5,
  boxShadow: '0 24px 60px rgba(24, 39, 75, 0.24)',
  animation: `${enter} 650ms cubic-bezier(0.22, 1, 0.36, 1) both, ${float} 6s ease-in-out 700ms infinite`,
  transition: 'box-shadow 250ms ease, transform 250ms ease',
  '&:hover': {
    boxShadow: '0 30px 70px rgba(24, 39, 75, 0.3)',
  },
} as const;

const sectionLabelSx = {
  color: '#3F72AF',
  fontSize: '0.63rem',
  fontWeight: 800,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
} as const;

const bodyCopySx = {
  color: '#526176',
  fontFamily: 'Georgia, serif',
  fontSize: { xs: '0.65rem', sm: '0.69rem' },
  lineHeight: 1.58,
} as const;

type TypedLinesProps = {
  lines: readonly string[];
  startDelay: number;
  fontSize?: string;
};

const TypedLines = ({ lines, startDelay, fontSize }: TypedLinesProps) => (
  <Stack spacing={0.08}>
    {lines.map((line, index) => (
      <Typography
        key={line}
        sx={{
          ...bodyCopySx,
          width: 'fit-content',
          maxWidth: '100%',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          fontSize: fontSize ?? bodyCopySx.fontSize,
          clipPath: 'inset(0 100% 0 0)',
          animation: `${typeLine} ${Math.max(420, line.length * 22)}ms steps(${Math.max(
            12,
            line.length
          )}, end) ${startDelay + index * 230}ms both`,
        }}
      >
        {line}
      </Typography>
    ))}
  </Stack>
);

const ResumePreview = () => (
  <Paper sx={{ ...documentSx, p: { xs: 2.25, sm: 2.75 } }}>
    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
      <Box
        sx={{
          width: 48,
          height: 48,
          flexShrink: 0,
          borderRadius: '50%',
          display: 'grid',
          placeItems: 'center',
          color: '#FFFFFF',
          bgcolor: '#E05B49',
          fontSize: '0.85rem',
          fontWeight: 800,
          boxShadow: '0 6px 16px rgba(224, 91, 73, 0.28)',
        }}
      >
        CB
      </Box>
      <Box>
        <Typography
          sx={{
            color: '#1F2E45',
            fontFamily: 'Georgia, serif',
            fontSize: { xs: '1.15rem', sm: '1.3rem' },
            fontWeight: 700,
            lineHeight: 1.1,
          }}
        >
          Charlie Bucket
        </Typography>
        <Typography sx={{ color: '#E05B49', fontSize: '0.61rem', fontWeight: 800, mt: 0.4 }}>
          FUTURE CHOCOLATE FACTORY OWNER
        </Typography>
        <Typography sx={{ color: '#718096', fontSize: '0.56rem', mt: 0.25 }}>
          Bucket Family Home · Near Wonka&apos;s Factory
        </Typography>
      </Box>
    </Stack>

    <Box sx={{ height: 3, borderRadius: 2, bgcolor: '#3F72AF', my: 1.8 }} />

    <Typography sx={sectionLabelSx}>Profile</Typography>
    <Box sx={{ mt: 0.6 }}>
      <TypedLines
        startDelay={650}
        lines={[
          'Imaginative, kind, and resilient problem-solver',
          'with a golden record of integrity. Ready to bring',
          "curiosity and heart to the world's most magical factory.",
        ]}
      />
    </Box>

    <Stack direction="row" spacing={2} sx={{ mt: 1.5 }}>
      <Box sx={{ flex: 1.15 }}>
        <Typography sx={sectionLabelSx}>Experience</Typography>
        <Typography sx={{ color: '#24344D', fontSize: '0.67rem', fontWeight: 800, mt: 0.65 }}>
          Factory Tour Finalist
        </Typography>
        <Typography sx={{ color: '#8993A4', fontSize: '0.56rem' }}>Wonka Industries</Typography>
        <Box sx={{ mt: 0.35 }}>
          <TypedLines
            startDelay={1420}
            fontSize="0.59rem"
            lines={[
              'Demonstrated sound',
              'judgment, teamwork, and',
              'grace under whimsical',
              'pressure.',
            ]}
          />
        </Box>
      </Box>
      <CharliePortrait />
      <Box sx={{ flex: 0.85 }}>
        <Typography sx={sectionLabelSx}>Strengths</Typography>
        <Stack spacing={0.55} sx={{ mt: 0.7 }}>
          {['Integrity', 'Quick learner', 'Leadership'].map((skill) => (
            <Chip
              key={skill}
              label={skill}
              size="small"
              sx={{
                height: 20,
                justifyContent: 'flex-start',
                bgcolor: '#EDF4FC',
                color: '#3F72AF',
                fontSize: '0.56rem',
                fontWeight: 700,
              }}
            />
          ))}
        </Stack>
      </Box>
    </Stack>
  </Paper>
);

const CoverLetterPreview = () => (
  <Paper sx={{ ...documentSx, p: { xs: 2.25, sm: 2.8 } }}>
    <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <Box>
        <Typography
          sx={{
            color: '#1F2E45',
            fontFamily: 'Georgia, serif',
            fontSize: { xs: '1.15rem', sm: '1.3rem' },
            fontWeight: 700,
          }}
        >
          Charlie Bucket
        </Typography>
        <Typography sx={{ color: '#718096', fontSize: '0.57rem' }}>
          Bucket Family Home · Wonka District
        </Typography>
      </Box>
      <Box
        sx={{
          width: 30,
          height: 30,
          borderRadius: 1,
          display: 'grid',
          placeItems: 'center',
          color: '#FFFFFF',
          bgcolor: '#E05B49',
          fontSize: '0.65rem',
          fontWeight: 800,
        }}
      >
        CB
      </Box>
    </Stack>

    <Box sx={{ height: 3, borderRadius: 2, bgcolor: '#3F72AF', my: 1.7 }} />

    <Box sx={{ mt: 0.1 }}>
      <TypedLines startDelay={600} fontSize="0.59rem" lines={['September 15, 2026']} />
    </Box>
    <Box sx={{ mt: 1.25 }}>
      <TypedLines startDelay={900} lines={['Mr. Willy Wonka', 'Wonka Chocolate Factory']} />
    </Box>
    <Typography sx={{ ...bodyCopySx, mt: 1.25, color: '#24344D', fontWeight: 700 }}>
      Dear Mr. Wonka,
    </Typography>
    <Box sx={{ mt: 0.8 }}>
      <TypedLines
        startDelay={1500}
        lines={[
          'I am delighted to apply for the opportunity to help',
          "shape the factory's next chapter. My curiosity, honesty,",
          'and respect for every Oompa Loompa would guide each',
          'decision I make.',
        ]}
      />
    </Box>
    <Box sx={{ mt: 0.8 }}>
      <TypedLines
        startDelay={2550}
        lines={[
          'During your factory tour, I stayed calm through every',
          'surprise and chose people over prizes. I would bring',
          'that same care, imagination, and responsibility to',
          'Wonka Industries.',
        ]}
      />
    </Box>
    <Typography sx={{ ...bodyCopySx, mt: 1.15 }}>
      With gratitude,
      <Box
        component="span"
        sx={{
          display: 'block',
          mt: 0.35,
          color: '#3F72AF',
          fontFamily: '"Dreaming Outloud", cursive',
          fontSize: '1rem',
          fontWeight: 700,
        }}
      >
        Charlie Bucket
      </Box>
    </Typography>
  </Paper>
);

const AuthDocumentPreview = ({ mode }: AuthDocumentPreviewProps) => {
  const isLogin = mode === 'login';

  return (
    <Box
      data-testid="auth-document-preview"
      aria-hidden="true"
      sx={{
        position: 'relative',
        isolation: 'isolate',
        width: '100%',
        height: '100%',
        minHeight: { xs: 340, md: 560 },
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        overflow: 'hidden',
        px: { xs: 1.5, sm: 2, md: 2.5 },
        py: { xs: 2, md: 2.5 },
        color: '#FFFFFF',
        background: isLogin
          ? 'linear-gradient(145deg, #315D94 0%, #5E60CE 100%)'
          : 'linear-gradient(145deg, #764C82 0%, #3F72AF 100%)',
        '&::before': {
          content: '""',
          position: 'absolute',
          width: 250,
          height: 250,
          borderRadius: '50%',
          top: -100,
          right: -80,
          bgcolor: 'rgba(255, 255, 255, 0.1)',
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          width: 180,
          height: 180,
          borderRadius: '50%',
          bottom: -90,
          left: -70,
          bgcolor: 'rgba(255, 255, 255, 0.08)',
        },
        '@media (prefers-reduced-motion: reduce)': {
          '&, & *': {
            animation: 'none !important',
            transition: 'none !important',
            clipPath: 'none !important',
          },
        },
      }}
    >
      <Box sx={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
        {isLogin ? <ResumePreview /> : <CoverLetterPreview />}
      </Box>
    </Box>
  );
};

export default AuthDocumentPreview;
