// ================================================
// CONTRÔLEUR DOCUMENTS AVEC SEQUELIZE
// ================================================

const { Document, User } = require('../models');

const getAllDocuments = async (req, res) => {
  try {
    console.log('📋 Récupération de tous les documents...');
    
    // Récupérer tous les documents avec pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    // Filtres optionnels
    const where = { isActive: true };
    if (req.query.type) where.type = req.query.type;
    if (req.query.userId) where.userId = req.query.userId;
    
    const { count, rows: documents } = await Document.findAndCountAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'firstName', 'lastName', 'email']
      }]
    });
    
    res.status(200).json({
      success: true,
      data: documents,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit)
      },
      message: `${documents.length} document(s) récupéré(s) avec succès`
    });
    
  } catch (error) {
    console.error('❌ Erreur getAllDocuments:', error.message);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des documents',
      error: error.message
    });
  }
};

const getDocumentById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🔍 Recherche du document ID: ${id}`);
    
    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID document invalide'
      });
    }
    
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

const createDocument = async (req, res) => {
  try {
    const { userId, nom, type, lienFichier, tailleFichier, formatFichier } = req.body;
    console.log(`📄 Création d'un nouveau document: ${nom}`);
    
    // Validation des champs requis
    if (!userId || !nom || !type || !lienFichier) {
      return res.status(400).json({
        success: false,
        message: 'userId, nom, type et lienFichier sont requis'
      });
    }
    
    // Vérifier que l'utilisateur existe
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }
    
    const newDocument = await Document.create({
      userId,
      nom,
      type,
      lienFichier,
      tailleFichier,
      formatFichier
    });
    
    // Récupérer le document avec les relations
    const documentWithUser = await Document.findByPk(newDocument.id, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'firstName', 'lastName', 'email']
      }]
    });
    
    res.status(201).json({
      success: true,
      data: documentWithUser,
      message: 'Document créé avec succès'
    });
    
  } catch (error) {
    console.error('❌ Erreur createDocument:', error.message);
    
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: error.errors.map(err => err.message)
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du document',
      error: error.message
    });
  }
};

const updateDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { nom, type, lienFichier, tailleFichier, formatFichier, isActive } = req.body;
    console.log(`✏️ Mise à jour du document ID: ${id}`);
    
    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID document invalide'
      });
    }
    
    const document = await Document.findByPk(id);
    if (!document || !document.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Document non trouvé'
      });
    }
    
    // Mettre à jour les champs
    const updateData = {};
    if (nom) updateData.nom = nom;
    if (type) updateData.type = type;
    if (lienFichier) updateData.lienFichier = lienFichier;
    if (tailleFichier !== undefined) updateData.tailleFichier = tailleFichier;
    if (formatFichier) updateData.formatFichier = formatFichier;
    if (typeof isActive === 'boolean') updateData.isActive = isActive;
    
    await document.update(updateData);
    
    // Récupérer le document mis à jour avec les relations
    const updatedDocument = await Document.findByPk(id, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'firstName', 'lastName', 'email']
      }]
    });
    
    res.status(200).json({
      success: true,
      data: updatedDocument,
      message: 'Document mis à jour avec succès'
    });
    
  } catch (error) {
    console.error('❌ Erreur updateDocument:', error.message);
    
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: error.errors.map(err => err.message)
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du document',
      error: error.message
    });
  }
};

const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🗑️ Suppression du document ID: ${id}`);
    
    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID document invalide'
      });
    }
    
    const document = await Document.findByPk(id);
    if (!document || !document.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Document non trouvé'
      });
    }
    
    // Soft delete
    await document.update({ isActive: false });
    
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

const getDocumentsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log(`📋 Récupération des documents pour l'utilisateur ID: ${userId}`);
    
    if (!userId || isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: 'ID utilisateur invalide'
      });
    }
    
    const documents = await Document.findByUserId(userId, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'firstName', 'lastName', 'email']
      }]
    });
    
    res.status(200).json({
      success: true,
      data: documents,
      message: `${documents.length} document(s) trouvé(s) pour cet utilisateur`
    });
    
  } catch (error) {
    console.error('❌ Erreur getDocumentsByUser:', error.message);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des documents',
      error: error.message
    });
  }
};

const getDocumentsByType = async (req, res) => {
  try {
    const { type } = req.params;
    console.log(`📋 Récupération des documents de type: ${type}`);
    
    const documents = await Document.findByType(type, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'firstName', 'lastName', 'email']
      }]
    });
    
    res.status(200).json({
      success: true,
      data: documents,
      message: `${documents.length} document(s) de type ${type} trouvé(s)`
    });
    
  } catch (error) {
    console.error('❌ Erreur getDocumentsByType:', error.message);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des documents',
      error: error.message
    });
  }
};

module.exports = {
  getAllDocuments,
  getDocumentById,
  createDocument,
  updateDocument,
  deleteDocument,
  getDocumentsByUser,
  getDocumentsByType
}; 