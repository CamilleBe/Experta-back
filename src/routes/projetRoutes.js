const express = require('express');
const router = express.Router();
const projetController = require('../controllers/projetController');
const { authenticateToken, authorizeRole } = require('../middlewares/authMiddleware');

// Routes CRUD de base (authentification requise)
router.get('/', authenticateToken, projetController.getAllProjets);
router.get('/:id', authenticateToken, projetController.getProjetById);
router.post('/', authenticateToken, authorizeRole(['client', 'AMO', 'admin']), projetController.createProjet);
router.put('/:id', authenticateToken, authorizeRole(['client', 'AMO', 'admin']), projetController.updateProjet);
router.delete('/:id', authenticateToken, authorizeRole(['admin', 'AMO']), projetController.deleteProjet);

// Routes spécialisées (authentification requise)
router.get('/client/:clientId', authenticateToken, projetController.getProjetsByClient);
router.get('/amo/:amoId', authenticateToken, projetController.getProjetsByAMO);
router.get('/status/:statut', authenticateToken, projetController.getProjetsByStatus);

module.exports = router; 