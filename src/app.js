const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import de la configuration de base de données
const { initializeDatabase } = require('./models');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ================================================
// INITIALISATION DE LA BASE DE DONNÉES
// ================================================
app.locals.dbInitialized = false;

const initDB = async () => {
  try {
    await initializeDatabase();
    app.locals.dbInitialized = true;
    console.log('🎉 Application prête à recevoir des requêtes');
  } catch (error) {
    console.error('💥 Échec de l\'initialisation de la base de données');
    console.error('❌ L\'application ne peut pas démarrer correctement');
    // Ne pas faire crash l'app, mais logger l'erreur
  }
};

// Initialiser la DB au démarrage
initDB();

// ================================================
// ROUTES PRINCIPALES
// ================================================

// Route de santé avec statut de la DB
app.get('/', (req, res) => {
  res.json({ 
    message: 'API Experta Backend est en fonctionnement!',
    version: '1.0.0',
    database: app.locals.dbInitialized ? 'connectée' : 'non connectée',
    timestamp: new Date().toISOString()
  });
});

// Route de vérification de la base de données
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    database: app.locals.dbInitialized ? 'healthy' : 'unhealthy',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    timestamp: new Date().toISOString()
  });
});

// Import des routes
const userRoutes = require('./routes/userRoutes');
const documentRoutes = require('./routes/documentRoutes');
const projetRoutes = require('./routes/projetRoutes');
const missionRoutes = require('./routes/missionRoutes');

// Configuration des routes
app.use('/api/users', userRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/projets', projetRoutes);
app.use('/api/missions', missionRoutes);

// Middleware de gestion d'erreur global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Erreur interne du serveur',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// Route 404
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route non trouvée' });
});

module.exports = app; 