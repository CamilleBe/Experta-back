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

### 3. Accepter un Projet (Nouveau endpoint dédié)

**POST** `/api/projets/:id/accept`

**Headers :**
```
Authorization: Bearer <token_amo>
```

**Body :** Aucun (l'AMO est identifié via le token)

**Réponse (200) :**
```json
{
  "success": true,
  "data": {
    "id": 15,
    "amoId": 8,
    "statut": "accepte",
    "description": "Rénovation complète d'une maison",
    "address": "123 rue de la Paix",
    "city": "Paris",
    "postalCode": "75001",
    "budget": 150000,
    "surfaceM2": 120,
    "bedrooms": 3,
    "houseType": "maison",
    "hasLand": true,
    "createdAt": "2025-01-15T14:30:25.000Z",
    "updatedAt": "2025-01-15T15:45:10.000Z",
    "client": {
      "id": 12,
      "firstName": "Jean",
      "lastName": "Dupont",
      "email": "jean@example.com",
      "telephone": "0123456789"
    },
    "amo": {
      "id": 8,
      "firstName": "Marie",
      "lastName": "Martin",
      "email": "marie@amo.fr",
      "telephone": "0987654321",
      "nomEntreprise": "Rénovation Pro"
    },
    "missions": []
  },
  "message": "Projet accepté avec succès! Il apparaît maintenant dans votre dashboard."
}
```

**Erreurs possibles :**
```json
// Projet déjà accepté
{
  "success": false,
  "message": "Ce projet a déjà été accepté par un autre AMO"
}

// Projet non disponible
{
  "success": false, 
  "message": "Ce projet n'est plus disponible"
}
```

### 4. Dashboard AMO - Mes Projets (Nouveau endpoint)

**GET** `/api/projets/my-amo-projects`

**Headers :**
```
Authorization: Bearer <token_amo>
```

**Réponse (200) :**
```json
{
  "success": true,
  "data": {
    "projets": [
      {
        "id": 15,
        "clientId": 12,
        "amoId": 8,
        "description": "Rénovation complète d'une maison",
        "address": "123 rue de la Paix",
        "city": "Paris",
        "postalCode": "75001",
        "budget": 150000,
        "surfaceM2": 120,
        "bedrooms": 3,
        "houseType": "maison",
        "hasLand": true,
        "statut": "accepte",
        "createdAt": "2025-01-15T14:30:25.000Z",
        "updatedAt": "2025-01-15T15:45:10.000Z",
        "client": {
          "id": 12,
          "firstName": "Jean",
          "lastName": "Dupont",
          "email": "jean@example.com",
          "telephone": "0123456789"
        },
        "missions": [],
        "budgetFormate": "150 000,00 €",
        "dureeJours": 2,
        "adresseComplete": "123 rue de la Paix, Paris 75001",
        "nombreMissions": 0
      }
    ],
    "statistiques": {
      "total": 3,
      "acceptes": 1,
      "enCours": 1,
      "termines": 1,
      "chiffreAffairesTotal": 450000,
      "chiffreAffairesRealise": 150000
    },
    "amoInfo": {
      "id": 8,
      "nom": "Marie Martin",
      "entreprise": "Rénovation Pro",
      "email": "marie@amo.fr",
      "zoneIntervention": ["75", "92", "94"]
    }
  },
  "message": "Dashboard AMO - 3 projet(s) récupéré(s)"
}
```

### 5. Récupérer les Projets d'un AMO Spécifique (Admin)

**GET** `/api/projets/amo/:amoId`

**Headers :**
```
Authorization: Bearer <token_amo_ou_admin>
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
  
  // Accepter un projet (nouveau endpoint)
  async acceptProject(projectId) {
    return api.post(`/api/projets/${projectId}/accept`);
  },
  
  // Dashboard AMO - Récupérer mes projets acceptés
  async getMyAMOProjects() {
    return api.get('/api/projets/my-amo-projects');
  },
  
  // Récupérer ses projets en cours (ancien endpoint, pour admin)
  async getProjectsByAMO(amoId) {
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
            @click="acceptProject(project.id)" 
            :disabled="loading"
            class="btn-accept"
          >
            {{ loading ? '⏳' : '✅' }} Accepter ce projet
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
    
    async acceptProject(projectId) {
      this.loading = true;
      
      try {
        const response = await amoProjectService.acceptProject(projectId);
        
        if (response.data.success) {
          this.showNotification('✅ ' + response.data.message);
          
          // Retirer le projet de la liste des projets disponibles
          this.newProjects = this.newProjects.filter(p => p.id !== projectId);
          
          // Rediriger vers le dashboard AMO ou afficher le projet accepté
          this.$router.push('/amo-dashboard');
        }
        
      } catch (error) {
        this.showNotification('❌ ' + (error.response?.data?.message || 'Erreur acceptation'));
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

.btn-accept {
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

.btn-accept:hover:not(:disabled) {
  background: #45a049;
}

.btn-accept:disabled {
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

### 3. Composant Dashboard AMO - Mes Projets Acceptés

```vue
<template>
  <div class="amo-my-projects">
    <header class="dashboard-header">
      <div class="amo-info">
        <h1>📋 Mon Dashboard AMO</h1>
        <p><strong>{{ amoInfo.nom }}</strong> - {{ amoInfo.entreprise }}</p>
        <p>📧 {{ amoInfo.email }}</p>
        <p>🌍 Zones: {{ amoInfo.zoneIntervention?.join(', ') || 'Non spécifiées' }}</p>
      </div>
      
      <div class="stats-grid">
        <div class="stat-card">
          <h3>{{ stats.total }}</h3>
          <p>Total Projets</p>
        </div>
        <div class="stat-card">
          <h3>{{ stats.acceptes }}</h3>
          <p>Acceptés</p>
        </div>
        <div class="stat-card">
          <h3>{{ stats.enCours }}</h3>
          <p>En Cours</p>
        </div>
        <div class="stat-card">
          <h3>{{ stats.termines }}</h3>
          <p>Terminés</p>
        </div>
        <div class="stat-card">
          <h3>{{ formatCurrency(stats.chiffreAffairesTotal) }}</h3>
          <p>CA Total</p>
        </div>
        <div class="stat-card">
          <h3>{{ formatCurrency(stats.chiffreAffairesRealise) }}</h3>
          <p>CA Réalisé</p>
        </div>
      </div>
    </header>

    <div class="projects-section">
      <h2>🏠 Mes Projets</h2>
      
      <div class="filters">
        <select v-model="statusFilter" @change="filterProjects">
          <option value="">Tous les statuts</option>
          <option value="accepte">Acceptés</option>
          <option value="en_cours">En cours</option>
          <option value="termine">Terminés</option>
        </select>
      </div>

      <div v-if="filteredProjects.length === 0" class="no-projects">
        📂 Aucun projet dans cette catégorie
      </div>

      <div v-else class="projects-list">
        <div 
          v-for="project in filteredProjects" 
          :key="project.id"
          class="project-item"
          :class="`status-${project.statut}`"
        >
          <div class="project-header">
            <h3>{{ project.city }} - {{ project.adresseComplete }}</h3>
            <span class="status-badge" :class="`status-${project.statut}`">
              {{ getStatusLabel(project.statut) }}
            </span>
          </div>

          <div class="project-content">
            <div class="project-details">
              <p><strong>💰 Budget :</strong> {{ project.budgetFormate }}</p>
              <p><strong>📏 Surface :</strong> {{ project.surfaceM2 }}m²</p>
              <p><strong>🏠 Type :</strong> {{ project.houseType }}</p>
              <p><strong>🛏️ Chambres :</strong> {{ project.bedrooms }}</p>
              <p><strong>🌳 Terrain :</strong> {{ project.hasLand ? 'Oui' : 'Non' }}</p>
              <p><strong>📋 Missions :</strong> {{ project.nombreMissions }}</p>
            </div>

            <div class="project-description">
              <p><strong>Description :</strong></p>
              <p>{{ project.description }}</p>
            </div>

            <div class="client-info">
              <h4>👤 Informations Client</h4>
              <p><strong>Nom :</strong> {{ project.client.firstName }} {{ project.client.lastName }}</p>
              <p><strong>Email :</strong> {{ project.client.email }}</p>
              <p><strong>Téléphone :</strong> {{ project.client.telephone }}</p>
            </div>
          </div>

          <div class="project-meta">
            <p><small>Accepté il y a {{ project.dureeJours }} jour(s)</small></p>
            <div class="project-actions">
              <button @click="viewProject(project.id)" class="btn-view">
                👁️ Voir détails
              </button>
              <button 
                v-if="project.statut === 'accepte'"
                @click="startProject(project.id)" 
                class="btn-start"
              >
                🚀 Démarrer
              </button>
              <button 
                v-if="project.statut === 'en_cours'"
                @click="completeProject(project.id)" 
                class="btn-complete"
              >
                ✅ Terminer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { amoProjectService } from '../services/amoProjectService';

export default {
  name: 'AmoMyProjects',
  data() {
    return {
      projects: [],
      stats: {},
      amoInfo: {},
      loading: false,
      statusFilter: '',
      refreshInterval: null
    }
  },

  computed: {
    filteredProjects() {
      if (!this.statusFilter) return this.projects;
      return this.projects.filter(p => p.statut === this.statusFilter);
    }
  },

  async mounted() {
    await this.loadMyProjects();
    
    // Rafraîchir toutes les 2 minutes
    this.refreshInterval = setInterval(this.loadMyProjects, 120000);
  },

  beforeUnmount() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  },

  methods: {
    async loadMyProjects() {
      this.loading = true;
      
      try {
        const response = await amoProjectService.getMyAMOProjects();
        
        if (response.data.success) {
          this.projects = response.data.data.projets;
          this.stats = response.data.data.statistiques;
          this.amoInfo = response.data.data.amoInfo;
        }
        
      } catch (error) {
        console.error('❌ Erreur chargement projets AMO:', error);
        this.showNotification('❌ Erreur lors du chargement des projets');
      } finally {
        this.loading = false;
      }
    },

    async startProject(projectId) {
      try {
        // Mettre à jour le statut vers "en_cours"
        const response = await api.put(`/api/projets/${projectId}`, {
          statut: 'en_cours'
        });

        if (response.data.success) {
          this.showNotification('🚀 Projet démarré avec succès!');
          await this.loadMyProjects();
        }
      } catch (error) {
        this.showNotification('❌ ' + (error.response?.data?.message || 'Erreur'));
      }
    },

    async completeProject(projectId) {
      try {
        const response = await api.put(`/api/projets/${projectId}`, {
          statut: 'termine'
        });

        if (response.data.success) {
          this.showNotification('✅ Projet terminé avec succès!');
          await this.loadMyProjects();
        }
      } catch (error) {
        this.showNotification('❌ ' + (error.response?.data?.message || 'Erreur'));
      }
    },

    viewProject(projectId) {
      this.$router.push(`/projects/${projectId}`);
    },

    getStatusLabel(status) {
      const labels = {
        'accepte': '📋 Accepté',
        'en_cours': '🔄 En cours',
        'termine': '✅ Terminé'
      };
      return labels[status] || status;
    },

    formatCurrency(amount) {
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: 0
      }).format(amount || 0);
    },

    filterProjects() {
      // La logique de filtrage est gérée par le computed filteredProjects
    },

    showNotification(message) {
      this.$toast.success(message);
    }
  }
}
</script>

