import { Request, Response, NextFunction } from 'express';
import { findUserById } from '@/lib/db/queries/users';

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const userId = (req.headers['x-user-id'] as string)?.trim();
  if (!userId) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  try {
    const user = await findUserById(userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    (req as Request & { userId: string }).userId = userId;
    next();
  } catch (e) {
    console.error('Auth middleware error:', e);
    res.status(500).json({ error: 'Server error' });
  }
}
