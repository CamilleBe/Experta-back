# 📋 API Documents - Dashboard Client

## 🎯 Vue d'ensemble

API pour la gestion des documents dans le dashboard client. Permet aux clients d'uploader, consulter, télécharger et supprimer leurs documents personnels.

---

## 🔌 Endpoints disponibles

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `POST` | `/api/client-documents/upload` | Upload de fichiers |
| `GET` | `/api/client-documents` | Liste des documents |
| `GET` | `/api/client-documents/:id/download` | Téléchargement |
| `GET` | `/api/client-documents/:id` | Détails d'un document |
| `DELETE` | `/api/client-documents/:id` | Suppression |

---

## 🔐 Authentification

**Toutes les requêtes nécessitent :**
```javascript
{
  "Authorization": "Bearer votre_token_jwt"
}
```

**Restriction :** Seuls les utilisateurs avec le rôle `client` peuvent accéder à ces endpoints.

---

## 📤 1. Upload de documents

### **POST** `/api/client-documents/upload`

**Content-Type :** `multipart/form-data`

**Paramètres :**
- `documents` : Fichier(s) à uploader (max 5 fichiers)

**Contraintes :**
- Types autorisés : PDF, DOC, DOCX, JPG, PNG
- Taille max : 10MB par fichier
- Nombre max : 5 fichiers par requête

**Exemple JavaScript :**
```javascript
const formData = new FormData();
formData.append('documents', file1);
formData.append('documents', file2);

const response = await fetch('/api/client-documents/upload', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});

const result = await response.json();
```

**Réponse (201) :**
```json
{
  "success": true,
  "data": [
    {
      "id": 15,
      "userId": 17,
      "nom": "contrat.pdf",
      "type": "autre",
      "lienFichier": "uploads/client_17/document-1673890123456-123456789.pdf",
      "tailleFichier": 107684,
      "formatFichier": "pdf",
      "nomOriginal": "contrat.pdf", 
      "nomFichier": "document-1673890123456-123456789.pdf",
      "mimeType": "application/pdf",
      "cheminFichier": "uploads/client_17/document-1673890123456-123456789.pdf",
      "isActive": true,
      "createdAt": "2025-01-15T16:11:39.000Z",
      "updatedAt": "2025-01-15T16:11:39.000Z"
    }
  ],
  "message": "1 document(s) uploadé(s) avec succès"
}
```

---

## 📋 2. Liste des documents

### **GET** `/api/client-documents`

**Paramètres query (optionnels) :**
- `page` : Numéro de page (défaut: 1)
- `limit` : Nombre d'éléments par page (défaut: 20)
- `mimeType` : Filtrer par type MIME

**Exemples :**
```
GET /api/client-documents
GET /api/client-documents?page=2&limit=10
GET /api/client-documents?mimeType=application/pdf
```

**Réponse (200) :**
```json
{
  "success": true,
  "data": {
    "documents": [
      {
        "id": 15,
        "userId": 17,
        "nom": "contrat.pdf",
        "type": "autre",
        "lienFichier": "uploads/client_17/document-1673890123456-123456789.pdf",
        "tailleFichier": 107684,
        "formatFichier": "pdf",
        "nomOriginal": "contrat.pdf",
        "nomFichier": "document-1673890123456-123456789.pdf", 
        "mimeType": "application/pdf",
        "cheminFichier": "uploads/client_17/document-1673890123456-123456789.pdf",
        "isActive": true,
        "createdAt": "2025-01-15T16:11:39.000Z",
        "updatedAt": "2025-01-15T16:11:39.000Z",
        "user": {
          "id": 17,
          "firstName": "Jean",
          "lastName": "Dupont",
          "email": "jean@example.com"
        }
      }
    ],
    "statistics": {
      "total": 5,
      "totalSize": 2048576,
      "byType": {
        "PDF": 3,
        "Image JPEG": 1,
        "Document Word": 1
      }
    }
  },
  "pagination": {
    "total": 5,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  },
  "message": "5 document(s) récupéré(s) avec succès"
}
```

---

## 📥 3. Téléchargement d'un document

### **GET** `/api/client-documents/:id/download`

**Paramètres :**
- `id` : ID du document à télécharger

**Sécurité :** Le client ne peut télécharger que ses propres documents.

**Réponse (200) :**
- Le fichier en téléchargement direct
- Headers appropriés pour le téléchargement

**Exemple JavaScript :**
```javascript
const response = await fetch(`/api/client-documents/${documentId}/download`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const blob = await response.blob();
const url = window.URL.createObjectURL(blob);
const link = document.createElement('a');
link.href = url;
link.download = originalFileName;
link.click();
```

---

## 🔍 4. Détails d'un document

### **GET** `/api/client-documents/:id`

**Réponse (200) :**
```json
{
  "success": true,
  "data": {
    "id": 15,
    "userId": 17,
    "nom": "contrat.pdf",
    "type": "autre",
    "lienFichier": "uploads/client_17/document-1673890123456-123456789.pdf",
    "tailleFichier": 107684,
    "formatFichier": "pdf",
    "nomOriginal": "contrat.pdf",
    "nomFichier": "document-1673890123456-123456789.pdf",
    "mimeType": "application/pdf", 
    "cheminFichier": "uploads/client_17/document-1673890123456-123456789.pdf",
    "isActive": true,
    "createdAt": "2025-01-15T16:11:39.000Z",
    "updatedAt": "2025-01-15T16:11:39.000Z",
    "user": {
      "id": 17,
      "firstName": "Jean",
      "lastName": "Dupont",
      "email": "jean@example.com"
    }
  },
  "message": "Document récupéré avec succès"
}
```