<style scoped>
.amo-my-projects {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.dashboard-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 30px;
  border-radius: 12px;
  margin-bottom: 30px;
}

.amo-info h1 {
  margin: 0 0 10px 0;
}

.amo-info p {
  margin: 5px 0;
  opacity: 0.9;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
  margin-top: 20px;
}

.stat-card {
  background: rgba(255, 255, 255, 0.15);
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  backdrop-filter: blur(10px);
}

.stat-card h3 {
  font-size: 24px;
  margin: 0 0 5px 0;
}

.stat-card p {
  font-size: 14px;
  margin: 0;
  opacity: 0.8;
}

.projects-section h2 {
  color: #333;
  margin-bottom: 20px;
}

.filters {
  margin-bottom: 20px;
}

.filters select {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
}

.projects-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.project-item {
  border: 1px solid #ddd;
  border-radius: 12px;
  padding: 25px;
  background: white;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
}

.project-item:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  transform: translateY(-2px);
}

.project-item.status-accepte {
  border-left: 4px solid #2196F3;
}

.project-item.status-en_cours {
  border-left: 4px solid #FF9800;
}

.project-item.status-termine {
  border-left: 4px solid #4CAF50;
}

.project-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.project-header h3 {
  margin: 0;
  color: #333;
}

.status-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: bold;
  color: white;
}

