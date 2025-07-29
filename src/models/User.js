const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');

// ================================================
// MODÈLE USER AVEC SEQUELIZE
// ================================================

console.log('📝 Création du modèle User...');

const User = sequelize.define('User', {
  // ================================================
  // DÉFINITION DES CHAMPS
  // ================================================
  
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    comment: 'Identifiant unique de l\'utilisateur'
  },
  
  firstName: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'first_name', // Nom de colonne en snake_case
    validate: {
      notEmpty: {
        msg: 'Le prénom ne peut pas être vide'
      },
      len: {
        args: [2, 50],
        msg: 'Le prénom doit contenir entre 2 et 50 caractères'
      }
    },
    comment: 'Prénom de l\'utilisateur'
  },
  
  lastName: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'last_name',
    validate: {
      notEmpty: {
        msg: 'Le nom ne peut pas être vide'
      },
      len: {
        args: [2, 50],
        msg: 'Le nom doit contenir entre 2 et 50 caractères'
      }
    },
    comment: 'Nom de famille de l\'utilisateur'
  },
  
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: {
      name: 'unique_email',
      msg: 'Cette adresse email est déjà utilisée'
    },
    validate: {
      isEmail: {
        msg: 'L\'adresse email n\'est pas valide'
      },
      notEmpty: {
        msg: 'L\'email ne peut pas être vide'
      }
    },
    comment: 'Adresse email unique de l\'utilisateur'
  },
  
  telephone: {
    type: DataTypes.STRING(20),
    allowNull: true,
    validate: {
      len: {
        args: [8, 20],
        msg: 'Le numéro de téléphone doit contenir entre 8 et 20 caractères'
      },
      is: {
        args: /^[\d\s\+\-\(\)\.]+$/,
        msg: 'Le numéro de téléphone contient des caractères non valides'
      }
    },
    comment: 'Numéro de téléphone de l\'utilisateur'
  },
  
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Le mot de passe ne peut pas être vide'
      },
      len: {
        args: [6, 255],
        msg: 'Le mot de passe doit contenir au moins 6 caractères'
      }
    },
    comment: 'Mot de passe hashé de l\'utilisateur'
  },
  
  role: {
    type: DataTypes.ENUM('client', 'AMO', 'partenaire', 'admin'),
    defaultValue: 'client',
    allowNull: false,
    validate: {
      isIn: {
        args: [['client', 'AMO', 'partenaire', 'admin']],
        msg: 'Le rôle doit être client, AMO, partenaire ou admin'
      }
    },
    comment: 'Rôle de l\'utilisateur dans l\'application'
  },
  
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active',
    comment: 'Indique si le compte utilisateur est actif'
  },
  
  lastLogin: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'last_login',
    comment: 'Date et heure de la dernière connexion'
  }
  
}, {
  // ================================================
  // OPTIONS DU MODÈLE
  // ================================================
  
  tableName: 'users',
  timestamps: true, // Ajoute created_at et updated_at
  underscored: true, // Utilise snake_case pour les colonnes
  
  // ================================================
  // HOOKS SEQUELIZE (ÉVÉNEMENTS)
  // ================================================
  
  hooks: {
    // Avant création d'un utilisateur
    beforeCreate: async (user, options) => {
      console.log(`🔐 Hashage du mot de passe pour ${user.email}...`);
      if (user.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
    
    // Avant mise à jour d'un utilisateur
    beforeUpdate: async (user, options) => {
      // Hash seulement si le mot de passe a changé
      if (user.changed('password')) {
        console.log(`🔐 Nouveau mot de passe pour ${user.email}...`);
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
    
    // Après création
    afterCreate: async (user, options) => {
      console.log(`✅ Utilisateur ${user.email} créé avec succès`);
    }
  },
  
  // ================================================
  // INDEX POUR LES PERFORMANCES
  // ================================================
  
  indexes: [
    {
      unique: true,
      fields: ['email']
    },
    {
      fields: ['role']
    },
    {
      fields: ['is_active']
    },
    {
      fields: ['created_at']
    }
  ]
});

// ================================================
// MÉTHODES INSTANCE (sur chaque utilisateur)
// ================================================

// Vérifier le mot de passe
User.prototype.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    console.error('❌ Erreur lors de la comparaison du mot de passe:', error.message);
    return false;
  }
};

// Obtenir le nom complet
User.prototype.getFullName = function() {
  return `${this.firstName} ${this.lastName}`;
};

// Mettre à jour la dernière connexion
User.prototype.updateLastLogin = async function() {
  this.lastLogin = new Date();
  await this.save();
  console.log(`🔄 Dernière connexion mise à jour pour ${this.email}`);
};

// Vérifier si l'utilisateur est admin
User.prototype.isAdmin = function() {
  return this.role === 'admin';
};

// ================================================
// MÉTHODES STATIQUES (sur le modèle User)
// ================================================

// Trouver un utilisateur par email
User.findByEmail = async function(email) {
  return await this.findOne({
    where: { email: email.toLowerCase() }
  });
};

// Trouver les utilisateurs actifs
User.findActiveUsers = async function() {
  return await this.findAll({
    where: { isActive: true },
    order: [['createdAt', 'DESC']]
  });
};

// Compter les utilisateurs par rôle
User.countByRole = async function() {
  return await this.findAll({
    attributes: [
      'role',
      [sequelize.fn('COUNT', sequelize.col('id')), 'count']
    ],
    group: ['role']
  });
};

// ================================================
// PERSONNALISER LA SÉRIALISATION JSON
// ================================================

User.prototype.toJSON = function() {
  const values = { ...this.get() };
  
  // Supprimer le mot de passe des réponses JSON
  delete values.password;
  
  // Ajouter le nom complet
  values.fullName = this.getFullName();
  
  return values;
};

console.log('✅ Modèle User créé avec succès');

module.exports = User; 