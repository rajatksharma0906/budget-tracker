'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Paper, Typography, Button } from '@mui/material';
import Layout from '@/components/Layout';
import { getStoredUsername } from '@/lib/auth';

export default function AddBillPage() {
  const router = useRouter();

  useEffect(() => {
    const username = getStoredUsername();
    if (!username) {
      router.push('/');
    }
  }, [router]);

  return (
    <Layout>
      <Paper sx={{ p: { xs: 2, sm: 4 }, maxWidth: 480, mx: 'auto' }}>
        <Typography variant="h5" component="h1" gutterBottom>
          Add New Bill
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          The Bills module is currently disabled.
        </Typography>
        <Button variant="contained" onClick={() => router.push('/dashboard')}>
          Back to Dashboard
        </Button>
      </Paper>
    </Layout>
  );
}
