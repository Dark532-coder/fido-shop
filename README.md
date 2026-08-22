# 🛍️ Fido's Shop

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
- **Mot de passe** : admin123

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

## 🚀 Déploiement gratuit — Render.com

### Méthode 1 : Déploiement en 1 clic

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

### Méthode 2 : Manuel

1. Créez un compte gratuit sur [render.com](https://render.com)
2. Cliquez **"New +"** → **"Web Service"**
3. Connectez votre dépôt GitHub
4. Remplissez les champs :
   - **Build Command** : `npm install && npm run seed && npm run build`
   - **Start Command** : `npm run server`
   - **Plan** : **Free**
5. Ajoutez la variable d'environnement :
   - `JWT_SECRET` = *(une chaîne aléatoire longue)*
6. Cliquez **"Create Web Service"**

Votre site sera accessible sur `https://fido-shop-xxxx.onrender.com` 🎉

> **Note** : Sur le plan gratuit, l'app s'endort après 15 min d'inactivité et met ~30s à se réveiller au prochain visiteur.

## Licence

MIT
