# 🔔 API Notifications AMO - Documentation Frontend

## 🎯 Vue d'ensemble

Cette documentation décrit le comportement actuel et les possibilités d'intégration pour les notifications AMO suite à la création de projets clients.

---

## ⚡ État Actuel : Notifications Console

### Fonctionnement Backend

Quand un client crée un projet via `POST /api/projets/`, le backend :

1. ✅ **Crée le projet** en base de données
2. 🔍 **Recherche automatiquement** les AMO dans la zone d'intervention
3. 📝 **Affiche dans les logs serveur** une notification détaillée
4. ✅ **Répond au client** avec le projet créé

### Format de Notification Console

```
🔔 NOUVEAU PROJET DISPONIBLE pour 2 AMO(s):
   📍 Lieu: Paris (75001)
   💰 Budget: 150000€
   🏠 Type: maison
   📏 Surface: 120m²
   📧 Client: client@example.com
   🎯 AMO concernés:
      - Jean Dupont (Rénovation Pro)
      - Marie Martin (martin@amo.fr)
   🔗 Projet ID: 15
   ⏰ Créé le: 14/08/2025 à 14:30:25
   ────────────────────────────────────────────────────
```

---

## 🚀 Endpoints API Disponibles

### 1. Création de Projet (Déclenche les Notifications)

**POST** `/api/projets/`

```javascript
// Requête - Utilisateur connecté
{
  "description": "Rénovation complète d'une maison",
  "address": "123 rue de la Paix",
  "city": "Paris",
  "postalCode": "75001",
  "budget": 150000,
  "surfaceM2": 120,
  "bedrooms": 3,
  "houseType": "maison",
  "hasLand": true
}

// OU Requête - Utilisateur anonyme
{
  "description": "Rénovation complète d'une maison",
  "address": "123 rue de la Paix", 
  "city": "Paris",
  "postalCode": "75001",
  "budget": 150000,
  "surfaceM2": 120,
  "bedrooms": 3,
  "houseType": "maison",
  "hasLand": true,
  "clientFirstName": "Jean",
  "clientLastName": "Dupont",
  "clientEmail": "jean@example.com",
  "clientPhone": "0123456789",
  "clientPassword": "motdepasse123"
}
```

**Réponse (201) :**
```json
{
  "success": true,
  "data": {
    "id": 15,
    "clientId": 12,
    "description": "Rénovation complète d'une maison",
    "address": "123 rue de la Paix",
    "city": "Paris", 
    "postalCode": "75001",
    "budget": 150000,
    "surfaceM2": 120,
    "bedrooms": 3,
    "houseType": "maison",
    "hasLand": true,
    "statut": "brouillon",
    "amoId": null,
    "isActive": true,
    "createdAt": "2025-01-15T14:30:25.000Z",
    "updatedAt": "2025-01-15T14:30:25.000Z",
    "client": {
      "id": 12,
      "firstName": "Jean",
      "lastName": "Dupont", 
      "email": "jean@example.com",
      "telephone": "0123456789"
    },
    "amo": null
  },
  "message": "Projet créé avec succès",
  "userCreated": false,
  "accountReady": false
}
```

> **🔔 Important :** À ce moment, les AMO reçoivent automatiquement la notification console côté serveur.

---

## 📋 APIs pour Dashboard AMO

### 2. Récupérer les Projets Disponibles pour un AMO

**GET** `/api/projets/status/brouillon`

**Headers :**
```
Authorization: Bearer <token_amo>
```

**Réponse (200) :**
```json
{
  "success": true,
  "data": [
    {
      "id": 15,
      "clientId": 12,
      "description": "Rénovation complète d'une maison",
      "address": "123 rue de la Paix",
      "city": "Paris",
      "postalCode": "75001", 
      "budget": 150000,
      "surfaceM2": 120,
      "bedrooms": 3,
      "houseType": "maison",
      "hasLand": true,
      "statut": "brouillon",
      "amoId": null,
      "createdAt": "2025-01-15T14:30:25.000Z",
      "client": {
        "id": 12,
        "firstName": "Jean",
        "lastName": "Dupont",
        "email": "jean@example.com",
        "telephone": "0123456789"
      }
    }
  ],
  "message": "3 projet(s) avec le statut brouillon trouvé(s)"
}
```

### 3. Candidater/S'assigner à un Projet

**PUT** `/api/projets/:id`

**Headers :**
```
Authorization: Bearer <token_amo>
```

**Body :**
```json
{
  "amoId": 8,
  "statut": "en_cours"
}
```

**Réponse (200) :**
```json
{
  "success": true,
  "data": {
    "id": 15,
    "amoId": 8,
    "statut": "en_cours",
    // ... autres champs du projet
    "amo": {
      "id": 8,
      "firstName": "Marie",
      "lastName": "Martin",
      "email": "marie@amo.fr",
      "telephone": "0987654321"
    }
  },
  "message": "Projet mis à jour avec succès"
}
```

### 4. Récupérer les Projets d'un AMO

**GET** `/api/projets/amo/:amoId`

**Headers :**
```
Authorization: Bearer <token_amo>
```

