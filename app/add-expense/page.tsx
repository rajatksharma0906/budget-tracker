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
  Autocomplete,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { MobileDatePicker } from '@mui/x-date-pickers/MobileDatePicker';
import dayjs from 'dayjs';
import Layout from '@/components/Layout';
import { getStoredUsername } from '@/lib/auth';
import { apiCreateExpense } from '@/lib/api';
import { EXPENSE_CATEGORIES, getSubCategoriesFor } from '@/lib/types';

const DESCRIPTION_OPTIONS = [
  'Walmart',
  'Costco',
  'Amazon',
  'Target',
  'Kroger',
  'Safeway',
  'Whole Foods',
  'Trader Joe\'s',
  'Aldi',
  'Home Depot',
  'Lowe\'s',
  'Best Buy',
  'Starbucks',
  'McDonald\'s',
  'Chipotle',
  'Subway',
  'CVS',
  'Walgreens',
  'Dollar General',
  'Dollar Tree',
  '7-Eleven',
  'Shell',
  'Exxon',
  'Chevron',
  'BP',
  'Netflix',
  'Spotify',
  'Apple',
  'Google',
  'Microsoft',
  'Uber',
  'Lyft',
  'DoorDash',
  'Instacart',
];

export default function AddExpensePage() {
  const router = useRouter();
  const theme = useTheme();
  const isMobileOrTablet = useMediaQuery(theme.breakpoints.down('md'));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: '',
    subCategory: '',
    date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    const username = getStoredUsername();
    if (!username) {
      router.push('/');
    }
  }, [router]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: value };
      if (field === 'category') {
        const subs = getSubCategoriesFor(value);
        next.subCategory = subs.length === 1 ? subs[0] : '';
      }
      return next;
    });
    setError('');
  };

  const subCategoryOptions = formData.category ? getSubCategoriesFor(formData.category) : [];

  // Menu props so category/subcategory dropdowns stay usable on mobile (above header, scrollable)
  const selectMenuProps = {
    disableScrollLock: true,
    sx: { zIndex: 1400 },
    PaperProps: {
      sx: { maxHeight: 'min(70vh, 360px)', zIndex: 1400 },
    },
    anchorOrigin: { vertical: 'bottom' as const, horizontal: 'left' as const },
    transformOrigin: { vertical: 'top' as const, horizontal: 'left' as const },
  };

  // When only one category exists, default select it (run once on mount)
  useEffect(() => {
    if (EXPENSE_CATEGORIES.length === 1) {
      const only = EXPENSE_CATEGORIES[0];
      setFormData((prev) => {
        if (prev.category) return prev;
        const subs = getSubCategoriesFor(only);
        return {
          ...prev,
          category: only,
          subCategory: subs.length === 1 ? subs[0] : '',
        };
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');

      if (!formData.description.trim()) {
        setError('Please enter a description');
        setLoading(false);
        return;
      }
      if (!formData.amount || parseFloat(formData.amount) <= 0) {
        setError('Please enter a valid amount');
        setLoading(false);
        return;
      }
      if (!formData.category) {
        setError('Please select a category');
        setLoading(false);
        return;
      }
      if (!formData.date) {
        setError('Please select a date');
        setLoading(false);
        return;
      }

      await apiCreateExpense({
        description: formData.description.trim(),
        amount: parseFloat(formData.amount),
        category: formData.category,
        subCategory: formData.subCategory.trim() || undefined,
        date: formData.date,
      });

      setSuccess(true);
      setFormData({
        description: '',
        amount: '',
        category: '',
        subCategory: '',
        date: new Date().toISOString().split('T')[0],
      });
      setTimeout(() => setSuccess(false), 600);
    } catch (err: any) {
      console.error('Error creating expense:', err);
      setError(err.message || 'Failed to create expense. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAnother = () => {
    setFormData({
      description: '',
      amount: '',
      category: '',
      subCategory: '',
      date: new Date().toISOString().split('T')[0],
    });
    setSuccess(false);
    setError('');
  };

  return (
    <Layout>
      <Paper sx={{ p: { xs: 2, sm: 4 }, maxWidth: 600, mx: 'auto' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Add Expense
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Expense added successfully!
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Autocomplete
            freeSolo
            options={DESCRIPTION_OPTIONS}
            value={formData.description}
            onInputChange={(_, value) => handleChange('description', value ?? '')}
            inputValue={formData.description}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Description"
                variant="outlined"
                margin="normal"
                placeholder="e.g., Walmart, Costco, or type your own"
                required
              />
            )}
            sx={{ mt: 1, mb: 0 }}
          />

          <TextField
            fullWidth
            label="Amount"
            type="number"
            variant="outlined"
            value={formData.amount}
            onChange={(e) => handleChange('amount', e.target.value)}
            margin="normal"
            inputProps={{ min: 0, step: 0.01 }}
            placeholder="0.00"
            required
          />

          <TextField
            fullWidth
            select
            label="Category"
            variant="outlined"
            value={formData.category}
            onChange={(e) => handleChange('category', e.target.value)}
            margin="normal"
            required
            SelectProps={{ MenuProps: selectMenuProps }}
          >
            {EXPENSE_CATEGORIES.map((cat) => (
              <MenuItem key={cat} value={cat}>
                {cat}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            fullWidth
            select
            label="Sub Category"
            variant="outlined"
            value={formData.subCategory}
            onChange={(e) => handleChange('subCategory', e.target.value)}
            margin="normal"
            disabled={!formData.category}
            SelectProps={{ MenuProps: selectMenuProps }}
          >
            <MenuItem value="">Select sub-category</MenuItem>
            {subCategoryOptions.map((sub) => (
              <MenuItem key={sub} value={sub}>
                {sub}
              </MenuItem>
            ))}
          </TextField>

          <Box sx={{ mt: 2, mb: 0 }}>
            {isMobileOrTablet ? (
              <MobileDatePicker
                label="Date"
                value={formData.date ? dayjs(formData.date) : dayjs()}
                onChange={(d) => handleChange('date', d ? dayjs(d).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'))}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true,
                    margin: 'normal',
                    variant: 'outlined',
                  },
                }}
              />
            ) : (
              <DatePicker
                label="Date"
                value={formData.date ? dayjs(formData.date) : dayjs()}
                onChange={(d) => handleChange('date', d ? dayjs(d).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'))}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true,
                    margin: 'normal',
                    variant: 'outlined',
                  },
                }}
              />
            )}
          </Box>

          <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              size="large"
            >
              {loading ? <CircularProgress size={24} /> : 'Save Expense'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Layout>
  );
}
