import { Router, Request, Response } from 'express';
import db from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// PayDunya configuration
// Set your keys in environment variables:
// PAYDUNYA_MASTER_KEY, PAYDUNYA_PRIVATE_KEY, PAYDUNYA_PUBLIC_KEY, PAYDUNYA_TOKEN
const PAYDUNYA_CONFIG = {
  masterKey: process.env.PAYDUNYA_MASTER_KEY || '',
  privateKey: process.env.PAYDUNYA_PRIVATE_KEY || '',
  publicKey: process.env.PAYDUNYA_PUBLIC_KEY || '',
  token: process.env.PAYDUNYA_TOKEN || '',
  mode: process.env.PAYDUNYA_MODE || 'test',
};

const isPayDunyaConfigured = Boolean(PAYDUNYA_CONFIG.masterKey && PAYDUNYA_CONFIG.privateKey);

/**
 * POST /api/payments/init — Initialize a payment for an order
 */
router.post('/init', requireAuth, async (req: Request, res: Response) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      res.status(400).json({ error: 'ID de commande requis.' });
      return;
    }

    const order = db.prepare('SELECT * FROM orders WHERE id = ? AND user_id = ?').get(orderId, req.user!.userId) as any;
    if (!order) {
      res.status(404).json({ error: 'Commande introuvable.' });
      return;
    }

    if (order.payment_status === 'completed') {
      res.status(400).json({ error: 'Cette commande est déjà payée.' });
      return;
    }

    const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(orderId) as any[];

    // If PayDunya is configured, use real payment
    if (isPayDunyaConfigured) {
      try {
        // Set callback URLs
        const baseUrl = process.env.APP_URL || 'http://localhost:3000';
        const invoiceItems: Record<string, { name: string; quantity: number; unit_price: number; total_price: number }> = {};
        items.forEach((item, index) => {
          invoiceItems[`item_${index + 1}`] = {
            name: item.product_name,
            quantity: item.quantity,
            unit_price: item.price,
            total_price: item.price * item.quantity,
          };
        });
        if (order.delivery_fee > 0) {
          invoiceItems[`item_${Object.keys(invoiceItems).length + 1}`] = {
            name: 'Frais de livraison',
            quantity: 1,
            unit_price: order.delivery_fee,
            total_price: order.delivery_fee,
          };
        }

        const paydunyaBaseUrl = PAYDUNYA_CONFIG.mode.toLowerCase() === 'test'
          ? 'https://app.paydunya.com/sandbox-api/v1'
          : 'https://app.paydunya.com/api/v1';
        const paydunyaResponse = await fetch(`${paydunyaBaseUrl}/checkout-invoice/create`, {
          method: 'POST',
          headers: {
            'PAYDUNYA-MASTER-KEY': PAYDUNYA_CONFIG.masterKey,
            'PAYDUNYA-PRIVATE-KEY': PAYDUNYA_CONFIG.privateKey,
            'PAYDUNYA-TOKEN': PAYDUNYA_CONFIG.token,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            invoice: {
              total_amount: order.total,
              description: `Commande ${order.order_number} - Fido's Shop`,
              items: invoiceItems,
            },
            store: { name: "Fido's Shop" },
            actions: {
              callback_url: `${baseUrl}/api/payments/webhook`,
              return_url: `${baseUrl}?payment=success&order=${order.order_number}`,
              cancel_url: `${baseUrl}?payment=cancelled&order=${order.order_number}`,
            },
          }),
        });
        const paydunyaBody = await paydunyaResponse.json() as { response_code?: string; response_text?: string; token?: string };

        if (paydunyaResponse.ok && paydunyaBody.response_code === '00' && paydunyaBody.token && paydunyaBody.response_text) {
          // Save PayDunya token
          db.prepare('UPDATE orders SET paydunya_token = ? WHERE id = ?').run(paydunyaBody.token, orderId);

          res.json({
            checkoutUrl: paydunyaBody.response_text,
            token: paydunyaBody.token,
            mode: 'paydunya',
          });
        } else {
          res.status(502).json({ error: paydunyaBody.response_text || 'Impossible de créer la facture PayDunya.' });
        }
      } catch (payErr: any) {
        console.error('PayDunya error:', payErr);
        res.status(500).json({ error: 'Erreur PayDunya: ' + payErr.message });
      }
    } else {
      // Simulation mode (no PayDunya keys configured)
      const transactionId = `trx-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const transactionRef = `TRX-${Date.now().toString().slice(-6)}`;
      const operatorRef = `${order.payment_method === 'yass' ? 'TM' : 'MF'}-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;

      // Create transaction in simulation mode
      db.prepare(`
        INSERT INTO transactions (id, transaction_ref, order_id, order_number, user_id, user_name, payer_phone, amount, fees, payment_method, status, operator_ref, description)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?, 'success', ?, ?)
      `).run(
        transactionId, transactionRef, orderId, order.order_number,
        req.user!.userId, order.user_name, order.user_phone,
        order.total, order.payment_method, operatorRef,
        `Paiement ${order.order_number} (simulation)`
      );

      // Mark order as paid
      db.prepare(`
        UPDATE orders SET payment_status = 'completed', order_status = 'paye', transaction_id = ?, updated_at = datetime('now')
        WHERE id = ?
      `).run(transactionId, orderId);

      const transaction = db.prepare('SELECT * FROM transactions WHERE id = ?').get(transactionId);

      res.json({
        mode: 'simulation',
        message: 'Paiement simulé avec succès (PayDunya non configuré).',
        transaction,
      });
    }
  } catch (err: any) {
    console.error('Payment init error:', err);
    res.status(500).json({ error: 'Erreur lors de l\'initialisation du paiement.' });
  }
});

