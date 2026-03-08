'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  InputAdornment,
  IconButton,
  FormControlLabel,
  Checkbox,
  Link,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import {
  setStoredUsername,
  setStoredUserId,
  setStoredRole,
  getSavedUsernameForLater,
  setSavedUsernameForLater,
  clearSavedUsernameForLater,
} from '@/lib/auth';
import { apiLogin, apiSignup, apiResetPassword } from '@/lib/api';

type Mode = 'login' | 'signup' | 'reset-password';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [recoveryPin, setRecoveryPin] = useState('');
  const [saveForLater, setSaveForLater] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = getSavedUsernameForLater();
    if (saved) {
      setUsername(saved);
      setSaveForLater(true);
      // Focus password so user can type and press Enter for quick login
      const t = setTimeout(() => passwordInputRef.current?.focus(), 100);
      return () => clearTimeout(t);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    if (!username.trim()) {
      setError('Please enter a username');
      setLoading(false);
      return;
    }
    if (!password) {
      setError('Please enter a password');
      setLoading(false);
      return;
    }
    try {
      const result = await apiLogin(username.trim(), password);
      setStoredUsername(result.username);
      setStoredUserId(result.id);
      setStoredRole(result.role);
      if (saveForLater) {
        setSavedUsernameForLater(result.username);
      } else {
        clearSavedUsernameForLater();
      }
      router.push('/dashboard');
    } catch (err: any) {
      const msg = err.message || 'Failed to login.';
      setError(msg);
      if (msg.toLowerCase().includes('sign up') || msg.toLowerCase().includes('not found')) {
        setMode('signup');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    if (!username.trim()) {
      setError('Please enter a username');
      setLoading(false);
      return;
    }
    if (!password) {
      setError('Please enter a password');
      setLoading(false);
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      setLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }
    if (recoveryPin.length !== 4 || !/^\d{4}$/.test(recoveryPin)) {
      setError('Recovery pin must be exactly 4 digits');
      setLoading(false);
      return;
    }
    try {
      const result = await apiSignup(username.trim(), password, {
        fullName: fullName.trim() || undefined,
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        recoveryPin,
      });
      setStoredUsername(result.username);
      setStoredUserId(result.id);
      setStoredRole(result.role);
      if (saveForLater) {
        setSavedUsernameForLater(result.username);
      } else {
        clearSavedUsernameForLater();
      }
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Sign up failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    if (!email.trim()) {
      setError('Email is required');
      setLoading(false);
      return;
    }
    if (!phone.trim()) {
      setError('Phone is required');
      setLoading(false);
      return;
    }
    if (recoveryPin.length !== 4 || !/^\d{4}$/.test(recoveryPin)) {
      setError('Recovery pin must be exactly 4 digits');
      setLoading(false);
      return;
    }
    if (!password || password.length < 8) {
      setError('New password must be at least 8 characters');
      setLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }
    try {
      await apiResetPassword(email.trim(), phone.trim(), recoveryPin, password);
      setSuccess('Password reset. You can log in now.');
      setMode('login');
      setPassword('');
      setConfirmPassword('');
      setRecoveryPin('');
    } catch (err: any) {
      setError(err.message || 'Reset failed. Check email, phone, and recovery pin.');
    } finally {
      setLoading(false);
    }
  };

  const isLogin = mode === 'login';
  const isReset = mode === 'reset-password';

  return (
    <Container
      maxWidth="sm"
      sx={{
        px: { xs: 1, sm: 2 },
        display: 'flex',
        flexDirection: 'column',
        minHeight: { xs: '100dvh', sm: '100vh' },
      }}
    >
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 2,
        }}
      >
        <Paper elevation={3} sx={{ p: { xs: 2, sm: 4 }, width: '100%' }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            Budget Tracker
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
            {isLogin && 'Log in to your account'}
            {mode === 'signup' && 'Create an account'}
            {isReset && 'Reset your password (you will be logged out)'}
          </Typography>

          {isReset ? (
            <form onSubmit={handleResetPassword}>
              <TextField fullWidth label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} margin="normal" required disabled={loading} />
              <TextField fullWidth label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} margin="normal" placeholder="e.g. +1234567890" required disabled={loading} />
              <TextField
                fullWidth
                label="Recovery pin (4 digits)"
                value={recoveryPin}
                onChange={(e) => setRecoveryPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                margin="normal"
                inputProps={{ maxLength: 4, inputMode: 'numeric' }}
                disabled={loading}
              />
              <TextField
                fullWidth
                label="New password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                margin="normal"
                inputProps={{ minLength: 8 }}
                disabled={loading}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword((v) => !v)} onMouseDown={(e) => e.preventDefault()} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                fullWidth
                label="Confirm new password"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                margin="normal"
                disabled={loading}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowConfirmPassword((v) => !v)} onMouseDown={(e) => e.preventDefault()} edge="end">
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
              {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}
              <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2, py: 1.5 }} disabled={loading}>
                {loading ? 'Resetting...' : 'Reset password'}
              </Button>
              <Box sx={{ textAlign: 'center' }}>
                <Link component="button" type="button" variant="body2" onClick={() => { setMode('login'); setError(''); setSuccess(''); }}>
                  Back to login
                </Link>
              </Box>
            </form>
          ) : (
            <form onSubmit={isLogin ? handleLogin : handleSignup}>
              <TextField
                fullWidth
                label="Username"
                variant="outlined"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                margin="normal"
                autoFocus={!getSavedUsernameForLater()}
                disabled={loading}
                inputProps={{ maxLength: 50, autoComplete: 'username' }}
              />

              {mode === 'signup' && (
                <TextField fullWidth label="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} margin="normal" disabled={loading} inputProps={{ maxLength: 100 }} />
              )}
              {mode === 'signup' && (
                <TextField fullWidth label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} margin="normal" disabled={loading} />
              )}
              {mode === 'signup' && (
                <TextField fullWidth label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} margin="normal" placeholder="e.g. +1234567890" disabled={loading} />
              )}

              <TextField
                fullWidth
                inputRef={passwordInputRef}
                label="Password"
                type={showPassword ? 'text' : 'password'}
                variant="outlined"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                margin="normal"
                disabled={loading}
                inputProps={{ minLength: 8, maxLength: 128, autoComplete: isLogin ? 'current-password' : 'new-password' }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword((v) => !v)} onMouseDown={(e) => e.preventDefault()} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              {mode === 'signup' && (
                <TextField
                  fullWidth
                  label="Recovery pin (4 digits)"
                  value={recoveryPin}
                  onChange={(e) => setRecoveryPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  margin="normal"
                  inputProps={{ maxLength: 4, inputMode: 'numeric' }}
                  helperText="Used to reset password if you forget it"
                  disabled={loading}
                />
              )}

              {!isLogin && (
                <TextField
                  fullWidth
                  label="Confirm password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  variant="outlined"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  margin="normal"
                  disabled={loading}
                  inputProps={{ minLength: 8, maxLength: 128, autoComplete: 'new-password' }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton aria-label={showConfirmPassword ? 'Hide password' : 'Show password'} onClick={() => setShowConfirmPassword((v) => !v)} onMouseDown={(e) => e.preventDefault()} edge="end">
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              )}

              <FormControlLabel
                control={<Checkbox checked={saveForLater} onChange={(e) => setSaveForLater(e.target.checked)} color="primary" />}
                label="Save for later"
                sx={{ mt: 1, display: 'block' }}
              />

              {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
              {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}

              <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2, py: 1.5 }} disabled={loading}>
                {loading ? (isLogin ? 'Logging in...' : 'Signing up...') : isLogin ? 'Login' : 'Sign up'}
              </Button>

              {isLogin && (
                <Box sx={{ textAlign: 'center', mb: 1 }}>
                  <Link component="button" type="button" variant="body2" onClick={() => { setMode('reset-password'); setError(''); setSuccess(''); setEmail(''); setPhone(''); setRecoveryPin(''); setPassword(''); setConfirmPassword(''); }}>
                    Forgot password?
                  </Link>
                </Box>
              )}

              <Box sx={{ textAlign: 'center' }}>
                {isLogin ? (
                  <Typography variant="body2" color="text.secondary">
                    Don&apos;t have an account?{' '}
                    <Link component="button" type="button" variant="body2" onClick={() => { setMode('signup'); setError(''); setConfirmPassword(''); setRecoveryPin(''); }}>
                      Sign up
                    </Link>
                  </Typography>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Already have an account?{' '}
                    <Link component="button" type="button" variant="body2" onClick={() => { setMode('login'); setError(''); setConfirmPassword(''); setRecoveryPin(''); }}>
                      Log in
                    </Link>
                  </Typography>
                )}
              </Box>
            </form>
          )}
        </Paper>
      </Box>

      <Box
        component="footer"
        sx={{
          py: 1.5,
          px: 1,
          borderTop: 1,
          borderColor: 'divider',
        }}
      >
        <Typography variant="caption" color="text.secondary" align="center" display="block">
          Developed by — Rajat Sharma
        </Typography>
        <Typography variant="caption" color="text.secondary" align="center" display="block">
          © {new Date().getFullYear()} Budget Tracker. Contact:{' '}
          <Box component="a" href="mailto:dummyuser@gmail.com" sx={{ color: 'inherit', textDecoration: 'underline' }}>
            dummyuser@gmail.com
          </Box>
        </Typography>
      </Box>
    </Container>
  );
}
