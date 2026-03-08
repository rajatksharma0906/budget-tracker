'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  InputAdornment,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import Layout from '@/components/Layout';
import { getStoredUsername } from '@/lib/auth';
import { apiGetProfile, apiUpdateProfile, apiChangePassword, apiUpdateRecoveryPin } from '@/lib/api';

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<{
    id: string;
    username: string;
    role: string;
    full_name: string | null;
    email: string | null;
    phone: string | null;
  } | null>(null);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [passwordDialog, setPasswordDialog] = useState(false);
  const [recoveryPinDialog, setRecoveryPinDialog] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [newRecoveryPin, setNewRecoveryPin] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);

  useEffect(() => {
    if (!getStoredUsername()) {
      router.push('/');
      return;
    }
    apiGetProfile()
      .then((p) => {
        setProfile(p);
        setFullName(p.full_name ?? '');
        setPhone(p.phone ?? '');
      })
      .catch(() => setError('Failed to load profile'))
      .finally(() => setLoading(false));
  }, [router]);

  const handleSaveProfile = async () => {
    if (!profile) return;
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await apiUpdateProfile({ fullName: fullName.trim() || null, phone: phone.trim() || null });
      setSuccess('Profile updated.');
      const p = await apiGetProfile();
      setProfile(p);
      setFullName(p.full_name ?? '');
      setPhone(p.phone ?? '');
    } catch (e: any) {
      setError(e.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    setError('');
    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setError('Passwords do not match');
      return;
    }
    try {
      await apiChangePassword(currentPassword, newPassword);
      setPasswordDialog(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setSuccess('Password changed.');
    } catch (e: any) {
      setError(e.message || 'Failed to change password');
    }
  };

  const handleUpdateRecoveryPin = async () => {
    setError('');
    if (newRecoveryPin.length !== 4 || !/^\d{4}$/.test(newRecoveryPin)) {
      setError('Recovery pin must be exactly 4 digits');
      return;
    }
    try {
      await apiUpdateRecoveryPin(currentPassword, newRecoveryPin);
      setRecoveryPinDialog(false);
      setCurrentPassword('');
      setNewRecoveryPin('');
      setSuccess('Recovery pin updated.');
    } catch (e: any) {
      setError(e.message || 'Failed to update recovery pin');
    }
  };

  if (loading || !profile) {
    return (
      <Layout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="40vh">
          <Typography>Loading...</Typography>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Paper sx={{ p: { xs: 2, sm: 4 }, maxWidth: 600 }}>
        <Typography variant="h5" gutterBottom>My Profile</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>You can update your name and phone. Recovery pin is not shown for security.</Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}
        <TextField fullWidth label="Username" value={profile.username} margin="normal" disabled />
        <TextField fullWidth label="Email" value={profile.email ?? ''} margin="normal" disabled helperText="Contact support to change email" />
        <TextField fullWidth label="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} margin="normal" inputProps={{ maxLength: 100 }} />
        <TextField fullWidth label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} margin="normal" />
        <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button variant="contained" onClick={handleSaveProfile} disabled={saving}>{saving ? 'Saving...' : 'Save profile'}</Button>
          <Button variant="outlined" onClick={() => { setPasswordDialog(true); setError(''); setCurrentPassword(''); setNewPassword(''); setConfirmNewPassword(''); }}>Change password</Button>
          <Button variant="outlined" onClick={() => { setRecoveryPinDialog(true); setError(''); setCurrentPassword(''); setNewRecoveryPin(''); }}>Update recovery pin</Button>
        </Box>
      </Paper>

      <Dialog open={passwordDialog} onClose={() => setPasswordDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Change password</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Current password" type={showPasswords ? 'text' : 'password'} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} margin="normal" />
          <TextField
            fullWidth
            label="New password"
            type={showPasswords ? 'text' : 'password'}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            margin="normal"
            inputProps={{ minLength: 8 }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPasswords((v) => !v)} edge="end">{showPasswords ? <VisibilityOff /> : <Visibility />}</IconButton>
                </InputAdornment>
              ),
            }}
          />
          <TextField fullWidth label="Confirm new password" type={showPasswords ? 'text' : 'password'} value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} margin="normal" />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPasswordDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleChangePassword}>Change password</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={recoveryPinDialog} onClose={() => setRecoveryPinDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Update recovery pin</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Enter your password and a new 4-digit recovery pin. The pin is used to reset your password when logged out.</Typography>
          <TextField fullWidth label="Current password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} margin="normal" />
          <TextField
            fullWidth
            label="New recovery pin (4 digits)"
            value={newRecoveryPin}
            onChange={(e) => setNewRecoveryPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
            margin="normal"
            inputProps={{ maxLength: 4, inputMode: 'numeric' }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRecoveryPinDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleUpdateRecoveryPin}>Update recovery pin</Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
}
