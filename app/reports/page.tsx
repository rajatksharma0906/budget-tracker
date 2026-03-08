'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import {
  Box,
  Paper,
  Typography,
  TextField,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Tabs,
  Tab,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  useMediaQuery,
  Checkbox,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import RestoreIcon from '@mui/icons-material/Restore';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { MobileDatePicker } from '@mui/x-date-pickers/MobileDatePicker';
import dayjs from 'dayjs';
import Layout from '@/components/Layout';
import { getStoredUsername } from '@/lib/auth';
import { apiGetReports, apiDeleteExpense, apiRestoreExpense, apiGetDeletedExpenses, apiUpdateExpense } from '@/lib/api';
import { EXPENSE_CATEGORIES, getSubCategoriesFor } from '@/lib/types';
import { format, parseISO } from 'date-fns';

type ExpenseItem = { id: string; description: string; amount: number; category: string; sub_category?: string; date: string };

function ReportsContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const theme = useTheme();
  const isMobileOrTablet = useMediaQuery(theme.breakpoints.down('md'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const now = new Date();
  const [historicalYear, setHistoricalYear] = useState(now.getFullYear());
  const [historicalMonth, setHistoricalMonth] = useState(now.getMonth() + 1);
  const [bills, setBills] = useState<Array<{ id: string; name: string; amount: number; category: string; sub_category?: string; dueDate: string; isPaid: boolean }>>([]);
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [totalBills, setTotalBills] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [monthlyBudget, setMonthlyBudget] = useState(0);
  const [tabValue, setTabValue] = useState(() => (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('tab') === 'historical' ? 1 : 0));
  const [historicalData, setHistoricalData] = useState<Array<{
    month: string;
    total: number;
    bills: number;
    expenses: number;
  }>>([]);
  const [yearlyData, setYearlyData] = useState<Array<{ year: number; total: number; bills: number; expenses: number }>>([]);
  const [historicalView, setHistoricalView] = useState<'monthly' | 'yearly'>('monthly');
  const [deletedExpenses, setDeletedExpenses] = useState<ExpenseItem[]>([]);
  const [deletedSectionExpanded, setDeletedSectionExpanded] = useState(false);
  const [deletedLoading, setDeletedLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [selectedExpenseIds, setSelectedExpenseIds] = useState<Set<string>>(new Set());
  const [selectedDeletedIds, setSelectedDeletedIds] = useState<Set<string>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [bulkRestoring, setBulkRestoring] = useState(false);
  const [editExpense, setEditExpense] = useState<ExpenseItem | null>(null);
  const [editForm, setEditForm] = useState({ description: '', amount: '', category: '', subCategory: '', date: '' });
  const [editSaving, setEditSaving] = useState(false);

  const loadDeletedExpenses = async () => {
    setDeletedLoading(true);
    try {
      const list = await apiGetDeletedExpenses(selectedMonth);
      setDeletedExpenses(Array.isArray(list) ? list : []);
    } catch {
      setDeletedExpenses([]);
    } finally {
      setDeletedLoading(false);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    try {
      setDeletingId(id);
      await apiDeleteExpense(id);
      const data = await apiGetReports(selectedMonth);
      setTotalBills(data.totalBills ?? 0);
      setTotalExpenses(data.totalExpenses ?? 0);
      setMonthlyBudget(data.monthlyBudget ?? 0);
      setBills(data.bills ?? []);
      setExpenses(data.expenses ?? []);
      setHistoricalData(data.historical ?? []);
      if (deletedSectionExpanded) loadDeletedExpenses();
      setSelectedExpenseIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    } catch (err: any) {
      setError(err.message || 'Failed to delete expense');
    } finally {
      setDeletingId(null);
    }
  };

  const toggleExpenseSelection = (id: string) => {
    setSelectedExpenseIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleDeletedSelection = (id: string) => {
    setSelectedDeletedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleBulkDelete = async () => {
    const ids = Array.from(selectedExpenseIds);
    if (ids.length === 0) return;
    try {
      setBulkDeleting(true);
      setError('');
      await Promise.all(ids.map((id) => apiDeleteExpense(id)));
      const [data, deletedList] = await Promise.all([
        apiGetReports(selectedMonth),
        apiGetDeletedExpenses(selectedMonth),
      ]);
      setTotalBills(data.totalBills ?? 0);
      setTotalExpenses(data.totalExpenses ?? 0);
      setMonthlyBudget(data.monthlyBudget ?? 0);
      setBills(data.bills ?? []);
      setExpenses(data.expenses ?? []);
      setHistoricalData(data.historical ?? []);
      setDeletedExpenses(Array.isArray(deletedList) ? deletedList : []);
      setSelectedExpenseIds(new Set());
    } catch (err: any) {
      setError(err.message || 'Failed to delete some expenses');
    } finally {
      setBulkDeleting(false);
    }
  };

  const handleBulkRestore = async () => {
    const ids = Array.from(selectedDeletedIds);
    if (ids.length === 0) return;
    try {
      setBulkRestoring(true);
      setError('');
      await Promise.all(ids.map((id) => apiRestoreExpense(id)));
      const [data, deletedList] = await Promise.all([
        apiGetReports(selectedMonth),
        apiGetDeletedExpenses(selectedMonth),
      ]);
      setTotalExpenses(data.totalExpenses ?? 0);
      setExpenses(data.expenses ?? []);
      setHistoricalData(data.historical ?? []);
      setDeletedExpenses(Array.isArray(deletedList) ? deletedList : []);
      setSelectedDeletedIds(new Set());
    } catch (err: any) {
      setError(err.message || 'Failed to restore some expenses');
    } finally {
      setBulkRestoring(false);
    }
  };

  const handleRestoreExpense = async (id: string) => {
    try {
      setRestoringId(id);
      await apiRestoreExpense(id);
      const data = await apiGetReports(selectedMonth);
      setTotalExpenses(data.totalExpenses ?? 0);
      setExpenses(data.expenses ?? []);
      setHistoricalData(data.historical ?? []);
      setDeletedExpenses((prev) => prev.filter((e) => e.id !== id));
      setSelectedDeletedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    } catch (err: any) {
      setError(err.message || 'Failed to restore expense');
    } finally {
      setRestoringId(null);
    }
  };

  const handleEditClick = (expense: ExpenseItem) => {
    setEditExpense(expense);
    setEditForm({
      description: expense.description,
      amount: String(expense.amount),
      category: expense.category,
      subCategory: expense.sub_category ?? '',
      date: expense.date,
    });
  };

  const handleEditClose = () => {
    setEditExpense(null);
    setEditForm({ description: '', amount: '', category: '', subCategory: '', date: '' });
  };

  const handleEditFormChange = (field: string, value: string) => {
    setEditForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === 'category') {
        const subs = getSubCategoriesFor(value);
        next.subCategory = subs.length === 1 ? subs[0] : '';
      }
      return next;
    });
  };

  const handleEditSave = async () => {
    if (!editExpense) return;
    const amount = parseFloat(editForm.amount);
    if (!editForm.description.trim() || isNaN(amount) || amount <= 0 || !editForm.category || !editForm.date) {
      setError('Please fill all fields with valid values');
      return;
    }
    try {
      setEditSaving(true);
      setError('');
      const dateStr = editForm.date.includes('T') ? editForm.date.slice(0, 10) : editForm.date;
      await apiUpdateExpense(editExpense.id, {
        description: editForm.description.trim(),
        amount,
        category: editForm.category,
        subCategory: editForm.subCategory.trim() || undefined,
        date: dateStr,
      });
      const data = await apiGetReports(selectedMonth);
      setTotalExpenses(data.totalExpenses ?? 0);
      setExpenses(data.expenses ?? []);
      setHistoricalData(data.historical ?? []);
      handleEditClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update expense');
    } finally {
      setEditSaving(false);
    }
  };

  const editSubCategoryOptions = editForm.category ? getSubCategoriesFor(editForm.category) : [];

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'historical') setTabValue(1);
    else if (tab === 'monthly' || tab === null) setTabValue(0);
  }, [searchParams]);

  useEffect(() => {
    const username = getStoredUsername();
    if (!username) {
      router.push('/');
      return;
    }

    const month = tabValue === 0 ? selectedMonth : `${historicalYear}-${String(historicalMonth).padStart(2, '0')}`;
    const isMonthlyTab = tabValue === 0;
    const loadReports = async () => {
      try {
        setLoading(true);
        setError('');
        const reportsPromise = apiGetReports(month);
        const deletedPromise = isMonthlyTab ? apiGetDeletedExpenses(month) : Promise.resolve([]);
        const [data, deletedList] = await Promise.all([reportsPromise, deletedPromise]);
        setTotalBills(data.totalBills ?? 0);
        setTotalExpenses(data.totalExpenses ?? 0);
        setMonthlyBudget(data.monthlyBudget ?? 0);
        setBills(data.bills ?? []);
        setExpenses(data.expenses ?? []);
        setHistoricalData(data.historical ?? []);
        setYearlyData(data.yearlyData ?? []);
        if (isMonthlyTab) setDeletedExpenses(Array.isArray(deletedList) ? deletedList : []);
        setSelectedExpenseIds(new Set());
        setSelectedDeletedIds(new Set());
      } catch (err: any) {
        setError(err.message || 'Failed to load reports');
      } finally {
        setLoading(false);
      }
    };

    loadReports();
  }, [selectedMonth, tabValue, router]);

  const generateMonthOptions = () => {
    const options = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const value = format(date, 'yyyy-MM');
      const label = format(date, 'MMMM yyyy');
      options.push({ value, label });
    }
    return options;
  };

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 6 }, (_, i) => currentYear - i);
  const monthOptions = Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: format(new Date(2000, i, 1), 'MMMM') }));
  const setHistoricalYearMonth = (year: number, month: number) => {
    setHistoricalYear(year);
    setHistoricalMonth(month);
  };

  const totalSpent = totalExpenses;
  const budgetPercentage = monthlyBudget > 0 ? Math.min((totalSpent / monthlyBudget) * 100, 100) : 0;

  if (loading && expenses.length === 0) {
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
      <Paper sx={{ p: { xs: 2, sm: 4 } }}>
        <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
          Reports
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Tabs
          value={tabValue}
          onChange={(_, newValue) => {
            setTabValue(newValue);
            const tab = newValue === 1 ? 'historical' : 'monthly';
            router.replace(`${pathname}?tab=${tab}`, { scroll: false });
          }}
          sx={{ mb: 3 }}
        >
          <Tab label="Monthly Report" />
          <Tab label="Historical Reports" />
        </Tabs>

        {tabValue === 0 && (
          <>
            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="h6">Monthly Report</Typography>
              <TextField
                select
                label="Select Month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                size="small"
                sx={{ minWidth: 200 }}
              >
                {generateMonthOptions().map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6}>
                <Card>
                  <CardContent>
                    <Typography color="text.secondary" gutterBottom>
                      Total Expenses
                    </Typography>
                    <Typography variant="h5">
                      ${totalExpenses.toFixed(2)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Card>
                  <CardContent>
                    <Typography color="text.secondary" gutterBottom>
                      Total Spent
                    </Typography>
                    <Typography variant="h5" color="primary">
                      ${totalSpent.toFixed(2)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {monthlyBudget > 0 && (
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="h6">Budget Status</Typography>
                    <Typography variant="h6" color={budgetPercentage > 100 ? 'error.main' : 'primary.main'}>
                      {budgetPercentage.toFixed(1)}%
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 1, mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Spent: ${totalSpent.toFixed(2)} / Budget: ${monthlyBudget.toFixed(2)}
                    </Typography>
                    <Typography variant="body2" color={monthlyBudget - totalSpent >= 0 ? 'success.main' : 'error.main'}>
                      {monthlyBudget - totalSpent >= 0
                        ? `Remaining: $${(monthlyBudget - totalSpent).toFixed(2)}`
                        : `Over by: $${(totalSpent - monthlyBudget).toFixed(2)}`}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={budgetPercentage}
                    sx={{
                      height: 10,
                      borderRadius: 5,
                      backgroundColor: 'grey.200',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: budgetPercentage > 100 ? 'error.main' : budgetPercentage > 80 ? 'warning.main' : 'primary.main',
                      },
                    }}
                  />
                </CardContent>
              </Card>
            )}

            <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
              Expenses
            </Typography>
            <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                Select rows to delete multiple:
              </Typography>
              <Button
                variant="outlined"
                color="error"
                size="small"
                startIcon={<DeleteOutlineIcon />}
                onClick={handleBulkDelete}
                disabled={bulkDeleting || selectedExpenseIds.size === 0}
              >
                Delete selected ({selectedExpenseIds.size})
              </Button>
              {selectedExpenseIds.size > 0 && (
                <Button size="small" onClick={() => setSelectedExpenseIds(new Set())}>
                  Clear selection
                </Button>
              )}
            </Box>
            <TableContainer sx={{ overflowX: 'auto' }}>
              <Table size="small" sx={{ minWidth: 400 }}>
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox" sx={{ position: 'sticky', left: 0, zIndex: 1, backgroundColor: 'background.paper', minWidth: 48 }}>
                      <Checkbox
                        indeterminate={selectedExpenseIds.size > 0 && selectedExpenseIds.size < expenses.length}
                        checked={expenses.length > 0 && selectedExpenseIds.size === expenses.length}
                        onChange={(ev) => {
                          if (ev.target.checked) setSelectedExpenseIds(new Set(expenses.map((x) => x.id)));
                          else setSelectedExpenseIds(new Set());
                        }}
                        aria-label="Select all expenses"
                      />
                    </TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {expenses.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        No expenses found for this month
                      </TableCell>
                    </TableRow>
                  ) : (
                    expenses.map((expense) => (
                      <TableRow key={expense.id} hover selected={selectedExpenseIds.has(expense.id)}>
                        <TableCell padding="checkbox" sx={{ position: 'sticky', left: 0, zIndex: 1, backgroundColor: selectedExpenseIds.has(expense.id) ? 'action.selected' : 'background.paper', minWidth: 48 }}>
                          <Checkbox
                            checked={selectedExpenseIds.has(expense.id)}
                            onChange={() => toggleExpenseSelection(expense.id)}
                            aria-label={`Select ${expense.description}`}
                          />
                        </TableCell>
                        <TableCell>{expense.description}</TableCell>
                        <TableCell>${expense.amount.toFixed(2)}</TableCell>
                        <TableCell>{expense.sub_category ? `${expense.category} - ${expense.sub_category}` : expense.category}</TableCell>
                        <TableCell>{format(parseISO(expense.date), 'MMM dd, yyyy')}</TableCell>
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            aria-label="Edit expense"
                            onClick={() => handleEditClick(expense)}
                          >
                            <EditOutlinedIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            aria-label="Delete expense"
                            onClick={() => handleDeleteExpense(expense.id)}
                            disabled={deletingId === expense.id}
                          >
                            <DeleteOutlineIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <Accordion
              expanded={deletedSectionExpanded}
              onChange={(_, expanded) => setDeletedSectionExpanded(expanded)}
              sx={{ mt: 3 }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6">Deleted expenses</Typography>
              </AccordionSummary>
              <AccordionDetails>
                {deletedLoading ? (
                  <Box display="flex" justifyContent="center" py={2}>
                    <CircularProgress size={24} />
                  </Box>
                ) : (
                  <>
                    <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                        Select rows to restore multiple:
                      </Typography>
                      <Button
                        variant="outlined"
                        color="primary"
                        size="small"
                        startIcon={<RestoreIcon />}
                        onClick={handleBulkRestore}
                        disabled={bulkRestoring || selectedDeletedIds.size === 0}
                      >
                        Restore selected ({selectedDeletedIds.size})
                      </Button>
                      {selectedDeletedIds.size > 0 && (
                        <Button size="small" onClick={() => setSelectedDeletedIds(new Set())}>
                          Clear selection
                        </Button>
                      )}
                    </Box>
                    <TableContainer sx={{ overflowX: 'auto' }}>
                      <Table size="small" sx={{ minWidth: 400 }}>
                        <TableHead>
                          <TableRow>
                            <TableCell padding="checkbox" sx={{ position: 'sticky', left: 0, zIndex: 1, backgroundColor: 'background.paper', minWidth: 48 }}>
                              <Checkbox
                                indeterminate={selectedDeletedIds.size > 0 && selectedDeletedIds.size < deletedExpenses.length}
                                checked={deletedExpenses.length > 0 && selectedDeletedIds.size === deletedExpenses.length}
                                onChange={(ev) => {
                                  if (ev.target.checked) setSelectedDeletedIds(new Set(deletedExpenses.map((x) => x.id)));
                                  else setSelectedDeletedIds(new Set());
                                }}
                                aria-label="Select all deleted"
                              />
                            </TableCell>
                            <TableCell>Description</TableCell>
                            <TableCell>Amount</TableCell>
                            <TableCell>Category</TableCell>
                            <TableCell>Date</TableCell>
                            <TableCell align="right">Actions</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {deletedExpenses.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={6} align="center">
                                No deleted expenses for this month
                              </TableCell>
                            </TableRow>
                          ) : (
                            deletedExpenses.map((exp) => (
                              <TableRow key={exp.id} hover selected={selectedDeletedIds.has(exp.id)}>
                                <TableCell padding="checkbox" sx={{ position: 'sticky', left: 0, zIndex: 1, backgroundColor: selectedDeletedIds.has(exp.id) ? 'action.selected' : 'background.paper', minWidth: 48 }}>
                                  <Checkbox
                                    checked={selectedDeletedIds.has(exp.id)}
                                    onChange={() => toggleDeletedSelection(exp.id)}
                                    aria-label={`Select ${exp.description}`}
                                  />
                                </TableCell>
                                <TableCell>{exp.description}</TableCell>
                                <TableCell>${exp.amount.toFixed(2)}</TableCell>
                                <TableCell>{exp.sub_category ? `${exp.category} - ${exp.sub_category}` : exp.category}</TableCell>
                                <TableCell>{format(parseISO(exp.date), 'MMM dd, yyyy')}</TableCell>
                                <TableCell align="right">
                                  <Button
                                    size="small"
                                    startIcon={<RestoreIcon />}
                                    onClick={() => handleRestoreExpense(exp.id)}
                                    disabled={restoringId === exp.id}
                                  >
                                    Restore
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </>
                )}
              </AccordionDetails>
            </Accordion>

            <Dialog open={!!editExpense} onClose={handleEditClose} maxWidth="sm" fullWidth>
              <DialogTitle>Edit expense</DialogTitle>
              <DialogContent>
                <TextField
                  fullWidth
                  label="Description"
                  value={editForm.description}
                  onChange={(e) => handleEditFormChange('description', e.target.value)}
                  margin="normal"
                  required
                />
                <TextField
                  fullWidth
                  label="Amount"
                  type="number"
                  value={editForm.amount}
                  onChange={(e) => handleEditFormChange('amount', e.target.value)}
                  margin="normal"
                  inputProps={{ min: 0, step: 0.01 }}
                  required
                />
                <TextField
                  fullWidth
                  select
                  label="Category"
                  value={editForm.category}
                  onChange={(e) => handleEditFormChange('category', e.target.value)}
                  margin="normal"
                  required
                >
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                  ))}
                </TextField>
                <TextField
                  fullWidth
                  select
                  label="Sub category"
                  value={editForm.subCategory}
                  onChange={(e) => handleEditFormChange('subCategory', e.target.value)}
                  margin="normal"
                  disabled={!editForm.category}
                >
                  <MenuItem value="">Select sub-category</MenuItem>
                  {editSubCategoryOptions.map((sub) => (
                    <MenuItem key={sub} value={sub}>{sub}</MenuItem>
                  ))}
                </TextField>
                <Box sx={{ mt: 2, mb: 1 }}>
                  {isMobileOrTablet ? (
                    <MobileDatePicker
                      label="Date"
                      value={editForm.date ? dayjs(editForm.date) : dayjs()}
                      onChange={(d) => handleEditFormChange('date', d ? dayjs(d).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'))}
                      slotProps={{ textField: { fullWidth: true, margin: 'normal' } }}
                    />
                  ) : (
                    <DatePicker
                      label="Date"
                      value={editForm.date ? dayjs(editForm.date) : dayjs()}
                      onChange={(d) => handleEditFormChange('date', d ? dayjs(d).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'))}
                      slotProps={{ textField: { fullWidth: true, margin: 'normal' } }}
                    />
                  )}
                </Box>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleEditClose}>Cancel</Button>
                <Button variant="contained" onClick={handleEditSave} disabled={editSaving}>
                  {editSaving ? 'Saving…' : 'Save'}
                </Button>
              </DialogActions>
            </Dialog>
          </>
        )}

        {tabValue === 1 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Historical Reports
            </Typography>
            <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2 }}>
              <Typography variant="body2" color="text.secondary">View by:</Typography>
              <Button
                variant={historicalView === 'monthly' ? 'contained' : 'outlined'}
                size="small"
                onClick={() => setHistoricalView('monthly')}
              >
                By month
              </Button>
              <Button
                variant={historicalView === 'yearly' ? 'contained' : 'outlined'}
                size="small"
                onClick={() => setHistoricalView('yearly')}
              >
                By year
              </Button>
              {historicalView === 'monthly' && (
                <>
                  <TextField
                    select
                    label="Year"
                    value={historicalYear}
                    onChange={(e) => setHistoricalYearMonth(Number(e.target.value), historicalMonth)}
                    size="small"
                    sx={{ minWidth: 100 }}
                  >
                    {yearOptions.map((y) => (
                      <MenuItem key={y} value={y}>{y}</MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    select
                    label="Month"
                    value={historicalMonth}
                    onChange={(e) => setHistoricalYearMonth(historicalYear, Number(e.target.value))}
                    size="small"
                    sx={{ minWidth: 130 }}
                  >
                    {monthOptions.map((m) => (
                      <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>
                    ))}
                  </TextField>
                </>
              )}
            </Box>
            {historicalView === 'monthly' && (
              <>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
                  From January through the selected month for the selected year.
                </Typography>
                <TableContainer component={Paper} variant="outlined" sx={{ overflowX: 'auto' }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>Month</strong></TableCell>
                        <TableCell align="right"><strong>Expenses</strong></TableCell>
                        <TableCell align="right"><strong>Total</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {historicalData.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={3} align="center" sx={{ py: 4 }}>
                            <Typography color="text.secondary">
                              No data for this range. Add expenses in the Monthly Report tab.
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        historicalData.map((data, index) => (
                          <TableRow key={index} hover>
                            <TableCell>{data.month}</TableCell>
                            <TableCell align="right">${data.expenses.toFixed(2)}</TableCell>
                            <TableCell align="right">
                              <Typography fontWeight="bold" color="primary">
                                ${data.total.toFixed(2)}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            )}
            {historicalView === 'yearly' && (
              <>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
                  Total spending per year (last 6 years).
                </Typography>
                <TableContainer component={Paper} variant="outlined" sx={{ overflowX: 'auto' }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>Year</strong></TableCell>
                        <TableCell align="right"><strong>Expenses</strong></TableCell>
                        <TableCell align="right"><strong>Total</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {yearlyData.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={3} align="center" sx={{ py: 4 }}>
                            <Typography color="text.secondary">
                              No yearly data yet. Add expenses in the Monthly Report tab.
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        yearlyData.map((row) => (
                          <TableRow key={row.year} hover>
                            <TableCell>{row.year}</TableCell>
                            <TableCell align="right">${row.expenses.toFixed(2)}</TableCell>
                            <TableCell align="right">
                              <Typography fontWeight="bold" color="primary">
                                ${row.total.toFixed(2)}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            )}
          </Box>
        )}
      </Paper>
    </Layout>
  );
}

export default function ReportsPage() {
  return (
    <Suspense
      fallback={
        <Layout>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
            <CircularProgress />
          </Box>
        </Layout>
      }
    >
      <ReportsContent />
    </Suspense>
  );
}
