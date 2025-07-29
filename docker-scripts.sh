#!/bin/bash

# ================================================
# SCRIPTS DE GESTION DOCKER POUR EXPERTA
# ================================================

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ================================================
# FONCTIONS UTILITAIRES
# ================================================

print_banner() {
    echo -e "${BLUE}"
    echo "================================================"
    echo "           EXPERTA DOCKER MANAGER"
    echo "================================================"
    echo -e "${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# ================================================
# FONCTIONS PRINCIPALES
# ================================================

build_image() {
    print_info "Construction de l'image Docker..."
    docker build -t experta-backend .
    if [ $? -eq 0 ]; then
        print_success "Image construite avec succès!"
    else
        print_error "Échec de la construction"
        exit 1
    fi
}

start_services() {
    print_info "Démarrage des services..."
    docker-compose up -d
    if [ $? -eq 0 ]; then
        print_success "Services démarrés!"
        print_info "Application: http://localhost:3000"
        print_info "Adminer: http://localhost:8080"
    else
        print_error "Échec du démarrage"
    fi
}

stop_services() {
    print_info "Arrêt des services..."
    docker-compose down
    print_success "Services arrêtés!"
}

restart_services() {
    print_info "Redémarrage des services..."
    docker-compose restart
    print_success "Services redémarrés!"
}

rebuild_and_start() {
    print_info "Reconstruction et redémarrage..."
    docker-compose down
    docker-compose build --no-cache
    docker-compose up -d
    print_success "Reconstruction terminée!"
}

show_logs() {
    print_info "Affichage des logs..."
    docker-compose logs -f
}

show_status() {
    print_info "État des conteneurs:"
    docker-compose ps
}

cleanup() {
    print_warning "Nettoyage complet (supprime tout)..."
    read -p "Êtes-vous sûr ? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        docker-compose down -v
        docker system prune -f
        print_success "Nettoyage terminé!"
    else
        print_info "Nettoyage annulé"
    fi
}

# ================================================
# MENU PRINCIPAL
# ================================================

show_menu() {
    print_banner
    echo "Choisissez une action:"
    echo "1) 🏗️  Construire l'image"
    echo "2) 🚀 Démarrer les services"
    echo "3) 🛑 Arrêter les services"
    echo "4) 🔄 Redémarrer les services"
    echo "5) 🔨 Reconstruire et redémarrer"
    echo "6) 📋 Voir les logs"
    echo "7) 📊 Voir le statut"
    echo "8) 🧹 Nettoyage complet"
    echo "9) 🚪 Quitter"
    echo ""
}

# ================================================
# SCRIPT PRINCIPAL
# ================================================

main() {
    while true; do
        show_menu
        read -p "Votre choix (1-9): " choice
        
        case $choice in
            1) build_image ;;
            2) start_services ;;
            3) stop_services ;;
            4) restart_services ;;
            5) rebuild_and_start ;;
            6) show_logs ;;
            7) show_status ;;
            8) cleanup ;;
            9) print_info "Au revoir!"; exit 0 ;;
            *) print_error "Choix invalide!" ;;
        esac
        
        echo ""
        read -p "Appuyez sur Entrée pour continuer..."
        clear
    done
}

# Vérifier si Docker est installé
if ! command -v docker &> /dev/null; then
    print_error "Docker n'est pas installé!"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose n'est pas installé!"
    exit 1
fi

# Exécuter le script principal
main 