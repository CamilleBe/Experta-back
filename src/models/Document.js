const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// ================================================
// MODÈLE DOCUMENT AVEC SEQUELIZE
// ================================================

console.log('📝 Création du modèle Document...');

const Document = sequelize.define('Document', {
  // ================================================
  // DÉFINITION DES CHAMPS
  // ================================================
  
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    comment: 'Identifiant unique du document'
  },
  
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'user_id',
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    comment: 'Identifiant de l\'utilisateur propriétaire du document'
  },
  
  nom: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Le nom du document ne peut pas être vide'
      },
      len: {
        args: [1, 255],
        msg: 'Le nom du document doit contenir entre 1 et 255 caractères'
      }
    },
    comment: 'Nom du document'
  },
  
  type: {
    type: DataTypes.ENUM('contrat', 'devis', 'facture', 'rapport', 'presentation', 'autre'),
    allowNull: false,
    validate: {
      isIn: {
        args: [['contrat', 'devis', 'facture', 'rapport', 'presentation', 'autre']],
        msg: 'Le type doit être contrat, devis, facture, rapport, presentation ou autre'
      }
    },
    comment: 'Type de document'
  },
  
  lienFichier: {
    type: DataTypes.STRING(500),
    allowNull: false,
    field: 'lien_fichier',
    validate: {
      notEmpty: {
        msg: 'Le lien du fichier ne peut pas être vide'
      }
      // Suppression de la validation isUrl pour permettre les chemins locaux
    },
    comment: 'URL ou chemin vers le fichier (local ou distant)'
  },
  
  tailleFichier: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'taille_fichier',
    validate: {
      min: {
        args: [0],
        msg: 'La taille du fichier ne peut pas être négative'
      }
    },
    comment: 'Taille du fichier en bytes'
  },
  
  formatFichier: {
    type: DataTypes.STRING(10),
    allowNull: true,
    field: 'format_fichier',
    validate: {
      len: {
        args: [1, 10],
        msg: 'Le format du fichier doit contenir entre 1 et 10 caractères'
      }
    },
    comment: 'Extension du fichier (pdf, docx, xlsx, etc.)'
  },

  // ================================================
  // NOUVEAUX CHAMPS POUR SUPPORT UPLOAD
  // ================================================
  
  nomOriginal: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'nom_original',
    comment: 'Nom original du fichier uploadé'
  },
  
  nomFichier: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'nom_fichier',
    comment: 'Nom du fichier sur le serveur'
  },
  
  mimeType: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'mime_type',
    comment: 'Type MIME du fichier'
  },
  
  cheminFichier: {
    type: DataTypes.STRING(500),
    allowNull: true,
    field: 'chemin_fichier',
    comment: 'Chemin relatif vers le fichier sur le serveur'
  },
  
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active',
    comment: 'Indique si le document est actif'
  },

  // ================================================
  // CHAMPS POUR GESTION AMO/CLIENT
  // ================================================
  
  projetId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'projet_id',
    references: {
      model: 'projets',
      key: 'id'
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    comment: 'Identifiant du projet associé'
  },
  
  authorType: {
    type: DataTypes.ENUM('client', 'AMO'),
    allowNull: false,
    defaultValue: 'client',
    field: 'author_type',
    comment: 'Type d\'auteur du document (client ou AMO)'
  },
  
  visibilite: {
    type: DataTypes.ENUM('prive', 'partage'),
    allowNull: false,
    defaultValue: 'prive',
    field: 'visibilite',
    comment: 'Visibilité du document (privé ou partagé avec l\'autre partie)'
  }
  
}, {
  // ================================================
  // OPTIONS DU MODÈLE
  // ================================================
  
  tableName: 'documents',
  timestamps: true,
  underscored: true,
  
  // ================================================
  // INDEX POUR LES PERFORMANCES
  // ================================================
  
  indexes: [
    {
      fields: ['user_id']
    },
    {
      fields: ['type']
    },
    {
      fields: ['is_active']
    },
    {
      fields: ['created_at']
    },
    {
      fields: ['user_id', 'type']
    }
  ]
});

// ================================================
// MÉTHODES INSTANCE
// ================================================

// Obtenir l'extension du fichier
Document.prototype.getFileExtension = function() {
  if (this.formatFichier) {
    return this.formatFichier.toLowerCase();
  }
  
  // Extraire l'extension depuis le lien fichier si pas définie
  const url = this.lienFichier;
  const extension = url.split('.').pop();
  return extension ? extension.toLowerCase() : 'unknown';
};

// Vérifier si le document est un PDF
Document.prototype.isPDF = function() {
  return this.getFileExtension() === 'pdf';
};

// Obtenir la taille formatée
Document.prototype.getFormattedSize = function() {
  if (!this.tailleFichier) return 'Taille inconnue';
  
  const bytes = this.tailleFichier;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  
  if (bytes === 0) return '0 Bytes';
  
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
};

// Obtenir le type de fichier lisible
Document.prototype.getReadableFileType = function() {
  if (this.mimeType) {
    const mimeMap = {
      'application/pdf': 'PDF',
      'application/msword': 'Document Word',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Document Word',
      'image/jpeg': 'Image JPEG',
      'image/png': 'Image PNG'
    };
    return mimeMap[this.mimeType] || 'Fichier';
  }
  
  // Fallback sur le type métier
  const typeMap = {
    'contrat': 'Contrat',
    'devis': 'Devis', 
    'facture': 'Facture',
    'rapport': 'Rapport',
    'presentation': 'Présentation',
    'autre': 'Autre'
  };
  return typeMap[this.type] || 'Document';
};

// ================================================
// MÉTHODES STATIQUES
// ================================================

// Trouver les documents d'un utilisateur
Document.findByUserId = async function(userId, options = {}) {
  return await this.findAll({
    where: { 
      userId: userId,
      isActive: true,
      ...options.where
    },
    order: options.order || [['createdAt', 'DESC']],
    ...options
  });
};

// Trouver les documents par type
Document.findByType = async function(type, options = {}) {
  return await this.findAll({
    where: { 
      type: type,
      isActive: true,
      ...options.where
    },
    order: options.order || [['createdAt', 'DESC']],
    ...options
  });
};

// Compter les documents par type
Document.countByType = async function() {
  return await this.findAll({
    attributes: [
      'type',
      [sequelize.fn('COUNT', sequelize.col('id')), 'count']
    ],
    where: { isActive: true },
    group: ['type']
  });
};

// ================================================
// PERSONNALISER LA SÉRIALISATION JSON
// ================================================

Document.prototype.toJSON = function() {
  const values = { ...this.get() };
  
  // Ajouter des données calculées
  values.fileExtension = this.getFileExtension();
  values.formattedSize = this.getFormattedSize();
  values.isPDF = this.isPDF();
  
  return values;
};

console.log('✅ Modèle Document créé avec succès');

module.exports = Document; 