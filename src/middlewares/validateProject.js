// ================================================
// MIDDLEWARE DE VALIDATION POUR LES PROJETS
// ================================================

const validateProjectCreation = (req, res, next) => {
  const { 
    description, address, city, postalCode, 
    budget, surfaceM2, bedrooms, houseType, hasLand,
    // Champs pour utilisateurs non connectés
    clientFirstName, clientLastName, clientEmail, clientPhone, clientPassword
  } = req.body;

  const errors = [];

  // ================================================
  // VALIDATION DES CHAMPS OBLIGATOIRES
  // ================================================
  
  if (!description || description.trim().length === 0) {
    errors.push('La description du projet est obligatoire');
  } else if (description.trim().length < 10) {
    errors.push('La description doit contenir au moins 10 caractères');
  } else if (description.trim().length > 5000) {
    errors.push('La description ne peut pas dépasser 5000 caractères');
  }

  if (!address || address.trim().length === 0) {
    errors.push('L\'adresse du projet est obligatoire');
  } else if (address.trim().length < 5) {
    errors.push('L\'adresse doit contenir au moins 5 caractères');
  } else if (address.trim().length > 255) {
    errors.push('L\'adresse ne peut pas dépasser 255 caractères');
  }

  if (!city || city.trim().length === 0) {
    errors.push('La ville du projet est obligatoire');
  } else if (city.trim().length < 2) {
    errors.push('La ville doit contenir au moins 2 caractères');
  } else if (city.trim().length > 100) {
    errors.push('La ville ne peut pas dépasser 100 caractères');
  }

  if (!postalCode || postalCode.trim().length === 0) {
    errors.push('Le code postal est obligatoire');
  } else if (!/^[0-9]{5}$/.test(postalCode.trim())) {
    errors.push('Le code postal doit contenir exactement 5 chiffres');
  }

  // ================================================
  // VALIDATION DES CHAMPS OPTIONNELS
  // ================================================

  if (budget !== undefined && budget !== null && budget !== '') {
    const budgetNum = parseFloat(budget);
    if (isNaN(budgetNum) || budgetNum < 0) {
      errors.push('Le budget doit être un nombre positif');
    }
  }

  if (surfaceM2 !== undefined && surfaceM2 !== null && surfaceM2 !== '') {
    const surfaceNum = parseInt(surfaceM2);
    if (isNaN(surfaceNum) || surfaceNum < 1) {
      errors.push('La surface doit être d\'au moins 1 m²');
    }
  }

  if (bedrooms !== undefined && bedrooms !== null && bedrooms !== '') {
    const bedroomsNum = parseInt(bedrooms);
    if (isNaN(bedroomsNum) || bedroomsNum < 0) {
      errors.push('Le nombre de chambres ne peut pas être négatif');
    }
  }

  if (houseType && !['plain-pied', 'étage', 'autre'].includes(houseType)) {
    errors.push('Le type de maison doit être "plain-pied", "étage" ou "autre"');
  }

  if (hasLand !== undefined && hasLand !== null && typeof hasLand !== 'boolean') {
    // Essayer de convertir string en boolean
    if (hasLand === 'true' || hasLand === '1') {
      req.body.hasLand = true;
    } else if (hasLand === 'false' || hasLand === '0') {
      req.body.hasLand = false;
    } else {
      errors.push('Le champ "terrain inclus" doit être true ou false');
    }
  }

  // ================================================
  // VALIDATION POUR UTILISATEURS NON CONNECTÉS
  // ================================================
  
  // Vérifier si l'utilisateur est connecté (sera défini par le middleware auth)
  // Si pas connecté, les infos client sont obligatoires
  if (!req.user) {
    if (!clientFirstName || clientFirstName.trim().length === 0) {
      errors.push('Le prénom du client est obligatoire');
    } else if (clientFirstName.trim().length < 2) {
      errors.push('Le prénom doit contenir au moins 2 caractères');
    } else if (clientFirstName.trim().length > 50) {
      errors.push('Le prénom ne peut pas dépasser 50 caractères');
    }

    if (!clientLastName || clientLastName.trim().length === 0) {
      errors.push('Le nom du client est obligatoire');
    } else if (clientLastName.trim().length < 2) {
      errors.push('Le nom doit contenir au moins 2 caractères');
    } else if (clientLastName.trim().length > 50) {
      errors.push('Le nom ne peut pas dépasser 50 caractères');
    }

    if (!clientEmail || clientEmail.trim().length === 0) {
      errors.push('L\'email du client est obligatoire');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientEmail.trim())) {
      errors.push('L\'email doit être valide');
    }

    if (!clientPhone || clientPhone.trim().length === 0) {
      errors.push('Le téléphone du client est obligatoire');
    } else if (!/^(\+33|0)[1-9](\d{8})$/.test(clientPhone.replace(/\s/g, ''))) {
      errors.push('Le numéro de téléphone doit être un numéro français valide');
    }

    if (!clientPassword || clientPassword.length === 0) {
      errors.push('Le mot de passe est obligatoire');
    } else if (clientPassword.length < 8) {
      errors.push('Le mot de passe doit contenir au moins 8 caractères');
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(clientPassword)) {
      errors.push('Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre');
    }
  }

  // ================================================
  // RETOUR DES ERREURS OU CONTINUATION
  // ================================================

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Erreurs de validation',
      errors: errors
    });
  }

  // Nettoyer les données (trimmer les strings)
  if (description) req.body.description = description.trim();
  if (address) req.body.address = address.trim();
  if (city) req.body.city = city.trim();
  if (postalCode) req.body.postalCode = postalCode.trim();
  
  // Nettoyer les données client pour utilisateurs non connectés
  if (!req.user) {
    if (clientFirstName) req.body.clientFirstName = clientFirstName.trim();
    if (clientLastName) req.body.clientLastName = clientLastName.trim();
    if (clientEmail) req.body.clientEmail = clientEmail.trim().toLowerCase();
    if (clientPhone) req.body.clientPhone = clientPhone.replace(/\s/g, '');
  }

  next();
};

