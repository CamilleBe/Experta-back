const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
const { authenticateToken, authorizeRole } = require('../middlewares/authMiddleware');

// Routes CRUD de base (authentification requise)
router.get('/', authenticateToken, documentController.getAllDocuments);
router.get('/:id', authenticateToken, documentController.getDocumentById);
router.post('/', authenticateToken, documentController.createDocument);
router.put('/:id', authenticateToken, documentController.updateDocument);
router.delete('/:id', authenticateToken, authorizeRole(['admin', 'amo']), documentController.deleteDocument);

// Routes spécialisées (authentification requise)
router.get('/user/:userId', authenticateToken, documentController.getDocumentsByUser);
router.get('/type/:type', authenticateToken, documentController.getDocumentsByType);

module.exports = router; 