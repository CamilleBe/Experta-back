# Documentation API Experta Backend - Pour Développement Frontend

## 📋 Vue d'ensemble

Cette documentation détaille toutes les routes API disponibles pour le frontend, incluant les autorisations, les nouvelles fonctionnalités des dashboards et les récents changements.

### 🔗 Base URL
```
http://localhost:3000/api
```

### 🔐 Authentification
L'API utilise JWT Bearer tokens :
```
Authorization: Bearer <votre_token_jwt>
```

---

## 🛡️ Système d'autorisation

### Rôles utilisateurs
- `client` : Utilisateurs finaux
- `AMO` : Professionnels de l'architecture/maîtrise d'œuvre  
- `partenaire` : Professionnels du bâtiment (plomberie, électricité, etc.)
- `admin` : Administrateurs système

### Middlewares d'autorisation

#### `authenticateToken` (Obligatoire)
- Vérifie la validité du JWT
- Retourne 401 si token manquant ou invalide

#### `authorizeRole(['role1', 'role2'])` (Standard)
- Vérifie que l'utilisateur a un des rôles autorisés
- Retourne 403 si rôle insuffisant

#### `authorizeRoleHidden(['role'])` (Sécurisé) 🆕
- Comme `authorizeRole` mais retourne 404 au lieu de 403
- Utilisé pour les routes sensibles (dashboards)
- Cache l'existence des routes aux utilisateurs non autorisés

#### `optionalAuthenticateToken` (Optionnel)
- Token JWT optionnel
- Permet l'accès anonyme ou authentifié

---

## 👥 Routes Utilisateurs (`/api/users`)

### Authentification & Inscription

| Méthode | Route | Auth | Rôles | Description |
|---------|-------|------|-------|-------------|
| `POST` | `/login` | ❌ | Public | Connexion utilisateur |
| `POST` | `/` | ❌ | Public | Inscription client |
| `POST` | `/register-amo` | ❌ | Public | Inscription AMO |
| `POST` | `/register-partner` | ❌ | Public | Inscription partenaire |

#### Format de connexion
```json
POST /api/users/login
{
  "email": "user@example.com",
  "password": "motdepasse"
}
```

**Réponse:**
```json
{
  "success": true,
  "data": {
    "token": "jwt_token_here",
    "user": {
      "id": 1,
      "email": "user@example.com",
      "role": "client",
      "prenom": "John",
      "nom": "Doe"
    }
  }
}
```

### Gestion des utilisateurs

| Méthode | Route | Auth | Rôles | Description |
|---------|-------|------|-------|-------------|
| `GET` | `/` | ✅ | admin | Liste tous les utilisateurs |
| `GET` | `/:id` | ✅ | Propriétaire ou admin | Détails d'un utilisateur |
| `PUT` | `/:id` | ✅ | Propriétaire ou admin | Modifier un utilisateur |
| `DELETE` | `/:id` | ✅ | admin | Supprimer un utilisateur |

### Recherche de professionnels (Public)

| Méthode | Route | Auth | Rôles | Description |
|---------|-------|------|-------|-------------|
| `GET` | `/professionals/tag/:tag` | ❌ | Public | Professionnels par spécialisation |
| `GET` | `/professionals/zone/:zone` | ❌ | Public | Professionnels par zone |
| `GET` | `/professionals/top` | ❌ | Public | Top professionnels |
| `GET` | `/professionals/stats/popular-tags` | ❌ | Public | Tags métiers populaires |

### Gestion des tags métiers

| Méthode | Route | Auth | Rôles | Description |
|---------|-------|------|-------|-------------|
| `POST` | `/:id/tags-metiers` | ✅ | AMO, partenaire, admin | Ajouter un tag |
| `DELETE` | `/:id/tags-metiers` | ✅ | AMO, partenaire, admin | Supprimer un tag |

---

## 🏗️ Routes Projets (`/api/projets`)

### CRUD de base

| Méthode | Route | Auth | Rôles | Description |
|---------|-------|------|-------|-------------|
| `GET` | `/` | ✅ | admin | Liste tous les projets |
| `POST` | `/` | 🔄 | client ou anonyme | Créer un projet |
| `GET` | `/:id` | ✅ | client, AMO, admin | Détails d'un projet |
| `PUT` | `/:id` | ✅ | client, AMO, admin | Modifier un projet |
| `DELETE` | `/:id` | ✅ | admin, AMO | Supprimer un projet |

### Routes spécialisées

