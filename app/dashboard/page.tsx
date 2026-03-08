'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Assessment as ReportsIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import Layout from '@/components/Layout';
import MonthlyExpenseSummary from '@/components/MonthlyExpenseSummary';
import { getStoredUsername, getStoredFullName } from '@/lib/auth';

export default function Dashboard() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUsername = getStoredUsername();
    if (!storedUsername) {
      router.push('/');
      return;
    }
    const fullName = getStoredFullName();
    setDisplayName(fullName && fullName.trim() ? fullName.trim() : storedUsername);
    setLoading(false);
  }, [router]);

  if (loading) {
    return (
      <Layout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
        Welcome, {displayName}!
      </Typography>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={8}>
          <MonthlyExpenseSummary />
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                <Button
                  variant="contained"
                  color="secondary"
                  startIcon={<AddIcon />}
                  onClick={() => router.push('/add-expense')}
                  fullWidth
                  sx={{ minHeight: 44, touchAction: 'manipulation' }}
                >
                  Add Expense
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<ReportsIcon />}
                  onClick={() => router.push('/reports')}
                  fullWidth
                  sx={{ minHeight: 44, touchAction: 'manipulation' }}
                >
                  View Monthly Report
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Layout>
  );
}
