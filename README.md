# StockSync - Warehouse Management System

A comprehensive warehouse management system built with React, Node.js, Express, TypeScript, and MongoDB.

## Choix du Framework

### Frontend - React + Vite

**React** a été choisi pour le développement frontend pour les raisons suivantes :
- **Composants réutilisables** : Architecture modulaire permettant de créer des composants réutilisables pour les différentes pages (gestion d'entrepôt, analytics, etc.)
- **Écosystème riche** : Large communauté et nombreuses bibliothèques disponibles (React Router pour la navigation, etc.)
- **Performance** : Virtual DOM pour des mises à jour efficaces de l'interface utilisateur
- **Flexibilité** : Facilite la gestion d'état et l'intégration avec des APIs backend

**Vite** a été sélectionné comme outil de build pour :
- **Développement rapide** : Hot Module Replacement (HMR) instantané pour un développement fluide
- **Build optimisé** : Compilation rapide et bundles optimisés pour la production
- **Configuration minimale** : Setup simple et intuitif

### Backend - Node.js + Express + TypeScript

**Node.js** a été choisi pour :
- **JavaScript unifié** : Utilisation du même langage (JavaScript/TypeScript) côté frontend et backend
- **Performance** : Architecture asynchrone et non-bloquante, idéale pour les opérations I/O
- **Écosystème npm** : Accès à une vaste bibliothèque de packages

**Express** a été sélectionné car :
- **Framework minimaliste** : Léger et flexible pour créer des APIs REST
- **Middleware** : Système de middleware puissant pour l'authentification, CORS, etc.
- **Routage** : Gestion simple et claire des routes API

**TypeScript** a été ajouté pour :
- **Type safety** : Détection d'erreurs à la compilation, réduisant les bugs en production
- **Maintenabilité** : Code plus lisible et facile à maintenir avec des types explicites
- **IntelliSense** : Meilleure expérience de développement avec l'autocomplétion

### Base de données - MongoDB

**MongoDB** a été choisi pour :
- **Flexibilité** : Schéma flexible adapté aux besoins évolutifs d'un système de gestion d'entrepôt
- **Documents JSON** : Structure de données naturelle alignée avec JavaScript/TypeScript
- **Scalabilité** : Facilite la gestion de grandes quantités de données de stock
- **Intégration** : Intégration native avec Node.js via Mongoose

## Fonctionnalités Développées

### 1. Système d'Authentification (JWT)
- **Connexion sécurisée** : Authentification basée sur JWT (JSON Web Tokens)
- **Gestion de session** : Tokens stockés dans localStorage pour maintenir la session utilisateur
- **Sécurité** : Mots de passe hashés avec bcrypt avant stockage en base de données
- **Protection des routes** : Middleware d'authentification protégeant toutes les routes API

### 2. Contrôle d'Accès Basé sur les Rôles (RBAC)
- **6 rôles utilisateurs** :
  - **Admin** : Accès complet à toutes les fonctionnalités
  - **Logistic Admin** : Accès complet à toutes les fonctionnalités
  - **Data Analyst** : Accès uniquement au tableau de bord analytique
  - **Warehouse Supervisor** : Accès à la gestion d'entrepôt uniquement
  - **Préparateur Commandes** : Accès à la préparation de commandes uniquement
  - **Agent Réception** : Accès à la gestion de réception uniquement
- **Protection des pages** : Routes frontend protégées selon le rôle de l'utilisateur
- **Interface adaptative** : Navigation et fonctionnalités affichées selon les permissions

### 3. Gestion d'Entrepôt
- **Gestion multi-entrepôts** : Création et gestion de plusieurs entrepôts
- **Statistiques en temps réel** : Affichage des statistiques de stock mises à jour depuis la base de données
- **Suivi des produits** : Gestion des produits, niveaux de stock, entrées et sorties
- **Interface intuitive** : Interface utilisateur claire pour la gestion quotidienne

### 4. Tableau de Bord Analytique
- **Analyses complètes** : Tableau de bord dédié aux analystes de données
- **Visualisations** : Graphiques et statistiques sur les mouvements de stock
- **Rapports** : Génération de rapports sur les performances des entrepôts

### 5. Gestion des Transfers
- **Transferts inter-entrepôts** : Gestion des transferts de stock entre différents entrepôts
- **Suivi des mouvements** : Historique complet des transferts effectués
- **Validation** : Système de validation pour les transferts

### 6. Système d'Alertes
- **Notifications** : Système d'alertes pour les stocks faibles, transferts en attente, etc.
- **Gestion centralisée** : Interface pour visualiser et gérer toutes les alertes

### 7. Préparation de Commandes
- **Interface dédiée** : Page spécifique pour les préparateurs de commandes
- **Gestion des commandes** : Suivi et préparation des commandes clients

### 8. Gestion de Réception
- **Interface de réception** : Page dédiée aux agents de réception
- **Enregistrement des arrivées** : Gestion des réceptions de marchandises

### 9. Paramètres Utilisateur
- **Gestion du profil** : Page de paramètres pour tous les utilisateurs
- **Configuration** : Personnalisation des préférences utilisateur



##  Features

- **Role-Based Access Control (RBAC)**: Multiple user roles with specific permissions
- **Stock Management**: Track products, stock levels, entries, and exits
- **Warehouse Management**: Manage multiple warehouses with real-time statistics
- **Analytics Dashboard**: Comprehensive analytics for data analysts
- **JWT Authentication**: Secure authentication with token-based access
- **Real-time Statistics**: Live updates from database

##  Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn

##  Installation

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd StockSync_webapp
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:

```env
MONGODB_URI=mongodb://localhost:27017/stocksync
PORT=4000
JWT_SECRET=your_strong_random_secret_key_here
```

### 3. Frontend Setup

```bash
cd ../my-react-app
npm install
```

### 4. Seed the Database

```bash
cd ../backend
npm run seed
```

This will create test users and populate the database with sample data. **Save the generated credentials from the console output!**

##  Running the Application

### Start Backend

```bash
cd backend
npm run dev
```

Backend will run on `http://localhost:4000`

### Start Frontend

```bash
cd my-react-app
npm run dev
```

Frontend will run on `http://localhost:5173`

##  User Roles

- **Admin**: Full access to all pages
- **Logistic Admin**: Full access to all pages
- **Data Analyst**: Access to analytics dashboard only
- **Warehouse Supervisor**: Access to warehouse management only
- **Préparateur Commandes**: Access to order preparation only
- **Agent Réception**: Access to reception management only

##  Project Structure

```
StockSync_webapp/
├── backend/              # Backend API (Node.js + Express + TypeScript)
│   ├── src/
│   │   ├── models/       # MongoDB models
│   │   ├── routes/       # API routes
│   │   ├── middleware/   # Auth middleware
│   │   └── scripts/      # Seed script
│   └── .env             # Environment variables (not in git)
├── my-react-app/         # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   └── utils/        # Utilities and API client
└── README.md
```

##  Security Notes

- **Never commit** `.env` files or `CREDENTIALS.md`
- JWT tokens are stored in localStorage
- Passwords are hashed using bcrypt
- All API routes are protected with authentication middleware



