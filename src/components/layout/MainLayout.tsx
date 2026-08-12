import React, { ReactNode, useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Drawer,
  List,
  ListItemIcon,
  ListItemText,
  Divider,
  useMediaQuery,
  useTheme,
  ListItemButton,
  Tooltip,
  Avatar,
  Fab,
  Menu,
  MenuItem,
  Button,
} from '@mui/material';
import {
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Dashboard as DashboardIcon,
  Description as ResumeIcon,
  Mail as CoverLetterIcon,
  Work as PortfolioIcon,
  Assignment as ApplicationsIcon,
  Settings as SettingsIcon,
  ExitToApp as LogoutIcon,
  Login as LoginIcon,
  Language as LanguageIcon,
} from '@mui/icons-material';
import { alpha } from '@mui/material/styles';
import { useAuth } from '../../contexts/AuthContext';
import { useAppearance } from '../../contexts/AppearanceContext';
import { Link as RouterLink, Outlet, useLocation } from 'react-router-dom';
import { env } from '../../config/env';
import { useUserProfile } from '../../hooks/useUserProfile';
import { headerGradient } from '../../theme/tokens';
import Footer from './Footer';
import { ProfileMenuAppearance } from './ProfileMenuAppearance';
import {
  getDrawerDividerSx,
  getDrawerNavIconSx,
  getDrawerNavItemSx,
  getDrawerNavLabelSx,
  getDrawerPaperSx,
} from './drawerNavStyles';

// Define navigation items
const navItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { text: 'Resumes', icon: <ResumeIcon />, path: '/resumes' },
  { text: 'Cover Letters', icon: <CoverLetterIcon />, path: '/cover-letters' },
  { text: 'Applications', icon: <ApplicationsIcon />, path: '/applications' },
  { text: 'Portfolio', icon: <PortfolioIcon />, path: '/portfolio' },
  { text: 'Website', icon: <LanguageIcon />, path: '/website' },
  { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
];

interface MainLayoutProps {
  children?: ReactNode;
  hideDrawer?: boolean;
}

const drawerWidth = 210;
const miniDrawerWidth = 65;

