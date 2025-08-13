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
router.get('/', authenticateToken, authorizeRole(['ADMIN']), projetController.getAllProjets);
// Route pour création de projet - authentification optionnelle (clients connectés ou anonymes)
router.post('/', optionalAuthenticateToken, authorizeClientOrAnonymous, validateProjectCreation, projetController.createProjet);

// Routes spécialisées (authentification requise) - DOIVENT ÊTRE AVANT les routes dynamiques
router.get('/my-projects', authenticateToken, authorizeRole(['CLIENT']), projetController.getMyProjets);
router.get('/client/:clientId', authenticateToken, authorizeRole(['CLIENT', 'ADMIN']), projetController.getProjetsByClient);
router.get('/amo/:amoId', authenticateToken, authorizeRole(['AMO', 'admin']), projetController.getProjetsByAMO);
router.get('/status/:statut', authenticateToken, authorizeRole(['ADMIN', 'AMO']), projetController.getProjetsByStatus);

// Routes dynamiques (DOIVENT ÊTRE À LA FIN)
router.get('/:id', authenticateToken, authorizeRole(['CLIENT', 'AMO', 'ADMIN']), projetController.getProjetById);
router.put('/:id', authenticateToken, authorizeRole(['CLIENT', 'AMO', 'ADMIN']), validateProjectUpdate, projetController.updateProjet);
router.delete('/:id', authenticateToken, authorizeRole(['ADMIN', 'AMO']), projetController.deleteProjet);

module.exports = router; 