import { Router, Request, Response } from 'express';
import db from '../db.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();

/**
 * GET /api/products — List all products (public)
 */
router.get('/', (req: Request, res: Response) => {
  try {
    const { category, search, featured } = req.query;

    let query = 'SELECT * FROM products';
    const conditions: string[] = [];
    const params: any[] = [];

    if (category && category !== 'tous') {
      conditions.push('category = ?');
      params.push(category);
    }

    if (search) {
      conditions.push('(name LIKE ? OR description LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    if (featured === 'true') {
      conditions.push('is_featured = 1');
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY created_at DESC';

    const products = db.prepare(query).all(...params) as any[];

    // Parse images JSON string and attach reviews
    const result = products.map((p) => {
      const reviews = db.prepare('SELECT * FROM reviews WHERE product_id = ? ORDER BY created_at DESC').all(p.id);
      return {
        ...p,
        images: JSON.parse(p.images || '[]'),
        isFeatured: p.is_featured === 1,
        originalPrice: p.original_price,
        reviews,
      };
    });

    res.json(result);
  } catch (err: any) {
    console.error('Get products error:', err);
    res.status(500).json({ error: 'Erreur lors de la récupération des produits.' });
  }
});

/**
 * GET /api/products/:id — Get single product (public)
 */
router.get('/:id', (req: Request, res: Response) => {
  try {
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id) as any;
    if (!product) {
      res.status(404).json({ error: 'Produit introuvable.' });
      return;
    }

    const reviews = db.prepare('SELECT * FROM reviews WHERE product_id = ? ORDER BY created_at DESC').all(product.id);

    res.json({
      ...product,
      images: JSON.parse(product.images || '[]'),
      isFeatured: product.is_featured === 1,
      originalPrice: product.original_price,
      reviews,
    });
  } catch (err: any) {
    console.error('Get product error:', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

/**
 * POST /api/products — Create product (admin only)
 */
router.post('/', requireAuth, requireAdmin, (req: Request, res: Response) => {
  try {
    const { name, description, price, originalPrice, category, images, stock, badge, isFeatured } = req.body;

    if (!name || price === undefined || stock === undefined) {
      res.status(400).json({ error: 'Nom, prix et stock sont requis.' });
      return;
    }

    const id = `prod-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    db.prepare(`
      INSERT INTO products (id, name, description, price, original_price, category, images, stock, badge, is_featured)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      name.trim(),
      (description || '').trim(),
      Math.round(price),
      Math.round(originalPrice || 0),
      category || 'autre',
      JSON.stringify(images || []),
      Math.round(stock),
      badge || '',
      isFeatured ? 1 : 0
    );

    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(id) as any;

    res.status(201).json({
      ...product,
      images: JSON.parse(product.images || '[]'),
      isFeatured: product.is_featured === 1,
      originalPrice: product.original_price,
      reviews: [],
    });
  } catch (err: any) {
    console.error('Create product error:', err);
    res.status(500).json({ error: 'Erreur lors de la création du produit.' });
  }
});

/**
 * PUT /api/products/:id — Update product (admin only)
 */
router.put('/:id', requireAuth, requireAdmin, (req: Request, res: Response) => {
  try {
    const existing = db.prepare('SELECT id FROM products WHERE id = ?').get(req.params.id);
    if (!existing) {
      res.status(404).json({ error: 'Produit introuvable.' });
      return;
    }

    const { name, description, price, originalPrice, category, images, stock, badge, isFeatured } = req.body;

    db.prepare(`
      UPDATE products SET
        name = COALESCE(?, name),
        description = COALESCE(?, description),
        price = COALESCE(?, price),
        original_price = COALESCE(?, original_price),
        category = COALESCE(?, category),
        images = COALESCE(?, images),
        stock = COALESCE(?, stock),
        badge = COALESCE(?, badge),
        is_featured = COALESCE(?, is_featured),
        updated_at = datetime('now')
      WHERE id = ?
    `).run(
      name?.trim() ?? null,
      description?.trim() ?? null,
      price !== undefined ? Math.round(price) : null,
      originalPrice !== undefined ? Math.round(originalPrice) : null,
      category ?? null,
      images ? JSON.stringify(images) : null,
      stock !== undefined ? Math.round(stock) : null,
      badge ?? null,
      isFeatured !== undefined ? (isFeatured ? 1 : 0) : null,
      req.params.id
    );

    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id) as any;
    const reviews = db.prepare('SELECT * FROM reviews WHERE product_id = ? ORDER BY created_at DESC').all(product.id);

    res.json({
      ...product,
      images: JSON.parse(product.images || '[]'),
      isFeatured: product.is_featured === 1,
      originalPrice: product.original_price,
      reviews,
    });
  } catch (err: any) {
    console.error('Update product error:', err);
    res.status(500).json({ error: 'Erreur lors de la mise à jour.' });
  }
});

/**
 * DELETE /api/products/:id — Delete product (admin only)
 */
router.delete('/:id', requireAuth, requireAdmin, (req: Request, res: Response) => {
  try {
    const result = db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
    if (result.changes === 0) {
      res.status(404).json({ error: 'Produit introuvable.' });
      return;
    }
    res.json({ message: 'Produit supprimé avec succès.' });
  } catch (err: any) {
    console.error('Delete product error:', err);
    res.status(500).json({ error: 'Erreur lors de la suppression.' });
  }
});

/**
 * POST /api/products/:id/reviews — Add review (authenticated)
 */
router.post('/:id/reviews', requireAuth, (req: Request, res: Response) => {
  try {
    const product = db.prepare('SELECT id FROM products WHERE id = ?').get(req.params.id);
    if (!product) {
      res.status(404).json({ error: 'Produit introuvable.' });
      return;
    }

    const { rating, title, comment } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      res.status(400).json({ error: 'Note entre 1 et 5 requise.' });
      return;
    }

    // Check if user has purchased this product
    const hasPurchased = db.prepare(`
      SELECT 1 FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      WHERE oi.product_id = ? AND o.user_id = ? AND o.payment_status = 'completed'
      LIMIT 1
    `).get(req.params.id, req.user!.userId);

    const id = `rev-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const user = db.prepare('SELECT name FROM users WHERE id = ?').get(req.user!.userId) as any;

    db.prepare(`
      INSERT INTO reviews (id, product_id, user_id, user_name, rating, title, comment, is_verified_purchase)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, req.params.id, req.user!.userId, user.name, rating, title || '', comment || '', hasPurchased ? 1 : 0);

    const review = db.prepare('SELECT * FROM reviews WHERE id = ?').get(id);
    res.status(201).json(review);
  } catch (err: any) {
    console.error('Add review error:', err);
    res.status(500).json({ error: 'Erreur lors de l\'ajout de l\'avis.' });
  }
});

export default router;
