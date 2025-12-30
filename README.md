# StockSync - Système de Gestion d'Entrepôt

Un système de gestion d'entrepôt complet construit avec React, Node.js, Express, TypeScript, et MongoDB.

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
  - **Administrateur logistique** : Accès complet à toutes les fonctionnalités
  - **Analyste de données** : Accès uniquement au tableau de bord analytique
  - **Gestionnaire d'entrepot** : Accès à la gestion d'entrepôt uniquement
  - **Préparateur de Commandes** : Accès à la préparation de commandes uniquement
  - **Agent de Réception** : Accès à la gestion de réception uniquement
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

### 5. Administration Logistique
- **Suivi des entrepots** : Affichage des informations sur tous les entrepots
- **Transferts inter-entrepôt** : Gestion des transferts de stock entre différents entrepôts
- **Suivi des utillisateurs** : Suivi de tous les utilisateurs du site (derniere connexion ,statut...)

### 6. Préparation de Commandes
- **Interface dédiée** : Page spécifique pour les préparateurs de commandes
- **Gestion des commandes** : Suivi et préparation des commandes clients

### 7. Gestion de Réception
- **Interface de réception** : Page dédiée aux agents de réception
- **Enregistrement des arrivées** : Gestion des réceptions de marchandises

### 8. Système d'Alertes
- **Notifications** : Système d'alertes pour les stocks faibles, transferts en attente, etc.
- **Gestion centralisée** : Interface pour visualiser et gérer toutes les alertes

### 9. Paramètres Utilisateur
- **Gestion du profil** : Page de paramètres pour tous les utilisateurs
- **Configuration** : Personnalisation des préférences utilisateur


##  Prérequis

- Node.js (v16 or higher)
- MongoDB (local or Atlas)
  (installation link : https://www.mongodb.com/docs/manual/installation/ )
- npm or yarn

##  Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yassin5ee/StockSync.git
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
JWT_SECRET=your strong generated jwt secret
NODE_ENV=development
```

### 3. Frontend Setup

```bash
cd ../my-react-app
npm install
npm install recharts
```
Create a `.env` file in the `my-react-app` directory:

```env
VITE_API_URL=http://localhost:4000
```

### 4. Seed the Database

```bash
cd ../backend
npm run seed
```

This will create test users and populate the database with sample data. **Save the generated credentials from the console output!**

##  Execution de l'application

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


##  Structure du projet

```
StockSync_webapp/
├── backend/                  # API Backend (Node.js + Express + TypeScript)
│   ├── src/
│   │   ├── models/           # Modèles MongoDB
│   │   ├── routes/           # Routes API
│   │   ├── middleware/       # Auth middleware
│   │   └── scripts/          # Seed script
│   └── .env                  # Env vars pour le serveur (DB_URI, PORT, JWT_SECRET...)
├── my-react-app/             # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/       # Composants React
│   │   ├── pages/            # Pages
│   │   └── utils/            # Utilitaires et client API
│   ├── .env                  # Env vars pour le client (VITE_API_URL...)
│   └── vite.config.ts        # Configuration Vite
└── README.md
```

##  Notes de Sécurité
- Les mots de passe sont hashés en utilisant bcrypt
- Toutes les routes API sont protégées par un middleware d'authentification


