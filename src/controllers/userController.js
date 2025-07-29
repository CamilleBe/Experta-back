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
    const { firstName, lastName, email, password, role, telephone } = req.body;
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
    
    // Créer le nouvel utilisateur
    const newUser = await User.create({
      firstName,
      lastName,
      email,
      password, // Sera hashé automatiquement par le hook
      role: role || 'client',
      telephone
    });
    
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
    const { firstName, lastName, email, role, isActive, telephone } = req.body;
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
    
    // Mettre à jour les champs
    const updateData = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (email) updateData.email = email;
    if (role) updateData.role = role;
    if (typeof isActive === 'boolean') updateData.isActive = isActive;
    if (telephone !== undefined) updateData.telephone = telephone;
    
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

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
}; 