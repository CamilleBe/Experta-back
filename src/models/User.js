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
  
  zoneIntervention: {
    type: DataTypes.JSON,
    allowNull: true,
    field: 'zone_intervention',
    defaultValue: null,
    validate: {
      isValidZoneArray(value) {
        if (value && !Array.isArray(value)) {
          throw new Error('zone_intervention doit être un tableau');
        }
        if (value && value.some(zone => typeof zone !== 'string')) {
          throw new Error('Toutes les zones doivent être des chaînes de caractères');
        }
      }
    },
    comment: 'Zones d\'intervention du professionnel (départements, villes, etc.)'
  },
  
  tagsMetiers: {
    type: DataTypes.JSON,
    allowNull: true,
    field: 'tags_metiers',
    defaultValue: null,
    validate: {
      isValidTagsArray(value) {
        if (value && !Array.isArray(value)) {
          throw new Error('tags_metiers doit être un tableau');
        }
        if (value && value.some(tag => typeof tag !== 'string')) {
          throw new Error('Tous les tags métiers doivent être des chaînes de caractères');
        }
      }
    },
    comment: 'Métiers et spécialités du professionnel'
  },
  
  nomEntreprise: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'nom_entreprise',
    validate: {
      len: {
        args: [2, 255],
        msg: 'Le nom de l\'entreprise doit contenir entre 2 et 255 caractères'
      }
    },
    comment: 'Nom de l\'entreprise du professionnel'
  },
  
  siteWeb: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'site_web',
    validate: {
      isUrl: {
        msg: 'L\'adresse du site web n\'est pas valide'
      },
      len: {
        args: [0, 255],
        msg: 'L\'adresse du site web ne peut pas dépasser 255 caractères'
      }
    },
    comment: 'Site web de l\'entreprise du professionnel'
  },
  
  siret: {
    type: DataTypes.STRING(14),
    allowNull: true,
    field: 'siret',
    validate: {
      len: {
        args: [14, 14],
        msg: 'Le numéro SIRET doit contenir exactement 14 chiffres'
      },
      isNumeric: {
        msg: 'Le numéro SIRET doit contenir uniquement des chiffres'
      },
      isSiretValid(value) {
        if (value && value.length === 14) {
          // Validation basique du format SIRET (14 chiffres)
          const siretRegex = /^\d{14}$/;
          if (!siretRegex.test(value)) {
            throw new Error('Le numéro SIRET doit contenir exactement 14 chiffres');
          }
        }
      }
    },
    comment: 'Numéro SIRET de l\'entreprise (14 chiffres)'
  },
  
  noteFiabilite: {
    type: DataTypes.FLOAT,
    allowNull: true,
    field: 'note_fiabilite',
    defaultValue: null,
    validate: {
      min: {
        args: [0],
        msg: 'La note de fiabilité ne peut pas être négativee'
      },
      max: {
        args: [5],
        msg: 'La note de fiabilité ne peut pas dépasser 5'
      }
    },
    comment: 'Note de fiabilité du professionnel (0 à 5)'
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
      
      // Normaliser les données professionnelles
      if (user.isProfessional()) {
        // Normaliser les tags métiers
        if (user.tagsMetiers && Array.isArray(user.tagsMetiers)) {
          user.tagsMetiers = user.tagsMetiers
            .map(tag => tag.toString().toLowerCase().trim())
            .filter(tag => tag.length > 0);
        }
        
        // Normaliser les zones d'intervention
        if (user.zoneIntervention && Array.isArray(user.zoneIntervention)) {
          user.zoneIntervention = user.zoneIntervention
            .map(zone => zone.toString().trim())
            .filter(zone => zone.length > 0);
        }
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
      
      // Normaliser les données professionnelles si changées
      if (user.isProfessional()) {
        // Normaliser les tags métiers si changés
        if (user.changed('tagsMetiers') && user.tagsMetiers && Array.isArray(user.tagsMetiers)) {
          user.tagsMetiers = user.tagsMetiers
            .map(tag => tag.toString().toLowerCase().trim())
            .filter(tag => tag.length > 0);
        }
        
        // Normaliser les zones d'intervention si changées
        if (user.changed('zoneIntervention') && user.zoneIntervention && Array.isArray(user.zoneIntervention)) {
          user.zoneIntervention = user.zoneIntervention
            .map(zone => zone.toString().trim())
            .filter(zone => zone.length > 0);
        }
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
    },
    {
      fields: ['nom_entreprise']
    },
    {
      fields: ['note_fiabilite']
    },
    {
      fields: ['role', 'note_fiabilite']
    },
    {
      fields: ['role', 'is_active']
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

// Vérifier si l'utilisateur est un professionnel
User.prototype.isProfessional = function() {
  return ['AMO', 'partenaire'].includes(this.role);
};

// Ajouter une zone d'intervention
User.prototype.addZoneIntervention = function(zone) {
  if (!this.isProfessional()) return false;
  
  if (!this.zoneIntervention) {
    this.zoneIntervention = [];
  }
  
  const normalizedZone = zone.toString().trim();
  if (normalizedZone && !this.zoneIntervention.includes(normalizedZone)) {
    this.zoneIntervention.push(normalizedZone);
    return true;
  }
  return false;
};

// Supprimer une zone d'intervention
User.prototype.removeZoneIntervention = function(zone) {
  if (!this.isProfessional() || !this.zoneIntervention) return false;
  
  const normalizedZone = zone.toString().trim();
  const initialLength = this.zoneIntervention.length;
  this.zoneIntervention = this.zoneIntervention.filter(z => z !== normalizedZone);
  
  return this.zoneIntervention.length < initialLength;
};

// Ajouter un tag métier
User.prototype.addTagMetier = function(tag) {
  if (!this.isProfessional()) return false;
  
  if (!this.tagsMetiers) {
    this.tagsMetiers = [];
  }
  
  const normalizedTag = tag.toString().toLowerCase().trim();
  if (normalizedTag && !this.tagsMetiers.includes(normalizedTag)) {
    this.tagsMetiers.push(normalizedTag);
    return true;
  }
  return false;
};

// Supprimer un tag métier
User.prototype.removeTagMetier = function(tag) {
  if (!this.isProfessional() || !this.tagsMetiers) return false;
  
  const normalizedTag = tag.toString().toLowerCase().trim();
  const initialLength = this.tagsMetiers.length;
  this.tagsMetiers = this.tagsMetiers.filter(t => t !== normalizedTag);
  
  return this.tagsMetiers.length < initialLength;
};

// Vérifier si un tag métier existe
User.prototype.hasTagMetier = function(tag) {
  if (!this.isProfessional() || !this.tagsMetiers) return false;
  
  const normalizedTag = tag.toString().toLowerCase().trim();
  return this.tagsMetiers.includes(normalizedTag);
};

// Vérifier si intervient dans une zone
User.prototype.interventInZone = function(zone) {
  if (!this.isProfessional() || !this.zoneIntervention) return false;
  
  const normalizedZone = zone.toString().trim();
  return this.zoneIntervention.includes(normalizedZone);
};

// Mettre à jour la note de fiabilité
User.prototype.updateNoteFiabilite = function(newNote) {
  if (!this.isProfessional()) return false;
  
  if (newNote >= 0 && newNote <= 5) {
    this.noteFiabilite = parseFloat(newNote.toFixed(2));
    return true;
  }
  return false;
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

// Trouver les professionnels par tag métier
User.findByTagMetier = async function(tag, options = {}) {
  const normalizedTag = tag.toString().toLowerCase().trim();
  
  return await this.findAll({
    where: {
      [sequelize.Op.and]: [
        { role: { [sequelize.Op.in]: ['AMO', 'partenaire'] } },
        { isActive: true },
        sequelize.where(
          sequelize.fn('JSON_SEARCH', sequelize.col('tags_metiers'), 'one', normalizedTag),
          { [sequelize.Op.ne]: null }
        ),
        ...(options.where ? [options.where] : [])
      ]
    },
    order: options.order || [['noteFiabilite', 'DESC'], ['createdAt', 'DESC']],
    ...options
  });
};

// Trouver les professionnels par zone d'intervention
User.findByZoneIntervention = async function(zone, options = {}) {
  const normalizedZone = zone.toString().trim();
  
  return await this.findAll({
    where: {
      [sequelize.Op.and]: [
        { role: { [sequelize.Op.in]: ['AMO', 'partenaire'] } },
        { isActive: true },
        sequelize.where(
          sequelize.fn('JSON_SEARCH', sequelize.col('zone_intervention'), 'one', normalizedZone),
          { [sequelize.Op.ne]: null }
        ),
        ...(options.where ? [options.where] : [])
      ]
    },
    order: options.order || [['noteFiabilite', 'DESC'], ['createdAt', 'DESC']],
    ...options
  });
};

// Trouver les professionnels les mieux notés
User.findTopProfessionals = async function(limit = 10, role = null) {
  const whereCondition = {
    role: role ? role : { [sequelize.Op.in]: ['AMO', 'partenaire'] },
    isActive: true,
    noteFiabilite: { [sequelize.Op.ne]: null }
  };
  
  return await this.findAll({
    where: whereCondition,
    order: [['noteFiabilite', 'DESC'], ['createdAt', 'DESC']],
    limit: limit,
    attributes: { exclude: ['password'] }
  });
};

// Statistiques des tags métiers les plus populaires chez les pros
User.getPopularTagsMetiers = async function(limit = 10) {
  const professionals = await this.findAll({
    where: { 
      role: { [sequelize.Op.in]: ['AMO', 'partenaire'] },
      isActive: true,
      tagsMetiers: { [sequelize.Op.ne]: null }
    },
    attributes: ['tagsMetiers']
  });
  
  // Compter les occurrences de chaque tag
  const tagCounts = {};
  professionals.forEach(pro => {
    if (pro.tagsMetiers && Array.isArray(pro.tagsMetiers)) {
      pro.tagsMetiers.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    }
  });
  
  // Trier par popularité
  return Object.entries(tagCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, limit)
    .map(([tag, count]) => ({ tag, count }));
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
  
  // Ajouter des informations calculées pour les professionnels
  if (this.isProfessional()) {
    values.isProfessional = true;
    values.tagsCount = this.tagsMetiers ? this.tagsMetiers.length : 0;
    values.zonesCount = this.zoneIntervention ? this.zoneIntervention.length : 0;
    values.hasNote = this.noteFiabilite !== null;
    values.hasSiteWeb = this.siteWeb !== null && this.siteWeb !== '';
  } else {
    values.isProfessional = false;
  }
  
  return values;
};

console.log('✅ Modèle User créé avec succès');

module.exports = User; 