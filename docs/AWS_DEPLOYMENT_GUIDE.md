# Guide de Déploiement AWS - Système de Réservation Hôtelière

Ce guide détaille toutes les étapes pour déployer l'application sur AWS.

## Prérequis

- Compte AWS avec accès au tier gratuit
- AWS CLI installé et configuré
- EB CLI (Elastic Beanstalk CLI) installé
- Node.js 18+ installé localement

## Architecture AWS

```
┌─────────────────┐
│   CloudFront    │  ← Distribution CDN (Frontend)
└────────┬────────┘
         │
    ┌────▼─────┐
    │ S3 Bucket │     ← Frontend React/Remix
    └──────────┘
         
┌──────────────────┐
│ Elastic Beanstalk│  ← Backend Node.js/Express
└────────┬─────────┘
         │
    ┌────▼─────┐
    │ RDS      │        ← PostgreSQL Database
    │PostgreSQL│
    └──────────┘
```

## Étape 1 : Configuration Initiale AWS

### 1.1 Installer AWS CLI

```bash
# Sur Linux
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Vérifier l'installation
aws --version
```

### 1.2 Configurer AWS CLI

```bash
aws configure
# Entrer:
# - AWS Access Key ID
# - AWS Secret Access Key  
# - Region: us-east-1 (ou votre région préférée)
# - Output format: json
```

### 1.3 Installer Elastic Beanstalk CLI

```bash
pip install awsebcli --upgrade --user

# Vérifier
eb --version
```

## Étape 2 : Créer et Configurer RDS PostgreSQL

### 2.1 Via AWS Console

1. **Accéder à RDS** : Console AWS → RDS → Create database
2. **Choisir PostgreSQL**
   - Engine type: PostgreSQL
   - Version: 15.x ou plus récent
3. **Templates** : Free tier
4. **Settings**
   - DB instance identifier: `reservation-hotel-db`
   - Master username: `admin`
   - Master password: [créer un mot de passe sécurisé]
5. **Instance configuration**
   - DB instance class: db.t3.micro (tier gratuit)
6. **Storage**
   - Storage type: General Purpose (SSD)
   - Allocated storage: 20 GB
7. **Connectivity**
   - Public access: Yes (pour le développement)
   - VPC security group: Créer nouveau `rds-postgres-sg`
8. **Additional configuration**
   - Initial database name: `reservation_hotel`
   - **Enable automated backups**: Yes (7 jours de rétention)
   - Backup window: Préféré
   - **Enable monitoring**: Yes

### 2.2 Configurer le Security Group RDS

1. EC2 → Security Groups → `rds-postgres-sg`
2. Inbound rules → Edit
3. Ajouter règle :
   - Type: PostgreSQL
   - Port: 5432
   - Source: Anywhere (0.0.0.0/0) pour dev, ou IP spécifique pour production
4. Save rules

### 2.3 Noter les informations de connexion

```bash
# Endpoint RDS (exemple)
reservation-hotel-db.xxxxx.us-east-1.rds.amazonaws.com

# Database name
reservation_hotel

# Username
admin

# Password
[votre mot de passe]
```

## Étape 3 : Déployer le Backend sur Elastic Beanstalk

### 3.1 Initialiser Elastic Beanstalk

```bash
cd server

# Initialiser EB
eb init

# Répondre aux questions:
# - Select a default region: us-east-1 (ou votre région)
# - Application name: reservation-hotel-backend
# - Platform: Node.js
# - Platform version: Node.js 18 running on 64bit Amazon Linux 2
# - CodeCommit: No
# - SSH: Yes (optionnel)
```

### 3.2 Créer l'environnement Elastic Beanstalk

```bash
# Créer l'environnement
eb create reservation-hotel-backend-env

# Cette commande va:
# - Créer un environnement Elastic Beanstalk
# - Créer un load balancer
# - Créer des instances EC2 (t2.micro tier gratuit)
# - Déployer l'application
```

### 3.3 Configurer les variables d'environnement

```bash
# Configurer les variables d'environnement
eb setenv \
  NODE_ENV=production \
  DB_DIALECT=postgres \
  DB_HOST=reservation-hotel-db.xxxxx.us-east-1.rds.amazonaws.com \
  DB_PORT=5432 \
  DB_NAME=reservation_hotel \
  DB_USER=admin \
  DB_PASSWORD=votre-mot-de-passe \
  PORT=5000 \
  CLIENT_URL=https://votre-cloudfront-domain.com \
  EMAIL_USER=votre-email@gmail.com \
  EMAIL_PASS=votre-app-password

# Vérifier
eb printenv
```

### 3.4 Déployer l'application

```bash
# Déployer
eb deploy

# Vérifier le statut
eb status

# Ouvrir l'application dans le navigateur
eb open

# Tester le health check
curl http://votre-eb-url.elasticbeanstalk.com/health
```

### 3.5 Configurer Auto Scaling

1. Console AWS → Elastic Beanstalk → Environment
2. Configuration → Capacity
3. Environment type: Load balanced
4. Instances:
   - Min: 1
   - Max: 4
5. Scaling triggers:
   - Metric: CPUUtilization
   - Statistic: Average
   - Unit: Percent
   - Upper threshold: 80
   - Lower threshold: 20
6. Apply

