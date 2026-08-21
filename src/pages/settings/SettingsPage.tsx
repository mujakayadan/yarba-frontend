import React, { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  InputLabel,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  Typography,
  type SelectChangeEvent,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  AccountCircle as AccountIcon,
  AutoAwesome as AiIcon,
  Badge as PersonalIcon,
  Description as StoryIcon,
  Image as MediaIcon,
  PrivacyTip as PrivacyIcon,
  Work as ApplicationsIcon,
} from '@mui/icons-material';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { ViewPageHeader } from '../../components/common/ViewPageHeader';
import ProfileEditPage from '../profile/ProfileEditPage';
import UserPage from '../user/UserPage';
import DataPrivacySettings from '../../components/settings/DataPrivacySettings';

type SettingsSection =
  | {
      slug: 'personal' | 'ai-preferences' | 'story' | 'media' | 'applications';
      label: string;
      description: string;
      icon: React.ReactNode;
      kind: 'profile';
      profileIndex: number;
    }
  | {
      slug: 'account-security';
      label: string;
      description: string;
      icon: React.ReactNode;
      kind: 'account';
    }
  | {
      slug: 'data-privacy';
      label: string;
      description: string;
      icon: React.ReactNode;
      kind: 'privacy';
    };

const SETTINGS_SECTIONS: readonly SettingsSection[] = [
  {
    slug: 'personal',
    label: 'Personal information',
    description: 'Contact details and professional links used in your documents.',
    icon: <PersonalIcon />,
    kind: 'profile',
    profileIndex: 0,
  },
  {
    slug: 'ai-preferences',
    label: 'AI & document defaults',
    description: 'Control document length, templates, appearance, and generation defaults.',
    icon: <AiIcon />,
    kind: 'profile',
    profileIndex: 1,
  },
  {
    slug: 'story',
    label: 'Story & voice',
    description: 'Give Yarba personal context for more authentic writing.',
    icon: <StoryIcon />,
    kind: 'profile',
    profileIndex: 2,
  },
  {
    slug: 'media',
    label: 'Picture & signature',
    description: 'Manage images used in your profile and generated documents.',
    icon: <MediaIcon />,
    kind: 'profile',
    profileIndex: 3,
  },
  {
    slug: 'applications',
    label: 'Application automation',
    description: 'Set reusable answers, eligibility, consent, and secure credentials.',
    icon: <ApplicationsIcon />,
    kind: 'profile',
    profileIndex: 4,
  },
  {
    slug: 'data-privacy',
    label: 'Data & privacy',
    description: 'Control optional analytics, exports, and account deletion.',
    icon: <PrivacyIcon />,
    kind: 'privacy',
  },
  {
    slug: 'account-security',
    label: 'Account & security',
    description: 'Manage your password, account details, and agent access.',
    icon: <AccountIcon />,
    kind: 'account',
  },
];

const getSection = (slug: string | undefined) =>
  SETTINGS_SECTIONS.find((section) => section.slug === slug);

