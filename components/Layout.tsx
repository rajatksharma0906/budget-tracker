'use client';

import { ReactNode, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
  BottomNavigation,
  BottomNavigationAction,
} from '@mui/material';
import {
  Home as HomeIcon,
  Add as AddIcon,
  Assessment as ReportsIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  AdminPanelSettings as AdminIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import {
  clearStoredUsername,
  getStoredRole,
  getStoredUserId,
  getStoredUsername,
  setStoredUserId,
  setStoredUsername,
  setStoredRole,
  setStoredFullName,
} from '@/lib/auth';
import { apiGetProfile } from '@/lib/api';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [role, setRole] = useState<'user' | 'admin' | null>(() => getStoredRole());
  const [username, setUsername] = useState<string | null>(() => getStoredUsername());
  const [authReady, setAuthReady] = useState(false);

  // On load/refresh: verify session and sync role (and username) from server
  useEffect(() => {
    const userId = getStoredUserId();
    if (!userId) {
      setAuthReady(true);
      return;
    }
    apiGetProfile()
      .then((profile) => {
        setStoredUserId(profile.id);
        setStoredUsername(profile.username);
        setStoredRole(profile.role);
        setStoredFullName(profile.full_name ?? null);
        setRole(profile.role);
        setUsername(profile.username);
      })
      .catch(() => {
        clearStoredUsername();
        setRole(null);
        setUsername(null);
        router.push('/');
      })
      .finally(() => setAuthReady(true));
  }, [router]);

  const handleLogout = () => {
    clearStoredUsername();
    setRole(null);
    setUsername(null);
    router.push('/');
  };

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  const isAdmin = role === 'admin';
  const isDashboard = pathname === '/dashboard';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: { xs: '100dvh', sm: '100vh' } }}>
      <AppBar
        position="static"
        sx={{ position: { xs: 'fixed', sm: 'fixed', md: 'static' }, zIndex: (theme) => theme.zIndex.drawer + 1 }}
      >
        <Toolbar sx={{ minHeight: { xs: 48, sm: 64 }, px: { xs: 1, sm: 2 }, gap: 0.5 }}>
          <Typography
            variant="h6"
            component={Link}
            href="/dashboard"
            sx={{
              flexGrow: 1,
              fontSize: { xs: '1.25rem', sm: '1.35rem', md: '1.25rem' },
              textDecoration: 'none',
              color: 'inherit',
            }}
          >
            Budget Tracker
          </Typography>
          {authReady && username && (
            <Button
              color="inherit"
              component={Link}
              href="/profile"
              startIcon={<PersonIcon />}
              sx={{ minHeight: 48, mr: 0.5, display: { xs: 'none', sm: 'flex' } }}
            >
              {username}
            </Button>
          )}
          {authReady && isAdmin && (
            <Button color="inherit" onClick={() => router.push('/admin')} startIcon={<AdminIcon />} sx={{ minHeight: 48, mr: 1 }}>
              Admin
            </Button>
          )}
          <Button
            color="inherit"
            onClick={handleLogout}
            startIcon={<LogoutIcon />}
            sx={{ minHeight: 48, touchAction: 'manipulation' }}
          >
            Logout
          </Button>
        </Toolbar>
      </AppBar>
      {/* Spacer so content is not hidden under fixed header on mobile/tablet */}
      <Box sx={{ minHeight: { xs: 48, sm: 64 }, display: { xs: 'block', sm: 'block', md: 'none' } }} />

      {!isDashboard && authReady && (
        <Box
          sx={{
            px: { xs: 1.5, sm: 2 },
            py: 1,
            borderBottom: 1,
            borderColor: 'divider',
            backgroundColor: 'action.hover',
          }}
        >
          <Container maxWidth="lg" sx={{ px: { xs: 1.5, sm: 2 } }}>
            <Button
              component={Link}
              href="/dashboard"
              startIcon={<ArrowBackIcon />}
              sx={{ flexDirection: 'row', alignItems: 'center', gap: 0.25, minHeight: 'auto', py: 0.5, textTransform: 'none' }}
            >
              <Typography component="span" variant="body1" sx={{ lineHeight: 1.2, display: 'block' }}>
                Dashboard
              </Typography>
            </Button>
          </Container>
        </Box>
      )}

      <Container maxWidth="lg" sx={{ flexGrow: 1, py: { xs: 2, sm: 3 }, pb: { xs: 10, sm: 10 }, px: { xs: 1.5, sm: 2 } }}>
        {children}
      </Container>

      <BottomNavigation
        value={pathname}
        onChange={(_, newValue) => handleNavigation(newValue)}
        showLabels
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          borderTop: 1,
          borderColor: 'divider',
          paddingBottom: 'env(safe-area-inset-bottom, 0)',
        }}
      >
        <BottomNavigationAction
          label="Dashboard"
          value="/dashboard"
          icon={<HomeIcon />}
          sx={{ minWidth: { xs: 56, sm: 64 } }}
        />
        <BottomNavigationAction
          label="Expense"
          value="/add-expense"
          icon={<AddIcon />}
          sx={{ minWidth: { xs: 56, sm: 64 } }}
        />
        <BottomNavigationAction
          label="Reports"
          value="/reports"
          icon={<ReportsIcon />}
          sx={{ minWidth: { xs: 56, sm: 64 } }}
        />
        <BottomNavigationAction
          label="Profile"
          value="/profile"
          icon={<PersonIcon />}
          sx={{ minWidth: { xs: 56, sm: 64 } }}
        />
        <BottomNavigationAction
          label="Settings"
          value="/settings"
          icon={<SettingsIcon />}
          sx={{ minWidth: { xs: 56, sm: 64 } }}
        />
      </BottomNavigation>
    </Box>
  );
}
