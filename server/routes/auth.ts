import { Router, Request, Response } from 'express';
import { login, signup, resetPasswordByEmailPhonePin } from '@/lib/api-auth';

const router = Router();

router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    // Do not log req.body — it contains the plain password. Use only for auth, then discard.
    const username = req.body?.username;
    const password = req.body?.password;
    if (typeof username !== 'string') {
      res.status(400).json({ error: 'Username is required' });
      return;
    }
    if (typeof password !== 'string') {
      res.status(400).json({ error: 'Password is required' });
      return;
    }
    const result = await login(username, password);
    if ('error' in result) {
      const status = result.code === 'USER_NOT_FOUND' ? 404 : 401;
      res.status(status).json({ error: result.error, code: result.code });
      return;
    }
    res.json(result);
  } catch (e) {
    console.error('Login API error:', e);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/signup', async (req: Request, res: Response): Promise<void> => {
  try {
    const username = req.body?.username;
    const password = req.body?.password;
    const fullName = req.body?.fullName ?? req.body?.full_name;
    const email = req.body?.email;
    const phone = req.body?.phone;
    const recoveryPin = req.body?.recoveryPin ?? req.body?.recovery_pin;
    if (typeof username !== 'string') {
      res.status(400).json({ error: 'Username is required' });
      return;
    }
    if (typeof password !== 'string') {
      res.status(400).json({ error: 'Password is required' });
      return;
    }
    const result = await signup(username, password, {
      fullName: typeof fullName === 'string' ? fullName : undefined,
      email: typeof email === 'string' ? email : undefined,
      phone: typeof phone === 'string' ? phone : undefined,
      recoveryPin: typeof recoveryPin === 'string' ? recoveryPin : undefined,
    });
    if ('error' in result) {
      res.status(400).json({ error: result.error });
      return;
    }
    res.json(result);
  } catch (e: any) {
    if (e?.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ error: 'Username already taken. Try logging in or choose another username.' });
      return;
    }
    console.error('Signup API error:', e);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/reset-password', async (req: Request, res: Response): Promise<void> => {
  try {
    const email = req.body?.email;
    const phone = req.body?.phone;
    const recoveryPin = req.body?.recoveryPin ?? req.body?.recovery_pin;
    const newPassword = req.body?.newPassword ?? req.body?.new_password;
    if (typeof email !== 'string' || typeof phone !== 'string' || typeof recoveryPin !== 'string' || typeof newPassword !== 'string') {
      res.status(400).json({ error: 'Email, phone, recovery pin, and new password are required.' });
      return;
    }
    const result = await resetPasswordByEmailPhonePin(email, phone, recoveryPin, newPassword);
    if ('error' in result) {
      res.status(400).json({ error: result.error });
      return;
    }
    res.json(result);
  } catch (e) {
    console.error('Reset password error:', e);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