/**
 * POST /api/payments/webhook — PayDunya IPN callback
 */
router.post('/webhook', (req: Request, res: Response) => {
  try {
    const { data } = req.body;

    if (!data || !data.invoice || !data.invoice.token) {
      res.status(400).json({ error: 'Données webhook invalides.' });
      return;
    }

    const paydunyaToken = data.invoice.token;
    const status = data.status;

    // Find the order by PayDunya token
    const order = db.prepare('SELECT * FROM orders WHERE paydunya_token = ?').get(paydunyaToken) as any;
    if (!order) {
      console.warn('Webhook: order not found for token', paydunyaToken);
      res.status(404).json({ error: 'Commande introuvable pour ce token.' });
      return;
    }

    if (status === 'completed') {
      const transactionId = `trx-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const transactionRef = `TRX-${Date.now().toString().slice(-6)}`;

      // Create transaction record
      db.prepare(`
        INSERT INTO transactions (id, transaction_ref, order_id, order_number, user_id, user_name, payer_phone, amount, fees, payment_method, status, paydunya_token, operator_ref, description)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?, 'success', ?, ?, ?)
      `).run(
        transactionId, transactionRef, order.id, order.order_number,
        order.user_id, order.user_name, order.user_phone,
        order.total, order.payment_method, paydunyaToken,
        data.receipt_number || '',
        `Paiement ${order.order_number} via PayDunya`
      );

      // Update order status
      db.prepare(`
        UPDATE orders SET payment_status = 'completed', order_status = 'paye', transaction_id = ?, updated_at = datetime('now')
        WHERE id = ?
      `).run(transactionId, order.id);

      console.log(`✅ Payment completed for order ${order.order_number}`);
    } else if (status === 'failed' || status === 'cancelled') {
      db.prepare(`
        UPDATE orders SET payment_status = 'failed', updated_at = datetime('now') WHERE id = ?
      `).run(order.id);

      // Restore stock
      const items = db.prepare('SELECT product_id, quantity FROM order_items WHERE order_id = ?').all(order.id) as any[];
      const restoreStock = db.prepare('UPDATE products SET stock = stock + ? WHERE id = ?');
      for (const item of items) {
        restoreStock.run(item.quantity, item.product_id);
      }

      console.log(`❌ Payment failed/cancelled for order ${order.order_number}`);
    }

    res.json({ status: 'ok' });
  } catch (err: any) {
    console.error('Webhook error:', err);
    res.status(500).json({ error: 'Erreur webhook.' });
  }
});

/**
 * GET /api/transactions — List transactions
 */
router.get('/transactions', requireAuth, (req: Request, res: Response) => {
  try {
    let transactions: any[];

    if (req.user!.role === 'admin') {
      transactions = db.prepare('SELECT * FROM transactions ORDER BY created_at DESC').all() as any[];
    } else {
      transactions = db.prepare('SELECT * FROM transactions WHERE user_id = ? ORDER BY created_at DESC').all(req.user!.userId) as any[];
    }

    res.json(transactions);
  } catch (err: any) {
    console.error('Get transactions error:', err);
    res.status(500).json({ error: 'Erreur lors de la récupération des transactions.' });
  }
});

export default router;
