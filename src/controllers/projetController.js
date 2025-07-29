// ================================================
// CONTRÔLEUR PROJETS AVEC SEQUELIZE
// ================================================

const { Projet, User, Mission } = require('../models');

const getAllProjets = async (req, res) => {
  try {
    console.log('📋 Récupération de tous les projets...');
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    // Filtres optionnels
    const where = { isActive: true };
    if (req.query.statut) where.statut = req.query.statut;
    if (req.query.clientId) where.clientId = req.query.clientId;
    if (req.query.amoId) where.amoId = req.query.amoId;
    if (req.query.city) where.city = req.query.city;
    
    const { count, rows: projets } = await Projet.findAndCountAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: User,
          as: 'client',
          attributes: ['id', 'firstName', 'lastName', 'email', 'telephone']
        },
        {
          model: User,
          as: 'amo',
          attributes: ['id', 'firstName', 'lastName', 'email', 'telephone'],
          required: false
        },
        {
          model: Mission,
          as: 'missions',
          where: { isActive: true },
          required: false
        }
      ]
    });
    
    res.status(200).json({
      success: true,
      data: projets,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit)
      },
      message: `${projets.length} projet(s) récupéré(s) avec succès`
    });
    
  } catch (error) {
    console.error('❌ Erreur getAllProjets:', error.message);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des projets',
      error: error.message
    });
  }
};

const getProjetById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🔍 Recherche du projet ID: ${id}`);
    
    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID projet invalide'
      });
    }
    
    const projet = await Projet.findByPk(id, {
      include: [
        {
          model: User,
          as: 'client',
          attributes: ['id', 'firstName', 'lastName', 'email', 'telephone']
        },
        {
          model: User,
          as: 'amo',
          attributes: ['id', 'firstName', 'lastName', 'email', 'telephone'],
          required: false
        },
        {
          model: Mission,
          as: 'missions',
          where: { isActive: true },
          required: false
        }
      ]
    });
    
    if (!projet || !projet.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Projet non trouvé'
      });
    }
    
    res.status(200).json({
      success: true,
      data: projet,
      message: 'Projet récupéré avec succès'
    });
    
  } catch (error) {
    console.error('❌ Erreur getProjetById:', error.message);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du projet',
      error: error.message
    });
  }
};

const createProjet = async (req, res) => {
  try {
    const { 
      clientId, description, address, city, postalCode, 
      budget, surfaceM2, bedrooms, houseType, hasLand 
    } = req.body;
    console.log(`🏗️ Création d'un nouveau projet pour le client ID: ${clientId}`);
    
    // Validation des champs requis
    if (!clientId || !description || !address || !city || !postalCode) {
      return res.status(400).json({
        success: false,
        message: 'clientId, description, address, city et postalCode sont requis'
      });
    }
    
    // Vérifier que le client existe et a le bon rôle
    const client = await User.findByPk(clientId);
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client non trouvé'
      });
    }
    
    if (client.role !== 'client') {
      return res.status(403).json({
        success: false,
        message: 'L\'utilisateur doit avoir le rôle client'
      });
    }
    
    const newProjet = await Projet.create({
      clientId,
      description,
      address,
      city,
      postalCode,
      budget,
      surfaceM2,
      bedrooms,
      houseType,
      hasLand
    });
    
    // Récupérer le projet avec les relations
    const projetWithRelations = await Projet.findByPk(newProjet.id, {
      include: [
        {
          model: User,
          as: 'client',
          attributes: ['id', 'firstName', 'lastName', 'email', 'telephone']
        },
        {
          model: User,
          as: 'amo',
          attributes: ['id', 'firstName', 'lastName', 'email', 'telephone'],
          required: false
        }
      ]
    });
    
    res.status(201).json({
      success: true,
      data: projetWithRelations,
      message: 'Projet créé avec succès'
    });
    
  } catch (error) {
    console.error('❌ Erreur createProjet:', error.message);
    
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: error.errors.map(err => err.message)
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du projet',
      error: error.message
    });
  }
};

