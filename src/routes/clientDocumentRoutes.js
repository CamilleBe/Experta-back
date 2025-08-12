const express = require('express');
const router = express.Router();
const clientDocumentController = require('../controllers/clientDocumentController');
const { authenticateToken, authorizeRole } = require('../middlewares/authMiddleware');

// ================================================
// ROUTES DOCUMENTS POUR DASHBOARD CLIENT
// ================================================

// Toutes les routes nécessitent une authentification
// Le middleware authenticateToken vérifie le JWT
// Certaines routes permettent l'accès aux AMO pour le partage de documents

// ================================================
// ENDPOINT: POST /api/documents/upload
// Description: Upload de fichiers (multipart/form-data)
// Contraintes: Types autorisés (PDF, DOC, DOCX, JPG, PNG), Taille max 10MB
// ================================================
router.post('/upload', 
  authenticateToken, 
  authorizeRole(['client', 'AMO']), 
  clientDocumentController.uploadDocuments
);

// ================================================
// ENDPOINT: GET /api/documents
// Description: Liste des documents du client connecté
// Paramètres query optionnels: page, limit, mimeType
// ================================================
router.get('/', 
  authenticateToken, 
  authorizeRole(['client', 'AMO']), 
  clientDocumentController.getClientDocuments
);

// ================================================
// ENDPOINT: GET /api/documents/:id/download
// Description: Téléchargement d'un fichier
// Sécurité: Accès contrôlé par la fonction checkDocumentAccess
// ================================================
router.get('/:id/download', 
  authenticateToken, 
  authorizeRole(['client', 'AMO']), 
  clientDocumentController.downloadDocument
);

// ================================================
// ENDPOINT: GET /api/documents/:id
// Description: Obtenir les détails d'un document spécifique
// Sécurité: Accès contrôlé par la fonction checkDocumentAccess
// ================================================
router.get('/:id', 
  authenticateToken, 
  authorizeRole(['client', 'AMO']), 
  clientDocumentController.getDocumentById
);

// ================================================
// ENDPOINT: DELETE /api/documents/:id
// Description: Suppression d'un document (soft delete)
// Sécurité: Accès contrôlé par la fonction checkDocumentAccess
// ================================================
router.delete('/:id', 
  authenticateToken, 
  authorizeRole(['client', 'AMO']), 
  clientDocumentController.deleteDocument
);

module.exports = router;




