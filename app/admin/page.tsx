'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import Layout from '@/components/Layout';
import { getStoredUsername, getStoredRole } from '@/lib/auth';
import { apiAdminListUsers, apiAdminResetUserPassword } from '@/lib/api';

export default function AdminPage() {
  const router = useRouter();
  const [users, setUsers] = useState<Array<{ id: string; username: string; role: string; full_name: string | null; email: string | null; phone: string | null; created_at: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [resetUserId, setResetUserId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!getStoredUsername()) {
      router.push('/');
      return;
    }
    if (getStoredRole() !== 'admin') {
      setError('Access denied. Admin only.');
      setLoading(false);
      return;
    }
    apiAdminListUsers()
      .then(setUsers)
      .catch((e) => setError(e.message || 'Failed to load users'))
      .finally(() => setLoading(false));
  }, [router]);

  const handleResetPassword = async () => {
    if (!resetUserId || !newPassword || newPassword.length < 8) return;
    setSaving(true);
    setError('');
    try {
      await apiAdminResetUserPassword(resetUserId, newPassword);
      setResetUserId(null);
      setNewPassword('');
    } catch (e: any) {
      setError(e.message || 'Failed to reset password');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="40vh">
          <Typography>Loading...</Typography>
        </Box>
      </Layout>
    );
  }

  if (getStoredRole() !== 'admin') {
    return (
      <Layout>
        <Alert severity="error">Access denied. Admin only.</Alert>
      </Layout>
    );
  }

  return (
    <Layout>
      <Paper sx={{ p: { xs: 2, sm: 4 } }}>
        <Typography variant="h5" gutterBottom>Admin panel</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>App users. Reset password when requested by user. Use email/phone to contact.</Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
        <TableContainer sx={{ overflowX: 'auto' }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Username</TableCell>
                <TableCell>Full name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Created</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>{u.username}</TableCell>
                  <TableCell>{u.full_name ?? '—'}</TableCell>
                  <TableCell>{u.email ?? '—'}</TableCell>
                  <TableCell>{u.phone ?? '—'}</TableCell>
                  <TableCell>{u.role}</TableCell>
                  <TableCell>{u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}</TableCell>
                  <TableCell align="right">
                    <Button size="small" variant="outlined" onClick={() => { setResetUserId(u.id); setNewPassword(''); setError(''); }}>Reset password</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={!!resetUserId} onClose={() => setResetUserId(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Reset user password</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Set a new temporary password for this user. They can change it from their profile.</Typography>
          <TextField
            fullWidth
            label="New password"
            type={showPassword ? 'text' : 'password'}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            margin="normal"
            inputProps={{ minLength: 8 }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword((v) => !v)} edge="end">{showPassword ? <VisibilityOff /> : <Visibility />}</IconButton>
                </InputAdornment>
              ),
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResetUserId(null)}>Cancel</Button>
          <Button variant="contained" onClick={handleResetPassword} disabled={saving || newPassword.length < 8}>{saving ? 'Saving...' : 'Reset password'}</Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
}