const updateProjet = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      amoId, statut, description, address, city, postalCode,
      budget, surfaceM2, bedrooms, houseType, hasLand, isActive 
    } = req.body;
    console.log(`✏️ Mise à jour du projet ID: ${id}`);
    
    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID projet invalide'
      });
    }
    
    const projet = await Projet.findByPk(id);
    if (!projet || !projet.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Projet non trouvé'
      });
    }
    
    // Si on assigne un AMO, vérifier qu'il a le bon rôle
    if (amoId) {
      const amo = await User.findByPk(amoId);
      if (!amo || amo.role !== 'AMO') {
        return res.status(400).json({
          success: false,
          message: 'L\'AMO doit avoir le rôle AMO'
        });
      }
    }
    
    // Mettre à jour les champs
    const updateData = {};
    if (amoId !== undefined) updateData.amoId = amoId;
    if (statut) updateData.statut = statut;
    if (description) updateData.description = description;
    if (address) updateData.address = address;
    if (city) updateData.city = city;
    if (postalCode) updateData.postalCode = postalCode;
    if (budget !== undefined) updateData.budget = budget;
    if (surfaceM2 !== undefined) updateData.surfaceM2 = surfaceM2;
    if (bedrooms !== undefined) updateData.bedrooms = bedrooms;
    if (houseType) updateData.houseType = houseType;
    if (hasLand !== undefined) updateData.hasLand = hasLand;
    if (typeof isActive === 'boolean') updateData.isActive = isActive;
    
    await projet.update(updateData);
    
    // Récupérer le projet mis à jour avec les relations
    const updatedProjet = await Projet.findByPk(id, {
      include: [
        {
          model: User,
          as: 'client',
          attributes: ['id', 'firstName', 'lastName', 'email', 'telephone']
        },
        {
          model: User,
          as: 'amo',
          attributes: ['id', 'firstName', 'lastName', 'email', 'telephone'],
          required: false
        },
        {
          model: Mission,
          as: 'missions',
          where: { isActive: true },
          required: false
        }
      ]
    });
    
    res.status(200).json({
      success: true,
      data: updatedProjet,
      message: 'Projet mis à jour avec succès'
    });
    
  } catch (error) {
    console.error('❌ Erreur updateProjet:', error.message);
    
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: error.errors.map(err => err.message)
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du projet',
      error: error.message
    });
  }
};

const deleteProjet = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🗑️ Suppression du projet ID: ${id}`);
    
    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID projet invalide'
      });
    }
    
    const projet = await Projet.findByPk(id);
    if (!projet || !projet.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Projet non trouvé'
      });
    }
    
    // Soft delete
    await projet.update({ isActive: false });
    
    res.status(200).json({
      success: true,
      message: 'Projet supprimé avec succès'
    });
    
  } catch (error) {
    console.error('❌ Erreur deleteProjet:', error.message);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du projet',
      error: error.message
    });
  }
};

const getProjetsByClient = async (req, res) => {
  try {
    const { clientId } = req.params;
    console.log(`📋 Récupération des projets pour le client ID: ${clientId}`);
    
    if (!clientId || isNaN(clientId)) {
      return res.status(400).json({
        success: false,
        message: 'ID client invalide'
      });
    }
    
    const projets = await Projet.findByClientId(clientId, {
      include: [
        {
          model: User,
          as: 'amo',
          attributes: ['id', 'firstName', 'lastName', 'email'],
          required: false
        }
      ]
    });
    
    res.status(200).json({
      success: true,
      data: projets,
      message: `${projets.length} projet(s) trouvé(s) pour ce client`
    });
    
  } catch (error) {
    console.error('❌ Erreur getProjetsByClient:', error.message);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des projets',
      error: error.message
    });
  }
};

const getProjetsByAMO = async (req, res) => {
  try {
    const { amoId } = req.params;
    console.log(`📋 Récupération des projets pour l'AMO ID: ${amoId}`);
    
    if (!amoId || isNaN(amoId)) {
      return res.status(400).json({
        success: false,
        message: 'ID AMO invalide'
      });
    }
    
    const projets = await Projet.findByAmoId(amoId, {
      include: [
        {
          model: User,
          as: 'client',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ]
    });
    
    res.status(200).json({
      success: true,
      data: projets,
      message: `${projets.length} projet(s) trouvé(s) pour cet AMO`
    });
    
  } catch (error) {
    console.error('❌ Erreur getProjetsByAMO:', error.message);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des projets',
      error: error.message
    });
  }
};

const getProjetsByStatus = async (req, res) => {
  try {
    const { statut } = req.params;
    console.log(`📋 Récupération des projets avec le statut: ${statut}`);
    
    const projets = await Projet.findByStatus(statut, {
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
    });
    
    res.status(200).json({
      success: true,
      data: projets,
      message: `${projets.length} projet(s) avec le statut ${statut} trouvé(s)`
    });
    
  } catch (error) {
    console.error('❌ Erreur getProjetsByStatus:', error.message);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des projets',
      error: error.message
    });
  }
};

module.exports = {
  getAllProjets,
  getProjetById,
  createProjet,
  updateProjet,
  deleteProjet,
  getProjetsByClient,
  getProjetsByAMO,
  getProjetsByStatus
}; 