'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getStoredUserId } from '@/lib/auth';
import { Box, CircularProgress, Typography } from '@mui/material';

export default function NotFound() {
  const router = useRouter();

  useEffect(() => {
    if (getStoredUserId()) {
      router.replace('/dashboard');
    } else {
      router.replace('/');
    }
  }, [router]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        gap: 2,
      }}
    >
      <CircularProgress size={32} />
      <Typography variant="body2" color="text.secondary">
        Redirecting...
      </Typography>
    </Box>
  );
}
