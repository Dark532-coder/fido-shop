/**
 * Seed script — Crée un compte administrateur par défaut
 * Usage: npx tsx server/seed.ts
 */
import 'dotenv/config';
import db from './db.js';
import { hashPassword } from './utils/hash.js';

async function seed() {
  console.log('🌱 Seed Fido\'s Shop...');

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminEmail || !adminPassword) {
    throw new Error('ADMIN_EMAIL et ADMIN_PASSWORD doivent être définis avant le seed.');
  }

  // Create admin user
  const existingAdmin = db.prepare('SELECT id FROM users WHERE role = \'admin\' ORDER BY created_at LIMIT 1').get() as { id: string } | undefined;
  const hash = await hashPassword(adminPassword);
  if (!existingAdmin) {
    db.prepare(`
      INSERT INTO users (id, name, email, phone, password_hash, role)
      VALUES (?, ?, ?, ?, ?, 'admin')
    `).run('user-admin-001', 'Administrateur Fido', adminEmail, '90000000', hash);
    console.log(`  ✅ Admin créé : ${adminEmail}`);
  } else {
    db.prepare(`
      UPDATE users
      SET email = ?, password_hash = ?, role = 'admin', updated_at = datetime('now')
      WHERE id = ?
    `).run(adminEmail, hash, existingAdmin.id);
    console.log(`  ✅ Identifiants admin synchronisés : ${adminEmail}`);
  }

  // Create sample products
  const productCount = (db.prepare('SELECT COUNT(*) as c FROM products').get() as any).c;
  if (productCount === 0) {
    const products = [
      { id: 'prod-001', name: 'T-Shirt Ankara Premium', description: 'T-shirt en tissu wax authentique, coupe moderne. Fabriqué à Lomé.', price: 8500, originalPrice: 12000, category: 'mode', stock: 25, badge: 'Bestseller', isFeatured: 1, images: '["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&auto=format&fit=crop&q=80"]' },
      { id: 'prod-002', name: 'Écouteurs Bluetooth Pro', description: 'Écouteurs sans fil avec réduction de bruit active. Autonomie 24h.', price: 15000, originalPrice: 22000, category: 'electronique', stock: 15, badge: '-32%', isFeatured: 1, images: '["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80"]' },
      { id: 'prod-003', name: 'Beurre de Karité Bio', description: 'Beurre de karité 100% naturel du Togo. Hydratation intense pour peau et cheveux.', price: 3500, originalPrice: 0, category: 'beaute', stock: 50, badge: 'Bio', isFeatured: 0, images: '["https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=600&auto=format&fit=crop&q=80"]' },
      { id: 'prod-004', name: 'Sneakers Urban Togo', description: 'Baskets légères et confortables. Semelle en mousse mémoire.', price: 18500, originalPrice: 25000, category: 'chaussures', stock: 10, badge: 'Nouveau', isFeatured: 1, images: '["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80"]' },
      { id: 'prod-005', name: 'Lampe Solaire LED', description: 'Lampe rechargeable à énergie solaire. Idéale pour les coupures de courant.', price: 6000, originalPrice: 8000, category: 'maison', stock: 30, badge: 'Éco', isFeatured: 0, images: '["https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=600&auto=format&fit=crop&q=80"]' },
      { id: 'prod-006', name: 'Pâte d\'Arachide Togolaise', description: 'Pâte d\'arachide artisanale, 100% arachides torréfiées. 500g.', price: 2000, originalPrice: 0, category: 'alimentation', stock: 100, badge: 'Local', isFeatured: 0, images: '["https://images.unsplash.com/photo-1612187209128-984be79a7d2e?w=600&auto=format&fit=crop&q=80"]' },
    ];

    const insert = db.prepare(`
      INSERT INTO products (id, name, description, price, original_price, category, stock, badge, is_featured, images)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const p of products) {
      insert.run(p.id, p.name, p.description, p.price, p.originalPrice, p.category, p.stock, p.badge, p.isFeatured, p.images);
    }
    console.log(`  ✅ ${products.length} produits créés.`);
  } else {
    console.log(`  ⏭️  ${productCount} produits existent déjà.`);
  }

  console.log('🎉 Seed terminé !');
}

seed().catch(console.error);
