const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// ================================================
// MODÈLE PROJET AVEC SEQUELIZE
// ================================================

console.log('📝 Création du modèle Projet...');

const Projet = sequelize.define('Projet', {
  // ================================================
  // DÉFINITION DES CHAMPS
  // ================================================
  
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    comment: 'Identifiant unique du projet'
  },
  
  clientId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'client_id',
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    comment: 'Identifiant du client propriétaire du projet'
  },
  
  amoId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'amo_id',
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
    comment: 'Identifiant de l\'AMO assigné au projet'
  },
  
  statut: {
    type: DataTypes.ENUM('brouillon', 'en_attente_AMO', 'en_mise_en_relation', 'devis_reçus', 'clôturé'),
    allowNull: false,
    defaultValue: 'brouillon',
    validate: {
      isIn: {
        args: [['brouillon', 'en_attente_AMO', 'en_mise_en_relation', 'devis_reçus', 'clôturé']],
        msg: 'Le statut doit être brouillon, en_attente_AMO, en_mise_en_relation, devis_reçus ou clôturé'
      }
    },
    comment: 'Statut actuel du projet'
  },
  
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'La description ne peut pas être vide'
      },
      len: {
        args: [10, 5000],
        msg: 'La description doit contenir entre 10 et 5000 caractères'
      }
    },
    comment: 'Description détaillée du projet'
  },
  
  address: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'L\'adresse ne peut pas être vide'
      },
      len: {
        args: [5, 255],
        msg: 'L\'adresse doit contenir entre 5 et 255 caractères'
      }
    },
    comment: 'Adresse du projet'
  },
  
  city: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'La ville ne peut pas être vide'
      },
      len: {
        args: [2, 100],
        msg: 'La ville doit contenir entre 2 et 100 caractères'
      }
    },
    comment: 'Ville du projet'
  },
  
  postalCode: {
    type: DataTypes.STRING(10),
    allowNull: false,
    field: 'postal_code',
    validate: {
      notEmpty: {
        msg: 'Le code postal ne peut pas être vide'
      },
      is: {
        args: /^[0-9]{5}$/,
        msg: 'Le code postal doit contenir exactement 5 chiffres'
      }
    },
    comment: 'Code postal du projet'
  },
  
  budget: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    validate: {
      min: {
        args: [0],
        msg: 'Le budget ne peut pas être négatif'
      }
    },
    comment: 'Budget estimé du projet en euros'
  },
  
  surfaceM2: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'surface_m2',
    validate: {
      min: {
        args: [1],
        msg: 'La surface doit être d\'au moins 1 m²'
      }
    },
    comment: 'Surface du projet en mètres carrés'
  },
  
  bedrooms: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: {
        args: [0],
        msg: 'Le nombre de chambres ne peut pas être négatif'
      }
    },
    comment: 'Nombre de chambres'
  },
  
  houseType: {
    type: DataTypes.ENUM('plain-pied', 'étage', 'autre'),
    allowNull: true,
    field: 'house_type',
    validate: {
      isIn: {
        args: [['plain-pied', 'étage', 'autre']],
        msg: 'Le type de maison doit être plain-pied, étage ou autre'
      }
    },
    comment: 'Type de maison'
  },
  
  hasLand: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false,
    field: 'has_land',
    comment: 'Indique si le projet inclut un terrain'
  },
  
  dateSubmission: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'date_soumission',
    comment: 'Date de soumission du projet'
  },
  
  dateModification: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'date_modification',
    comment: 'Date de dernière modification du projet'
  },
  
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active',
    comment: 'Indique si le projet est actif'
  }
  
}, {
  // ================================================
  // OPTIONS DU MODÈLE
  // ================================================
  
  tableName: 'projets',
  timestamps: true,
  underscored: true,
  
  // ================================================
  // HOOKS SEQUELIZE
  // ================================================
  
  hooks: {
    beforeUpdate: async (projet, options) => {
      // Mettre à jour automatiquement la date de modification
      projet.dateModification = new Date();
    },
    
    beforeCreate: async (projet, options) => {
      // Définir la date de soumission si pas définie
      if (!projet.dateSubmission) {
        projet.dateSubmission = new Date();
      }
    }
  },
  
  // ================================================
  // INDEX POUR LES PERFORMANCES
  // ================================================
  
  indexes: [
    {
      fields: ['client_id']
    },
    {
      fields: ['amo_id']
    },
    {
      fields: ['statut']
    },
    {
      fields: ['city']
    },
    {
      fields: ['postal_code']
    },
    {
      fields: ['is_active']
    },
    {
      fields: ['date_soumission']
    },
    {
      fields: ['client_id', 'statut']
    }
  ]
});