| Méthode | Route | Auth | Rôles | Description |
|---------|-------|------|-------|-------------|
| `GET` | `/my-projects` | ✅ | client | Mes projets (client connecté) |
| `GET` | `/client/:clientId` | ✅ | client, admin | Projets d'un client |
| `GET` | `/amo/:amoId` | ✅ | AMO, admin | Projets d'un AMO |
| `GET` | `/status/:statut` | ✅ | admin, AMO | Projets par statut |

#### 🆕 Création de projet (anonyme/client)
```json
POST /api/projets
{
  "nom": "Rénovation maison",
  "description": "Rénovation complète",
  "budget": 50000,
  "statut": "en_attente"
}
```

---

## 🎯 Routes Missions (`/api/missions`)

### CRUD de base

| Méthode | Route | Auth | Rôles | Description |
|---------|-------|------|-------|-------------|
| `GET` | `/` | ✅ | Tous connectés | Liste des missions |
| `GET` | `/:id` | ✅ | Tous connectés | Détails d'une mission |
| `POST` | `/` | ✅ | AMO, admin | Créer une mission |
| `PUT` | `/:id` | ✅ | AMO, admin | Modifier une mission |
| `DELETE` | `/:id` | ✅ | admin, AMO | Supprimer une mission |

### Routes spécialisées

| Méthode | Route | Auth | Rôles | Description |
|---------|-------|------|-------|-------------|
| `GET` | `/project/:projectId` | ✅ | Tous connectés | Missions d'un projet |
| `GET` | `/status/:statut` | ✅ | Tous connectés | Missions par statut |
| `GET` | `/tag/:tag` | ✅ | Tous connectés | Missions par tag |

### Gestion des tags

| Méthode | Route | Auth | Rôles | Description |
|---------|-------|------|-------|-------------|
| `GET` | `/stats/popular-tags` | ❌ | Public | Tags populaires |
| `POST` | `/:id/tags` | ✅ | AMO, admin | Ajouter un tag à une mission |
| `DELETE` | `/:id/tags` | ✅ | AMO, admin | Supprimer un tag d'une mission |

---

## 📁 Système de Documents

### 📊 Documents Génériques (`/api/documents`)
Routes pour documents métier internes

| Méthode | Route | Auth | Rôles | Description |
|---------|-------|------|-------|-------------|
| `GET` | `/` | ✅ | Tous connectés | Liste des documents |
| `GET` | `/:id` | ✅ | Tous connectés | Détails d'un document |
| `POST` | `/` | ✅ | Tous connectés | Créer un document |
| `PUT` | `/:id` | ✅ | Tous connectés | Modifier un document |
| `DELETE` | `/:id` | ✅ | admin, AMO | Supprimer un document |
| `GET` | `/user/:userId` | ✅ | Tous connectés | Documents d'un utilisateur |
| `GET` | `/type/:type` | ✅ | Tous connectés | Documents par type |

### 📋 Documents Client Dashboard (`/api/client-documents`) 🆕

#### Upload de documents
```json
POST /api/client-documents/upload
Content-Type: multipart/form-data

FormData:
- files: File[] (max 10MB chacun)
- Types autorisés: PDF, DOC, DOCX, JPG, PNG
```

#### Gestion des documents client

| Méthode | Route | Auth | Rôles | Description |
|---------|-------|------|-------|-------------|
| `POST` | `/upload` | ✅ | client (hidden) | Upload fichiers client |
| `GET` | `/` | ✅ | client (hidden) | Mes documents |
| `GET` | `/:id` | ✅ | client, AMO (hidden) | Détails d'un document |
| `GET` | `/:id/download` | ✅ | client, AMO (hidden) | Télécharger un fichier |
| `DELETE` | `/:id` | ✅ | client (hidden) | Supprimer un document |

#### 🔄 Accès croisé aux documents AMO (depuis dashboard client)

| Méthode | Route | Auth | Rôles | Description |
|---------|-------|------|-------|-------------|
| `GET` | `/amo` | ✅ | client (hidden) | Documents AMO visibles |
| `GET` | `/amo/:id` | ✅ | client (hidden) | Détails document AMO |
| `GET` | `/amo/:id/download` | ✅ | client (hidden) | Télécharger document AMO |

---

## 🎛️ Dashboards Spécialisés (Nouveaux)

### 🏢 Dashboard AMO (`/api/amo`) 🆕

**Toutes les routes utilisent `authorizeRoleHidden(['AMO'])` - retournent 404 si pas AMO**

| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| `GET` | `/dashboard` | ✅ (AMO) | Vue d'ensemble dashboard AMO |
| `GET` | `/mes-projets` | ✅ (AMO) | Projets de l'AMO connecté |
| `GET` | `/gestion-missions` | ✅ (AMO) | Gestion des missions |
| `GET` | `/profil` | ✅ (AMO) | Profil AMO |

#### Documents pour AMO
| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| `POST` | `/documents/upload` | ✅ (AMO) | Upload documents AMO |
| `GET` | `/documents/client` | ✅ (AMO) | Documents des clients |
| `GET` | `/documents/client/:id` | ✅ (AMO) | Détails document client |
| `GET` | `/documents/client/:id/download` | ✅ (AMO) | Télécharger document client |
| `GET` | `/documents/partenaire/:id/download` | ✅ (AMO) | Télécharger document partenaire |

### 🔧 Dashboard Partenaire (`/api/partenaire`) 🆕

**Toutes les routes utilisent `authorizeRoleHidden(['partenaire'])` - retournent 404 si pas partenaire**

| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| `GET` | `/dashboard` | ✅ (partenaire) | Vue d'ensemble dashboard partenaire |
| `GET` | `/missions-disponibles` | ✅ (partenaire) | Missions ouvertes |
| `GET` | `/mes-missions` | ✅ (partenaire) | Missions du partenaire |
| `GET` | `/profil` | ✅ (partenaire) | Profil partenaire |

#### Documents pour Partenaire
| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| `POST` | `/documents/upload` | ✅ (partenaire) | Upload documents partenaire |
| `GET` | `/documents/amo` | ✅ (partenaire) | Documents AMO visibles |
| `GET` | `/documents/amo/:id` | ✅ (partenaire) | Détails document AMO |
| `GET` | `/documents/amo/:id/download` | ✅ (partenaire) | Télécharger document AMO |

---

## 🔧 Routes Utilitaires

### Santé de l'API
| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| `GET` | `/` | ❌ | Statut API et version |
| `GET` | `/health` | ❌ | Santé détaillée (DB, mémoire, uptime) |

---

## 📈 Changements Récents (Derniers commits)

### v4 - Dashboard Routing (commit: `4aed47e`)
- ✅ Nouvelles routes dashboard AMO et partenaire
- ✅ Autorisation renforcée avec `authorizeRoleHidden`
- ✅ Accès croisé aux documents entre rôles

### v3 - Consultation Croisée (commit: `2f5b633`)
- ✅ AMO peuvent voir les documents clients
- ✅ Clients peuvent voir les documents AMO
- ✅ Partenaires peuvent voir les documents AMO

### Upload Fonctionnel (commit: `1beb1cd`)
- ✅ Upload multipart/form-data
- ✅ Validation des types de fichiers
- ✅ Limite de taille 10MB

### Corrections Client (commit: `2b8cf2e`)
- ✅ Route `/my-projects` pour les clients connectés
- ✅ Fix affichage documents AMO

---

## 🎨 Format des Réponses

### Réponse Standard
```json
{
  "success": true|false,
  "data": {}, // ou "message": "string" en cas d'erreur,
  "error": "string" // optionnel, en cas d'erreur
}
```

### Réponse d'erreur
```json
{
  "success": false,
  "message": "Description de l'erreur"
}
```

### Pagination
```json
{
  "success": true,
  "data": {
    "items": [],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 45,
      "totalPages": 5
    }
  }
}
```

---

## 🚨 Points d'Attention Frontend

### Sécurité
1. **Hidden Routes**: Les routes dashboard retournent 404 au lieu de 403 pour masquer leur existence
2. **Token Expiration**: Prévoir la gestion de l'expiration JWT
3. **CORS**: Configuré pour les ports de dev (3000, 5173, 8080, etc.)

### Nouvelles Fonctionnalités
1. **Création Projet Anonyme**: Possibilité de créer un projet sans être connecté
2. **Upload Multiple**: Support de plusieurs fichiers simultanément
3. **Accès Croisé**: Les rôles peuvent consulter les documents d'autres rôles selon les règles métier

### Optimisations Recommandées
1. **Cache**: Mettre en cache les listes de professionnels et tags populaires
2. **Lazy Loading**: Charger les documents à la demande
3. **Retry Logic**: Implémenter une logique de retry pour les uploads

---

## 📞 Support & Contact

Pour questions techniques : Voir les contrôleurs dans `src/controllers/` pour les détails d'implémentation.

**Version**: 1.0.0  
**Dernière mise à jour**: Août 2025  
**Environment de dev**: http://localhost:3000