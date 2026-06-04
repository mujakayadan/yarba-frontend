import React, { Suspense, lazy } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { ProtectedRoute } from '../components/common/ProtectedRoute';
import MainLayout from '../components/layout/MainLayout';
import { useAuth } from '../contexts/AuthContext';
import { isDev } from '../config/env';

const PortfolioEditLegacyRedirect = () => {
  const { search } = useLocation();
  return <Navigate to={`/portfolio/edit${search}`} replace />;
};

const LoginPage = lazy(() => import('../pages/LoginPage'));
const MainPage = lazy(() => import('../pages/MainPage'));
const DashboardPage = lazy(() => import('../pages/DashboardPage'));
const ResumesPage = lazy(() => import('../pages/resume/ResumesPage'));
const TemplatesPage = lazy(() => import('../pages/TemplatesPage'));
const ProfilePage = lazy(() => import('../pages/profile/ProfilePage'));
const ViewResumePage = lazy(() => import('../pages/resume/ViewResumePage'));
const EditResumePage = lazy(() => import('../pages/resume/EditResumePage'));
const FirebaseTestPage = lazy(() => import('../pages/FirebaseTestPage'));
const CreateResumePage = lazy(() => import('../pages/resume/CreateResumePage'));
const ProfileEditPage = lazy(() => import('../pages/profile/ProfileEditPage'));
const PortfolioCreatePage = lazy(() => import('../pages/portfolio/PortfolioCreatePage'));
const PortfolioEditPage = lazy(() => import('../pages/portfolio/PortfolioEditPage'));
const PortfolioViewPage = lazy(() => import('../pages/portfolio/PortfolioViewPage'));
const UserPage = lazy(() => import('../pages/user/UserPage'));
const CoverLettersPage = lazy(() => import('../pages/cover-letter/CoverLettersPage'));
const CoverLetterNewPage = lazy(() => import('../pages/cover-letter/CoverLetterNewPage'));
const CoverLetterViewPage = lazy(() => import('../pages/cover-letter/CoverLetterViewPage'));
const CoverLetterEditPage = lazy(() => import('../pages/cover-letter/CoverLetterEditPage'));
const AboutPage = lazy(() => import('../pages/footer/AboutPage'));
const SupportPage = lazy(() => import('../pages/footer/SupportPage'));
const FAQPage = lazy(() => import('../pages/footer/FAQPage'));
const BlogPage = lazy(() => import('../pages/footer/BlogPage'));
const PrivacyPage = lazy(() => import('../pages/footer/PrivacyPage'));
const TermsPage = lazy(() => import('../pages/footer/TermsPage'));
const ContactPage = lazy(() => import('../pages/footer/ContactPage'));
const UploadPortfolioPage = lazy(() => import('../pages/portfolio/UploadPortfolioPage'));
const WebsitePage = lazy(() => import('../pages/WebsitePage'));
const PersonalInfoSetupPage = lazy(() => import('../pages/user/setup/PersonalInfoSetupPage'));
const PromptPreferencesSetupPage = lazy(
  () => import('../pages/user/setup/PromptPreferencesSetupPage')
);
const SystemPreferencesSetupPage = lazy(
  () => import('../pages/user/setup/SystemPreferencesSetupPage')
);
const LifeStorySetupPage = lazy(() => import('../pages/user/setup/LifeStorySetupPage'));
const PortfolioUploadPage = lazy(() => import('../pages/user/setup/PortfolioUploadPage'));
const PortfolioReviewPage = lazy(() => import('../pages/user/setup/PortfolioReviewPage'));

const PageLoader = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
    <CircularProgress />
  </Box>
);

const RootRoute: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <MainLayout hideDrawer>
        <PageLoader />
      </MainLayout>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <MainLayout hideDrawer>
      <MainPage />
    </MainLayout>
  );
};

const AppRoutes: React.FC = () => (
  <Suspense fallback={<PageLoader />}>
    <Routes>
      <Route path="/" element={<RootRoute />} />
      <Route path="/login" element={<LoginPage authMode="login" />} />
      <Route path="/register" element={<LoginPage authMode="register" />} />

      <Route
        element={
          <ProtectedRoute>
            <MainLayout hideDrawer />
          </ProtectedRoute>
        }
      >
        <Route path="/user/setup/personal-info" element={<PersonalInfoSetupPage />} />
        <Route path="/user/setup/prompt-preferences" element={<PromptPreferencesSetupPage />} />
        <Route path="/user/setup/system-preferences" element={<SystemPreferencesSetupPage />} />
        <Route path="/user/setup/life-story" element={<LifeStorySetupPage />} />
        <Route path="/user/setup/portfolio-upload" element={<PortfolioUploadPage />} />
        <Route path="/user/setup/portfolio-review" element={<PortfolioReviewPage />} />
      </Route>

      <Route element={<MainLayout />}>
        <Route path="/about" element={<AboutPage />} />
        <Route path="/support" element={<SupportPage />} />
        <Route path="/faq" element={<FAQPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/contact" element={<ContactPage />} />
      </Route>

      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        {isDev && <Route path="/firebase-test" element={<FirebaseTestPage />} />}
        <Route path="/resumes" element={<ResumesPage />} />
        <Route path="/resumes/new" element={<CreateResumePage />} />
        <Route path="/resumes/:id" element={<ViewResumePage />} />
        <Route path="/resumes/:id/edit" element={<EditResumePage />} />
        <Route path="/cover-letters" element={<CoverLettersPage />} />
        <Route path="/cover-letters/new" element={<CoverLetterNewPage />} />
        <Route path="/cover-letters/:id" element={<CoverLetterViewPage />} />
        <Route path="/cover-letters/:id/edit" element={<CoverLetterEditPage />} />
        <Route path="/portfolio" element={<PortfolioViewPage />} />
        <Route path="/portfolio/upload" element={<UploadPortfolioPage />} />
        <Route path="/portfolio/create" element={<PortfolioCreatePage />} />
        <Route path="/portfolio/edit" element={<PortfolioEditPage />} />
        <Route path="/portfolio/:id/edit" element={<PortfolioEditLegacyRedirect />} />
        <Route path="/portfolio/:id" element={<PortfolioViewPage />} />
        <Route path="/templates" element={<TemplatesPage />} />
        <Route path="/user" element={<UserPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/profile/edit" element={<ProfileEditPage />} />
        <Route path="/website" element={<WebsitePage />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  </Suspense>
);

export default AppRoutes;
