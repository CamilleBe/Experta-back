# 📋 Documentation API - Formulaire de Création de Projet

## 🎯 Endpoint pour le Formulaire de Page d'Accueil

### **POST** `/api/projets`

Créer un nouveau projet via le formulaire de la page d'accueil.

---

## 🔐 Authentification - FLEXIBLE

### **Deux modes de fonctionnement :**

#### 1. 👤 **Utilisateur Connecté (Client)**
- **Header requis** : `Authorization: Bearer <token>`
- **Condition** : L'utilisateur doit avoir le rôle `client`
- **Comportement** : Le projet sera automatiquement assigné au client connecté

#### 2. 🌐 **Utilisateur Anonyme (Non Connecté)**
- **Header** : Aucun token requis
- **Condition** : Fournir les informations client dans le formulaire
- **Comportement** : 
  - Si l'email existe déjà → Assigne le projet à ce client
  - Si l'email n'existe pas → Crée un nouveau compte client automatiquement

> ⚠️ **Important** : Les utilisateurs connectés avec d'autres rôles (AMO, admin) ne peuvent pas créer de projets via ce formulaire.

---

## 📝 Champs du Formulaire

### **Champs Obligatoires - Projet**

| Champ | Type | Validation | Description |
|-------|------|------------|-------------|
| `description` | `string` | 10-5000 caractères | Description détaillée du projet |
| `address` | `string` | 5-255 caractères | Adresse complète du projet |
| `city` | `string` | 2-100 caractères | Ville du projet |
| `postalCode` | `string` | 5 chiffres exactement | Code postal français |

### **Champs Obligatoires - Client (Utilisateurs NON connectés uniquement)**

| Champ | Type | Validation | Description |
|-------|------|------------|-------------|
| `clientFirstName` | `string` | 2-50 caractères | Prénom du client |
| `clientLastName` | `string` | 2-50 caractères | Nom du client |
| `clientEmail` | `string` | Format email valide | Email du client |
| `clientPhone` | `string` | Numéro français valide | Téléphone du client |

### **Champs Optionnels - Projet**

| Champ | Type | Validation | Description |
|-------|------|------------|-------------|
| `budget` | `number` | ≥ 0 | Budget estimé en euros |
| `surfaceM2` | `integer` | ≥ 1 | Surface en mètres carrés |
| `bedrooms` | `integer` | ≥ 0 | Nombre de chambres |
| `houseType` | `enum` | 'plain-pied', 'étage', 'autre' | Type de maison |
| `hasLand` | `boolean` | true/false | Terrain inclus dans le projet |

---

## 📤 Exemples de Requêtes

### **1. Utilisateur Connecté (Client)**

```javascript
// Données minimales pour client connecté
const projetDataConnected = {
  description: "Rénovation complète d'une maison de famille avec extension moderne. Nous souhaitons ouvrir l'espace de vie et moderniser la cuisine.",
  address: "123 Rue de la Paix",
  city: "Lyon",
  postalCode: "69001"
};

// Requête avec token d'authentification
const response = await fetch('/api/projets', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${userToken}` // Token requis
  },
  body: JSON.stringify(projetDataConnected)
});
```

### **2. Utilisateur Anonyme (Non Connecté)**

```javascript
// Données pour utilisateur anonyme (inclut les infos client)
const projetDataAnonymous = {
  // Informations du projet
  description: "Construction d'une maison contemporaine avec jardin paysager. Recherche d'un style architectural moderne.",
  address: "456 Avenue des Champs",
  city: "Marseille",
  postalCode: "13001",
  budget: 250000,
  surfaceM2: 150,
  bedrooms: 4,
  houseType: "étage",
  hasLand: true,
  
  // Informations du client (OBLIGATOIRES pour anonymes)
  clientFirstName: "Jean",
  clientLastName: "Dupont",
  clientEmail: "jean.dupont@email.com",
  clientPhone: "0123456789"
};

// Requête sans token d'authentification
const response = await fetch('/api/projets', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
    // Pas d'Authorization header
  },
  body: JSON.stringify(projetDataAnonymous)
});
```

---

## 📥 Réponses de l'API

### ✅ **Succès (201 Created)**

#### **Client Connecté :**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "clientId": 5,
    "description": "Rénovation complète d'une maison...",
    "address": "123 Rue de la Paix",
    "city": "Lyon",
    "postalCode": "69001",
    "budget": 150000,
    "surfaceM2": 120,
    "bedrooms": 3,
    "houseType": "étage",
    "hasLand": true,
    "statut": "brouillon",
    "isActive": true,
    "dateSubmission": "2024-01-15T10:30:00.000Z",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z",
    "client": {
      "id": 5,
      "firstName": "Jean",
      "lastName": "Dupont",
      "email": "jean.dupont@email.com",
      "telephone": "0123456789"
    },
    "amo": null
  },
  "message": "Projet créé avec succès",
  "userCreated": false,
  "needsPasswordSetup": false
}
```