const SettingsPage: React.FC = () => {
  const { section: sectionSlug } = useParams<{ section: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const section = getSection(sectionSlug);
  const [settingsDirty, setSettingsDirty] = useState(false);
  const [pendingSection, setPendingSection] = useState<string | null>(null);

  if (!section) {
    return <Navigate to="/settings/personal" replace />;
  }

  const navigateToSection = (slug: string) => {
    if (settingsDirty && slug !== section.slug) {
      setPendingSection(slug);
      return;
    }
    navigate(`/settings/${slug}`);
  };

  const handleMobileSectionChange = (event: SelectChangeEvent) => {
    navigateToSection(event.target.value);
  };

  const renderSection = () => {
    switch (section.kind) {
      case 'profile':
        return (
          <ProfileEditPage
            key={section.slug}
            embedded
            sectionIndex={section.profileIndex}
            onDirtyChange={setSettingsDirty}
          />
        );
      case 'account':
        return <UserPage embedded />;
      case 'privacy':
        return <DataPrivacySettings />;
      default: {
        const exhaustiveCheck: never = section;
        return exhaustiveCheck;
      }
    }
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 1280, mx: 'auto', p: { xs: 2, md: 3 } }}>
      <ViewPageHeader
        title="Settings"
        description="Manage the information Yarba uses, how AI creates your documents, application automation, and account security."
      />

      {isMobile ? (
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel id="settings-section-label">Settings section</InputLabel>
          <Select
            labelId="settings-section-label"
            value={section.slug}
            label="Settings section"
            onChange={handleMobileSectionChange}
          >
            {SETTINGS_SECTIONS.map((item) => (
              <MenuItem key={item.slug} value={item.slug}>
                {item.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      ) : null}

      <Paper
        variant="outlined"
        sx={{
          display: 'flex',
          alignItems: 'stretch',
          overflow: 'hidden',
          borderRadius: 3,
          minHeight: 560,
        }}
      >
        {!isMobile && (
          <Box
            component="nav"
            aria-label="Settings sections"
            sx={{
              width: 248,
              flexShrink: 0,
              bgcolor: 'action.hover',
              borderRight: 1,
              borderColor: 'divider',
              py: 2,
            }}
          >
            <Typography
              variant="overline"
              color="text.secondary"
              sx={{ display: 'block', px: 2.5, pb: 1, fontWeight: 700, letterSpacing: 1 }}
            >
              Categories
            </Typography>
            <List disablePadding sx={{ px: 1.25 }}>
              {SETTINGS_SECTIONS.map((item) => (
                <ListItemButton
                  key={item.slug}
                  selected={item.slug === section.slug}
                  onClick={() => navigateToSection(item.slug)}
                  sx={{
                    minHeight: 48,
                    mb: 0.5,
                    px: 1.5,
                    borderRadius: 2,
                    borderLeft: 3,
                    borderColor: item.slug === section.slug ? 'primary.main' : 'transparent',
                    '&.Mui-selected': {
                      bgcolor: 'background.paper',
                      boxShadow: 1,
                    },
                    '&.Mui-selected:hover': {
                      bgcolor: 'background.paper',
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 38,
                      color: item.slug === section.slug ? 'primary.main' : 'text.secondary',
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontSize: '0.9rem',
                      fontWeight: item.slug === section.slug ? 700 : 500,
                    }}
                  />
                </ListItemButton>
              ))}
            </List>
          </Box>
        )}

        <Box
          component="section"
          aria-labelledby="settings-section-title"
          sx={{ minWidth: 0, flex: 1, p: { xs: 2, sm: 3, lg: 4 }, bgcolor: 'background.paper' }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2.5 }}>
            <Box
              aria-hidden="true"
              sx={{
                width: 44,
                height: 44,
                borderRadius: 2,
                display: 'grid',
                placeItems: 'center',
                color: 'primary.main',
                bgcolor: 'action.selected',
                flexShrink: 0,
              }}
            >
              {section.icon}
            </Box>
            <Box>
              <Typography
                component="h2"
                id="settings-section-title"
                variant="h5"
                sx={{ fontWeight: 700 }}
              >
                {section.label}
              </Typography>
              <Typography color="text.secondary">{section.description}</Typography>
            </Box>
          </Box>
          <Divider sx={{ mb: 3 }} />
          {renderSection()}
        </Box>
      </Paper>

      <Dialog open={pendingSection !== null} onClose={() => setPendingSection(null)}>
        <DialogTitle>Discard unsaved changes?</DialogTitle>
        <DialogContent>
          Changes in this settings section have not been saved. Stay here to save them, or discard
          them and continue.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPendingSection(null)}>Stay here</Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => {
              if (pendingSection) {
                setSettingsDirty(false);
                navigate(`/settings/${pendingSection}`);
              }
              setPendingSection(null);
            }}
          >
            Discard changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SettingsPage;
