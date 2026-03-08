'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  MenuItem,
  Alert,
  CircularProgress,
} from '@mui/material';
import Layout from '@/components/Layout';
import { getStoredUsername } from '@/lib/auth';
import { apiGetSettings, apiSaveSettings } from '@/lib/api';

const currencies = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
];

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [settings, setSettings] = useState({
    monthlyBudget: '',
    currency: 'USD',
  });

  useEffect(() => {
    const isMounted = { current: true };

    const username = getStoredUsername();
    if (!username) {
      router.push('/');
      return;
    }

    const loadSettings = async () => {
      try {
        if (!isMounted.current) return;
        setLoading(true);
        const data = await apiGetSettings();
        if (!isMounted.current) return;
        setSettings({
          monthlyBudget: data.monthlyBudget?.toString() ?? '',
          currency: data.currency ?? 'USD',
        });
        setLoading(false);
      } catch (err: any) {
        if (!isMounted.current) return;
        setError(err.message || 'Failed to load settings');
        setLoading(false);
      }
    };

    loadSettings();

    return () => {
      isMounted.current = false;
    };
  }, [router]);

  useEffect(() => {
    const handleFocus = () => {
      if (getStoredUsername()) {
        apiGetSettings()
          .then((data) => {
            setSettings({
              monthlyBudget: data.monthlyBudget?.toString() ?? '',
              currency: data.currency ?? 'USD',
            });
          })
          .catch(() => {});
      }
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess(false);

      if (!getStoredUsername()) {
        router.push('/');
        return;
      }

      await apiSaveSettings({
        monthlyBudget: settings.monthlyBudget ? parseFloat(settings.monthlyBudget) : 0,
        currency: settings.currency || 'USD',
      });

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  const selectedCurrency = currencies.find((c) => c.code === settings.currency);

  return (
    <Layout>
      <Paper sx={{ p: { xs: 2, sm: 4 }, maxWidth: 600 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Settings
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Settings saved successfully!
          </Alert>
        )}

        <Box sx={{ mt: 3 }}>
          <TextField
            fullWidth
            label="Monthly Budget"
            type="number"
            variant="outlined"
            value={settings.monthlyBudget}
            onChange={(e) => setSettings({ ...settings, monthlyBudget: e.target.value })}
            margin="normal"
            inputProps={{ min: 0, step: 0.01 }}
            placeholder="0.00"
            helperText={`Enter your monthly budget in ${selectedCurrency?.name || 'USD'}`}
          />

          <TextField
            fullWidth
            select
            label="Preferred Currency"
            variant="outlined"
            value={settings.currency}
            onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
            margin="normal"
            helperText="Select your preferred currency for displaying amounts"
          >
            {currencies.map((currency) => (
              <MenuItem key={currency.code} value={currency.code}>
                {currency.symbol} - {currency.name} ({currency.code})
              </MenuItem>
            ))}
          </TextField>

          <Box sx={{ mt: 3 }}>
            <Button
              variant="contained"
              onClick={handleSave}
              disabled={saving}
              fullWidth
              size="large"
            >
              {saving ? <CircularProgress size={24} /> : 'Save Settings'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Layout>
  );
}
