import { Request, Response } from 'express';
import { loginSchema } from './auth.validation';
import { loginUser } from './auth.service';

export class AuthController {
  static async login(req: Request, res: Response): Promise<void> {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, message: parsed.error.errors[0]?.message || 'Invalid credentials' });
      return;
    }

    try {
      const result = await loginUser(parsed.data);
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(401).json({ success: false, message: error.message || 'Invalid email or password' });
    }
  }

  static async me(req: Request, res: Response): Promise<void> {
    const user = (req as any).user;
    if (!user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    res.status(200).json({ success: true, data: { user } });
  }
}
