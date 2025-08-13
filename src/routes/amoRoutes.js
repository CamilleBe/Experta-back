const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRole, authorizeRoleHidden } = require('../middlewares/authMiddleware');

// ================================================
// ROUTES DASHBOARD AMO
// ================================================

// Routes spécifiques pour les AMO
// Seuls les AMO ont accès à ces routes

// Dashboard AMO - vue d'ensemble
router.get('/dashboard', 
  authenticateToken, 
  authorizeRoleHidden(['AMO']), 
  (req, res) => {
    // Contrôleur à implémenter pour le dashboard AMO
    res.json({
      success: true,
      message: 'Dashboard AMO accessible',
      data: {
        userId: req.user.id,
        role: req.user.role
      }
    });
  }
);

// Mes projets AMO
router.get('/mes-projets', 
  authenticateToken, 
  authorizeRoleHidden(['AMO']), 
  (req, res) => {
    // Contrôleur à implémenter pour les projets de l'AMO
    res.json({
      success: true,
      message: 'Mes projets AMO',
      data: {
        userId: req.user.id,
        role: req.user.role
      }
    });
  }
);

// Gestion des missions (AMO)
router.get('/gestion-missions', 
  authenticateToken, 
  authorizeRoleHidden(['AMO']), 
  (req, res) => {
    // Contrôleur à implémenter pour la gestion des missions
    res.json({
      success: true,
      message: 'Gestion missions AMO',
      data: {
        userId: req.user.id,
        role: req.user.role
      }
    });
  }
);

// Profil AMO
router.get('/profil', 
  authenticateToken, 
  authorizeRoleHidden(['AMO']), 
  (req, res) => {
    // Contrôleur à implémenter pour le profil AMO
    res.json({
      success: true,
      message: 'Profil AMO',
      data: {
        userId: req.user.id,
        role: req.user.role
      }
    });
  }
);

// ================================================
// ROUTES DOCUMENTS POUR AMO
// ================================================

// Import du contrôleur de documents
const clientDocumentController = require('../controllers/clientDocumentController');
const documentController = require('../controllers/documentController');

// Télécharger les documents des clients (pour AMO)
router.get('/documents/client/:id/download', 
  authenticateToken, 
  authorizeRoleHidden(['AMO']), 
  clientDocumentController.downloadDocument
);

// Voir les documents des clients (pour AMO)
router.get('/documents/client/:id', 
  authenticateToken, 
  authorizeRoleHidden(['AMO']), 
  clientDocumentController.getDocumentById
);

// Lister les documents d'un client (pour AMO)
router.get('/documents/client', 
  authenticateToken, 
  authorizeRoleHidden(['AMO']), 
  clientDocumentController.getClientDocuments
);

// Télécharger les documents partenaires (pour AMO)
router.get('/documents/partenaire/:id/download', 
  authenticateToken, 
  authorizeRoleHidden(['AMO']), 
  documentController.downloadDocument
);

// Upload de documents AMO
router.post('/documents/upload', 
  authenticateToken, 
  authorizeRoleHidden(['AMO']), 
  documentController.uploadDocuments
);

module.exports = router;