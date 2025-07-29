const { Sequelize } = require('sequelize');
require('dotenv').config();

// ================================================
// CONFIGURATION SEQUELIZE POUR MYSQL + DOCKER
// ================================================

console.log('🔧 Configuration de la base de données...');

// Configuration Sequelize pour MySQL
const sequelize = new Sequelize(
  process.env.DB_NAME || 'experta_db',
  process.env.DB_USER || 'experta_user', 
  process.env.DB_PASSWORD || 'root',
  {
    host: process.env.DB_HOST || 'localhost', // 'mysql' dans Docker
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    
    // Logs uniquement en développement
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    
    // Pool de connexions optimisé
    pool: {
      max: 5,        // Maximum 5 connexions
      min: 0,        // Minimum 0 connexions
      acquire: 30000, // Temps max pour obtenir une connexion (30s)
      idle: 10000     // Temps max d'inactivité avant fermeture (10s)
    },
    
    // Configuration des modèles par défaut
    define: {
      timestamps: true,      // Ajoute createdAt et updatedAt automatiquement
      underscored: true,     // Utilise snake_case pour les colonnes
      freezeTableName: true  // Évite la pluralisation automatique des tables
    },
    
    // Retry en cas d'échec de connexion (important pour Docker)
    retry: {
      max: 3
    }
  }
);

// ================================================
// FONCTION DE TEST DE CONNEXION
// ================================================
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Connexion à MySQL établie avec succès');
    console.log(`📊 Base de données: ${process.env.DB_NAME || 'experta_db'}`);
    console.log(`🏠 Hôte: ${process.env.DB_HOST || 'localhost'}`);
    return true;
  } catch (error) {
    console.error('❌ Impossible de se connecter à MySQL:');
    console.error('📋 Détails:', error.message);
    
    // En développement, afficher plus de détails
    if (process.env.NODE_ENV === 'development') {
      console.error('🔍 Configuration utilisée:');
      console.error(`   - Host: ${process.env.DB_HOST || 'localhost'}`);
      console.error(`   - Port: ${process.env.DB_PORT || 3306}`);
      console.error(`   - Database: ${process.env.DB_NAME || 'experta_db'}`);
      console.error(`   - User: ${process.env.DB_USER || 'experta_user'}`);
    }
    
    return false;
  }
};

// ================================================
// FONCTION DE SYNCHRONISATION DES MODÈLES
// ================================================
const syncDatabase = async (options = {}) => {
  try {
    console.log('🔄 Synchronisation des modèles avec la base de données...');
    
    // Options par défaut
    const defaultOptions = {
      force: false,  // false = ne supprime pas les tables existantes
      alter: true    // true = met à jour la structure sans perdre les données
    };
    
    const syncOptions = { ...defaultOptions, ...options };
    
    await sequelize.sync(syncOptions);
    
    if (syncOptions.force) {
      console.log('⚠️  Tables recréées (données perdues)');
    } else if (syncOptions.alter) {
      console.log('✅ Structure des tables mise à jour');
    } else {
      console.log('✅ Tables synchronisées');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Erreur lors de la synchronisation:');
    console.error('📋 Détails:', error.message);
    return false;
  }
};

// ================================================
// FONCTION DE FERMETURE PROPRE
// ================================================
const closeConnection = async () => {
  try {
    await sequelize.close();
    console.log('✅ Connexion à la base de données fermée');
  } catch (error) {
    console.error('❌ Erreur lors de la fermeture:', error.message);
  }
};

// ================================================
// GESTION DES SIGNAUX DE FERMETURE
// ================================================
process.on('SIGINT', async () => {
  console.log('\n🛑 Arrêt du serveur en cours...');
  await closeConnection();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Arrêt du serveur demandé...');
  await closeConnection();
  process.exit(0);
});

module.exports = {
  sequelize,
  testConnection,
  syncDatabase,
  closeConnection
}; 