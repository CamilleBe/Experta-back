// ================================================
// INDEX DES MODÈLES SEQUELIZE
// ================================================

const { sequelize, testConnection, syncDatabase } = require('../config/database');

// Import des modèles
const User = require('./User');
const Document = require('./Document');
const Projet = require('./Projet');
const Mission = require('./Mission');

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

// Associations Document <-> Projet
Document.belongsTo(Projet, {
  foreignKey: 'projetId',
  as: 'projet'
});

Projet.hasMany(Document, {
  foreignKey: 'projetId',
  as: 'documents',
  onDelete: 'CASCADE'
});



// Associations User <-> Projet (en tant que client)
User.hasMany(Projet, { 
  foreignKey: 'clientId', 
  as: 'projetsClient',
  onDelete: 'CASCADE'
});

Projet.belongsTo(User, { 
  foreignKey: 'clientId', 
  as: 'client'
});

// Associations User <-> Projet (en tant qu'AMO)
User.hasMany(Projet, { 
  foreignKey: 'amoId', 
  as: 'projetsAMO',
  onDelete: 'SET NULL'
});

Projet.belongsTo(User, { 
  foreignKey: 'amoId', 
  as: 'amo'
});

// Associations Projet <-> Mission
Projet.hasMany(Mission, { 
  foreignKey: 'projectId', 
  as: 'missions',
  onDelete: 'CASCADE'
});

Mission.belongsTo(Projet, { 
  foreignKey: 'projectId', 
  as: 'projet'
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
    
    console.log('📋 Modèles chargés:', {
      User: !!User,
      Document: !!Document,
      Projet: !!Projet,
      Mission: !!Mission
    });
    
    // 2. Synchronisation des modèles
    console.log(`🔄 Synchronisation avec force=${force}, alter=${!force}`);
    await syncDatabase({ 
      force, // true = recrée toutes les tables (⚠️ perte de données)
      alter: !force // true = met à jour la structure sans perdre les données
    });
    
    // 3. Vérifier que la table ClientDocument existe
    console.log('🔍 Vérification table documents...');
    try {
      const tableExists = await sequelize.getQueryInterface().showAllTables();
      console.log('📋 Tables existantes:', tableExists);
      
      if (tableExists.includes('documents')) {
        console.log('✅ Table documents trouvée');
        const tableStructure = await sequelize.getQueryInterface().describeTable('documents');
        console.log('📋 Structure table documents:', Object.keys(tableStructure));
      } else {
        console.log('❌ Table documents NON trouvée !');
      }
    } catch (tableError) {
      console.error('❌ Erreur vérification table:', tableError.message);
    }
    
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
        role: 'admin',
        telephone: '+33 1 23 45 67 89'
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
        role: 'client',
        telephone: '+33 6 12 34 56 78'
      });
      
      console.log('👤 Utilisateur test créé: test@experta.com / Test123!');
    }
    
    // Créer un AMO d'exemple
    const existingAMO = await User.findOne({ where: { email: 'amo@experta.com' } });
    if (!existingAMO) {
      await User.create({
        firstName: 'Marie',
        lastName: 'Architecture',
        email: 'amo@experta.com',
        password: 'AMO123!',
        role: 'AMO',
        telephone: '+33 1 98 76 54 32',
        zoneIntervention: ['75', '92', '93', '94'],
        tagsMetiers: ['architecture', 'maîtrise d\'oeuvre', 'rénovation'],
        nomEntreprise: 'Architecture & Conseil SARL',
        noteFiabilite: 4.5
      });
      
      console.log('🏗️ AMO d\'exemple créé: amo@experta.com / AMO123!');
    }
    
    // Créer un partenaire d'exemple
    const existingPartner = await User.findOne({ where: { email: 'partenaire@experta.com' } });
    if (!existingPartner) {
      await User.create({
        firstName: 'Jean',
        lastName: 'Renovation',
        email: 'partenaire@experta.com',
        password: 'Partner123!',
        role: 'partenaire',
        telephone: '+33 6 87 65 43 21',
        zoneIntervention: ['75', '77', '78'],
        tagsMetiers: ['plomberie', 'électricité', 'chauffage'],
        nomEntreprise: 'Rénovation Pro SAS',
        noteFiabilite: 4.2
      });
      
      console.log('🔧 Partenaire d\'exemple créé: partenaire@experta.com / Partner123!');
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
  Projet,
  Mission,
  
  // Fonctions utilitaires
  testConnection,
  syncDatabase,
  initializeDatabase,
  createDefaultData
}; 