#  Checklist de Déploiement AWS

Utilisez cette checklist pour suivre votre déploiement étape par étape.

## Préparation (À faire avant de commencer)

- [ ] Compte AWS créé et vérifié
- [ ] Carte de crédit/débit ajoutée (tier gratuit mais requis)
- [ ] Accéder à AWS Console : https://console.aws.amazon.com
- [ ] Créer un utilisateur IAM avec accès administrateur
- [ ] Noter Access Key ID et Secret Access Key

## Installation des Outils (Une seule fois)

- [ ] AWS CLI installé (`aws --version`)
- [ ] AWS CLI configuré (`aws configure`)
- [ ] Elastic Beanstalk CLI installé (`eb --version`)
- [ ] Node.js 18+ installé (`node --version`)

## 1️ Base de Données RDS PostgreSQL

- [ ] Créer instance RDS PostgreSQL
  - Template: **Free tier**
  - Instance: db.t3.micro
  - Storage: 20 GB
  - DB name: `reservation_hotel`
  - Username: `admin`
  - Password: [noter quelque part de sécurisé]
- [ ] Attendre que le statut soit "Available" (5-10 min)
- [ ] Configurer Security Group (port 5432 ouvert)
- [ ] Tester connexion (optionnel) :
  ```bash
  psql -h <endpoint> -U admin -d reservation_hotel
  ```
- [ ] Noter l'endpoint RDS : `_______________________________`

## 2️ Backend - Elastic Beanstalk

### Initialisation

- [ ] `cd server`
- [ ] `eb init`
  - Region: us-east-1
  - App name: reservation-hotel-backend
  - Platform: Node.js 18
- [ ] `eb create reservation-hotel-env`
- [ ] Attendre création (5-10 min)

### Configuration

- [ ] Configurer variables d'environnement :
  ```bash
  eb setenv \
    NODE_ENV=production \
    DB_DIALECT=postgres \
    DB_HOST=<votre-endpoint-rds> \
    DB_PORT=5432 \
    DB_NAME=reservation_hotel \
    DB_USER=admin \
    DB_PASSWORD=<votre-mot-de-passe> \
    PORT=5000 \
    EMAIL_USER=<votre-email> \
    EMAIL_PASS=<app-password>
  ```
- [ ] `eb deploy`
- [ ] Tester : `curl http://<url>.elasticbeanstalk.com/health`
- [ ] Tester : `curl http://<url>.elasticbeanstalk.com/api/rooms`
- [ ] Noter URL Backend : `_______________________________`

## 3️ Frontend - S3

### Création du bucket

- [ ] Choisir un nom unique : `reservation-hotel-frontend-<votre-nom>`
- [ ] Créer bucket :
  ```bash
  aws s3 mb s3://<nom-bucket> --region us-east-1
  ```
- [ ] Activer web hosting :
  ```bash
  aws s3 website s3://<nom-bucket> \
    --index-document index.html \
    --error-document index.html
  ```
- [ ] Configurer bucket policy (rendre public)

### Build et déploiement

- [ ] `cd client`
- [ ] Créer `.env.production` :
  ```
  VITE_API_URL=http://<backend-url>.elasticbeanstalk.com
  ```
- [ ] `npm run build`
- [ ] Déployer :
  ```bash
  aws s3 sync build/client s3://<nom-bucket> --delete
  ```
- [ ] Tester URL : `http://<nom-bucket>.s3-website-us-east-1.amazonaws.com`