.status-badge.status-accepte {
  background: #2196F3;
}

.status-badge.status-en_cours {
  background: #FF9800;
}

.status-badge.status-termine {
  background: #4CAF50;
}

.project-content {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

.project-details p, .client-info p {
  margin: 8px 0;
  font-size: 14px;
}

.project-description {
  grid-column: 1 / -1;
  background: #f9f9f9;
  padding: 15px;
  border-radius: 6px;
}

.client-info h4 {
  margin: 0 0 10px 0;
  color: #666;
  font-size: 16px;
}

.project-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 15px;
  border-top: 1px solid #eee;
}

.project-actions {
  display: flex;
  gap: 10px;
}

.btn-view, .btn-start, .btn-complete {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.3s ease;
}

.btn-view {
  background: #6c757d;
  color: white;
}

.btn-view:hover {
  background: #5a6268;
}

.btn-start {
  background: #007bff;
  color: white;
}

.btn-start:hover {
  background: #0056b3;
}

.btn-complete {
  background: #28a745;
  color: white;
}

.btn-complete:hover {
  background: #1e7e34;
}

.no-projects {
  text-align: center;
  padding: 60px 20px;
  color: #666;
  font-size: 18px;
  background: #f8f9fa;
  border-radius: 8px;
}

@media (max-width: 768px) {
  .project-content {
    grid-template-columns: 1fr;
  }
  
  .project-meta {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
```

### 4. Store Vuex/Pinia pour Notifications

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
Client → POST /api/projets/ → Projet créé (statut: "brouillon")
                           ↓
                    🔔 Notification console AMO automatique
                           ↓
                    Logs serveur avec détails projet + AMO zone
```

### 2. AMO consulte les nouveaux projets
```
AMO → GET /api/projets/status/brouillon → Liste projets disponibles
                                        ↓
                                Frontend filtre par zone d'intervention
                                        ↓
                                Affichage + badge "NOUVEAU"
```

### 3. AMO accepte le projet
```
AMO → POST /api/projets/15/accept → Projet accepté (statut: "accepte")
                                  ↓
                           🔔 Log confirmation backend
                                  ↓
                           Projet retiré de la liste "brouillon"
                                  ↓
                           Projet ajouté au dashboard AMO
```

### 4. AMO gère ses projets acceptés
```
AMO → GET /api/projets/my-amo-projects → Dashboard avec tous ses projets
                                       ↓
                                Statistiques CA + projets
                                       ↓
                                Actions: Démarrer / Terminer / Voir détails
```

### 5. Cycle de vie du projet
```
"brouillon" → [AMO accepte] → "accepte" → [AMO démarre] → "en_cours" → [AMO termine] → "termine"
```

---

## 🎯 Points d'Attention

### ✅ **Fonctionnalités Prêtes**
- ✅ Notification console automatique 
- ✅ Recherche AMO par zone d'intervention
- ✅ **Nouveau**: Endpoint dédié pour accepter un projet
- ✅ **Nouveau**: Dashboard AMO complet avec statistiques
- ✅ **Nouveau**: Gestion du cycle de vie des projets
- ✅ API complète pour toutes les étapes

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

Le backend est **100% fonctionnel** avec toutes les nouvelles fonctionnalités. Le frontend peut immédiatement :

1. **Créer des projets** → Les AMO seront notifiés côté serveur
2. **Consulter les projets disponibles** → API `/api/projets/status/brouillon`  
3. **Accepter un projet** → API `POST /api/projets/:id/accept`
4. **Dashboard AMO complet** → API `/api/projets/my-amo-projects`
5. **Gérer le cycle de vie** → Démarrer, terminer les projets
6. **Filtrer par zone** → Logique frontend avec `zoneIntervention`

### 🆕 **Nouveautés Implémentées**

- **Endpoint d'acceptation**: `POST /api/projets/:id/accept` - Plus simple que l'ancien système
- **Dashboard AMO**: `GET /api/projets/my-amo-projects` - Vue complète des projets avec statistiques
- **Statut "accepte"**: Nouveau statut intermédiaire entre "brouillon" et "en_cours"
- **Logs améliorés**: Confirmation détaillée lors de l'acceptation d'un projet
- **Composants frontend**: Code Vue.js complet pour les deux vues (disponibles + dashboard)

Les AMO peuvent maintenant **accepter des projets** et les **garder dans leur dashboard** avec toutes les informations client et les statistiques de leur activité.