// ================================================
// CONTRÔLEUR MISSIONS AVEC SEQUELIZE
// ================================================

const { Mission, Projet, User } = require('../models');

const getAllMissions = async (req, res) => {
  try {
    console.log('📋 Récupération de toutes les missions...');
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    // Filtres optionnels
    const where = { isActive: true };
    if (req.query.statut) where.statut = req.query.statut;
    if (req.query.projectId) where.projectId = req.query.projectId;
    
    const { count, rows: missions } = await Mission.findAndCountAll({
      where,
      limit,
      offset,
      order: [['dateCreation', 'DESC']],
      include: [{
        model: Projet,
        as: 'projet',
        include: [
          {
            model: User,
            as: 'client',
            attributes: ['id', 'firstName', 'lastName', 'email']
          },
          {
            model: User,
            as: 'amo',
            attributes: ['id', 'firstName', 'lastName', 'email'],
            required: false
          }
        ]
      }]
    });
    
    res.status(200).json({
      success: true,
      data: missions,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit)
      },
      message: `${missions.length} mission(s) récupérée(s) avec succès`
    });
    
  } catch (error) {
    console.error('❌ Erreur getAllMissions:', error.message);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des missions',
      error: error.message
    });
  }
};

const getMissionById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🔍 Recherche de la mission ID: ${id}`);
    
    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID mission invalide'
      });
    }
    
    const mission = await Mission.findByPk(id, {
      include: [{
        model: Projet,
        as: 'projet',
        include: [
          {
            model: User,
            as: 'client',
            attributes: ['id', 'firstName', 'lastName', 'email']
          },
          {
            model: User,
            as: 'amo',
            attributes: ['id', 'firstName', 'lastName', 'email'],
            required: false
          }
        ]
      }]
    });
    
    if (!mission || !mission.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Mission non trouvée'
      });
    }
    
    res.status(200).json({
      success: true,
      data: mission,
      message: 'Mission récupérée avec succès'
    });
    
  } catch (error) {
    console.error('❌ Erreur getMissionById:', error.message);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la mission',
      error: error.message
    });
  }
};

const createMission = async (req, res) => {
  try {
    const { projectId, tagsMetiers, commentaireAMO, statut } = req.body;
    console.log(`📋 Création d'une nouvelle mission pour le projet ID: ${projectId}`);
    
    // Validation des champs requis
    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: 'projectId est requis'
      });
    }
    
    // Vérifier que le projet existe
    const projet = await Projet.findByPk(projectId);
    if (!projet || !projet.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Projet non trouvé'
      });
    }
    
    const newMission = await Mission.create({
      projectId,
      tagsMetiers: tagsMetiers || [],
      commentaireAMO,
      statut: statut || 'en_attente'
    });
    
    // Récupérer la mission avec les relations
    const missionWithRelations = await Mission.findByPk(newMission.id, {
      include: [{
        model: Projet,
        as: 'projet',
        include: [
          {
            model: User,
            as: 'client',
            attributes: ['id', 'firstName', 'lastName', 'email']
          },
          {
            model: User,
            as: 'amo',
            attributes: ['id', 'firstName', 'lastName', 'email'],
            required: false
          }
        ]
      }]
    });
    
    res.status(201).json({
      success: true,
      data: missionWithRelations,
      message: 'Mission créée avec succès'
    });
    
  } catch (error) {
    console.error('❌ Erreur createMission:', error.message);
    
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: error.errors.map(err => err.message)
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la mission',
      error: error.message
    });
  }
};

const updateMission = async (req, res) => {
  try {
    const { id } = req.params;
    const { tagsMetiers, commentaireAMO, statut, isActive } = req.body;
    console.log(`✏️ Mise à jour de la mission ID: ${id}`);
    
    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID mission invalide'
      });
    }
    
    const mission = await Mission.findByPk(id);
    if (!mission || !mission.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Mission non trouvée'
      });
    }
    
    // Mettre à jour les champs
    const updateData = {};
    if (tagsMetiers !== undefined) updateData.tagsMetiers = tagsMetiers;
    if (commentaireAMO !== undefined) updateData.commentaireAMO = commentaireAMO;
    if (statut) updateData.statut = statut;
    if (typeof isActive === 'boolean') updateData.isActive = isActive;
    
    await mission.update(updateData);
    
    // Récupérer la mission mise à jour avec les relations
    const updatedMission = await Mission.findByPk(id, {
      include: [{
        model: Projet,
        as: 'projet',
        include: [
          {
            model: User,
            as: 'client',
            attributes: ['id', 'firstName', 'lastName', 'email']
          },
          {
            model: User,
            as: 'amo',
            attributes: ['id', 'firstName', 'lastName', 'email'],
            required: false
          }
        ]
      }]
    });
    
    res.status(200).json({
      success: true,
      data: updatedMission,
      message: 'Mission mise à jour avec succès'
    });
    
  } catch (error) {
    console.error('❌ Erreur updateMission:', error.message);
    
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: error.errors.map(err => err.message)
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de la mission',
      error: error.message
    });
  }
};

