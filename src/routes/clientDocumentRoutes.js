const express = require('express');
const router = express.Router();
const clientDocumentController = require('../controllers/clientDocumentController');
const { authenticateToken, authorizeRole } = require('../middlewares/authMiddleware');

// ================================================
// ROUTES DOCUMENTS POUR DASHBOARD CLIENT
// ================================================

// Toutes les routes nécessitent une authentification et le rôle client
// Le middleware authenticateToken vérifie le JWT
// Le middleware authorizeRole(['client']) vérifie que l'utilisateur est un client

// ================================================
// ENDPOINT: POST /api/documents/upload
// Description: Upload de fichiers (multipart/form-data)
// Contraintes: Types autorisés (PDF, DOC, DOCX, JPG, PNG), Taille max 10MB
// ================================================
router.post('/upload', 
  authenticateToken, 
  authorizeRole(['client']), 
  clientDocumentController.uploadDocuments
);

// ================================================
// ENDPOINT: GET /api/documents
// Description: Liste des documents du client connecté
// Paramètres query optionnels: page, limit, mimeType
// ================================================
router.get('/', 
  authenticateToken, 
  authorizeRole(['client']), 
  clientDocumentController.getClientDocuments
);

// ================================================
// ENDPOINT: GET /api/documents/:id/download
// Description: Téléchargement d'un fichier
// Sécurité: Le client ne peut télécharger que ses propres documents
// ================================================
router.get('/:id/download', 
  authenticateToken, 
  authorizeRole(['client']), 
  clientDocumentController.downloadDocument
);

// ================================================
// ENDPOINT: GET /api/documents/:id
// Description: Obtenir les détails d'un document spécifique
// Sécurité: Le client ne peut voir que ses propres documents
// ================================================
router.get('/:id', 
  authenticateToken, 
  authorizeRole(['client']), 
  clientDocumentController.getDocumentById
);

// ================================================
// ENDPOINT: DELETE /api/documents/:id
// Description: Suppression d'un document (soft delete)
// Sécurité: Le client ne peut supprimer que ses propres documents
// ================================================
router.delete('/:id', 
  authenticateToken, 
  authorizeRole(['client']), 
  clientDocumentController.deleteDocument
);

module.exports = router;



