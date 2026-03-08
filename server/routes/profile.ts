import { Router, Request, Response } from 'express';
import {
  getProfile,
  updateProfile,
  changePassword,
  updateRecoveryPinAction,
} from '@/lib/api-auth';
import { requireAuth } from '@/server/middleware/auth';

const router = Router();

router.get('/', requireAuth, async (req: Request, res: Response): Promise<void> => {
  const userId = (req as Request & { userId: string }).userId;
  try {
    const profile = await getProfile(userId);
    if (!profile) {
      res.status(404).json({ error: 'Profile not found' });
      return;
    }
    res.json(profile);
  } catch (e) {
    console.error('Get profile error:', e);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/', requireAuth, async (req: Request, res: Response): Promise<void> => {
  const userId = (req as Request & { userId: string }).userId;
  const body = req.body;
  const fullName = body?.fullName ?? body?.full_name;
  const phone = body?.phone;
  try {
    await updateProfile(userId, {
      full_name: typeof fullName === 'string' ? fullName : undefined,
      phone: typeof phone === 'string' ? phone : undefined,
    });
    const profile = await getProfile(userId);
    res.json(profile ?? {});
  } catch (e) {
    console.error('Update profile error:', e);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/password', requireAuth, async (req: Request, res: Response): Promise<void> => {
  const userId = (req as Request & { userId: string }).userId;
  const currentPassword = req.body?.currentPassword ?? req.body?.current_password;
  const newPassword = req.body?.newPassword ?? req.body?.new_password;
  if (typeof currentPassword !== 'string' || typeof newPassword !== 'string') {
    res.status(400).json({ error: 'Current password and new password are required.' });
    return;
  }
  try {
    const result = await changePassword(userId, currentPassword, newPassword);
    if ('error' in result) {
      res.status(400).json({ error: result.error });
      return;
    }
    res.json({ ok: true });
  } catch (e) {
    console.error('Change password error:', e);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/recovery-pin', requireAuth, async (req: Request, res: Response): Promise<void> => {
  const userId = (req as Request & { userId: string }).userId;
  const currentPassword = req.body?.currentPassword ?? req.body?.current_password;
  const newRecoveryPin = req.body?.newRecoveryPin ?? req.body?.new_recovery_pin;
  if (typeof currentPassword !== 'string' || typeof newRecoveryPin === 'undefined') {
    res.status(400).json({ error: 'Current password and new recovery pin (4 digits) are required.' });
    return;
  }
  try {
    const result = await updateRecoveryPinAction(userId, currentPassword, String(newRecoveryPin));
    if ('error' in result) {
      res.status(400).json({ error: result.error });
      return;
    }
    res.json({ ok: true });
  } catch (e) {
    console.error('Update recovery pin error:', e);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