const deleteMission = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🗑️ Suppression de la mission ID: ${id}`);
    
    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID mission invalide'
      });
    }
    
    const mission = await Mission.findByPk(id);
    if (!mission || !mission.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Mission non trouvée'
      });
    }
    
    // Soft delete
    await mission.update({ isActive: false });
    
    res.status(200).json({
      success: true,
      message: 'Mission supprimée avec succès'
    });
    
  } catch (error) {
    console.error('❌ Erreur deleteMission:', error.message);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de la mission',
      error: error.message
    });
  }
};

const getMissionsByProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    console.log(`📋 Récupération des missions pour le projet ID: ${projectId}`);
    
    if (!projectId || isNaN(projectId)) {
      return res.status(400).json({
        success: false,
        message: 'ID projet invalide'
      });
    }
    
    const missions = await Mission.findByProjectId(projectId, {
      include: [{
        model: Projet,
        as: 'projet',
        include: [
          {
            model: User,
            as: 'client',
            attributes: ['id', 'firstName', 'lastName', 'email']
          },
          {
            model: User,
            as: 'amo',
            attributes: ['id', 'firstName', 'lastName', 'email'],
            required: false
          }
        ]
      }]
    });
    
    res.status(200).json({
      success: true,
      data: missions,
      message: `${missions.length} mission(s) trouvée(s) pour ce projet`
    });
    
  } catch (error) {
    console.error('❌ Erreur getMissionsByProject:', error.message);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des missions',
      error: error.message
    });
  }
};

const getMissionsByStatus = async (req, res) => {
  try {
    const { statut } = req.params;
    console.log(`📋 Récupération des missions avec le statut: ${statut}`);
    
    const missions = await Mission.findByStatus(statut, {
      include: [{
        model: Projet,
        as: 'projet',
        include: [
          {
            model: User,
            as: 'client',
            attributes: ['id', 'firstName', 'lastName', 'email']
          }
        ]
      }]
    });
    
    res.status(200).json({
      success: true,
      data: missions,
      message: `${missions.length} mission(s) avec le statut ${statut} trouvée(s)`
    });
    
  } catch (error) {
    console.error('❌ Erreur getMissionsByStatus:', error.message);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des missions',
      error: error.message
    });
  }
};

const getMissionsByTag = async (req, res) => {
  try {
    const { tag } = req.params;
    console.log(`📋 Récupération des missions avec le tag métier: ${tag}`);
    
    const missions = await Mission.findByTagMetier(tag, {
      include: [{
        model: Projet,
        as: 'projet',
        include: [
          {
            model: User,
            as: 'client',
            attributes: ['id', 'firstName', 'lastName', 'email']
          }
        ]
      }]
    });
    
    res.status(200).json({
      success: true,
      data: missions,
      message: `${missions.length} mission(s) avec le tag ${tag} trouvée(s)`
    });
    
  } catch (error) {
    console.error('❌ Erreur getMissionsByTag:', error.message);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des missions',
      error: error.message
    });
  }
};

const getPopularTags = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    console.log(`📊 Récupération des ${limit} tags métiers les plus populaires`);
    
    const popularTags = await Mission.getPopularTags(limit);
    
    res.status(200).json({
      success: true,
      data: popularTags,
      message: `Top ${popularTags.length} des tags métiers populaires`
    });
    
  } catch (error) {
    console.error('❌ Erreur getPopularTags:', error.message);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des tags populaires',
      error: error.message
    });
  }
};

const addTagToMission = async (req, res) => {
  try {
    const { id } = req.params;
    const { tag } = req.body;
    console.log(`➕ Ajout du tag "${tag}" à la mission ID: ${id}`);
    
    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID mission invalide'
      });
    }
    
    if (!tag) {
      return res.status(400).json({
        success: false,
        message: 'Le tag est requis'
      });
    }
    
    const mission = await Mission.findByPk(id);
    if (!mission || !mission.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Mission non trouvée'
      });
    }
    
    mission.addTagMetier(tag);
    await mission.save();
    
    res.status(200).json({
      success: true,
      data: mission,
      message: `Tag "${tag}" ajouté avec succès`
    });
    
  } catch (error) {
    console.error('❌ Erreur addTagToMission:', error.message);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'ajout du tag',
      error: error.message
    });
  }
};

const removeTagFromMission = async (req, res) => {
  try {
    const { id } = req.params;
    const { tag } = req.body;
    console.log(`➖ Suppression du tag "${tag}" de la mission ID: ${id}`);
    
    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID mission invalide'
      });
    }
    
    if (!tag) {
      return res.status(400).json({
        success: false,
        message: 'Le tag est requis'
      });
    }
    
    const mission = await Mission.findByPk(id);
    if (!mission || !mission.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Mission non trouvée'
      });
    }
    
    mission.removeTagMetier(tag);
    await mission.save();
    
    res.status(200).json({
      success: true,
      data: mission,
      message: `Tag "${tag}" supprimé avec succès`
    });
    
  } catch (error) {
    console.error('❌ Erreur removeTagFromMission:', error.message);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du tag',
      error: error.message
    });
  }
};

module.exports = {
  getAllMissions,
  getMissionById,
  createMission,
  updateMission,
  deleteMission,
  getMissionsByProject,
  getMissionsByStatus,
  getMissionsByTag,
  getPopularTags,
  addTagToMission,
  removeTagFromMission
}; 