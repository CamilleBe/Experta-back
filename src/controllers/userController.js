// Exemple de contrôleur pour les utilisateurs
// Remplacez cette logique par votre propre logique métier

const getAllUsers = async (req, res) => {
  try {
    // Logique pour récupérer tous les utilisateurs
    const users = [
      { id: 1, name: 'John Doe', email: 'john@example.com' },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
    ];
    
    res.status(200).json({
      success: true,
      data: users,
      message: 'Utilisateurs récupérés avec succès'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des utilisateurs',
      error: error.message
    });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Logique pour récupérer un utilisateur par ID
    const user = { id: parseInt(id), name: 'John Doe', email: 'john@example.com' };
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }
    
    res.status(200).json({
      success: true,
      data: user,
      message: 'Utilisateur récupéré avec succès'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de l\'utilisateur',
      error: error.message
    });
  }
};

const createUser = async (req, res) => {
  try {
    const { name, email } = req.body;
    
    // Validation basique
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Le nom et l\'email sont requis'
      });
    }
    
    // Logique pour créer un nouvel utilisateur
    const newUser = { id: Date.now(), name, email };
    
    res.status(201).json({
      success: true,
      data: newUser,
      message: 'Utilisateur créé avec succès'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de l\'utilisateur',
      error: error.message
    });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email } = req.body;
    
    // Logique pour mettre à jour un utilisateur
    const updatedUser = { id: parseInt(id), name, email };
    
    res.status(200).json({
      success: true,
      data: updatedUser,
      message: 'Utilisateur mis à jour avec succès'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de l\'utilisateur',
      error: error.message
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Logique pour supprimer un utilisateur
    
    res.status(200).json({
      success: true,
      message: 'Utilisateur supprimé avec succès'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de l\'utilisateur',
      error: error.message
    });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
}; 