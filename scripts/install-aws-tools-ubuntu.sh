#!/bin/bash

# Script d'installation des outils AWS pour Ubuntu moderne (22.04+)
# Usage: ./install-aws-tools-ubuntu.sh

set -e

echo "🔧 Installation des outils AWS pour Ubuntu"
echo "==========================================="
echo ""

# Vérifier qu'on est sur Linux
if [[ "$OSTYPE" != "linux-gnu"* ]]; then
    echo "❌ Ce script est pour Linux/Ubuntu uniquement"
    exit 1
fi

# Mettre à jour les packages
echo "📦 Mise à jour des packages..."
sudo apt update

# Installer les dépendances
echo "📦 Installation des dépendances..."
sudo apt install -y curl unzip pipx

# Installer AWS CLI
echo ""
echo "📥 Installation AWS CLI..."
if command -v aws &> /dev/null; then
    echo "✅ AWS CLI déjà installé ($(aws --version))"
else
    cd /tmp
    curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
    unzip -o awscliv2.zip
    sudo ./aws/install
    rm -rf aws awscliv2.zip
    cd - > /dev/null
    echo "✅ AWS CLI installé avec succès"
fi

# Configurer pipx
echo ""
echo "⚙️  Configuration de pipx..."
pipx ensurepath

# Installer EB CLI avec pipx (compatible Ubuntu 22.04+)
echo ""
echo "📥 Installation Elastic Beanstalk CLI..."
if command -v eb &> /dev/null; then
    echo "✅ EB CLI déjà installé ($(eb --version))"
else
    echo "Installation via pipx (compatible Ubuntu moderne)..."
    pipx install awsebcli
    
    # S'assurer que pipx binaries sont dans le PATH
    export PATH="$HOME/.local/bin:$PATH"
    
    echo "✅ EB CLI installé avec succès"
fi

echo ""
echo "✅ Installation terminée!"
echo ""
echo "Versions installées:"
aws --version
~/.local/bin/eb --version 2>/dev/null || eb --version
echo ""
echo "📝 Prochaines étapes:"
echo "1. Redémarrer votre terminal ou exécuter: source ~/.bashrc"
echo "2. Si 'eb' n'est pas trouvé, exécuter: pipx ensurepath && source ~/.bashrc"
echo "3. Configurer AWS CLI: aws configure"
echo "4. Suivre le guide: docs/GUIDE_DEPLOIEMENT_AWS_SIMPLIFIE.md"
