import { Router, Request, Response } from 'express';
import db from '../db.js';
import { hashPassword, verifyPassword } from '../utils/hash.js';
import { generateToken, requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();

/**
 * POST /api/auth/register
 */
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password) {
      res.status(400).json({ error: 'Tous les champs sont requis (nom, email, téléphone, mot de passe).' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ error: 'Le mot de passe doit contenir au moins 6 caractères.' });
      return;
    }

    // Check if email already exists
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      res.status(409).json({ error: 'Un compte avec cet email existe déjà.' });
      return;
    }

    const id = `user-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const passwordHash = await hashPassword(password);

    db.prepare(`
      INSERT INTO users (id, name, email, phone, password_hash, role)
      VALUES (?, ?, ?, ?, ?, 'client')
    `).run(id, name.trim(), email.trim().toLowerCase(), phone.trim(), passwordHash);

    const user = db.prepare('SELECT id, name, email, phone, role, avatar, created_at FROM users WHERE id = ?').get(id) as any;

    const token = generateToken({ userId: id, email: user.email, role: user.role });

    res.status(201).json({ user, token });
  } catch (err: any) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Erreur lors de la création du compte.' });
  }
});

/**
 * POST /api/auth/login
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email et mot de passe requis.' });
      return;
    }

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.trim().toLowerCase()) as any;
    if (!user) {
      res.status(401).json({ error: 'Email ou mot de passe incorrect.' });
      return;
    }

    const isValid = await verifyPassword(password, user.password_hash);
    if (!isValid) {
      res.status(401).json({ error: 'Email ou mot de passe incorrect.' });
      return;
    }

    const token = generateToken({ userId: user.id, email: user.email, role: user.role });

    // Don't send password_hash to client
    const { password_hash, ...safeUser } = user;
    res.json({ user: safeUser, token });
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Erreur lors de la connexion.' });
  }
});

/**
 * GET /api/auth/me — Get current user profile
 */
router.get('/me', async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Non authentifié.' });
      return;
    }

    const user = db.prepare('SELECT id, name, email, phone, role, avatar, created_at FROM users WHERE id = ?').get(req.user.userId) as any;
    if (!user) {
      res.status(404).json({ error: 'Utilisateur introuvable.' });
      return;
    }

    res.json({ user });
  } catch (err: any) {
    console.error('Get profile error:', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

/**
 * PUT /api/auth/admin-credentials — Update the authenticated admin credentials
 */
router.put('/admin-credentials', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { currentPassword, email, newPassword } = req.body;
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

    if (!currentPassword || !normalizedEmail) {
      res.status(400).json({ error: 'Le mot de passe actuel et l’email sont requis.' });
      return;
    }
    if (!normalizedEmail.includes('@')) {
      res.status(400).json({ error: 'Veuillez renseigner une adresse email valide.' });
      return;
    }
    if (newPassword && newPassword.length < 8) {
      res.status(400).json({ error: 'Le nouveau mot de passe doit contenir au moins 8 caractères.' });
      return;
    }

    const admin = db.prepare('SELECT * FROM users WHERE id = ? AND role = \'admin\'').get(req.user!.userId) as any;
    if (!admin || !(await verifyPassword(currentPassword, admin.password_hash))) {
      res.status(401).json({ error: 'Le mot de passe actuel est incorrect.' });
      return;
    }

    const existing = db.prepare('SELECT id FROM users WHERE email = ? AND id != ?').get(normalizedEmail, admin.id);
    if (existing) {
      res.status(409).json({ error: 'Cette adresse email est déjà utilisée.' });
      return;
    }

    const passwordHash = newPassword ? await hashPassword(newPassword) : admin.password_hash;
    db.prepare('UPDATE users SET email = ?, password_hash = ?, updated_at = datetime(\'now\') WHERE id = ?')
      .run(normalizedEmail, passwordHash, admin.id);

    const user = db.prepare('SELECT id, name, email, phone, role, avatar, created_at FROM users WHERE id = ?').get(admin.id) as any;
    const token = generateToken({ userId: user.id, email: user.email, role: user.role });
    res.json({ user, token });
  } catch (err: any) {
    console.error('Admin credentials update error:', err);
    res.status(500).json({ error: 'Erreur lors de la mise à jour des identifiants.' });
  }
});

export default router;
