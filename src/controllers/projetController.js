// ================================================
// CONTRÔLEUR PROJETS AVEC SEQUELIZE
// ================================================

const { Projet, User, Mission } = require('../models');
const bcrypt = require('bcryptjs');

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
      description, address, city, postalCode, 
      budget, surfaceM2, bedrooms, houseType, hasLand,
      // Champs pour utilisateurs non connectés
      clientFirstName, clientLastName, clientEmail, clientPhone, clientPassword
    } = req.body;
    
    let clientId;
    let isNewUser = false;
    
    // ================================================
    // GESTION UTILISATEUR CONNECTÉ VS NON CONNECTÉ
    // ================================================
    
    if (req.user) {
      // Utilisateur connecté - utiliser son ID
      clientId = req.user.id;
      console.log(`🏗️ Création d'un nouveau projet pour le client connecté ID: ${clientId}`);
      
      // Vérification du rôle déjà faite par le middleware authorizeClientOrAnonymous
      
    } else {
      // Utilisateur non connecté - créer ou trouver un compte client
      console.log(`🏗️ Création d'un projet pour un utilisateur anonyme: ${clientEmail}`);
      
      // Vérifier si un utilisateur avec cet email existe déjà
      let existingUser = await User.findOne({ where: { email: clientEmail } });
      
      if (existingUser) {
        // Utilisateur existe déjà
        if (existingUser.role !== 'client') {
          return res.status(409).json({
            success: false,
            message: 'Un compte avec cet email existe déjà mais n\'est pas un compte client. Veuillez vous connecter.'
          });
        }
        
        clientId = existingUser.id;
        console.log(`👤 Utilisateur existant trouvé: ${existingUser.email}`);
        
      } else {
        // Créer un nouveau compte client avec mot de passe hashé
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(clientPassword, salt);
        
        const newUser = await User.create({
          firstName: clientFirstName,
          lastName: clientLastName,
          email: clientEmail,
          telephone: clientPhone,
          role: 'client',
          password: hashedPassword,
          isActive: true
        });
        
        clientId = newUser.id;
        isNewUser = true;
        console.log(`👤 Nouvel utilisateur créé: ${newUser.email} (ID: ${clientId})`);
      }
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
    
    // ================================================
    // NOTIFICATION SIMPLE POUR LES AMO
    // ================================================
    
    // Trouver les AMO dans la zone d'intervention du projet
    try {
      const amosInZone = await User.findAll({
        where: {
          role: 'AMO',
          isActive: true,
          zoneIntervention: {
            [require('sequelize').Op.like]: `%${postalCode}%`
          }
        },
        attributes: ['id', 'firstName', 'lastName', 'email', 'nomEntreprise']
      });
      
      if (amosInZone.length > 0) {
        console.log(`🔔 NOUVEAU PROJET DISPONIBLE pour ${amosInZone.length} AMO(s):`);
        console.log(`   📍 Lieu: ${city} (${postalCode})`);
        console.log(`   💰 Budget: ${budget ? budget + '€' : 'Non spécifié'}`);
        console.log(`   🏠 Type: ${houseType || 'Non spécifié'}`);
        console.log(`   📏 Surface: ${surfaceM2 ? surfaceM2 + 'm²' : 'Non spécifié'}`);
        console.log(`   📧 Client: ${projetWithRelations.client.email}`);
        console.log(`   🎯 AMO concernés:`);
        
        amosInZone.forEach(amo => {
          console.log(`      - ${amo.firstName} ${amo.lastName} (${amo.nomEntreprise || amo.email})`);
        });
        
        console.log(`   🔗 Projet ID: ${newProjet.id}`);
        console.log(`   ⏰ Créé le: ${new Date().toLocaleString('fr-FR')}`);
        console.log('   ────────────────────────────────────────────────────');
      } else {
        console.log(`📭 Nouveau projet créé (ID: ${newProjet.id}) - Aucun AMO trouvé dans la zone ${postalCode}`);
      }
    } catch (notificationError) {
      console.error('❌ Erreur notification AMO:', notificationError.message);
      // Ne pas faire échouer la création du projet pour autant
    }

    res.status(201).json({
      success: true,
      data: projetWithRelations,
      message: 'Projet créé avec succès',
      userCreated: isNewUser, // Indique si un nouveau compte utilisateur a été créé
      accountReady: isNewUser // Indique que le compte est prêt à être utilisé (mot de passe déjà configuré)
    });
    
  } catch (error) {
    console.error('❌ Erreur createProjet:', error.message);
    
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: error.errors.map(err => ({
          field: err.path,
          message: err.message,
          value: err.value
        }))
      });
    }
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({
        success: false,
        message: 'Un projet avec ces caractéristiques existe déjà',
        errors: error.errors.map(err => ({
          field: err.path,
          message: err.message
        }))
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du projet',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Erreur interne du serveur'
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

// ================================================
// ENDPOINT SPÉCIFIQUE DASHBOARD CLIENT
// ================================================

const getMyProjets = async (req, res) => {
  try {
    const clientId = req.user.id;
    console.log(`📋 Dashboard - Récupération des projets pour le client connecté ID: ${clientId}`);
    
    // Vérifier que l'utilisateur est bien un client
    if (req.user.role !== 'client') {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé - Seuls les clients peuvent accéder à leur dashboard'
      });
    }
    
    // Récupérer tous les projets du client (sans les missions pour le dashboard)
    const projets = await Projet.findByClientId(clientId, {
      include: [
        {
          model: User,
          as: 'amo',
          attributes: ['id', 'firstName', 'lastName', 'email', 'telephone'],
          required: false
        }
      ]
    });
    
    // Calculer les statistiques pour le dashboard
    const stats = {
      total: projets.length,
      enCours: projets.filter(p => p.isInProgress()).length,
      termines: projets.filter(p => p.isCompleted()).length,
      brouillons: projets.filter(p => p.statut === 'brouillon').length,
      budgetTotal: projets.reduce((sum, p) => sum + (p.budget || 0), 0)
    };
    
    // Ajouter des informations calculées à chaque projet
    const projetsEnriches = projets.map(projet => {
      const projetJson = projet.toJSON();
      return {
        ...projetJson,
        estEnCours: projet.isInProgress(),
        estTermine: projet.isCompleted(),
        budgetFormate: projet.getFormattedBudget(),
        dureeJours: projet.getProjectDuration(),
        adresseComplete: projet.getFullAddress()
      };
    });
    
    res.status(200).json({
      success: true,
      data: {
        projets: projetsEnriches,
        statistiques: stats
      },
      message: `Dashboard client - ${projets.length} projet(s) récupéré(s)`
    });
    
  } catch (error) {
    console.error('❌ Erreur getMyProjets (dashboard):', error.message);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des projets du dashboard',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Erreur interne du serveur'
    });
  }
};