// ================================================
// VALIDATION POUR LA MISE À JOUR
// ================================================

const validateProjectUpdate = (req, res, next) => {
  const { 
    description, address, city, postalCode, 
    budget, surfaceM2, bedrooms, houseType, hasLand, statut 
  } = req.body;

  const errors = [];

  // Validation des champs seulement s'ils sont fournis
  if (description !== undefined) {
    if (description.trim().length < 10) {
      errors.push('La description doit contenir au moins 10 caractères');
    } else if (description.trim().length > 5000) {
      errors.push('La description ne peut pas dépasser 5000 caractères');
    }
  }

  if (address !== undefined) {
    if (address.trim().length < 5) {
      errors.push('L\'adresse doit contenir au moins 5 caractères');
    } else if (address.trim().length > 255) {
      errors.push('L\'adresse ne peut pas dépasser 255 caractères');
    }
  }

  if (city !== undefined) {
    if (city.trim().length < 2) {
      errors.push('La ville doit contenir au moins 2 caractères');
    } else if (city.trim().length > 100) {
      errors.push('La ville ne peut pas dépasser 100 caractères');
    }
  }

  if (postalCode !== undefined) {
    if (!/^[0-9]{5}$/.test(postalCode.trim())) {
      errors.push('Le code postal doit contenir exactement 5 chiffres');
    }
  }

  if (budget !== undefined && budget !== null && budget !== '') {
    const budgetNum = parseFloat(budget);
    if (isNaN(budgetNum) || budgetNum < 0) {
      errors.push('Le budget doit être un nombre positif');
    }
  }

  if (surfaceM2 !== undefined && surfaceM2 !== null && surfaceM2 !== '') {
    const surfaceNum = parseInt(surfaceM2);
    if (isNaN(surfaceNum) || surfaceNum < 1) {
      errors.push('La surface doit être d\'au moins 1 m²');
    }
  }

  if (bedrooms !== undefined && bedrooms !== null && bedrooms !== '') {
    const bedroomsNum = parseInt(bedrooms);
    if (isNaN(bedroomsNum) || bedroomsNum < 0) {
      errors.push('Le nombre de chambres ne peut pas être négatif');
    }
  }

  if (houseType && !['plain-pied', 'étage', 'autre'].includes(houseType)) {
    errors.push('Le type de maison doit être "plain-pied", "étage" ou "autre"');
  }

  if (statut && !['brouillon', 'en_attente_AMO', 'en_mise_en_relation', 'devis_reçus', 'clôturé'].includes(statut)) {
    errors.push('Le statut doit être "brouillon", "en_attente_AMO", "en_mise_en_relation", "devis_reçus" ou "clôturé"');
  }

  if (hasLand !== undefined && hasLand !== null && typeof hasLand !== 'boolean') {
    if (hasLand === 'true' || hasLand === '1') {
      req.body.hasLand = true;
    } else if (hasLand === 'false' || hasLand === '0') {
      req.body.hasLand = false;
    } else {
      errors.push('Le champ "terrain inclus" doit être true ou false');
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Erreurs de validation',
      errors: errors
    });
  }

  // Nettoyer les données
  if (description) req.body.description = description.trim();
  if (address) req.body.address = address.trim();
  if (city) req.body.city = city.trim();
  if (postalCode) req.body.postalCode = postalCode.trim();

  next();
};

module.exports = {
  validateProjectCreation,
  validateProjectUpdate
};