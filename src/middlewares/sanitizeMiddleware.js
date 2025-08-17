// ================================================
// MIDDLEWARE DE SANITISATION DES ENTRÉES
// ================================================

const xss = require('xss');
const validator = require('validator');

// ================================================
// CONFIGURATION XSS
// ================================================

const xssOptions = {
  whiteList: {}, // Aucune balise HTML autorisée
  stripIgnoreTag: true, // Supprimer les balises non autorisées
  stripIgnoreTagBody: ['script'], // Supprimer complètement les balises script
  allowCommentTag: false, // Pas de commentaires HTML
  css: false // Pas de CSS inline
};

// ================================================
// FONCTION DE SANITISATION D'UNE VALEUR
// ================================================

const sanitizeValue = (value) => {
  if (typeof value !== 'string') {
    return value;
  }
  
  // 1. Trimmer les espaces
  let cleaned = value.trim();
  
  // 2. Échapper les caractères HTML dangereux
  cleaned = validator.escape(cleaned);
  
  // 3. Nettoyer avec XSS (redondant mais sécuritaire)
  cleaned = xss(cleaned, xssOptions);
  
  return cleaned;
};

// ================================================
// FONCTION RÉCURSIVE POUR SANITISER LES OBJETS
// ================================================

const sanitizeObject = (obj) => {
  if (obj === null || obj === undefined) {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }
  
  if (typeof obj === 'object') {
    const sanitized = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        sanitized[key] = sanitizeObject(obj[key]);
      }
    }
    return sanitized;
  }
  
  if (typeof obj === 'string') {
    return sanitizeValue(obj);
  }
  
  return obj;
};

// ================================================
// MIDDLEWARE PRINCIPAL DE SANITISATION
// ================================================

const sanitizeInputs = (req, res, next) => {
  try {
    console.log('🧼 Sanitisation des entrées en cours...');
    
    // Compter les champs sanitisés pour le logging
    let sanitizedCount = 0;
    
    // ================================================
    // SANITISER req.body
    // ================================================
    
    if (req.body && typeof req.body === 'object') {
      const originalBody = JSON.stringify(req.body);
      req.body = sanitizeObject(req.body);
      
      // Vérifier s'il y a eu des modifications
      if (JSON.stringify(req.body) !== originalBody) {
        sanitizedCount++;
        console.log('🔧 req.body sanitisé');
      }
    }
    
    // ================================================
    // SANITISER req.query
    // ================================================
    
    if (req.query && typeof req.query === 'object') {
      const originalQuery = JSON.stringify(req.query);
      req.query = sanitizeObject(req.query);
      
      // Vérifier s'il y a eu des modifications
      if (JSON.stringify(req.query) !== originalQuery) {
        sanitizedCount++;
        console.log('🔧 req.query sanitisé');
      }
    }
    
    // ================================================
    // SANITISER req.params (généralement sûrs mais par précaution)
    // ================================================
    
    if (req.params && typeof req.params === 'object') {
      const originalParams = JSON.stringify(req.params);
      req.params = sanitizeObject(req.params);
      
      // Vérifier s'il y a eu des modifications
      if (JSON.stringify(req.params) !== originalParams) {
        sanitizedCount++;
        console.log('🔧 req.params sanitisé');
      }
    }
    
    // Logging du résultat
    if (sanitizedCount > 0) {
      console.log(`✅ Sanitisation terminée - ${sanitizedCount} section(s) nettoyée(s)`);
    } else {
      console.log('✅ Sanitisation terminée - Aucune modification nécessaire');
    }
    
    next();
    
  } catch (error) {
    console.error('❌ Erreur lors de la sanitisation:', error.message);
    
    // En cas d'erreur, on continue mais on log l'erreur
    // Ne pas bloquer la requête pour un problème de sanitisation
    next();
  }
};

// ================================================
// MIDDLEWARE SPÉCIALISÉ POUR LES EMAILS
// ================================================

const sanitizeEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return email;
  }
  
  try {
    // Normaliser l'email (lowercase, supprimer espaces, etc.)
    let cleanEmail = validator.normalizeEmail(email.trim(), {
      gmail_lowercase: true,
      gmail_remove_dots: false,
      gmail_remove_subaddress: false,
      outlookdotcom_lowercase: true,
      yahoo_lowercase: true,
      icloud_lowercase: true
    });
    
    // Vérifier que l'email est valide après normalisation
    if (cleanEmail && validator.isEmail(cleanEmail)) {
      return cleanEmail;
    }
    
    // Si la normalisation échoue, essayer juste un trim + validation
    const trimmedEmail = email.trim().toLowerCase();
    if (validator.isEmail(trimmedEmail)) {
      return trimmedEmail;
    }
    
    // Si rien ne fonctionne, retourner l'original
    return email;
    
  } catch (error) {
    console.warn(`⚠️ Erreur sanitisation email "${email}":`, error.message);
    return email;
  }
};

// ================================================
// FONCTION UTILITAIRE POUR SANITISER MANUELLEMENT
// ================================================

const manualSanitize = (value) => {
  return sanitizeValue(value);
};

// ================================================
// EXPORTS
// ================================================

module.exports = {
  sanitizeInputs,
  sanitizeEmail,
  manualSanitize,
  sanitizeObject,
  sanitizeValue
};