const MainLayout: React.FC<MainLayoutProps> = ({ children, hideDrawer = false }) => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const theme = useTheme();
  const { navVariant } = useAppearance();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const drawerNavItemSx = getDrawerNavItemSx(navVariant);
  const drawerNavLabelSx = getDrawerNavLabelSx(navVariant);
  const [drawerOpen, setDrawerOpen] = useState(!isMobile && !hideDrawer);
  const { data: profile } = useUserProfile();
  const [imageVersion, setImageVersion] = useState<number>(Date.now());
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (hideDrawer) {
      setDrawerOpen(false);
    }
  }, [hideDrawer]);

  useEffect(() => {
    if (profile?.profile_picture_key) {
      setImageError(false);
      setImageVersion(Date.now());
    }
  }, [profile?.profile_picture_key]);

  useEffect(() => {
    const refreshInterval = setInterval(() => {
      setImageVersion(Date.now());
    }, 60000);

    return () => clearInterval(refreshInterval);
  }, []);

  const toggleDrawer = () => {
    if (!hideDrawer) {
      setDrawerOpen(!drawerOpen);
    }
  };

  const handleProfileClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleProfileNavigate = () => {
    handleClose();
  };

  const isNavItemSelected = (path: string) =>
    location.pathname === path || location.pathname.startsWith(`${path}/`);

  const drawer = (
    <>
      <List sx={{ mt: 1 }}>
        {navItems.map((item, index) => (
          <Tooltip
            title={!drawerOpen ? item.text : ''}
            placement="right"
            key={item.text}
            TransitionProps={{ timeout: 0 }}
          >
            <ListItemButton
              component={RouterLink}
              to={item.path}
              onClick={() => {
                if (isMobile) {
                  setDrawerOpen(false);
                }
              }}
              selected={isNavItemSelected(item.path)}
              className="slide-up nav-item"
              sx={{
                ...drawerNavItemSx,
                justifyContent: drawerOpen ? 'initial' : 'center',
                animation: `slideUp 0.3s ease-out forwards ${index * 0.05 + 0.2}s`,
                opacity: 0,
              }}
            >
              <ListItemIcon
                sx={{
                  ...getDrawerNavIconSx(navVariant, isNavItemSelected(item.path)),
                  mr: drawerOpen ? 2 : 'auto',
                  ml: drawerOpen ? 0 : 0,
                }}
              >
                {item.icon}
              </ListItemIcon>
              {drawerOpen && (
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontWeight: 600,
                    fontSize: item.text.length > 10 ? '0.85rem' : '1rem',
                    letterSpacing: item.text.length > 10 ? '0' : '0.02em',
                    fontFamily: "'Dreaming Outloud Pro', cursive",
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                  sx={drawerNavLabelSx}
                />
              )}
            </ListItemButton>
          </Tooltip>
        ))}
      </List>
      <Divider sx={getDrawerDividerSx(navVariant)} />
      <List>
        <Tooltip
          title={!drawerOpen ? 'Logout' : ''}
          placement="right"
          TransitionProps={{ timeout: 0 }}
        >
          <ListItemButton
            onClick={() => {
              if (isMobile) {
                setDrawerOpen(false);
              }
              signOut();
            }}
            className="nav-item"
            sx={{
              ...drawerNavItemSx,
              justifyContent: drawerOpen ? 'initial' : 'center',
              ...(navVariant === 'gradient'
                ? {}
                : {
                    '&:hover': {
                      backgroundColor: (t) => alpha(t.palette.error.main, 0.08),
                    },
                  }),
            }}
          >
            <ListItemIcon
              sx={{
                ...getDrawerNavIconSx(navVariant, false),
                mr: drawerOpen ? 2 : 'auto',
                ml: drawerOpen ? 0 : 0,
                ...(navVariant === 'gradient' ? { color: '#E05B49' } : { color: 'accent.main' }),
              }}
            >
              <LogoutIcon />
            </ListItemIcon>
            {drawerOpen && (
              <ListItemText
                primary="Logout"
                primaryTypographyProps={{
                  fontWeight: 600,
                  fontSize: '1rem',
                  letterSpacing: '0.02em',
                  fontFamily: "'Dreaming Outloud Pro', cursive",
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
                sx={drawerNavLabelSx}
              />
            )}
          </ListItemButton>
        </Tooltip>
      </List>
    </>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        sx={{
          width: '100%',
          ml: 0,
          backgroundColor: 'transparent',
          backgroundImage: headerGradient(),
          zIndex: (t) => t.zIndex.drawer + 1,
          boxShadow: 3,
          height: {
            xs: '56px',
            sm: '56px',
            md: '64px',
          },
        }}
      >
        <Toolbar
          sx={{
            minHeight: { xs: 56, sm: 56, md: 64 },
            py: { xs: 0, md: 0.5 },
            px: { xs: 1, sm: 2 }, // Reduce horizontal padding on mobile for more space
          }}
        >
          {!hideDrawer && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={toggleDrawer}
              sx={{ mr: 2, display: !user ? 'none' : { sm: 'block', md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            <RouterLink
              to={user ? '/dashboard' : '/'}
              style={{
                textDecoration: 'none',
                color: 'inherit',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <img
                src="/logo.svg"
                alt="YARBA Icon"
                style={{ height: '40px', width: 'auto', marginRight: '10px' }}
              />
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Typography
                  variant="h5"
                  component="span"
                  sx={{
                    fontFamily: "'Dreaming Outloud Pro', cursive",
                    fontWeight: 'bold',
                    color: 'white',
                    lineHeight: 1,
                  }}
                >
                  YARBA
                </Typography>
                <Typography
                  variant="caption"
                  component="span"
                  sx={{
                    fontFamily: "'Dreaming Outloud Pro', cursive",
                    color: 'white',
                    fontSize: '0.85rem',
                    opacity: 0.9,
                    lineHeight: 1,
                  }}
                >
                  Yet Another Resume Builder App
                </Typography>
              </Box>
            </RouterLink>
          </Typography>
          {user ? (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography
                sx={{
                  mr: 2,
                  opacity: 0.9,
                  display: { xs: 'none', sm: 'none', md: 'block' },
                  fontFamily: "'Dreaming Outloud Pro', cursive",
                  fontSize: '1.1rem',
                }}
              >
                {profile?.personal_information?.full_name ||
                  user.username?.replace(/_[0-9]+$/, '').replace(/_/g, ' ') ||
                  'User'}
              </Typography>
              <IconButton
                id="profile-button"
                aria-label="Open account menu"
                aria-controls={open ? 'profile-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
                onClick={handleProfileClick}
                sx={{
                  width: 40,
                  height: 40,
                  p: 0,
                  borderRadius: '50%',
                  overflow: 'hidden',
                  boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)',
                  border: '2px solid rgba(255, 255, 255, 0.85)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  '&:hover': {
                    transform: 'scale(1.05)',
                  },
                  transition: 'transform 0.2s ease-in-out',
                }}
              >
                {profile?.profile_picture_key && !imageError ? (
                  <img
                    src={`${env.cloudfrontUrl}${profile.profile_picture_key}?v=${imageVersion}`}
                    alt={profile?.personal_information?.full_name || 'User profile'}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      objectPosition: 'center',
                    }}
                    loading="eager"
                    referrerPolicy="no-referrer"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <Avatar
                    sx={{
                      bgcolor: 'secondary.main',
                      width: '100%',
                      height: '100%',
                      fontSize: 18,
                    }}
                  >
                    {profile?.personal_information?.full_name?.charAt(0).toUpperCase() ||
                      user?.username?.charAt(0).toUpperCase() ||
                      'U'}
                  </Avatar>
                )}
              </IconButton>

              {/* Profile dropdown menu */}
              <Menu
                id="profile-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                MenuListProps={{
                  'aria-labelledby': 'profile-button',
                }}
                PaperProps={{
                  elevation: 3,
                  sx: {
                    mt: 1.5,
                    minWidth: 220,
                    borderRadius: 2,
                    overflow: 'visible',
                    filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.2))',
                    '&:before': {
                      content: '""',
                      display: 'block',
                      position: 'absolute',
                      top: 0,
                      right: 14,
                      width: 10,
                      height: 10,
                      bgcolor: 'background.paper',
                      transform: 'translateY(-50%) rotate(45deg)',
                      zIndex: 0,
                    },
                  },
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                <Box sx={{ px: 2, pt: 2, pb: 1.5 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {profile?.personal_information?.full_name || user.username}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: 'text.secondary', wordBreak: 'break-all' }}
                  >
                    {user.email || profile?.personal_information?.email || ''}
                  </Typography>
                </Box>
                <ProfileMenuAppearance onClose={handleClose} />
                <MenuItem
                  onClick={handleProfileNavigate}
                  component={RouterLink}
                  to="/settings/account-security"
                >
                  <ListItemIcon sx={{ minWidth: '25px' }}>
                    <SettingsIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Settings</ListItemText>
                </MenuItem>
                <Divider />
                <MenuItem onClick={signOut}>
                  <ListItemIcon sx={{ minWidth: '25px' }}>
                    <LogoutIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Logout</ListItemText>
                </MenuItem>
              </Menu>
            </Box>
          ) : (
            <Button
              component={RouterLink}
              to="/login"
              variant="contained"
              color="secondary"
              startIcon={<LoginIcon />}
              sx={{
                fontWeight: 600,
                borderRadius: 2,
                px: 2,
                py: 0.5,
                boxShadow: 2,
                '&:hover': {
                  boxShadow: 4,
                  backgroundColor: 'secondary.dark',
                },
                textTransform: 'none',
              }}
            >
              Sign In
            </Button>
          )}
        </Toolbar>
      </AppBar>

      {/* Responsive drawer */}
      {!hideDrawer && user && (
        <Drawer
          variant={isMobile ? 'temporary' : 'permanent'}
          open={isMobile ? drawerOpen : true}
          onClose={isMobile ? toggleDrawer : undefined}
          ModalProps={{
            keepMounted: false,
            disableAutoFocus: true,
            disableEnforceFocus: true,
            disableRestoreFocus: true,
            disablePortal: true,
            hideBackdrop: !isMobile,
            BackdropProps: {
              sx: {
                backgroundColor: 'rgba(0, 0, 0, 0.5)', // Proper scrim opacity
              },
            },
          }}
          sx={{
            display: 'block',
            '& .MuiDrawer-paper': {
              position: 'fixed',
              width: isMobile ? 240 : drawerOpen ? drawerWidth : miniDrawerWidth,
              overflowX: 'hidden',
              transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
              boxSizing: 'border-box',
              paddingTop: isMobile ? '56px' : '64px', // Proper padding for header height
              marginTop: 0, // Ensure no additional margin
              height: '100%',
              ...getDrawerPaperSx(navVariant),
              zIndex: theme.zIndex.drawer,
            },
          }}
        >
          {drawer}
        </Drawer>
      )}

      {/* Main content */}
      <Box
        component="main"
        className="fade-in"
        sx={{
          flexGrow: 1,
          p: 0,
          width: {
            xs: '100%',
            md:
              hideDrawer || !user
                ? '100%'
                : drawerOpen
                  ? `calc(100% - ${drawerWidth}px)`
                  : `calc(100% - ${miniDrawerWidth}px)`,
          },
          marginTop: {
            xs: '56px', // Mobile header height
            sm: '56px', // Small tablets
            md: '64px', // Desktop header height
          },
          marginLeft: {
            xs: 0, // Mobile: no margin
            md: hideDrawer || !user ? 0 : drawerOpen ? `${drawerWidth}px` : `${miniDrawerWidth}px`,
          },
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
          }),
          opacity: 0,
          animation: 'fadeIn 0.5s ease-out forwards 0.2s',
          display: 'flex',
          flexDirection: 'column',
          minHeight: 'calc(100vh - 64px)', // Subtract the header height
        }}
      >
        <Box sx={{ flexGrow: 1 }}>{children ?? <Outlet />}</Box>
        <Footer />
      </Box>

      {/* Floating toggle button - only visible on non-mobile and if drawer is not hidden and user is logged in */}
      {!isMobile && !hideDrawer && user && (
        <Fab
          size="small"
          onClick={toggleDrawer}
          sx={{
            position: 'fixed',
            left: drawerOpen ? drawerWidth - 20 : miniDrawerWidth - 20,
            bottom: 20,
            zIndex: 1300,
            backgroundColor: 'primary.main',
            color: 'primary.contrastText',
            transition: 'left 0.2s ease',
            '&:hover': {
              backgroundColor: 'primary.dark',
            },
          }}
        >
          {drawerOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />}
        </Fab>
      )}
    </Box>
  );
};

export default MainLayout;
