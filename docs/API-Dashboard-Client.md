# 📊 Dashboard Client - Documentation API

## 🎯 Endpoint Principal pour le Dashboard

### **GET** `/api/projets/my-projects`

Récupère tous les projets du client connecté avec statistiques pour le dashboard.

---

## 🔐 Authentification

- **Obligatoire** : Token JWT dans le header `Authorization: Bearer <token>`
- **Rôle requis** : `client` uniquement

---

## 📤 Requête

```javascript
const response = await fetch('/api/projets/my-projects', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${userToken}`,
    'Content-Type': 'application/json'
  }
});

const dashboard = await response.json();
```

---

## 📥 Réponse (200 OK)

```json
{
  "success": true,
  "data": {
    "projets": [
      {
        "id": 1,
        "clientId": 5,
        "amoId": 2,
        "statut": "en_mise_en_relation",
        "description": "Rénovation complète d'une maison de famille...",
        "address": "123 Rue de la Paix",
        "city": "Lyon",
        "postalCode": "69001",
        "budget": 150000,
        "surfaceM2": 120,
        "bedrooms": 3,
        "houseType": "étage",
        "hasLand": true,
        "dateSubmission": "2024-01-15T10:30:00.000Z",
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-20T14:15:00.000Z",
        
        // Champs enrichis automatiquement
        "estEnCours": true,
        "estTermine": false,
        "budgetFormate": "150 000,00 €",
        "dureeJours": 15,
        "adresseComplete": "123 Rue de la Paix, 69001 Lyon",
        
        // Relations
        "amo": {
          "id": 2,
          "firstName": "Marie",
          "lastName": "Martin",
          "email": "marie.martin@experta.fr",
          "telephone": "0234567890"
        },
        "missions": [
          {
            "id": 1,
            "titre": "Étude de faisabilité",
            "statut": "en_cours",
            "createdAt": "2024-01-16T09:00:00.000Z"
          }
        ]
      }
    ],
    "statistiques": {
      "total": 3,
      "enCours": 2,
      "termines": 1,
      "brouillons": 0,
      "budgetTotal": 450000
    }
  },
  "message": "Dashboard client - 3 projet(s) récupéré(s)"
}
```

---

## 📊 Statistiques Disponibles

| Statistique | Description |
|-------------|-------------|
| `total` | Nombre total de projets |
| `enCours` | Projets avec statut : `en_attente_AMO`, `en_mise_en_relation`, `devis_reçus` |
| `termines` | Projets avec statut : `clôturé` |
| `brouillons` | Projets avec statut : `brouillon` |
| `budgetTotal` | Somme de tous les budgets des projets (en euros) |

---

## 🏷️ Statuts des Projets

| Statut | Description | Interface Recommandée |
|--------|-------------|----------------------|
| `brouillon` | Projet en cours de création | Badge gris |
| `en_attente_AMO` | En attente d'assignation d'un AMO | Badge orange |
| `en_mise_en_relation` | AMO assigné, mise en relation en cours | Badge bleu |
| `devis_reçus` | Devis reçus, en attente de validation | Badge violet |
| `clôturé` | Projet terminé | Badge vert |

---

## 🎨 Champs Enrichis pour l'Interface

### **Indicateurs Booléens :**
- `estEnCours` : `true` si le projet est actif (statuts intermédiaires)
- `estTermine` : `true` si statut = `clôturé`

### **Données Formatées :**
- `budgetFormate` : Budget affiché avec symbole € (ex: "150 000,00 €")
- `adresseComplete` : Adresse complète formatée
- `dureeJours` : Nombre de jours depuis la soumission

---

## 🚫 Erreurs Possibles

### **403 Forbidden - Rôle Incorrect**
```json
{
  "success": false,
  "message": "Accès refusé - Seuls les clients peuvent accéder à leur dashboard"
}
```

### **401 Unauthorized - Token Manquant**
```json
{
  "success": false,
  "message": "Token d'accès requis"
}
```

---

## 💡 Exemple d'Usage Frontend

### **React Hook Personnalisé :**

```javascript
import { useState, useEffect } from 'react';

const useDashboardData = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem('jwt_token');
        const response = await fetch('/api/projets/my-projects', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Erreur lors du chargement du dashboard');
        }

        const data = await response.json();
        setDashboard(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  return { dashboard, loading, error };
};

// Utilisation dans un composant
const DashboardClient = () => {
  const { dashboard, loading, error } = useDashboardData();

  if (loading) return <div>Chargement...</div>;
  if (error) return <div>Erreur: {error}</div>;

  return (
    <div>
      <h1>Mon Dashboard</h1>
      
      {/* Statistiques */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>{dashboard.statistiques.total}</h3>
          <p>Projets Total</p>
        </div>
        <div className="stat-card">
          <h3>{dashboard.statistiques.enCours}</h3>
          <p>En Cours</p>
        </div>
        <div className="stat-card">
          <h3>{dashboard.statistiques.termines}</h3>
          <p>Terminés</p>
        </div>
        <div className="stat-card">
          <h3>{dashboard.statistiques.budgetTotal.toLocaleString('fr-FR')} €</h3>
          <p>Budget Total</p>
        </div>
      </div>

      {/* Liste des projets */}
      <div className="projects-list">
        {dashboard.projets.map(projet => (
          <div key={projet.id} className="project-card">
            <h3>{projet.description.substring(0, 50)}...</h3>
            <p>📍 {projet.adresseComplete}</p>
            <p>💰 {projet.budgetFormate}</p>
            <p>⏱️ {projet.dureeJours} jours</p>
            <span className={`status-badge ${projet.statut}`}>
              {projet.statut.replace('_', ' ')}
            </span>
            {projet.amo && (
              <p>👥 AMO: {projet.amo.firstName} {projet.amo.lastName}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
```

---

## 🔄 Autres Endpoints Disponibles

Si vous avez besoin d'endpoints plus spécifiques :

- `GET /api/projets/client/:clientId` - Projets d'un client spécifique (pour admins/AMO)
- `GET /api/projets/status/:statut` - Projets par statut
- `GET /api/projets/:id` - Détails d'un projet spécifique

---

**Votre dashboard client est maintenant prêt côté backend ! 🚀**