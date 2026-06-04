import React, { Suspense } from 'react';
import { Box, Paper } from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDeferredTabs } from '../../hooks/useDeferredTabs';
import { useUserProfile } from '../../hooks/useUserProfile';
import { TabPanelFallback, TAB_PANEL_MIN_HEIGHT } from '../../components/common/DeferredTabPanel';
import { IconTabBar } from '../../components/common/IconTabBar';
import { PagePrimaryButton } from '../../components/common/PagePrimaryButton';
import { ViewPageHeader } from '../../components/common/ViewPageHeader';
import { PageLoadingState, PageErrorState } from '../../components/common/PageState';
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
    return <PageLoadingState />;
  }

  if (isError || !profile) {
    return (
      <PageErrorState
        title="Profile"
        message={
          queryError instanceof Error
            ? queryError.message
            : 'Unable to load your profile information. Please try refreshing the page.'
        }
      />
    );
  }

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <ViewPageHeader
        title="Profile"
        action={
          <PagePrimaryButton startIcon={<EditIcon />} onClick={handleEditClick}>
            Edit Profile
          </PagePrimaryButton>
        }
      />

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
              minHeight: TAB_PANEL_MIN_HEIGHT,
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
