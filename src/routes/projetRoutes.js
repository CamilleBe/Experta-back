const express = require('express');
const router = express.Router();
const projetController = require('../controllers/projetController');
const { 
  authenticateToken, 
  authorizeRole, 
  optionalAuthenticateToken, 
  authorizeClientOrAnonymous 
} = require('../middlewares/authMiddleware');
const { validateProjectCreation, validateProjectUpdate } = require('../middlewares/validateProject');

// Routes CRUD de base (admin seulement pour tout voir)
router.get('/', authenticateToken, authorizeRole(['admin']), projetController.getAllProjets);
// Route pour création de projet - authentification optionnelle (clients connectés ou anonymes)
router.post('/', optionalAuthenticateToken, authorizeClientOrAnonymous, validateProjectCreation, projetController.createProjet);

// Routes spécialisées (authentification requise) - DOIVENT ÊTRE AVANT les routes dynamiques
router.get('/my-projects', authenticateToken, authorizeRole(['client']), projetController.getMyProjets);
router.get('/client/:clientId', authenticateToken, authorizeRole(['client', 'admin']), projetController.getProjetsByClient);
router.get('/amo/:amoId', authenticateToken, authorizeRole(['AMO', 'admin']), projetController.getProjetsByAMO);
router.get('/status/:statut', authenticateToken, authorizeRole(['admin', 'AMO']), projetController.getProjetsByStatus);

// Routes dynamiques (DOIVENT ÊTRE À LA FIN)
router.get('/:id', authenticateToken, authorizeRole(['client', 'AMO', 'admin']), projetController.getProjetById);
router.put('/:id', authenticateToken, authorizeRole(['client', 'AMO', 'admin']), validateProjectUpdate, projetController.updateProjet);
router.delete('/:id', authenticateToken, authorizeRole(['admin', 'AMO']), projetController.deleteProjet);

module.exports = router; 