---

## 🗑️ 5. Suppression d'un document

### **DELETE** `/api/client-documents/:id`

**Sécurité :** Le client ne peut supprimer que ses propres documents.

**Note :** Suppression douce (soft delete), le fichier physique est conservé.

**Réponse (200) :**
```json
{
  "success": true,
  "message": "Document supprimé avec succès"
}
```

---

## ⚠️ Gestion d'erreurs

### **Erreurs courantes :**

**403 - Accès refusé :**
```json
{
  "success": false,
  "message": "Accès refusé - Seuls les clients peuvent uploader des documents"
}
```

**400 - Fichier trop volumineux :**
```json
{
  "success": false,
  "message": "Fichier trop volumineux (max 10MB)"
}
```

**400 - Type non autorisé :**
```json
{
  "success": false,
  "message": "Type de fichier non autorisé. Types acceptés: PDF, DOC, DOCX, JPG, PNG"
}
```

**404 - Document non trouvé :**
```json
{
  "success": false,
  "message": "Document non trouvé"
}
```

**401 - Non authentifié :**
```json
{
  "success": false,
  "message": "Token manquant"
}
```

---

## 💡 Code exemple complet

### **Composant Vue.js pour upload :**

```vue
<template>
  <div class="document-upload">
    <div 
      class="dropzone"
      @dragover.prevent
      @drop="handleDrop"
      @click="$refs.fileInput.click()"
    >
      <input 
        ref="fileInput"
        type="file"
        multiple
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
        @change="handleFileSelect"
        style="display: none"
      />
      <p>Glisser-déposer vos fichiers ou cliquer pour choisir</p>
      <small>PDF, DOC, DOCX, JPG, PNG (max 10MB)</small>
    </div>
    
    <div v-if="selectedFiles.length" class="selected-files">
      <h4>Fichiers sélectionnés :</h4>
      <div v-for="(file, index) in selectedFiles" :key="index">
        {{ file.name }} ({{ formatSize(file.size) }})
        <button @click="removeFile(index)">Supprimer</button>
      </div>
      <button @click="uploadFiles" :disabled="uploading">
        {{ uploading ? 'Upload...' : 'Uploader' }}
      </button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      selectedFiles: [],
      uploading: false
    }
  },
  methods: {
    handleDrop(e) {
      e.preventDefault();
      const files = Array.from(e.dataTransfer.files);
      this.addFiles(files);
    },
    
    handleFileSelect(e) {
      const files = Array.from(e.target.files);
      this.addFiles(files);
    },
    
    addFiles(files) {
      const validFiles = files.filter(file => {
        if (file.size > 10 * 1024 * 1024) {
          alert(`${file.name} est trop volumineux (max 10MB)`);
          return false;
        }
        return true;
      });
      
      this.selectedFiles = [...this.selectedFiles, ...validFiles];
    },
    
    removeFile(index) {
      this.selectedFiles.splice(index, 1);
    },
    
    async uploadFiles() {
      if (!this.selectedFiles.length) return;
      
      this.uploading = true;
      
      try {
        const formData = new FormData();
        this.selectedFiles.forEach(file => {
          formData.append('documents', file);
        });
        
        const response = await this.$api.post('/api/client-documents/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        
        if (response.data.success) {
          alert(`${response.data.data.length} document(s) uploadé(s)`);
          this.selectedFiles = [];
          this.$emit('upload-success');
        }
        
      } catch (error) {
        alert(error.response?.data?.message || 'Erreur upload');
      } finally {
        this.uploading = false;
      }
    },
    
    formatSize(bytes) {
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      if (bytes === 0) return '0 Bytes';
      const i = Math.floor(Math.log(bytes) / Math.log(1024));
      return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    }
  }
}
</script>
```

### **Service API :**

```javascript
// documentService.js
import api from './api';

export const documentService = {
  // Upload de documents
  async upload(files) {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('documents', file);
    });
    
    return api.post('/api/client-documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  // Liste des documents
  async getAll(params = {}) {
    return api.get('/api/client-documents', { params });
  },

  // Télécharger un document
  async download(id) {
    return api.get(`/api/client-documents/${id}/download`, {
      responseType: 'blob'
    });
  },

  // Détails d'un document
  async getById(id) {
    return api.get(`/api/client-documents/${id}`);
  },

  // Supprimer un document
  async delete(id) {
    return api.delete(`/api/client-documents/${id}`);
  }
};
```

---

## 🚀 Statut

✅ **Backend opérationnel** - Prêt pour intégration frontend  
✅ **Table documents étendue** - Nouveaux champs ajoutés  
✅ **Sécurité implémentée** - Isolation des données clients  
✅ **Validation complète** - Types, tailles, permissions  
✅ **Logs optimisés** - Messages clairs et concis

