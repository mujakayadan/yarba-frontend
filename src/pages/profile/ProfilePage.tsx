import React, { Suspense } from 'react';
import { Box, Typography, Button, Paper, CircularProgress, Alert } from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDeferredTabs } from '../../hooks/useDeferredTabs';
import { useUserProfile } from '../../hooks/useUserProfile';
import { TabPanelFallback } from '../../components/common/DeferredTabPanel';
import { IconTabBar } from '../../components/common/IconTabBar';
import { PROFILE_VIEW_TABS } from '../../components/profile/view/profileViewTabs';
import { parseTabIndex, tabSearchParam } from '../../utils/tabUrl';

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const initialTab = parseTabIndex(searchParams.get('tab'), PROFILE_VIEW_TABS.length - 1);
  const { tabValue, renderedTab, isTabPending, handleTabChange } = useDeferredTabs(initialTab);
  const { data: profile, isLoading, isError, error: queryError } = useUserProfile();

  const handleEditClick = () => {
    navigate(`/profile/edit${tabSearchParam(tabValue)}`);
  };

  const ActiveTab = PROFILE_VIEW_TABS[renderedTab]?.Tab;

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError || !profile) {
    return (
      <Box sx={{ p: 3 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom>
            Profile Information
          </Typography>
          <Alert severity="error" sx={{ mb: 3 }}>
            {queryError instanceof Error
              ? queryError.message
              : 'Unable to load your profile information. Please try refreshing the page.'}
          </Alert>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', p: 3, pl: 2, pt: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'right', alignItems: 'center', mb: 3 }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<EditIcon />}
          onClick={handleEditClick}
        >
          Edit Profile
        </Button>
      </Box>

      <Paper elevation={1} sx={{ mb: 4 }}>
        <IconTabBar
          tabValue={tabValue}
          onChange={handleTabChange}
          tabs={PROFILE_VIEW_TABS}
          idPrefix="profile"
          ariaLabel="profile tabs"
        />

        <div
          role="tabpanel"
          id={`profile-tabpanel-${renderedTab}`}
          aria-labelledby={`profile-tab-${renderedTab}`}
          aria-busy={isTabPending}
        >
          <Box
            sx={{
              p: 3,
              minHeight: 80,
              opacity: isTabPending ? 0.6 : 1,
              transition: 'opacity 150ms',
            }}
          >
            {ActiveTab && (
              <Suspense fallback={<TabPanelFallback />}>
                <ActiveTab
                  profile={profile}
                  userEmail={user?.email}
                  imageVersion={profile.updated_at}
                />
              </Suspense>
            )}
          </Box>
        </div>
      </Paper>
    </Box>
  );
};

export default ProfilePage;
