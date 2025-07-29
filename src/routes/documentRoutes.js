const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');

// Routes CRUD de base
router.get('/', documentController.getAllDocuments);
router.get('/:id', documentController.getDocumentById);
router.post('/', documentController.createDocument);
router.put('/:id', documentController.updateDocument);
router.delete('/:id', documentController.deleteDocument);

// Routes spécialisées
router.get('/user/:userId', documentController.getDocumentsByUser);
router.get('/type/:type', documentController.getDocumentsByType);

module.exports = router; 