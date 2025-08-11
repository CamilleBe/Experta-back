// ================================================
// CONTRÔLEUR CLIENT DOCUMENTS POUR DASHBOARD CLIENT
// ================================================

const { Document, User } = require('../models');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const fsSync = require('fs');

// ================================================
// CONFIGURATION MULTER POUR UPLOAD DE FICHIERS
// ================================================

// Créer le dossier uploads s'il n'existe pas
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fsSync.existsSync(uploadsDir)) {
  fsSync.mkdirSync(uploadsDir, { recursive: true });
  console.log('📁 Dossier uploads créé:', uploadsDir);
}

// Configuration du stockage multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Créer un dossier par client pour organiser les fichiers
    const clientId = req.user.id;
    const clientDir = path.join(uploadsDir, `client_${clientId}`);
    
    // Créer le dossier client s'il n'existe pas
    if (!fsSync.existsSync(clientDir)) {
      fsSync.mkdirSync(clientDir, { recursive: true });
    }
    
    cb(null, clientDir);
  },
  filename: function (req, file, cb) {
    // Générer un nom de fichier unique avec timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    const fileName = `document-${uniqueSuffix}${extension}`;
    cb(null, fileName);
  }
});

// Filtre pour valider les types de fichiers
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png'
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Type de fichier non autorisé. Types acceptés: PDF, DOC, DOCX, JPG, PNG'), false);
  }
};

// Configuration multer avec limites
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
    files: 5 // Maximum 5 fichiers à la fois
  }
}).array('documents', 5); // Nom du champ + max 5 fichiers

// ================================================
// ENDPOINT: POST /api/documents/upload
// Description: Upload de fichiers (multipart/form-data)
// ================================================

const uploadDocuments = async (req, res) => {
  try {
    console.log(`📤 Upload documents - Client ID: ${req.user.id}`);
    
    // Vérifier que l'utilisateur est bien un client
    if (req.user.role !== 'client') {
      console.log(`❌ Accès refusé - rôle: ${req.user.role}`);
      return res.status(403).json({
        success: false,
        message: 'Accès refusé - Seuls les clients peuvent uploader des documents'
      });
    }

    // Utiliser multer pour traiter l'upload
    upload(req, res, async function (err) {
      if (err instanceof multer.MulterError) {
        console.error('❌ Erreur Multer:', err.message);
        
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: 'Fichier trop volumineux (max 10MB)'
          });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
          return res.status(400).json({
            success: false,
            message: 'Trop de fichiers (max 5 à la fois)'
          });
        }
        
        return res.status(400).json({
          success: false,
          message: 'Erreur lors de l\'upload',
          error: err.message
        });
      } else if (err) {
        console.error('❌ Erreur upload:', err.message);
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }
      
      // Vérifier qu'au moins un fichier a été uploadé
      if (!req.files || req.files.length === 0) {
        console.log(`❌ Aucun fichier fourni`);
        return res.status(400).json({
          success: false,
          message: 'Aucun fichier fourni'
        });
      }
      
      console.log(`📁 ${req.files.length} fichier(s) reçu(s)`);

      try {
        const uploadedDocuments = [];
        
        // Traiter chaque fichier uploadé
        for (const file of req.files) {
          const relativePath = path.relative(path.join(__dirname, '../..'), file.path);
          
          const documentData = {
            userId: req.user.id,
            nom: file.originalname,
            type: 'autre',
            lienFichier: relativePath,
            tailleFichier: file.size,
            formatFichier: path.extname(file.originalname).toLowerCase().replace('.', ''),
            nomOriginal: file.originalname,
            nomFichier: file.filename,
            mimeType: file.mimetype,
            cheminFichier: relativePath
          };
          
          console.log(`📋 Données pour ${file.originalname}:`, {
            userId: documentData.userId,
            nom: documentData.nom,
            type: documentData.type,
            lienFichier: documentData.lienFichier,
            tailleFichier: documentData.tailleFichier,
            mimeType: documentData.mimeType
          });
          
          try {
            const document = await Document.create(documentData);
            uploadedDocuments.push(document);
            console.log(`✅ Document uploadé: ${file.originalname} (ID: ${document.id})`);
            
          } catch (dbError) {
            console.error(`❌ Erreur création document ${file.originalname}:`, dbError.message);
            console.error(`📋 Validation errors:`, dbError.errors?.map(e => e.message));
            throw dbError;
          }
        }

        res.status(201).json({
          success: true,
          data: uploadedDocuments,
          message: `${uploadedDocuments.length} document(s) uploadé(s) avec succès`
        });

      } catch (dbError) {
        console.error('❌ Erreur base de données:', dbError.message);
        
        // Nettoyer les fichiers uploadés en cas d'erreur DB
        for (const file of req.files) {
          try {
            await fs.unlink(file.path);
          } catch (unlinkError) {
            console.error('❌ Erreur suppression fichier:', unlinkError.message);
          }
        }
        
        res.status(500).json({
          success: false,
          message: 'Erreur lors de l\'enregistrement en base de données',
          error: dbError.message
        });
      }
    });

  } catch (error) {
    console.error('❌ Erreur uploadDocuments:', error.message);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur',
      error: error.message
    });
  }
};

