const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Route pour obtenir tous les utilisateurs
router.get('/', userController.getAllUsers);

// Route pour obtenir un utilisateur par ID
router.get('/:id', userController.getUserById);

// Route pour créer un nouvel utilisateur
router.post('/', userController.createUser);

// Route pour mettre à jour un utilisateur
router.put('/:id', userController.updateUser);

// Route pour supprimer un utilisateur
router.delete('/:id', userController.deleteUser);

// Routes spécialisées pour les professionnels
router.get('/professionals/tag/:tag', userController.getProfessionalsByTag);
router.get('/professionals/zone/:zone', userController.getProfessionalsByZone);
router.get('/professionals/top', userController.getTopProfessionals);
router.get('/professionals/stats/popular-tags', userController.getPopularTagsMetiers);

// Routes pour la gestion des tags métiers
router.post('/:id/tags-metiers', userController.addTagMetierToUser);
router.delete('/:id/tags-metiers', userController.removeTagMetierFromUser);

module.exports = router; 