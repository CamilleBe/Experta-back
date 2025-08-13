const express = require('express');
const router = express.Router();
const missionController = require('../controllers/missionController');
const { authenticateToken, authorizeRole } = require('../middlewares/authMiddleware');

// Routes CRUD de base (authentification requise)
router.get('/', authenticateToken, missionController.getAllMissions);
router.get('/:id', authenticateToken, missionController.getMissionById);
router.post('/', authenticateToken, authorizeRole(['amo', 'admin']), missionController.createMission);
router.put('/:id', authenticateToken, authorizeRole(['amo', 'admin']), missionController.updateMission);
router.delete('/:id', authenticateToken, authorizeRole(['admin', 'amo']), missionController.deleteMission);

// Routes spécialisées pour les recherches (authentification requise)
router.get('/project/:projectId', authenticateToken, missionController.getMissionsByProject);
router.get('/status/:statut', authenticateToken, missionController.getMissionsByStatus);
router.get('/tag/:tag', authenticateToken, missionController.getMissionsByTag);

// Routes pour les tags métiers
router.get('/stats/popular-tags', missionController.getPopularTags); // Publique (stats)
router.post('/:id/tags', authenticateToken, authorizeRole(['amo', 'admin']), missionController.addTagToMission);
router.delete('/:id/tags', authenticateToken, authorizeRole(['amo', 'admin']), missionController.removeTagFromMission);

module.exports = router; 