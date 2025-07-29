const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// ================================================
// MODÈLE MISSION AVEC SEQUELIZE
// ================================================

console.log('📝 Création du modèle Mission...');

const Mission = sequelize.define('Mission', {
  // ================================================
  // DÉFINITION DES CHAMPS
  // ================================================
  
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    comment: 'Identifiant unique de la mission'
  },
  
  projectId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'project_id',
    references: {
      model: 'projets',
      key: 'id'
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    comment: 'Identifiant du projet associé à la mission'
  },
  
  tagsMetiers: {
    type: DataTypes.JSON,
    allowNull: true,
    field: 'tags_metiers',
    defaultValue: [],
    validate: {
      isValidTagsArray(value) {
        if (value && !Array.isArray(value)) {
          throw new Error('tags_metiers doit être un tableau');
        }
        if (value && value.some(tag => typeof tag !== 'string')) {
          throw new Error('Tous les tags doivent être des chaînes de caractères');
        }
      }
    },
    comment: 'Liste des métiers nécessaires pour la mission'
  },
  
  commentaireAMO: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'commentaire_AMO',
    validate: {
      len: {
        args: [0, 2000],
        msg: 'Le commentaire AMO ne peut pas dépasser 2000 caractères'
      }
    },
    comment: 'Commentaire de l\'AMO pour la mission'
  },
  
  dateCreation: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'date_creation',
    defaultValue: DataTypes.NOW,
    comment: 'Date de création de la mission'
  },
  
  statut: {
    type: DataTypes.ENUM('en_attente', 'en_cours', 'terminé'),
    allowNull: false,
    defaultValue: 'en_attente',
    validate: {
      isIn: {
        args: [['en_attente', 'en_cours', 'terminé']],
        msg: 'Le statut doit être en_attente, en_cours ou terminé'
      }
    },
    comment: 'Statut actuel de la mission'
  },
  
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active',
    comment: 'Indique si la mission est active'
  }
  
}, {
  // ================================================
  // OPTIONS DU MODÈLE
  // ================================================
  
  tableName: 'missions',
  timestamps: true,
  underscored: true,
  
  // ================================================
  // HOOKS SEQUELIZE
  // ================================================
  
  hooks: {
    beforeCreate: async (mission, options) => {
      // S'assurer que la date de création est définie
      if (!mission.dateCreation) {
        mission.dateCreation = new Date();
      }
      
      // Normaliser les tags métiers (lowercase, trim)
      if (mission.tagsMetiers && Array.isArray(mission.tagsMetiers)) {
        mission.tagsMetiers = mission.tagsMetiers
          .map(tag => tag.toString().toLowerCase().trim())
          .filter(tag => tag.length > 0);
      }
    },
    
    beforeUpdate: async (mission, options) => {
      // Normaliser les tags métiers lors de la mise à jour
      if (mission.tagsMetiers && Array.isArray(mission.tagsMetiers)) {
        mission.tagsMetiers = mission.tagsMetiers
          .map(tag => tag.toString().toLowerCase().trim())
          .filter(tag => tag.length > 0);
      }
    }
  },
  
  // ================================================
  // INDEX POUR LES PERFORMANCES
  // ================================================
  
  indexes: [
    {
      fields: ['project_id']
    },
    {
      fields: ['statut']
    },
    {
      fields: ['date_creation']
    },
    {
      fields: ['is_active']
    },
    {
      fields: ['project_id', 'statut']
    }
  ]
});

// ================================================
// MÉTHODES INSTANCE
// ================================================

// Vérifier si la mission est en cours
Mission.prototype.isInProgress = function() {
  return this.statut === 'en_cours';
};

// Vérifier si la mission est terminée
Mission.prototype.isCompleted = function() {
  return this.statut === 'terminé';
};

// Ajouter un tag métier
Mission.prototype.addTagMetier = function(tag) {
  if (!this.tagsMetiers) {
    this.tagsMetiers = [];
  }
  
  const normalizedTag = tag.toString().toLowerCase().trim();
  if (normalizedTag && !this.tagsMetiers.includes(normalizedTag)) {
    this.tagsMetiers.push(normalizedTag);
  }
};

// Supprimer un tag métier
Mission.prototype.removeTagMetier = function(tag) {
  if (!this.tagsMetiers) return;
  
  const normalizedTag = tag.toString().toLowerCase().trim();
  this.tagsMetiers = this.tagsMetiers.filter(t => t !== normalizedTag);
};

// Vérifier si un tag métier existe
Mission.prototype.hasTagMetier = function(tag) {
  if (!this.tagsMetiers) return false;
  
  const normalizedTag = tag.toString().toLowerCase().trim();
  return this.tagsMetiers.includes(normalizedTag);
};

// Obtenir le nombre de tags métiers
Mission.prototype.getTagsCount = function() {
  return this.tagsMetiers ? this.tagsMetiers.length : 0;
};

// Calculer la durée de la mission
Mission.prototype.getMissionDuration = function() {
  if (!this.dateCreation) return null;
  
  const endDate = this.statut === 'terminé' ? this.updatedAt : new Date();
  const diffTime = Math.abs(endDate - this.dateCreation);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

// ================================================
// MÉTHODES STATIQUES
// ================================================

// Trouver les missions d'un projet
Mission.findByProjectId = async function(projectId, options = {}) {
  return await this.findAll({
    where: { 
      projectId: projectId,
      isActive: true,
      ...options.where
    },
    order: options.order || [['dateCreation', 'DESC']],
    ...options
  });
};

// Trouver les missions par statut
Mission.findByStatus = async function(statut, options = {}) {
  return await this.findAll({
    where: { 
      statut: statut,
      isActive: true,
      ...options.where
    },
    order: options.order || [['dateCreation', 'DESC']],
    ...options
  });
};

// Trouver les missions contenant un tag métier spécifique
Mission.findByTagMetier = async function(tag, options = {}) {
  const normalizedTag = tag.toString().toLowerCase().trim();
  
  return await this.findAll({
    where: {
      [sequelize.Op.and]: [
        { isActive: true },
        sequelize.where(
          sequelize.fn('JSON_SEARCH', sequelize.col('tags_metiers'), 'one', normalizedTag),
          { [sequelize.Op.ne]: null }
        ),
        ...(options.where ? [options.where] : [])
      ]
    },
    order: options.order || [['dateCreation', 'DESC']],
    ...options
  });
};

// Compter les missions par statut
Mission.countByStatus = async function() {
  return await this.findAll({
    attributes: [
      'statut',
      [sequelize.fn('COUNT', sequelize.col('id')), 'count']
    ],
    where: { isActive: true },
    group: ['statut']
  });
};

// Statistiques des tags métiers les plus utilisés
Mission.getPopularTags = async function(limit = 10) {
  const missions = await this.findAll({
    where: { 
      isActive: true,
      tagsMetiers: { [sequelize.Op.ne]: null }
    },
    attributes: ['tagsMetiers']
  });
  
  // Compter les occurrences de chaque tag
  const tagCounts = {};
  missions.forEach(mission => {
    if (mission.tagsMetiers && Array.isArray(mission.tagsMetiers)) {
      mission.tagsMetiers.forEach(tag => {
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

Mission.prototype.toJSON = function() {
  const values = { ...this.get() };
  
  // Ajouter des données calculées
  values.isInProgress = this.isInProgress();
  values.isCompleted = this.isCompleted();
  values.tagsCount = this.getTagsCount();
  values.missionDuration = this.getMissionDuration();
  
  return values;
};

console.log('✅ Modèle Mission créé avec succès');

module.exports = Mission; 