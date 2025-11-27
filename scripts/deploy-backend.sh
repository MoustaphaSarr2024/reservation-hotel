#!/bin/bash

# Script de déploiement backend sur AWS Elastic Beanstalk
# Usage: ./deploy-backend.sh

set -e

echo " Déploiement du Backend sur AWS Elastic Beanstalk"
echo "=================================================="

# Vérifier qu'on est dans le bon répertoire
if [ ! -f "package.json" ]; then
    echo " Erreur: Exécuter ce script depuis le dossier server/"
    exit 1
fi

# Vérifier que EB CLI est installé
if ! command -v eb &> /dev/null; then
    echo " Elastic Beanstalk CLI n'est pas installé"
    echo "Installation: pip install awsebcli --upgrade --user"
    exit 1
fi

echo ""
echo " Étape 1: Vérification des fichiers..."
if [ ! -d ".ebextensions" ]; then
    echo "  Dossier .ebextensions manquant"
    exit 1
fi

echo " Fichiers OK"

echo ""
echo " Étape 2: Déploiement..."
eb deploy

echo ""
echo " Étape 3: Vérification du statut..."
eb status

echo ""
echo " Déploiement terminé!"
echo ""
echo "Pour ouvrir l'application: eb open"
echo " Pour voir les logs: eb logs"
echo " Health check: eb health"