---

## 🖥️ Implémentation Frontend Recommandée

### 1. Service API pour AMO

```javascript
// services/amoProjectService.js
import api from './api';

export const amoProjectService = {
  // Récupérer les nouveaux projets disponibles
  async getAvailableProjects() {
    return api.get('/api/projets/status/brouillon');
  },
  
  // S'assigner à un projet
  async assignToProject(projectId, amoId) {
    return api.put(`/api/projets/${projectId}`, {
      amoId,
      statut: 'en_cours'
    });
  },
  
  // Récupérer ses projets en cours
  async getMyProjects(amoId) {
    return api.get(`/api/projets/amo/${amoId}`);
  },
  
  // Filtrer par zone (côté frontend)
  filterByZone(projects, amoZones) {
    return projects.filter(project => 
      amoZones.some(zone => 
        project.postalCode.startsWith(zone)
      )
    );
  }
};
```

### 2. Composant Vue.js - Dashboard AMO

```vue
<template>
  <div class="amo-dashboard">
    <h2>🔔 Nouveaux Projets Disponibles</h2>
    
    <!-- Notifications temps réel -->
    <div v-if="newProjects.length === 0" class="no-projects">
      📭 Aucun nouveau projet dans votre zone d'intervention
    </div>
    
    <!-- Liste des projets -->
    <div v-else class="projects-grid">
      <div 
        v-for="project in filteredProjects" 
        :key="project.id"
        class="project-card"
        :class="{ 'new-project': isRecentProject(project) }"
      >
        <div class="project-header">
          <h3>{{ project.city }} ({{ project.postalCode }})</h3>
          <span v-if="isRecentProject(project)" class="new-badge">🆕 NOUVEAU</span>
        </div>
        
        <div class="project-details">
          <p><strong>📍 Adresse :</strong> {{ project.address }}</p>
          <p><strong>💰 Budget :</strong> {{ formatBudget(project.budget) }}</p>
          <p><strong>📏 Surface :</strong> {{ project.surfaceM2 }}m²</p>
          <p><strong>🏠 Type :</strong> {{ project.houseType }}</p>
          <p><strong>🛏️ Chambres :</strong> {{ project.bedrooms }}</p>
          <p><strong>🌳 Terrain :</strong> {{ project.hasLand ? 'Oui' : 'Non' }}</p>
        </div>
        
        <div class="project-description">
          <p><strong>📝 Description :</strong></p>
          <p>{{ project.description }}</p>
        </div>
        
        <div class="client-info">
          <p><strong>📧 Client :</strong> {{ project.client.firstName }} {{ project.client.lastName }}</p>
          <p><strong>📞 Contact :</strong> {{ project.client.email }}</p>
        </div>
        
        <div class="project-actions">
          <button 
            @click="assignProject(project.id)" 
            :disabled="loading"
            class="btn-assign"
          >
            {{ loading ? '⏳' : '✅' }} M'assigner ce projet
          </button>
          <small>Créé le {{ formatDate(project.createdAt) }}</small>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { amoProjectService } from '../services/amoProjectService';

export default {
  name: 'AmoDashboard',
  data() {
    return {
      newProjects: [],
      loading: false,
      currentAmo: null,
      pollInterval: null
    }
  },
  
  computed: {
    // Filtrer les projets selon la zone d'intervention de l'AMO
    filteredProjects() {
      if (!this.currentAmo?.zoneIntervention) return this.newProjects;
      
      return amoProjectService.filterByZone(
        this.newProjects, 
        this.currentAmo.zoneIntervention
      );
    }
  },
  
  async mounted() {
    this.currentAmo = this.$store.state.user; // ou votre système d'auth
    await this.loadAvailableProjects();
    
    // Polling toutes les 30 secondes pour les nouveaux projets
    this.pollInterval = setInterval(this.loadAvailableProjects, 30000);
  },
  
  beforeUnmount() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
    }
  },
  
  methods: {
    async loadAvailableProjects() {
      try {
        const response = await amoProjectService.getAvailableProjects();
        if (response.data.success) {
          const oldCount = this.newProjects.length;
          this.newProjects = response.data.data;
          
          // Notification si nouveaux projets
          if (this.newProjects.length > oldCount) {
            this.showNotification(
              `🔔 ${this.newProjects.length - oldCount} nouveau(x) projet(s) disponible(s)!`
            );
          }
        }
      } catch (error) {
        console.error('❌ Erreur chargement projets:', error);
      }
    },
    
    async assignProject(projectId) {
      this.loading = true;
      
      try {
        const response = await amoProjectService.assignToProject(
          projectId, 
          this.currentAmo.id
        );
        
        if (response.data.success) {
          this.showNotification('✅ Projet assigné avec succès!');
          
          // Retirer le projet de la liste
          this.newProjects = this.newProjects.filter(p => p.id !== projectId);
          
          // Rediriger vers le projet ou recharger
          this.$router.push(`/projects/${projectId}`);
        }
        
      } catch (error) {
        this.showNotification('❌ ' + (error.response?.data?.message || 'Erreur assignation'));
      } finally {
        this.loading = false;
      }
    },
    
    isRecentProject(project) {
      const now = new Date();
      const created = new Date(project.createdAt);
      const diffMinutes = (now - created) / (1000 * 60);
      return diffMinutes < 60; // Nouveau si créé il y a moins d'1h
    },
    
    formatBudget(budget) {
      return budget ? new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR'
      }).format(budget) : 'Non spécifié';
    },
    
    formatDate(dateString) {
      return new Date(dateString).toLocaleString('fr-FR');
    },
    
    showNotification(message) {
      // Votre système de notification
      this.$toast.success(message);
      // OU alert(message) pour test rapide
    }
  }
}
</script>

<style scoped>
.amo-dashboard {
  padding: 20px;
}

.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.project-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  background: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
}

.project-card:hover {
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
  transform: translateY(-2px);
}

.project-card.new-project {
  border-color: #4CAF50;
  background: linear-gradient(135deg, #f8fff8 0%, #ffffff 100%);
}

.project-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.new-badge {
  background: #4CAF50;
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
}

.project-details, .client-info {
  margin: 15px 0;
}

.project-details p, .client-info p {
  margin: 5px 0;
  font-size: 14px;
}

.project-description {
  background: #f9f9f9;
  padding: 10px;
  border-radius: 4px;
  margin: 15px 0;
}

.project-actions {
  text-align: center;
  margin-top: 20px;
}

.btn-assign {
  background: #4CAF50;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 10px;
}

.btn-assign:hover:not(:disabled) {
  background: #45a049;
}

.btn-assign:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.no-projects {
  text-align: center;
  padding: 40px;
  color: #666;
  font-size: 18px;
}
</style>
```

