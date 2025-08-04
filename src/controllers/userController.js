// ================================================
// CONTRÔLEUR UTILISATEURS AVEC SEQUELIZE
// ================================================

const { User } = require('../models');

const getAllUsers = async (req, res) => {
  try {
    console.log('📋 Récupération de tous les utilisateurs...');
    
    // Récupérer tous les utilisateurs avec pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    const { count, rows: users } = await User.findAndCountAll({
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      attributes: { exclude: ['password'] } // Exclure le mot de passe
    });
    
    res.status(200).json({
      success: true,
      data: users,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit)
      },
      message: `${users.length} utilisateur(s) récupéré(s) avec succès`
    });
    
  } catch (error) {
    console.error('❌ Erreur getAllUsers:', error.message);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des utilisateurs',
      error: error.message
    });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🔍 Recherche de l'utilisateur ID: ${id}`);
    
    // Validation de l'ID
    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID utilisateur invalide'
      });
    }
    
    const user = await User.findByPk(id, {
      attributes: { exclude: ['password'] }
    });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }
    
    res.status(200).json({
      success: true,
      data: user,
      message: 'Utilisateur récupéré avec succès'
    });
    
  } catch (error) {
    console.error('❌ Erreur getUserById:', error.message);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de l\'utilisateur',
      error: error.message
    });
  }
};

const createUser = async (req, res) => {
  try {
    const { 
      firstName, lastName, email, password, role, telephone,
      zoneIntervention, tagsMetiers, nomEntreprise 
    } = req.body;
    console.log(`👤 Création d'un nouvel utilisateur: ${email}`);
    
    // Validation des champs requis
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Le prénom, nom, email et mot de passe sont requis'
      });
    }
    
    // Vérifier si l'email existe déjà
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Cette adresse email est déjà utilisée'
      });
    }
    
    // Préparer les données pour les professionnels
    const userData = {
      firstName,
      lastName,
      email,
      password, // Sera hashé automatiquement par le hook
      role: role || 'client',
      telephone
    };
    
    // Ajouter les champs professionnels si le rôle l'exige
    const isProfessional = ['AMO', 'partenaire'].includes(role);
    if (isProfessional) {
      if (zoneIntervention) userData.zoneIntervention = zoneIntervention;
      if (tagsMetiers) userData.tagsMetiers = tagsMetiers;
      if (nomEntreprise) userData.nomEntreprise = nomEntreprise;
    }
    
    // Créer le nouvel utilisateur
    const newUser = await User.create(userData);
    
    res.status(201).json({
      success: true,
      data: newUser, // Le mot de passe sera exclu par toJSON()
      message: 'Utilisateur créé avec succès'
    });
    
  } catch (error) {
    console.error('❌ Erreur createUser:', error.message);
    
    // Gestion des erreurs de validation Sequelize
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: error.errors.map(err => err.message)
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de l\'utilisateur',
      error: error.message
    });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      firstName, lastName, email, role, isActive, telephone,
      zoneIntervention, tagsMetiers, nomEntreprise, noteFiabilite 
    } = req.body;
    console.log(`✏️ Mise à jour de l'utilisateur ID: ${id}`);
    
    // Validation de l'ID
    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID utilisateur invalide'
      });
    }
    
    // Trouver l'utilisateur
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }
    
    // Vérifier si le nouvel email existe déjà (sauf pour cet utilisateur)
    if (email && email !== user.email) {
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'Cette adresse email est déjà utilisée'
        });
      }
    }
    
    // Mettre à jour les champs de base
    const updateData = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (email) updateData.email = email;
    if (role) updateData.role = role;
    if (typeof isActive === 'boolean') updateData.isActive = isActive;
    if (telephone !== undefined) updateData.telephone = telephone;
    
    // Mettre à jour les champs professionnels si l'utilisateur est/devient un professionnel
    const currentUser = user;
    const newRole = role || currentUser.role;
    const isProfessional = ['AMO', 'partenaire'].includes(newRole);
    
    if (isProfessional) {
      if (zoneIntervention !== undefined) updateData.zoneIntervention = zoneIntervention;
      if (tagsMetiers !== undefined) updateData.tagsMetiers = tagsMetiers;
      if (nomEntreprise !== undefined) updateData.nomEntreprise = nomEntreprise;
      if (noteFiabilite !== undefined) {
        // Validation spéciale pour la note de fiabilité
        if (noteFiabilite >= 0 && noteFiabilite <= 5) {
          updateData.noteFiabilite = parseFloat(noteFiabilite.toFixed(2));
        } else {
          return res.status(400).json({
            success: false,
            message: 'La note de fiabilité doit être entre 0 et 5'
          });
        }
      }
    } else {
      // Si l'utilisateur n'est plus professionnel, vider les champs professionnels
      if (role && !isProfessional) {
        updateData.zoneIntervention = null;
        updateData.tagsMetiers = null;
        updateData.nomEntreprise = null;
        updateData.noteFiabilite = null;
      }
    }
    
    await user.update(updateData);
    
    res.status(200).json({
      success: true,
      data: user,
      message: 'Utilisateur mis à jour avec succès'
    });
    
  } catch (error) {
    console.error('❌ Erreur updateUser:', error.message);
    
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: error.errors.map(err => err.message)
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de l\'utilisateur',
      error: error.message
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🗑️ Suppression de l'utilisateur ID: ${id}`);
    
    // Validation de l'ID
    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID utilisateur invalide'
      });
    }
    
    // Trouver l'utilisateur
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }
    
    // Empêcher la suppression du dernier admin
    if (user.role === 'admin') {
      const adminCount = await User.count({ where: { role: 'admin' } });
      if (adminCount <= 1) {
        return res.status(403).json({
          success: false,
          message: 'Impossible de supprimer le dernier administrateur'
        });
      }
    }
    
    // Supprimer l'utilisateur
    await user.destroy();
    
    res.status(200).json({
      success: true,
      message: 'Utilisateur supprimé avec succès'
    });
    
  } catch (error) {
    console.error('❌ Erreur deleteUser:', error.message);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de l\'utilisateur',
      error: error.message
    });
  }
};