// ================================================
// ENDPOINT SPÉCIFIQUE POUR AMO - ACCEPTER PROJET
// ================================================

const acceptProjet = async (req, res) => {
  try {
    const { id } = req.params;
    const amoId = req.user.id; // AMO qui accepte le projet
    console.log(`✅ AMO ${amoId} accepte le projet ID: ${id}`);
    
    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID projet invalide'
      });
    }
    
    // Vérifier que l'utilisateur est bien un AMO
    if (req.user.role !== 'AMO') {
      return res.status(403).json({
        success: false,
        message: 'Seuls les AMO peuvent accepter des projets'
      });
    }
    
    const projet = await Projet.findByPk(id);
    if (!projet || !projet.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Projet non trouvé'
      });
    }
    
    // Vérifier que le projet est encore disponible
    if (projet.amoId) {
      return res.status(409).json({
        success: false,
        message: 'Ce projet a déjà été accepté par un autre AMO'
      });
    }
    
    if (projet.statut !== 'brouillon') {
      return res.status(409).json({
        success: false,
        message: 'Ce projet n\'est plus disponible'
      });
    }
    
    // Accepter le projet
    await projet.update({
      amoId: amoId,
      statut: 'accepte' // Nouveau statut pour projet accepté par AMO
    });
    
    // Récupérer le projet mis à jour avec les relations
    const projetAccepte = await Projet.findByPk(id, {
      include: [
        {
          model: User,
          as: 'client',
          attributes: ['id', 'firstName', 'lastName', 'email', 'telephone']
        },
        {
          model: User,
          as: 'amo',
          attributes: ['id', 'firstName', 'lastName', 'email', 'telephone', 'nomEntreprise']
        },
        {
          model: Mission,
          as: 'missions',
          where: { isActive: true },
          required: false
        }
      ]
    });
    
    // Log de confirmation
    console.log(`🎉 Projet accepté avec succès:`);
    console.log(`   📋 Projet: ${projet.description.substring(0, 50)}...`);
    console.log(`   📍 Lieu: ${projet.city} (${projet.postalCode})`);
    console.log(`   👤 Client: ${projetAccepte.client.email}`);
    console.log(`   🏢 AMO: ${projetAccepte.amo.firstName} ${projetAccepte.amo.lastName} (${projetAccepte.amo.nomEntreprise || projetAccepte.amo.email})`);
    console.log(`   📅 Accepté le: ${new Date().toLocaleString('fr-FR')}`);
    console.log('   ────────────────────────────────────────────────────');
    
    res.status(200).json({
      success: true,
      data: projetAccepte,
      message: 'Projet accepté avec succès! Il apparaît maintenant dans votre dashboard.'
    });
    
  } catch (error) {
    console.error('❌ Erreur acceptProjet:', error.message);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'acceptation du projet',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Erreur interne du serveur'
    });
  }
};

