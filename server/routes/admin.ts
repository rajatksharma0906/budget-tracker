import { Router, Request, Response } from 'express';
import { requireAuth } from '@/server/middleware/auth';
import { requireAdmin, adminListUsers, adminResetUserPassword } from '@/lib/api-auth';

const router = Router();

router.get('/users', requireAuth, async (req: Request, res: Response): Promise<void> => {
  const userId = (req as Request & { userId: string }).userId;
  const forbidden = await requireAdmin(userId);
  if (forbidden) {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }
  try {
    const users = await adminListUsers();
    res.json(users);
  } catch (e) {
    console.error('Admin list users error:', e);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/users/:id/reset-password', requireAuth, async (req: Request, res: Response): Promise<void> => {
  const adminUserId = (req as Request & { userId: string }).userId;
  const targetUserId = req.params?.id;
  const newPassword = req.body?.newPassword ?? req.body?.new_password;
  const forbidden = await requireAdmin(adminUserId);
  if (forbidden) {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }
  if (!targetUserId || typeof newPassword !== 'string') {
    res.status(400).json({ error: 'User ID and new password are required.' });
    return;
  }
  try {
    const result = await adminResetUserPassword(adminUserId, targetUserId, newPassword);
    if ('error' in result) {
      res.status(400).json({ error: result.error });
      return;
    }
    res.json({ ok: true });
  } catch (e) {
    console.error('Admin reset password error:', e);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
