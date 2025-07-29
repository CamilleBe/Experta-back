const express = require('express');
const router = express.Router();
const projetController = require('../controllers/projetController');

// Routes CRUD de base
router.get('/', projetController.getAllProjets);
router.get('/:id', projetController.getProjetById);
router.post('/', projetController.createProjet);
router.put('/:id', projetController.updateProjet);
router.delete('/:id', projetController.deleteProjet);

// Routes spécialisées
router.get('/client/:clientId', projetController.getProjetsByClient);
router.get('/amo/:amoId', projetController.getProjetsByAMO);
router.get('/status/:statut', projetController.getProjetsByStatus);

module.exports = router; 