// ================================================
// ENDPOINT DASHBOARD AMO - MES PROJETS
// ================================================

const getMyAMOProjets = async (req, res) => {
  try {
    const amoId = req.user.id;
    console.log(`📋 Dashboard AMO - Récupération des projets pour l'AMO ID: ${amoId}`);
    
    // Vérifier que l'utilisateur est bien un AMO
    if (req.user.role !== 'AMO') {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé - Seuls les AMO peuvent accéder à leur dashboard'
      });
    }
    
    // Récupérer tous les projets de l'AMO
    const projets = await Projet.findAll({
      where: { 
        amoId: amoId,
        isActive: true
      },
      order: [['updatedAt', 'DESC']],
      include: [
        {
          model: User,
          as: 'client',
          attributes: ['id', 'firstName', 'lastName', 'email', 'telephone']
        },
        {
          model: Mission,
          as: 'missions',
          where: { isActive: true },
          required: false
        }
      ]
    });
    
    // Calculer les statistiques pour le dashboard AMO
    const stats = {
      total: projets.length,
      acceptes: projets.filter(p => p.statut === 'accepte').length,
      enCours: projets.filter(p => p.statut === 'en_cours').length,
      termines: projets.filter(p => p.statut === 'termine').length,
      chiffreAffairesTotal: projets.reduce((sum, p) => sum + (p.budget || 0), 0),
      chiffreAffairesRealise: projets
        .filter(p => p.statut === 'termine')
        .reduce((sum, p) => sum + (p.budget || 0), 0)
    };
    
    // Enrichir chaque projet avec des infos calculées
    const projetsEnriches = projets.map(projet => {
      const projetJson = projet.toJSON();
      return {
        ...projetJson,
        budgetFormate: projet.budget ? 
          new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(projet.budget) : 
          'Non spécifié',
        dureeJours: Math.floor((new Date() - new Date(projet.createdAt)) / (1000 * 60 * 60 * 24)),
        adresseComplete: `${projet.address}, ${projet.city} ${projet.postalCode}`,
        nombreMissions: projet.missions ? projet.missions.length : 0
      };
    });
    
    res.status(200).json({
      success: true,
      data: {
        projets: projetsEnriches,
        statistiques: stats,
        amoInfo: {
          id: req.user.id,
          nom: `${req.user.firstName} ${req.user.lastName}`,
          entreprise: req.user.nomEntreprise,
          email: req.user.email,
          zoneIntervention: req.user.zoneIntervention
        }
      },
      message: `Dashboard AMO - ${projets.length} projet(s) récupéré(s)`
    });
    
  } catch (error) {
    console.error('❌ Erreur getMyAMOProjets (dashboard AMO):', error.message);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du dashboard AMO',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Erreur interne du serveur'
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
  getProjetsByStatus,
  getMyProjets,
  acceptProjet,
  getMyAMOProjets
}; 