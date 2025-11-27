#!/bin/bash

# Script de déploiement frontend sur AWS S3
# Usage: ./deploy-frontend.sh <nom-du-bucket>

set -e

BUCKET_NAME=$1

if [ -z "$BUCKET_NAME" ]; then
    echo "❌ Usage: ./deploy-frontend.sh <nom-du-bucket>"
    echo "Exemple: ./deploy-frontend.sh reservation-hotel-frontend-msarr"
    exit 1
fi

echo "🚀 Déploiement du Frontend sur S3"
echo "=================================="
echo "Bucket: $BUCKET_NAME"
echo ""

# Vérifier qu'on est dans le bon répertoire
if [ ! -f "package.json" ]; then
    echo "❌ Erreur: Exécuter ce script depuis le dossier client/"
    exit 1
fi

echo "📝 Étape 1: Build du frontend..."
npm run build

echo ""
echo "📝 Étape 2: Upload vers S3..."
aws s3 sync build/client s3://$BUCKET_NAME --delete

echo ""
echo "✅ Déploiement terminé!"
echo ""
echo "🔗 URL du site:"
echo "http://$BUCKET_NAME.s3-website-us-east-1.amazonaws.com"
echo ""
echo "💡 Pour invalider le cache CloudFront (si configuré):"
echo "aws cloudfront create-invalidation --distribution-id <ID> --paths '/*'"
