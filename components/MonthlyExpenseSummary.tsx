'use client';

import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  Alert,
} from '@mui/material';
import { TrendingUp, TrendingDown } from '@mui/icons-material';
import { getOrFetchUserId } from '@/lib/auth';
import { apiGetSummary } from '@/lib/api';
import { format } from 'date-fns';

export default function MonthlyExpenseSummary() {
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [monthlyBudget, setMonthlyBudget] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadSummary = async () => {
      try {
        if (!isMounted) return;
        setLoading(true);
        const userId = await getOrFetchUserId();
        if (!userId) {
          if (!isMounted) return;
          setError('User not found. Please log out and log back in.');
          setLoading(false);
          return;
        }

        const data = await apiGetSummary();
        if (!isMounted) return;
        setTotalExpenses(data.totalExpenses ?? 0);
        setMonthlyBudget(data.monthlyBudget ?? 0);
        setLoading(false);
      } catch (err: any) {
        if (!isMounted) return;
        setError(err.message || 'Failed to load summary');
        setLoading(false);
      }
    };

    loadSummary();

    return () => {
      isMounted = false;
    };
  }, []);

  const totalSpent = totalExpenses;
  const remaining = monthlyBudget > 0 ? monthlyBudget - totalSpent : null;

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          <Alert severity="error">{error}</Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Monthly Expense Summary - {format(new Date(), 'MMMM yyyy')}
        </Typography>

        <Box sx={{ mt: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography>Total Expenses:</Typography>
            <Typography fontWeight="bold">${totalExpenses.toFixed(2)}</Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
            <Typography variant="h6">Total Spent:</Typography>
            <Typography variant="h6" fontWeight="bold" color="primary">
              ${totalSpent.toFixed(2)}
            </Typography>
          </Box>

          {monthlyBudget > 0 && (
            <>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography>Monthly Budget:</Typography>
                <Typography fontWeight="bold">${monthlyBudget.toFixed(2)}</Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 2, borderTop: 1, borderColor: 'divider' }}>
                <Typography variant="h6">Remaining:</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {remaining !== null && remaining >= 0 ? (
                    <TrendingUp color="success" />
                  ) : (
                    <TrendingDown color="error" />
                  )}
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    color={remaining !== null && remaining >= 0 ? 'success.main' : 'error.main'}
                  >
                    ${remaining !== null ? remaining.toFixed(2) : '0.00'}
                  </Typography>
                </Box>
              </Box>
            </>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