## Étape 4 : Déployer le Frontend sur S3 + CloudFront

### 4.1 Créer le bucket S3

```bash
# Créer un bucket S3
aws s3 mb s3://reservation-hotel-frontend --region us-east-1

# Configurer pour hébergement web statique
aws s3 website s3://reservation-hotel-frontend \
  --index-document index.html \
  --error-document index.html
```

### 4.2 Configurer la politique du bucket

Créer un fichier `bucket-policy.json`:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::reservation-hotel-frontend/*"
    }
  ]
}
```

Appliquer la politique:

```bash
aws s3api put-bucket-policy \
  --bucket reservation-hotel-frontend \
  --policy file://bucket-policy.json
```

### 4.3 Configurer le frontend

Créer `client/.env.production`:

```bash
REACT_APP_API_URL=http://your-backend.elasticbeanstalk.com
```

### 4.4 Build et déployer le frontend

```bash
cd client

# Build en production
npm run build

# Upload vers S3
aws s3 sync build/ s3://reservation-hotel-frontend --delete

# Vérifier
aws s3 ls s3://reservation-hotel-frontend/
```

### 4.5 Créer distribution CloudFront

1. Console AWS → CloudFront → Create distribution
2. **Origin Settings**
   - Origin domain: reservation-hotel-frontend.s3-website-us-east-1.amazonaws.com
   - Protocol: HTTP only
3. **Default Cache Behavior**
   - Viewer protocol policy: Redirect HTTP to HTTPS
   - Allowed HTTP methods: GET, HEAD, OPTIONS
4. **Settings**
   - Price class: Use only North America and Europe
   - Default root object: index.html
5. Create distribution
6. **Créer custom error page** (pour React Router)
   - Error pages → Create custom error response
   - HTTP error code: 403
   - Customize error response: Yes
   - Response page path: /index.html
   - HTTP response code: 200
7. Répéter pour erreur 404

### 4.6 Mettre à jour CLIENT_URL dans Backend

```bash
cd server
eb setenv CLIENT_URL=https://dxxxxx.cloudfront.net
eb deploy
```

## Étape 5 : Sécurité et Optimisations

### 5.1 Activer HTTPS sur Elastic Beanstalk (Optionnel)

Requiert un certificat SSL via AWS Certificate Manager

### 5.2 Restreindre Security Groups

Pour la production, restreindre l'accès RDS:
- Source: Security Group d'Elastic Beanstalk uniquement

### 5.3 Configurer CloudWatch Alarms

1. CloudWatch → Alarms → Create alarm
2. Créer alarmes pour:
   - RDS CPU utilization > 80%
   - RDS Storage space < 20%
   - EB Application health
   - EB Instance status

## Étape 6 : Vérification et Tests

### 6.1 Test du Health Check

```bash
curl https://your-backend.elasticbeanstalk.com/health
# Devrait retourner: {"status":"ok","timestamp":"..."}
```

### 6.2 Test des API Endpoints

```bash
# Liste des chambres
curl https://your-backend.elasticbeanstalk.com/api/rooms

# Créer une réservation
curl -X POST https://your-backend.elasticbeanstalk.com/api/reservations \
  -H "Content-Type: application/json" \
  -d '{
    "roomId": 1,
    "guestName": "Test User",
    "guestEmail": "test@example.com",
    "phoneNumber": "+33123456789",
    "dateOfBirth": "1990-01-01",
    "dateFrom": "2025-12-01",
    "dateTo": "2025-12-05"
  }'
```

### 6.3 Test de l'application complète

1. Ouvrir CloudFront URL dans navigateur
2. Tester navigation
3. Créer une réservation
4. Vérifier email de confirmation
5. Tester interface admin

## Étape 7 : Maintenance et Monitoring

### 7.1 Vérifier les logs

```bash
# Logs Elastic Beanstalk
eb logs

# Logs en temps réel
eb logs --stream
```

### 7.2 Vérifier les métriques CloudWatch

Console AWS → CloudWatch → Metrics

### 7.3 Vérifier les sauvegardes RDS

Console AWS → RDS → Automated backups

## Commandes Utiles

```bash
# Backend
eb status                    # Statut de l'environnement
eb health                    # Santé de l'application
eb logs                      # Voir les logs
eb deploy                    # Redéployer
eb terminate                 # Supprimer l'environnement

# Frontend
aws s3 sync build/ s3://reservation-hotel-frontend --delete
aws cloudfront create-invalidation --distribution-id DXXXXX --paths "/*"

# RDS
aws rds describe-db-instances --db-instance-identifier reservation-hotel-db
```

## Coûts Estimés (Tier Gratuit)

- **RDS**: Gratuit (db.t3.micro, 20GB, 12 mois)
- **Elastic Beanstalk**: Gratuit (t2.micro, 750h/mois, 12 mois)
- **S3**: Gratuit (5GB, 12 mois)
- **CloudFront**: Gratuit (50GB transfert/mois, 12 mois)


## Arrêter les Ressources

```bash
# Backend
eb terminate reservation-hotel-backend-env

# RDS
aws rds delete-db-instance \
  --db-instance-identifier reservation-hotel-db \
  --skip-final-snapshot

# S3
aws s3 rb s3://reservation-hotel-frontend --force

# CloudFront
aws cloudfront delete-distribution --id DXXXXX
```
