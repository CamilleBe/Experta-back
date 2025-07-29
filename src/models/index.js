// ================================================
// INDEX DES MODÈLES SEQUELIZE
// ================================================

const { sequelize, testConnection, syncDatabase } = require('../config/database');

// Import des modèles
const User = require('./User');
const Document = require('./Document');

// ================================================
// ASSOCIATIONS ENTRE MODÈLES
// ================================================

// Associations User <-> Document
User.hasMany(Document, { 
  foreignKey: 'userId', 
  as: 'documents',
  onDelete: 'CASCADE'
});

Document.belongsTo(User, { 
  foreignKey: 'userId', 
  as: 'user'
});

console.log('🔗 Associations entre modèles configurées');

// ================================================
// FONCTION D'INITIALISATION DE LA BASE DE DONNÉES
// ================================================

const initializeDatabase = async (force = false) => {
  try {
    console.log('🚀 Initialisation de la base de données...');
    
    // 1. Test de la connexion
    const connected = await testConnection();
    if (!connected) {
      throw new Error('Impossible de se connecter à la base de données');
    }
    
    // 2. Synchronisation des modèles
    await syncDatabase({ 
      force, // true = recrée toutes les tables (⚠️ perte de données)
      alter: !force // true = met à jour la structure sans perdre les données
    });
    
    // 3. Création de données par défaut si nécessaire
    if (force) {
      await createDefaultData();
    }
    
    console.log('✅ Base de données initialisée avec succès');
    return true;
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation de la base de données:');
    console.error('📋 Détails:', error.message);
    throw error;
  }
};

// ================================================
// CRÉATION DE DONNÉES PAR DÉFAUT
// ================================================

const createDefaultData = async () => {
  try {
    console.log('📝 Création des données par défaut...');
    
    // Vérifier si un admin existe déjà
    const existingAdmin = await User.findOne({ where: { role: 'admin' } });
    
    if (!existingAdmin) {
      // Créer un utilisateur admin par défaut
      await User.create({
        firstName: 'Admin',
        lastName: 'System',
        email: 'admin@experta.com',
        password: 'Admin123!', // Sera hashé automatiquement par le hook
        role: 'admin'
      });
      
      console.log('👑 Utilisateur admin créé: admin@experta.com / Admin123!');
    }
    
    // Créer un utilisateur de test
    const existingTestUser = await User.findOne({ where: { email: 'test@experta.com' } });
    if (!existingTestUser) {
      await User.create({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@experta.com',
        password: 'Test123!',
        role: 'client'
      });
      
      console.log('👤 Utilisateur test créé: test@experta.com / Test123!');
    }
    
    console.log('✅ Données par défaut créées');
    
  } catch (error) {
    console.error('❌ Erreur lors de la création des données par défaut:', error.message);
    throw error;
  }
};

// ================================================
// EXPORT DE TOUS LES MODÈLES ET FONCTIONS
// ================================================

module.exports = {
  // Configuration Sequelize
  sequelize,
  
  // Modèles
  User,
  Document,
  
  // Fonctions utilitaires
  testConnection,
  syncDatabase,
  initializeDatabase,
  createDefaultData
}; 