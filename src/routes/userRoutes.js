const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken, authorizeRole } = require('../middlewares/authMiddleware');

// Route pour obtenir tous les utilisateurs (admin seulement)
router.get('/', authenticateToken, authorizeRole(['admin']), userController.getAllUsers);

// Route pour créer un nouvel utilisateur (publique pour l'inscription client)
router.post('/', userController.createUser);

// Route pour l'inscription spécialisée AMO (publique)
router.post('/register-amo', userController.registerAMO);

// Route pour l'inscription des professionnels du bâtiment (publique)
router.post('/register-partner', userController.registerPartner);

// Route pour la connexion (publique)
router.post('/login', userController.loginUser);

// Route pour obtenir un utilisateur par ID (propriétaire ou admin)
router.get('/:id', authenticateToken, userController.getUserById);

// Route pour mettre à jour un utilisateur (propriétaire ou admin)
router.put('/:id', authenticateToken, userController.updateUser);

// Route pour supprimer un utilisateur (admin seulement)
router.delete('/:id', authenticateToken, authorizeRole(['admin']), userController.deleteUser);

// Routes spécialisées pour les professionnels
router.get('/professionals/tag/:tag', userController.getProfessionalsByTag);
router.get('/professionals/zone/:zone', userController.getProfessionalsByZone);
router.get('/professionals/top', userController.getTopProfessionals);
router.get('/professionals/stats/popular-tags', userController.getPopularTagsMetiers);

// Routes pour la gestion des tags métiers (AMO et partenaire seulement)
router.post('/:id/tags-metiers', authenticateToken, authorizeRole(['amo', 'partenaire', 'admin']), userController.addTagMetierToUser);
router.delete('/:id/tags-metiers', authenticateToken, authorizeRole(['amo', 'partenaire', 'admin']), userController.removeTagMetierFromUser);

module.exports = router; 