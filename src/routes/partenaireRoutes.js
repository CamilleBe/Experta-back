const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRole } = require('../middlewares/authMiddleware');

// ================================================
// ROUTES DASHBOARD PARTENAIRE/ARTISAN
// ================================================

// Routes spécifiques pour les partenaires
// Seuls les partenaires ont accès à ces routes

// Dashboard partenaire - vue d'ensemble
router.get('/dashboard', 
  authenticateToken, 
  authorizeRole(['partenaire']), 
  (req, res) => {
    // Contrôleur à implémenter pour le dashboard partenaire
    res.json({
      success: true,
      message: 'Dashboard partenaire accessible',
      data: {
        userId: req.user.id,
        role: req.user.role
      }
    });
  }
);

// Missions disponibles pour le partenaire
router.get('/missions-disponibles', 
  authenticateToken, 
  authorizeRole(['partenaire']), 
  (req, res) => {
    // Contrôleur à implémenter pour lister les missions disponibles
    res.json({
      success: true,
      message: 'Missions disponibles pour partenaire',
      data: {
        userId: req.user.id,
        role: req.user.role
      }
    });
  }
);

// Mes missions en cours (partenaire)
router.get('/mes-missions', 
  authenticateToken, 
  authorizeRole(['partenaire']), 
  (req, res) => {
    // Contrôleur à implémenter pour les missions du partenaire
    res.json({
      success: true,
      message: 'Mes missions partenaire',
      data: {
        userId: req.user.id,
        role: req.user.role
      }
    });
  }
);

// Profil partenaire
router.get('/profil', 
  authenticateToken, 
  authorizeRole(['partenaire']), 
  (req, res) => {
    // Contrôleur à implémenter pour le profil partenaire
    res.json({
      success: true,
      message: 'Profil partenaire',
      data: {
        userId: req.user.id,
        role: req.user.role
      }
    });
  }
);

// ================================================
// ROUTES DOCUMENTS POUR PARTENAIRE
// ================================================

// Import du contrôleur de documents
const documentController = require('../controllers/documentController');

// Télécharger les documents de l'AMO (pour partenaire)
router.get('/documents/amo/:id/download', 
  authenticateToken, 
  authorizeRole(['partenaire']), 
  documentController.downloadDocument
);

// Voir les documents de l'AMO (pour partenaire)
router.get('/documents/amo/:id', 
  authenticateToken, 
  authorizeRole(['partenaire']), 
  documentController.getDocumentById
);

// Lister les documents AMO (pour partenaire)
router.get('/documents/amo', 
  authenticateToken, 
  authorizeRole(['partenaire']), 
  documentController.getDocumentsByUser
);

// Upload de documents partenaire
router.post('/documents/upload', 
  authenticateToken, 
  authorizeRole(['partenaire']), 
  documentController.uploadDocuments
);

module.exports = router;