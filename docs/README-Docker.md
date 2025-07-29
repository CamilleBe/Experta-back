# 🐳 Guide de Dockerisation - Experta Backend

## 📋 **Architecture Créée**

Votre projet est maintenant entièrement dockerisé avec :

```
experta-back/
├── 🐳 Dockerfile              # Configuration de l'image Node.js
├── 🚫 .dockerignore           # Optimisation de l'image
├── 🎼 docker-compose.yml      # Orchestration multi-conteneurs
├── 🗃️ init.sql               # Initialisation de la base de données
├── 🔧 docker-scripts.sh       # Scripts de gestion (Linux/Mac)
├── 🔧 docker-scripts.ps1      # Scripts de gestion (Windows)
├── ❤️ healthcheck.js          # Surveillance de l'application
└── 📦 package.json            # Scripts npm ajoutés
```

## 🎯 **Services Inclus**

1. **experta-backend** : Votre application Node.js/Express
2. **mysql** : Base de données MySQL 8.0
3. **adminer** : Interface web pour gérer MySQL

## 🚀 **Comment Tester Votre Dockerisation**

### **Méthode 1 : Scripts Automatisés (Recommandé)**

**Sur Windows :**
```powershell
# Exécuter le script PowerShell
./docker-scripts.ps1
```

**Sur Linux/Mac :**
```bash
# Rendre le script exécutable (si nécessaire)
chmod +x docker-scripts.sh
# Exécuter le script
./docker-scripts.sh
```

### **Méthode 2 : Commandes npm**

```bash
# Construire l'image
npm run docker:build

# Démarrer tous les services
npm run docker:up

# Voir les logs
npm run docker:logs

# Arrêter les services
npm run docker:down
```

### **Méthode 3 : Commandes Docker Directes**

```bash
# 1. Construire l'image
docker build -t experta-backend .

# 2. Démarrer tous les services
docker-compose up -d

# 3. Vérifier que tout fonctionne
docker-compose ps

# 4. Voir les logs
docker-compose logs -f

# 5. Arrêter les services
docker-compose down
```

## 🧪 **Tests de Validation**

### **1. Tester l'Application**

Une fois démarrée, vérifiez :

- **API** : http://localhost:3000
- **Adminer** : http://localhost:8080
- **Health Check** : http://localhost:3000/ (doit retourner un JSON)

### **2. Tester la Base de Données**

1. Allez sur http://localhost:8080 (Adminer)
2. Connectez-vous avec :
   - **Serveur** : `mysql`
   - **Utilisateur** : `experta_user`
   - **Mot de passe** : `secure_password_123`
   - **Base de données** : `experta_db`

### **3. Vérifier les Health Checks**

```bash
# Voir l'état de santé des conteneurs
docker-compose ps
```

## 🔧 **Commandes Utiles**

```bash
# Voir tous les conteneurs
docker ps

# Entrer dans le conteneur de l'app
docker exec -it experta-backend sh

# Entrer dans MySQL
docker exec -it experta-mysql mysql -u experta_user -p experta_db

# Voir l'utilisation des ressources
docker stats

# Nettoyer complètement
docker-compose down -v
docker system prune -f
```

## 🎓 **Concepts Clés Appris**

### **1. Dockerfile Multi-Stage**
- Optimisation des images
- Sécurité avec utilisateur non-root
- Cache des layers

### **2. Docker Compose**
- Orchestration de services
- Networks isolés
- Volumes persistants
- Health checks

### **3. Bonnes Pratiques**
- `.dockerignore` pour la sécurité
- Variables d'environnement
- Health checks
- Scripts de gestion

## 🚨 **Dépannage**

### **Problème : Port déjà utilisé**
```bash
# Trouver le processus utilisant le port 3000
netstat -ano | findstr :3000
# Ou sur Linux/Mac
lsof -i :3000
```

### **Problème : Conteneur ne démarre pas**
```bash
# Voir les logs détaillés
docker-compose logs experta-backend

# Redémarrer sans cache
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### **Problème : Base de données inaccessible**
```bash
# Vérifier l'état de MySQL
docker-compose logs mysql

# Recréer le volume de données
docker-compose down -v
docker-compose up -d
```

## 🎉 **Félicitations !**

Vous avez maintenant :
- ✅ Une application entièrement dockerisée
- ✅ Une base de données persistante
- ✅ Des scripts de gestion automatisés
- ✅ Un environnement de développement portable
- ✅ Une base solide pour le déploiement en production

## 📚 **Prochaines Étapes**

1. **CI/CD** : Intégrer avec GitHub Actions
2. **Kubernetes** : Déployer sur un cluster
3. **Monitoring** : Ajouter Prometheus/Grafana
4. **Sécurité** : Scanner les images pour les vulnérabilités 