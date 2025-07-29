const express = require('express');
const router = express.Router();
const missionController = require('../controllers/missionController');

// Routes CRUD de base
router.get('/', missionController.getAllMissions);
router.get('/:id', missionController.getMissionById);
router.post('/', missionController.createMission);
router.put('/:id', missionController.updateMission);
router.delete('/:id', missionController.deleteMission);

// Routes spécialisées pour les recherches
router.get('/project/:projectId', missionController.getMissionsByProject);
router.get('/status/:statut', missionController.getMissionsByStatus);
router.get('/tag/:tag', missionController.getMissionsByTag);

// Routes pour les tags métiers
router.get('/stats/popular-tags', missionController.getPopularTags);
router.post('/:id/tags', missionController.addTagToMission);
router.delete('/:id/tags', missionController.removeTagFromMission);

module.exports = router; 