#### **Utilisateur Anonyme (Nouveau compte créé) :**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "clientId": 6,
    "description": "Construction d'une maison contemporaine...",
    "address": "456 Avenue des Champs",
    "city": "Marseille",
    "postalCode": "13001",
    "budget": 250000,
    "surfaceM2": 150,
    "bedrooms": 4,
    "houseType": "étage",
    "hasLand": true,
    "statut": "brouillon",
    "isActive": true,
    "dateSubmission": "2024-01-15T10:35:00.000Z",
    "createdAt": "2024-01-15T10:35:00.000Z",
    "updatedAt": "2024-01-15T10:35:00.000Z",
    "client": {
      "id": 6,
      "firstName": "Jean",
      "lastName": "Dupont",
      "email": "jean.dupont@email.com",
      "telephone": "0123456789"
    },
    "amo": null
  },
  "message": "Projet créé avec succès",
  "userCreated": true,
  "needsPasswordSetup": true
}
```

### ❌ **Erreurs de Validation (400 Bad Request)**

#### **Erreurs Projet (tous utilisateurs) :**
```json
{
  "success": false,
  "message": "Erreurs de validation",
  "errors": [
    "La description du projet est obligatoire",
    "L'adresse du projet est obligatoire",
    "Le code postal doit contenir exactement 5 chiffres"
  ]
}
```

#### **Erreurs Client (utilisateurs anonymes) :**
```json
{
  "success": false,
  "message": "Erreurs de validation",
  "errors": [
    "Le prénom du client est obligatoire",
    "L'email du client est obligatoire",
    "L'email doit être valide",
    "Le numéro de téléphone doit être un numéro français valide"
  ]
}
```

### 🚫 **Erreurs d'Autorisation (403 Forbidden)**

#### **Utilisateur connecté non-client :**
```json
{
  "success": false,
  "message": "Accès refusé - Seuls les clients peuvent créer des projets"
}
```

### 🔄 **Conflit Email (409 Conflict)**

#### **Email existe avec rôle différent :**
```json
{
  "success": false,
  "message": "Un compte avec cet email existe déjà mais n'est pas un compte client. Veuillez vous connecter."
}
```

---

## 🎨 Recommandations pour le Frontend

### **1. Validation côté Client**
- Implémenter la même validation que le backend pour une meilleure UX
- Afficher les erreurs en temps réel pendant la saisie
- Désactiver le bouton submit si les champs obligatoires ne sont pas remplis

### **2. Gestion des États**
```javascript
const [formData, setFormData] = useState({
  description: '',
  address: '',
  city: '',
  postalCode: '',
  budget: '',
  surfaceM2: '',
  bedrooms: '',
  houseType: '',
  hasLand: false
});

const [errors, setErrors] = useState({});
const [isSubmitting, setIsSubmitting] = useState(false);
```

### **3. Types de Champs Recommandés**
- `description` : Textarea avec compteur de caractères
- `address` : Input text avec autocomplétion possible
- `city` : Input text
- `postalCode` : Input text avec masque de saisie (12345)
- `budget` : Input number avec formatage euros
- `surfaceM2` : Input number 
- `bedrooms` : Select ou input number
- `houseType` : Select avec options fixes
- `hasLand` : Checkbox ou toggle

### **4. Gestion d'Erreurs**
```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  setIsSubmitting(true);
  setErrors({});

  try {
    const response = await fetch('/api/projets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(formData)
    });

    const result = await response.json();

    if (!response.ok) {
      if (result.errors) {
        // Afficher les erreurs de validation
        setErrors(result.errors);
      } else {
        // Erreur générale
        alert(result.message);
      }
      return;
    }

    // Succès - rediriger ou afficher confirmation
    console.log('Projet créé:', result.data);
    
  } catch (error) {
    console.error('Erreur réseau:', error);
    alert('Erreur de connexion. Veuillez réessayer.');
  } finally {
    setIsSubmitting(false);
  }
};
```

---

## 🔄 États du Projet

Après création, le projet aura automatiquement :
- **Statut** : `brouillon`
- **Client assigné** : L'utilisateur connecté
- **AMO** : `null` (sera assigné plus tard)
- **Actif** : `true`

---

## 📞 Support

Pour toute question sur l'intégration de cette API, référez-vous aux fichiers sources :
- `src/controllers/projetController.js`
- `src/middlewares/validateProject.js`
- `src/routes/projetRoutes.js`
- `src/models/Projet.js`