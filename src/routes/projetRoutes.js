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

// Routes CRUD de base (authentification requise)
router.get('/', authenticateToken, projetController.getAllProjets);
router.get('/:id', authenticateToken, projetController.getProjetById);
// Route pour création de projet - authentification optionnelle (clients connectés ou anonymes)
router.post('/', optionalAuthenticateToken, authorizeClientOrAnonymous, validateProjectCreation, projetController.createProjet);
router.put('/:id', authenticateToken, authorizeRole(['client', 'AMO', 'admin']), validateProjectUpdate, projetController.updateProjet);
router.delete('/:id', authenticateToken, authorizeRole(['admin', 'AMO']), projetController.deleteProjet);

// Routes spécialisées (authentification requise)
router.get('/my-projects', authenticateToken, authorizeRole(['client']), projetController.getMyProjets);
router.get('/client/:clientId', authenticateToken, projetController.getProjetsByClient);
router.get('/amo/:amoId', authenticateToken, projetController.getProjetsByAMO);
router.get('/status/:statut', authenticateToken, projetController.getProjetsByStatus);

module.exports = router; 