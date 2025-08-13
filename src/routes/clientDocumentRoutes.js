const express = require('express');
const router = express.Router();
const clientDocumentController = require('../controllers/clientDocumentController');
const { authenticateToken, authorizeRole, authorizeRoleHidden } = require('../middlewares/authMiddleware');

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
  authorizeRoleHidden(['client']), 
  clientDocumentController.uploadDocuments
);

// ================================================
// ENDPOINT: GET /api/documents
// Description: Liste des documents du client connecté
// Paramètres query optionnels: page, limit, mimeType
// ================================================
router.get('/', 
  authenticateToken, 
  authorizeRoleHidden(['client']), 
  clientDocumentController.getClientDocuments
);

// ================================================
// ROUTES POUR ACCÉDER AUX DOCUMENTS AMO (depuis dashboard client)
// CES ROUTES DOIVENT ÊTRE AVANT LES ROUTES AVEC PARAMÈTRES /:id
// ================================================

// Import du contrôleur de documents génériques
const documentController = require('../controllers/documentController');

// Lister les documents AMO (pour client) - DOIT ÊTRE AVANT /:id
router.get('/amo', 
  authenticateToken, 
  authorizeRoleHidden(['client']), 
  clientDocumentController.getAmoDocuments
);

// Télécharger les documents de l'AMO (pour client)
router.get('/amo/:id/download', 
  authenticateToken, 
  authorizeRoleHidden(['client']), 
  clientDocumentController.downloadDocument
);

// Voir les documents de l'AMO (pour client)
router.get('/amo/:id', 
  authenticateToken, 
  authorizeRoleHidden(['client']), 
  clientDocumentController.getDocumentById
);

// ================================================
// ENDPOINT: GET /api/documents/:id/download
// Description: Téléchargement d'un fichier
// Sécurité: Accès contrôlé par la fonction checkDocumentAccess
// ================================================
router.get('/:id/download', 
  authenticateToken, 
  authorizeRoleHidden(['client', 'AMO']), 
  clientDocumentController.downloadDocument
);

// ================================================
// ENDPOINT: GET /api/documents/:id
// Description: Obtenir les détails d'un document spécifique
// Sécurité: Accès contrôlé par la fonction checkDocumentAccess
// ================================================
router.get('/:id', 
  authenticateToken, 
  authorizeRoleHidden(['client', 'AMO']), 
  clientDocumentController.getDocumentById
);

// ================================================
// ENDPOINT: DELETE /api/documents/:id
// Description: Suppression d'un document (soft delete)
// Sécurité: Accès contrôlé par la fonction checkDocumentAccess
// ================================================
router.delete('/:id', 
  authenticateToken, 
  authorizeRoleHidden(['client']), 
  clientDocumentController.deleteDocument
);

module.exports = router;




