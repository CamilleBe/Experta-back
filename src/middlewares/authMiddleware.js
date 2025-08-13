const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Token d\'accès requis'
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: 'Token invalide'
      });
    }
    
    req.user = user;
    next();
  });
};

const authorizeRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Utilisateur non authentifié'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé - Privilèges insuffisants'
      });
    }

    next();
  };
};

// ================================================
// MIDDLEWARE D'AUTHENTIFICATION OPTIONNELLE
// ================================================

const optionalAuthenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  // Si pas de token, continuer sans authentification
  if (!token) {
    req.user = null;
    return next();
  }

  // Si token présent, essayer de le vérifier
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      // Token invalide, continuer sans authentification
      req.user = null;
    } else {
      // Token valide, attacher l'utilisateur
      req.user = user;
    }
    next();
  });
};

// ================================================
// MIDDLEWARE POUR AUTORISER CLIENTS OU ANONYMES
// ================================================

const authorizeClientOrAnonymous = (req, res, next) => {
  // Si pas d'utilisateur connecté, autoriser (anonyme)
  if (!req.user) {
    return next();
  }

  // Si utilisateur connecté, vérifier qu'il a le rôle client
  if (req.user.role !== 'client') {
    return res.status(403).json({
      success: false,
      message: 'Accès refusé - Seuls les clients peuvent créer des projets'
    });
  }

  next();
};

// ================================================
// MIDDLEWARE POUR RETOURNER 404 AU LIEU DE 403 (SÉCURITÉ)
// ================================================

const authorizeRoleHidden = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(404).json({
        success: false,
        message: 'Page non trouvée'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(404).json({
        success: false,
        message: 'Page non trouvée'
      });
    }

    next();
  };
};

module.exports = {
  authenticateToken,
  authorizeRole,
  optionalAuthenticateToken,
  authorizeClientOrAnonymous,
  authorizeRoleHidden
}; 