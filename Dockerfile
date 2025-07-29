# ================================================
# DOCKERFILE POUR APPLICATION NODE.JS/EXPRESS
# ================================================

# ÉTAPE 1: Choisir l'image de base
# On utilise node:18-alpine car :
# - node:18 = Version LTS stable de Node.js
# - alpine = Distribution Linux très légère (5MB vs 900MB pour Ubuntu)
# - Sécurisé et optimisé pour la production
FROM node:18-alpine

# ÉTAPE 2: Créer un utilisateur non-root pour la sécurité
# Par défaut, les conteneurs tournent en root, ce qui est dangereux
# On crée un utilisateur 'appuser' avec un groupe dédié
RUN addgroup -g 1001 -S nodejs && \
    adduser -S appuser -u 1001

# ÉTAPE 3: Définir le répertoire de travail
# Toutes les commandes suivantes s'exécuteront dans ce dossier
WORKDIR /app

# ÉTAPE 4: Copier les fichiers de dépendances d'abord
# On copie package*.json en premier pour optimiser le cache Docker
# Si ces fichiers ne changent pas, Docker réutilise les layers précédents
COPY package*.json ./

# ÉTAPE 5: Installer les dépendances
# --only=production : installe uniquement les dépendances de production
# --no-cache : évite de garder le cache npm dans l'image finale
RUN npm ci --only=production --no-cache && \
    npm cache clean --force

# ÉTAPE 6: Copier le code source
# On fait ça après npm install pour optimiser le cache Docker
COPY . .

# ÉTAPE 7: Changer la propriété des fichiers vers notre utilisateur
# Sécurité : éviter que l'app tourne en root
RUN chown -R appuser:nodejs /app
USER appuser

# ÉTAPE 8: Exposer le port
# Indique que l'application écoute sur le port 3000
# ATTENTION : n'ouvre pas réellement le port, c'est juste informatif
EXPOSE 3000

# ÉTAPE 10: Commande de démarrage
# CMD vs RUN : RUN s'exécute lors du build, CMD lors du run
# On utilise node directement (pas npm) pour une meilleure gestion des signaux
CMD ["node", "server.js"] 