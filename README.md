# Fido's Shop

Boutique e-commerce au Togo — Paiement sécurisé T-Money (Yass) & Moov Flooz.

## Stack

- **Frontend** : React 19 + Vite + Tailwind CSS 4
- **Backend** : Express.js + SQLite (better-sqlite3)
- **Auth** : JWT + bcrypt
- **Paiements** : PayDunya (T-Money & Flooz)

## Démarrage rapide

```bash
# Installer les dépendances
npm install

# Créer la base de données et les données de test
npm run seed

# Développement (2 terminaux)
npm run dev          # Frontend (port 3000)
npm run server:dev   # Backend (port 3001)

# Production
npm start            # Build + serveur (port 3001)
```

## Compte administrateur par défaut

- **Email** : admin@fido.tg
- **Mot de passe** : Admin2026!

## Variables d'environnement

Copiez `.env.example` en `.env` et renseignez vos clés :

| Variable | Description |
|----------|-------------|
| `PORT` | Port du serveur (défaut: 3001) |
| `JWT_SECRET` | Clé secrète pour les tokens JWT |
| `PAYDUNYA_MASTER_KEY` | Clé maître PayDunya |
| `PAYDUNYA_PRIVATE_KEY` | Clé privée PayDunya |
| `PAYDUNYA_PUBLIC_KEY` | Clé publique PayDunya |
| `PAYDUNYA_TOKEN` | Token PayDunya |
| `PAYDUNYA_MODE` | `test` ou `live` |

## Déploiement

### Railway (recommandé)

1. Connectez votre dépôt GitHub à [Railway](https://railway.app)
2. Railway détecte automatiquement le `Procfile`
3. Ajoutez les variables d'environnement dans le dashboard
4. Le site sera accessible sur `https://votre-app.up.railway.app`