### 3. Store Vuex/Pinia pour Notifications

```javascript
// stores/notifications.js
export const useNotificationStore = defineStore('notifications', {
  state: () => ({
    newProjectsCount: 0,
    lastCheck: null
  }),
  
  actions: {
    async checkNewProjects() {
      try {
        const response = await amoProjectService.getAvailableProjects();
        const currentCount = response.data.data.length;
        
        if (this.lastCheck && currentCount > this.newProjectsCount) {
          // Il y a de nouveaux projets!
          const newCount = currentCount - this.newProjectsCount;
          
          // Notification navigateur si permission accordée
          if (Notification.permission === 'granted') {
            new Notification('Nouveaux projets Experta', {
              body: `${newCount} nouveau(x) projet(s) dans votre zone`,
              icon: '/favicon.ico',
              tag: 'new-projects'
            });
          }
        }
        
        this.newProjectsCount = currentCount;
        this.lastCheck = Date.now();
        
      } catch (error) {
        console.error('❌ Erreur vérification nouveaux projets:', error);
      }
    },
    
    async startPolling() {
      // Demander permission pour les notifications
      if (Notification.permission === 'default') {
        await Notification.requestPermission();
      }
      
      // Vérifier immédiatement
      await this.checkNewProjects();
      
      // Puis toutes les 30 secondes
      setInterval(this.checkNewProjects, 30000);
    }
  }
});
```

---

## 🔄 Workflow Complet

### 1. Client crée un projet
```
Client → POST /api/projets/ → Projet créé
                           ↓
                    🔔 Notification console AMO
                           ↓
                    Logs serveur mis à jour
```

### 2. AMO consulte les nouveaux projets
```
AMO → GET /api/projets/status/brouillon → Liste projets
                                        ↓
                                Frontend filtre par zone
                                        ↓
                                Affichage + badge "NOUVEAU"
```

### 3. AMO s'assigne le projet
```
AMO → PUT /api/projets/15 {amoId: 8} → Projet assigné
                                     ↓
                              statut = "en_cours"
                                     ↓
                              Retiré de la liste "brouillon"
```

---

## 🎯 Points d'Attention

### ✅ **Fonctionnalités Prêtes**
- ✅ Notification console automatique 
- ✅ Recherche AMO par zone d'intervention
- ✅ API complète pour dashboard AMO
- ✅ Assignation de projets

### 🔄 **Améliorations Possibles**
- 📧 Notifications email automatiques
- 📱 Notifications push temps réel
- 🔔 Système de notifications persistantes en BDD
- 📊 Statistiques de matching AMO/projets

### 🎨 **Côté Frontend**
- 🔄 Polling automatique des nouveaux projets
- 🔔 Notifications navigateur avec permission
- 🎯 Filtrage par zone d'intervention
- 📱 Interface responsive pour mobile
- ⏰ Indicateurs "nouveau projet" avec timer

---

## 🚀 Prêt pour l'Intégration

Le backend est **100% fonctionnel** pour recevoir et traiter les notifications. Le frontend peut immédiatement :

1. **Créer des projets** → Les AMO seront notifiés côté serveur
2. **Consulter les projets disponibles** → API `/api/projets/status/brouillon`  
3. **S'assigner aux projets** → API `PUT /api/projets/:id`
4. **Filtrer par zone** → Logique frontend avec `zoneIntervention`

La notification console actuelle permet de **valider le bon fonctionnement** avant d'implémenter des notifications plus avancées.