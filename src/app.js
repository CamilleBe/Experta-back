const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import de la configuration de base de données
const { initializeDatabase } = require('./models');

// Import du middleware de sanitisation
const { sanitizeInputs } = require('./middlewares/sanitizeMiddleware');

const app = express();

// Middlewares CORS - Configuration temporaire permissive pour debug
const allowedOrigins = [
  'http://localhost:3000', // backend et potentiellement front en dev
  'http://localhost:5173', // front en développement (Vite)
  'http://localhost:8080', // Vue CLI dev server
  'http://localhost:4173', // Vite preview
  'http://localhost:5174', // Vite alternative port
  'http://localhost:3001', // front alternatif
  'http://localhost:5175', // front alternatif
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:8080',
];

app.use(cors({
  origin: function (origin, callback) {
    // Autoriser les requêtes sans origin (ex: Postman) ou si l'origine est dans la liste
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log(`❌ CORS - Origine refusée: ${origin}`);
      callback(new Error(`CORS: Origine ${origin} non autorisée`));
    }
  },
  credentials: true,
  allowedHeaders: ['Authorization', 'X-Requested-With', 'Content-Type', 'Accept'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  optionsSuccessStatus: 200
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ================================================
// MIDDLEWARE DE SANITISATION DES ENTRÉES
// ================================================
app.use(sanitizeInputs);

// Middleware de logging simple
app.use((req, res, next) => {
  if (req.method !== 'OPTIONS') {
    console.log(`🌐 ${req.method} ${req.originalUrl}`);
  }
  next();
});

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
const clientDocumentRoutes = require('./routes/clientDocumentRoutes');
const projetRoutes = require('./routes/projetRoutes');
const missionRoutes = require('./routes/missionRoutes');
const amoRoutes = require('./routes/amoRoutes');
const partenaireRoutes = require('./routes/partenaireRoutes');

// Configuration des routes
app.use('/api/users', userRoutes);
app.use('/api/documents', documentRoutes); // Routes documents métier (existantes)
app.use('/api/client-documents', clientDocumentRoutes); // Routes documents clients (dashboard)
app.use('/api/projets', projetRoutes);
app.use('/api/missions', missionRoutes);
app.use('/api/amo', amoRoutes); // Routes dashboard AMO
app.use('/api/partenaire', partenaireRoutes); // Routes dashboard partenaire

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