const getProfessionalsByTag = async (req, res) => {
  try {
    const { tag } = req.params;
    console.log(`🔍 Recherche des professionnels avec le tag: ${tag}`);
    
    const professionals = await User.findByTagMetier(tag, {
      attributes: { exclude: ['password'] }
    });
    
    res.status(200).json({
      success: true,
      data: professionals,
      message: `${professionals.length} professionnel(s) trouvé(s) avec le tag ${tag}`
    });
    
  } catch (error) {
    console.error('❌ Erreur getProfessionalsByTag:', error.message);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la recherche des professionnels',
      error: error.message
    });
  }
};

const getProfessionalsByZone = async (req, res) => {
  try {
    const { zone } = req.params;
    console.log(`🌍 Recherche des professionnels dans la zone: ${zone}`);
    
    const professionals = await User.findByZoneIntervention(zone, {
      attributes: { exclude: ['password'] }
    });
    
    res.status(200).json({
      success: true,
      data: professionals,
      message: `${professionals.length} professionnel(s) trouvé(s) dans la zone ${zone}`
    });
    
  } catch (error) {
    console.error('❌ Erreur getProfessionalsByZone:', error.message);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la recherche des professionnels',
      error: error.message
    });
  }
};

const getTopProfessionals = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const role = req.query.role; // 'AMO' ou 'partenaire'
    console.log(`⭐ Récupération des ${limit} meilleurs professionnels`);
    
    const professionals = await User.findTopProfessionals(limit, role);
    
    res.status(200).json({
      success: true,
      data: professionals,
      message: `Top ${professionals.length} des professionnels les mieux notés`
    });
    
  } catch (error) {
    console.error('❌ Erreur getTopProfessionals:', error.message);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des professionnels',
      error: error.message
    });
  }
};

const getPopularTagsMetiers = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    console.log(`📊 Récupération des ${limit} tags métiers les plus populaires`);
    
    const popularTags = await User.getPopularTagsMetiers(limit);
    
    res.status(200).json({
      success: true,
      data: popularTags,
      message: `Top ${popularTags.length} des tags métiers populaires`
    });
    
  } catch (error) {
    console.error('❌ Erreur getPopularTagsMetiers:', error.message);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des tags populaires',
      error: error.message
    });
  }
};

const addTagMetierToUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { tag } = req.body;
    console.log(`➕ Ajout du tag métier "${tag}" à l'utilisateur ID: ${id}`);
    
    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID utilisateur invalide'
      });
    }
    
    if (!tag) {
      return res.status(400).json({
        success: false,
        message: 'Le tag métier est requis'
      });
    }
    
    const user = await User.findByPk(id);
    if (!user || !user.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }
    
    if (!user.isProfessional()) {
      return res.status(403).json({
        success: false,
        message: 'Seuls les professionnels peuvent avoir des tags métiers'
      });
    }
    
    const added = user.addTagMetier(tag);
    if (added) {
      await user.save();
      res.status(200).json({
        success: true,
        data: user,
        message: `Tag métier "${tag}" ajouté avec succès`
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Tag métier déjà existant ou invalide'
      });
    }
    
  } catch (error) {
    console.error('❌ Erreur addTagMetierToUser:', error.message);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'ajout du tag métier',
      error: error.message
    });
  }
};

const removeTagMetierFromUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { tag } = req.body;
    console.log(`➖ Suppression du tag métier "${tag}" de l'utilisateur ID: ${id}`);
    
    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID utilisateur invalide'
      });
    }
    
    if (!tag) {
      return res.status(400).json({
        success: false,
        message: 'Le tag métier est requis'
      });
    }
    
    const user = await User.findByPk(id);
    if (!user || !user.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }
    
    const removed = user.removeTagMetier(tag);
    if (removed) {
      await user.save();
      res.status(200).json({
        success: true,
        data: user,
        message: `Tag métier "${tag}" supprimé avec succès`
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Tag métier non trouvé'
      });
    }
    
  } catch (error) {
    console.error('❌ Erreur removeTagMetierFromUser:', error.message);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du tag métier',
      error: error.message
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(`🔐 Tentative de connexion pour: ${email}`);
    
    // Validation des champs requis
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email et mot de passe sont requis'
      });
    }
    
    // Rechercher l'utilisateur par email
    const user = await User.findOne({ 
      where: { email: email.toLowerCase() },
      attributes: { include: ['password'] } // Inclure le mot de passe pour la vérification
    });
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      });
    }

    // Vérifier le mot de passe (supposons qu'il est hashé avec bcrypt)
    const bcrypt = require('bcryptjs');
    const isValidPassword = await bcrypt.compare(password, user.password);

    
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      });
    }
    
    // Générer le token JWT
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    // Retourner les données utilisateur (sans le mot de passe) et le token
    const userWithoutPassword = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      telephone: user.telephone,
      zoneIntervention: user.zoneIntervention,
      nomEntreprise: user.nomEntreprise,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
    
    res.status(200).json({
      success: true,
      message: 'Connexion réussie',
      data: {
        user: userWithoutPassword,
        token: token
      }
    });
    
  } catch (error) {
    console.error('❌ Erreur loginUser:', error.message);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la connexion',
      error: error.message
    });
  }
};

const registerAMO = async (req, res) => {
  try {
    const { firstName, lastName, email, password, passwordConfirm, telephone } = req.body;
    console.log(`👨‍💼 Inscription d'un nouveau professionnel AMO: ${email}`);
    
    // Validation des champs requis pour les AMO
    if (!firstName || !lastName || !email || !password || !passwordConfirm || !telephone) {
      return res.status(400).json({
        success: false,
        message: 'Tous les champs sont requis pour l\'inscription AMO (prénom, nom, email, mot de passe, confirmation mot de passe, téléphone)'
      });
    }
    
    // Vérification de la confirmation du mot de passe
    if (password !== passwordConfirm) {
      return res.status(400).json({
        success: false,
        message: 'Le mot de passe et sa confirmation ne correspondent pas'
      });
    }
    
    // Validation renforcée du mot de passe pour les professionnels
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Le mot de passe doit contenir au moins 8 caractères pour les professionnels'
      });
    }
    
    // Validation du format téléphone (basique)
    const phoneRegex = /^[\d\s\+\-\(\)\.]{8,20}$/;
    if (!phoneRegex.test(telephone)) {
      return res.status(400).json({
        success: false,
        message: 'Le format du numéro de téléphone n\'est pas valide'
      });
    }
    
    // Vérifier si l'email existe déjà
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Cette adresse email est déjà utilisée'
      });
    }
    
    // Préparer les données spécifiques pour un AMO
    const amoData = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      password, // Sera hashé automatiquement par le hook
      role: 'AMO', // Forcé à AMO pour cette route
      telephone: telephone.trim(),
      isActive: true
    };
    
    // Créer le nouvel AMO
    const newAMO = await User.create(amoData);
    
    console.log(`✅ Professionnel AMO ${newAMO.email} créé avec succès`);
    
    res.status(201).json({
      success: true,
      data: newAMO, // Le mot de passe sera exclu par toJSON()
      message: 'Inscription AMO réussie ! Bienvenue dans la communauté des professionnels.'
    });
    
  } catch (error) {
    console.error('❌ Erreur registerAMO:', error.message);
    
    // Gestion des erreurs de validation Sequelize
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: error.errors.map(err => err.message)
      });
    }
    
    // Gestion des erreurs d'unicité
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({
        success: false,
        message: 'Cette adresse email est déjà utilisée'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'inscription AMO',
      error: error.message
    });
  }
};

