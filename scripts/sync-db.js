// ================================================
// SCRIPT DE SYNCHRONISATION FORCÉE DE LA BASE DE DONNÉES
// ================================================

require('dotenv').config();
const { initializeDatabase } = require('../src/models');

async function forceSyncDatabase() {
  try {
    console.log('🔄 Démarrage de la synchronisation forcée...');
    
    // Force = true recrée toutes les tables (⚠️ supprime les données existantes)
    await initializeDatabase(true);
    
    console.log('✅ Synchronisation terminée avec succès !');
    console.log('📊 Vous pouvez maintenant voir les tables dans phpMyAdmin');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Erreur lors de la synchronisation:', error.message);
    console.error('🔧 Détails:', error);
    process.exit(1);
  }
}

// Exécuter la synchronisation
forceSyncDatabase(); 