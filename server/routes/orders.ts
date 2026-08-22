import { Router, Request, Response } from 'express';
import db from '../db.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();

/**
 * POST /api/orders — Create a new order (authenticated)
 */
router.post('/', requireAuth, (req: Request, res: Response) => {
  try {
    const { items, shippingAddress, paymentMethod } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ error: 'Le panier est vide.' });
      return;
    }

    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.phone || !shippingAddress.district) {
      res.status(400).json({ error: 'Adresse de livraison incomplète.' });
      return;
    }

    if (!paymentMethod || !['yass', 'flooz'].includes(paymentMethod)) {
      res.status(400).json({ error: 'Méthode de paiement invalide.' });
      return;
    }

    // Calculate totals from DB prices (don't trust client prices)
    let subtotal = 0;
    const validatedItems: any[] = [];

    for (const item of items) {
      const product = db.prepare('SELECT * FROM products WHERE id = ?').get(item.productId) as any;
      if (!product) {
        res.status(400).json({ error: `Produit introuvable : ${item.productId}` });
        return;
      }
      if (product.stock < item.quantity) {
        res.status(400).json({ error: `Stock insuffisant pour "${product.name}" (${product.stock} restants).` });
        return;
      }
      subtotal += product.price * item.quantity;
      validatedItems.push({
        productId: product.id,
        productName: product.name,
        price: product.price,
        quantity: item.quantity,
        image: JSON.parse(product.images || '[]')[0] || '',
      });
    }

    const freeShippingThreshold = 50000;
    const deliveryFee = subtotal >= freeShippingThreshold ? 0 : 1500;
    const total = subtotal + deliveryFee;

    const orderId = `ord-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const orderNumber = `CMD-TG-${Math.floor(100000 + Math.random() * 900000)}`;
    const timestamp = new Date().toISOString();

    // Create order
    db.prepare(`
      INSERT INTO orders (id, order_number, user_id, user_name, user_email, user_phone, subtotal, delivery_fee, total, shipping_address, payment_method, payment_status, order_status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'en_attente', ?, ?)
    `).run(
      orderId, orderNumber,
      req.user!.userId, shippingAddress.fullName, shippingAddress.email || '', shippingAddress.phone,
      subtotal, deliveryFee, total,
      JSON.stringify(shippingAddress),
      paymentMethod,
      timestamp, timestamp
    );

    // Insert order items
    const insertItem = db.prepare(`
      INSERT INTO order_items (order_id, product_id, product_name, price, quantity, image)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    for (const item of validatedItems) {
      insertItem.run(orderId, item.productId, item.productName, item.price, item.quantity, item.image);
    }

    // Reserve stock (deduct)
    const updateStock = db.prepare('UPDATE products SET stock = stock - ? WHERE id = ?');
    for (const item of validatedItems) {
      updateStock.run(item.quantity, item.productId);
    }

    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId) as any;

    res.status(201).json({
      ...order,
      shippingAddress: JSON.parse(order.shipping_address),
      items: validatedItems,
    });
  } catch (err: any) {
    console.error('Create order error:', err);
    res.status(500).json({ error: 'Erreur lors de la création de la commande.' });
  }
});

/**
 * GET /api/orders — List orders (client: own orders, admin: all orders)
 */
router.get('/', requireAuth, (req: Request, res: Response) => {
  try {
    let orders: any[];

    if (req.user!.role === 'admin') {
      orders = db.prepare('SELECT * FROM orders ORDER BY created_at DESC').all() as any[];
    } else {
      orders = db.prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC').all(req.user!.userId) as any[];
    }

    const result = orders.map((o) => {
      const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(o.id);
      return {
        ...o,
        shippingAddress: JSON.parse(o.shipping_address),
        items,
      };
    });

    res.json(result);
  } catch (err: any) {
    console.error('Get orders error:', err);
    res.status(500).json({ error: 'Erreur lors de la récupération des commandes.' });
  }
});

/**
 * PUT /api/orders/:id/status — Update order status (admin only)
 */
router.put('/:id/status', requireAuth, requireAdmin, (req: Request, res: Response) => {
  try {
    const { orderStatus } = req.body;
    const validStatuses = ['en_attente', 'paye', 'en_preparation', 'expediee', 'livree', 'annulee'];

    if (!orderStatus || !validStatuses.includes(orderStatus)) {
      res.status(400).json({ error: 'Statut invalide.' });
      return;
    }

    const result = db.prepare(`
      UPDATE orders SET order_status = ?, updated_at = datetime('now') WHERE id = ?
    `).run(orderStatus, req.params.id);

    if (result.changes === 0) {
      res.status(404).json({ error: 'Commande introuvable.' });
      return;
    }

    // If cancelled, restore stock
    if (orderStatus === 'annulee') {
      const items = db.prepare('SELECT product_id, quantity FROM order_items WHERE order_id = ?').all(req.params.id) as any[];
      const restoreStock = db.prepare('UPDATE products SET stock = stock + ? WHERE id = ?');
      for (const item of items) {
        restoreStock.run(item.quantity, item.product_id);
      }
    }

    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id) as any;
    res.json({ ...order, shippingAddress: JSON.parse(order.shipping_address) });
  } catch (err: any) {
    console.error('Update order status error:', err);
    res.status(500).json({ error: 'Erreur lors de la mise à jour.' });
  }
});

export default router;
