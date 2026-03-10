'use client';

import { useEffect } from 'react';
import { Box, Button, Typography, Paper } from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App error:', error);
  }, [error]);

  return (
    <Box
      sx={{
        minHeight: '60vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <Paper sx={{ p: 3, maxWidth: 400, textAlign: 'center' }} elevation={2}>
        <Typography variant="h6" color="error" gutterBottom>
          Something went wrong
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          The app hit an error. This can happen on a slow connection or when the server is busy.
        </Typography>
        <Button
          variant="contained"
          startIcon={<RefreshIcon />}
          onClick={reset}
          fullWidth
        >
          Try again
        </Button>
      </Paper>
    </Box>
  );
}