const registerPartner = async (req, res) => {
  try {
    const { 
      firstName, lastName, nomEntreprise, email, password, passwordConfirm, 
      telephone, tagsMetiers, zoneIntervention, siteWeb 
    } = req.body;
    console.log(`🏗️ Inscription d'un nouveau professionnel du bâtiment: ${email}`);
    
    // Validation des champs requis pour les partenaires
    if (!firstName || !lastName || !nomEntreprise || !email || !password || !passwordConfirm || !telephone) {
      return res.status(400).json({
        success: false,
        message: 'Tous les champs obligatoires sont requis (prénom, nom, nom entreprise, email, mot de passe, confirmation mot de passe, téléphone)'
      });
    }
    
    // Vérification de la confirmation du mot de passe
    if (password !== passwordConfirm) {
      return res.status(400).json({
        success: false,
        message: 'Le mot de passe et sa confirmation ne correspondent pas'
      });
    }
    
    // Validation renforcée du mot de passe pour les professionnels
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Le mot de passe doit contenir au moins 8 caractères pour les professionnels'
      });
    }
    
    // Validation du format téléphone
    const phoneRegex = /^[\d\s\+\-\(\)\.]{8,20}$/;
    if (!phoneRegex.test(telephone)) {
      return res.status(400).json({
        success: false,
        message: 'Le format du numéro de téléphone n\'est pas valide'
      });
    }
    
    // Validation des tags métiers (au moins un requis)
    if (!tagsMetiers || !Array.isArray(tagsMetiers) || tagsMetiers.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Au moins un tag métier est requis (ex: plombier, maçon, électricien...)'
      });
    }
    
    // Validation des zones d'intervention (au moins une requise)
    if (!zoneIntervention || !Array.isArray(zoneIntervention) || zoneIntervention.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Au moins une zone d\'intervention est requise (villes ou départements)'
      });
    }
    
    // Validation optionnelle du site web
    if (siteWeb && siteWeb.trim() !== '') {
      const urlRegex = /^https?:\/\/.+/;
      if (!urlRegex.test(siteWeb.trim())) {
        return res.status(400).json({
          success: false,
          message: 'Le site web doit commencer par http:// ou https://'
        });
      }
    }
    
    // Vérifier si l'email existe déjà
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Cette adresse email est déjà utilisée'
      });
    }
    
    // Préparer les données spécifiques pour un partenaire
    const partnerData = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      nomEntreprise: nomEntreprise.trim(),
      email: email.toLowerCase().trim(),
      password, // Sera hashé automatiquement par le hook
      role: 'partenaire', // Forcé à partenaire pour cette route
      telephone: telephone.trim(),
      tagsMetiers: tagsMetiers.map(tag => tag.toString().toLowerCase().trim()).filter(tag => tag.length > 0),
      zoneIntervention: zoneIntervention.map(zone => zone.toString().trim()).filter(zone => zone.length > 0),
      siteWeb: siteWeb && siteWeb.trim() !== '' ? siteWeb.trim() : null,
      isActive: true
    };
    
    // Créer le nouveau partenaire
    const newPartner = await User.create(partnerData);
    
    console.log(`✅ Professionnel du bâtiment ${newPartner.email} créé avec succès`);
    console.log(`🏷️ Tags métiers: ${newPartner.tagsMetiers.join(', ')}`);
    console.log(`🌍 Zones d'intervention: ${newPartner.zoneIntervention.join(', ')}`);
    
    res.status(201).json({
      success: true,
      data: newPartner, // Le mot de passe sera exclu par toJSON()
      message: 'Inscription professionnelle réussie ! Bienvenue dans notre réseau de partenaires du bâtiment.'
    });
    
  } catch (error) {
    console.error('❌ Erreur registerPartner:', error.message);
    
    // Gestion des erreurs de validation Sequelize
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: error.errors.map(err => err.message)
      });
    }
    
    // Gestion des erreurs d'unicité
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({
        success: false,
        message: 'Cette adresse email est déjà utilisée'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'inscription du partenaire',
      error: error.message
    });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getProfessionalsByTag,
  getProfessionalsByZone,
  getTopProfessionals,
  getPopularTagsMetiers,
  addTagMetierToUser,
  removeTagMetierFromUser,
  loginUser,
  registerAMO,
  registerPartner
}; 