// ================================================
// ENDPOINT: GET /api/documents
// Description: Liste des documents du client connecté
// ================================================

const getClientDocuments = async (req, res) => {
  try {
    const clientId = req.user.id;
    console.log(`📋 GET documents - Client ID: ${clientId}`);
    
    // Vérifier que l'utilisateur est bien un client
    if (req.user.role !== 'client') {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé - Seuls les clients peuvent accéder à leurs documents'
      });
    }
    
    // Options de pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    
    // Filtres optionnels
    const where = { 
      userId: clientId,
      isActive: true 
    };
    
    if (req.query.mimeType) {
      where.mimeType = req.query.mimeType;
    }
    const { count, rows: documents } = await Document.findAndCountAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']], // Utiliser createdAt au lieu de uploadDate
      include: [{
        model: User,
        as: 'user', // Utiliser 'user' au lieu de 'client'
        attributes: ['id', 'firstName', 'lastName', 'email']
      }]
    });
    
    console.log(`📊 ${count} documents trouvés`);
    
    // Calculer les statistiques
    const stats = {
      total: count,
      totalSize: 0, // Calculer manuellement
      byType: {}
    };
    
    // Calculer la taille totale manuellement
    const sizeResult = await Document.findAll({
      where: { userId: clientId, isActive: true },
      attributes: ['tailleFichier']
    });
    stats.totalSize = sizeResult.reduce((sum, doc) => sum + (doc.tailleFichier || 0), 0);
    
    // Compter par type
    const allDocuments = await Document.findAll({
      where: { userId: clientId, isActive: true },
      attributes: ['type', 'mimeType']
    });
    
    allDocuments.forEach(doc => {
      const type = doc.getReadableFileType();
      stats.byType[type] = (stats.byType[type] || 0) + 1;
    });
    
    res.status(200).json({
      success: true,
      data: {
        documents,
        statistics: stats
      },
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit)
      },
      message: `${documents.length} document(s) récupéré(s) avec succès`
    });
    
  } catch (error) {
    console.error('❌ Erreur getClientDocuments:', error.message);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des documents',
      error: error.message
    });
  }
};

// ================================================
// ENDPOINT: GET /api/documents/:id/download
// Description: Téléchargement d'un fichier
// ================================================

const downloadDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const clientId = req.user.id;
    console.log(`📥 Téléchargement du document ID: ${id} par le client ID: ${clientId}`);
    
    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID document invalide'
      });
    }
    
    // Récupérer le document
    const document = await Document.findByPk(id);
    
    if (!document || !document.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Document non trouvé'
      });
    }
    
    // Vérifier que le document appartient au client connecté (sécurité)
    if (document.userId !== clientId) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé - Ce document ne vous appartient pas'
      });
    }
    
    // Construire le chemin complet du fichier
    const filePath = path.join(__dirname, '../..', document.cheminFichier || document.lienFichier);
    
    // Vérifier que le fichier existe sur le système
    try {
      await fs.access(filePath);
    } catch (fileError) {
      console.error('❌ Fichier non trouvé sur disque:', filePath);
      return res.status(404).json({
        success: false,
        message: 'Fichier non trouvé sur le serveur'
      });
    }
    
    // Définir les headers pour le téléchargement
    res.setHeader('Content-Type', document.mimeType || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(document.nomOriginal || document.nom)}"`);
    res.setHeader('Content-Length', document.tailleFichier || 0);
    
    // Envoyer le fichier
    res.sendFile(filePath, (err) => {
      if (err) {
        console.error('❌ Erreur envoi fichier:', err.message);
        if (!res.headersSent) {
          res.status(500).json({
            success: false,
            message: 'Erreur lors du téléchargement'
          });
        }
      } else {
        console.log(`✅ Fichier téléchargé: ${document.nomOriginal || document.nom}`);
      }
    });
    
  } catch (error) {
    console.error('❌ Erreur downloadDocument:', error.message);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du téléchargement',
      error: error.message
    });
  }
};

// ================================================
// ENDPOINT: DELETE /api/documents/:id
// Description: Suppression d'un document
// ================================================

const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const clientId = req.user.id;
    console.log(`🗑️ Suppression du document ID: ${id} par le client ID: ${clientId}`);
    
    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID document invalide'
      });
    }
    
    // Récupérer le document
    const document = await Document.findByPk(id);
    
    if (!document || !document.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Document non trouvé'
      });
    }
    
    // Vérifier que le document appartient au client connecté (sécurité)
    if (document.userId !== clientId) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé - Ce document ne vous appartient pas'
      });
    }
    
    // Soft delete en base de données
    await document.update({ isActive: false });
    
    // Optionnel: Supprimer le fichier physique du serveur
    // (Je recommande de le garder pour permettre une récupération)
    /*
    try {
      const filePath = path.join(__dirname, '../..', document.path);
      await fs.unlink(filePath);
      console.log(`🗑️ Fichier physique supprimé: ${filePath}`);
    } catch (fileError) {
      console.warn('⚠️ Impossible de supprimer le fichier physique:', fileError.message);
    }
    */
    
    res.status(200).json({
      success: true,
      message: 'Document supprimé avec succès'
    });
    
  } catch (error) {
    console.error('❌ Erreur deleteDocument:', error.message);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du document',
      error: error.message
    });
  }
};

// ================================================
// ENDPOINT BONUS: GET /api/documents/:id
// Description: Obtenir les détails d'un document spécifique
// ================================================

const getDocumentById = async (req, res) => {
  try {
    const { id } = req.params;
    const clientId = req.user.id;
    console.log(`🔍 Récupération du document ID: ${id} par le client ID: ${clientId}`);
    
    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID document invalide'
      });
    }
    
    // Récupérer le document avec les informations du client
    const document = await Document.findByPk(id, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'firstName', 'lastName', 'email']
      }]
    });
    
    if (!document || !document.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Document non trouvé'
      });
    }
    
    // Vérifier que le document appartient au client connecté (sécurité)
    if (document.userId !== clientId) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé - Ce document ne vous appartient pas'
      });
    }
    
    res.status(200).json({
      success: true,
      data: document,
      message: 'Document récupéré avec succès'
    });
    
  } catch (error) {
    console.error('❌ Erreur getDocumentById:', error.message);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du document',
      error: error.message
    });
  }
};

module.exports = {
  uploadDocuments,
  getClientDocuments,
  downloadDocument,
  deleteDocument,
  getDocumentById
};