// ================================================
// MÉTHODES INSTANCE
// ================================================

// Obtenir l'adresse complète
Projet.prototype.getFullAddress = function() {
  return `${this.address}, ${this.postalCode} ${this.city}`;
};

// Vérifier si le projet est en cours
Projet.prototype.isInProgress = function() {
  return ['en_attente_AMO', 'en_mise_en_relation', 'devis_reçus'].includes(this.statut);
};

// Vérifier si le projet est terminé
Projet.prototype.isCompleted = function() {
  return this.statut === 'clôturé';
};

// Obtenir le budget formaté
Projet.prototype.getFormattedBudget = function() {
  if (!this.budget) return 'Budget non défini';
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(this.budget);
};

// Calculer la durée du projet
Projet.prototype.getProjectDuration = function() {
  if (!this.dateSubmission) return null;
  
  const endDate = this.statut === 'clôturé' && this.dateModification 
    ? this.dateModification 
    : new Date();
  
  const diffTime = Math.abs(endDate - this.dateSubmission);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

// ================================================
// MÉTHODES STATIQUES
// ================================================

// Trouver les projets d'un client
Projet.findByClientId = async function(clientId, options = {}) {
  return await this.findAll({
    where: { 
      clientId: clientId,
      isActive: true,
      ...options.where
    },
    order: options.order || [['createdAt', 'DESC']],
    ...options
  });
};

// Trouver les projets d'un AMO
Projet.findByAmoId = async function(amoId, options = {}) {
  return await this.findAll({
    where: { 
      amoId: amoId,
      isActive: true,
      ...options.where
    },
    order: options.order || [['createdAt', 'DESC']],
    ...options
  });
};

// Trouver les projets par statut
Projet.findByStatus = async function(statut, options = {}) {
  return await this.findAll({
    where: { 
      statut: statut,
      isActive: true,
      ...options.where
    },
    order: options.order || [['createdAt', 'DESC']],
    ...options
  });
};

// Compter les projets par statut
Projet.countByStatus = async function() {
  return await this.findAll({
    attributes: [
      'statut',
      [sequelize.fn('COUNT', sequelize.col('id')), 'count']
    ],
    where: { isActive: true },
    group: ['statut']
  });
};

// Statistiques des projets par ville
Projet.getStatsByCity = async function() {
  return await this.findAll({
    attributes: [
      'city',
      [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      [sequelize.fn('AVG', sequelize.col('budget')), 'avgBudget']
    ],
    where: { isActive: true },
    group: ['city'],
    order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']]
  });
};

// ================================================
// PERSONNALISER LA SÉRIALISATION JSON
// ================================================

Projet.prototype.toJSON = function() {
  const values = { ...this.get() };
  
  // Ajouter des données calculées
  values.fullAddress = this.getFullAddress();
  values.formattedBudget = this.getFormattedBudget();
  values.isInProgress = this.isInProgress();
  values.isCompleted = this.isCompleted();
  values.projectDuration = this.getProjectDuration();
  
  return values;
};

console.log('✅ Modèle Projet créé avec succès');

module.exports = Projet; 