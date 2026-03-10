'use client';

import { Box, CircularProgress } from '@mui/material';

export default function Loading() {
  return (
    <Box
      sx={{
        minHeight: '50vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <CircularProgress aria-label="Loading" />
    </Box>
  );
}
