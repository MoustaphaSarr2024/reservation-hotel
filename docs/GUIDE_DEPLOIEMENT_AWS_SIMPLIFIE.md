# Guide Simplifié - Déploiement AWS

##  Vue d'ensemble

Vous allez déployer :
1. **Base de données PostgreSQL** → AWS RDS
2. **Backend Node.js** → AWS Elastic Beanstalk
3. **Frontend React** → AWS S3 + CloudFront

##  Étapes Rapides

### Étape 1 : Installer les outils AWS (une seule fois)

```bash
# Installer AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Vérifier
aws --version

# Installer Elastic Beanstalk CLI
pip install awsebcli --upgrade --user

# Vérifier
eb --version
```

### Étape 2 : Configurer AWS CLI

```bash
aws configure
```

Entrer vos informations AWS :
- **Access Key ID** : (depuis votre compte AWS)
- **Secret Access Key** : (depuis votre compte AWS)
- **Region** : `us-east-1`
- **Output format** : `json`

### Étape 3 : Créer la base de données RDS PostgreSQL

#### Via la console AWS (plus simple) :

1. Aller sur https://console.aws.amazon.com/rds/
2. Cliquer **"Create database"**
3. Choisir :
   - **Engine** : PostgreSQL
   - **Templates** : **Free tier** 
   - **DB instance identifier** : `reservation-hotel-db`
   - **Master username** : `admin`
   - **Master password** : [créer un mot de passe fort]
   - **DB instance class** : db.t3.micro (gratuit)
   - **Storage** : 20 GB
   - **Public access** : Yes
   - **Initial database name** : `reservation_hotel`
4. Créer la base de données (prend 5-10 minutes)

#### Configurer Security Group :

1. Aller dans **EC2** → **Security Groups**
2. Trouver le security group de votre RDS
3. **Inbound rules** → Edit
4. Ajouter :
   - Type: PostgreSQL
   - Port: 5432
   - Source: Anywhere (0.0.0.0/0) pour tests
5. Sauvegarder

#### Noter l'endpoint :

```
Exemple: reservation-hotel-db.xxxxxx.us-east-1.rds.amazonaws.com
```

### Étape 4 : Déployer le Backend sur Elastic Beanstalk

```bash
cd server

# Initialiser Elastic Beanstalk
eb init

# Répondre :
# - Region: us-east-1
# - Application name: reservation-hotel-backend
# - Platform: Node.js
# - Version: Node.js 18
# - SSH: Yes (optionnel)

# Créer l'environnement
eb create reservation-hotel-env

# Attendre 5-10 minutes...
```

#### Configurer les variables d'environnement :

```bash
# Remplacer avec vos vraies valeurs
eb setenv \
  NODE_ENV=production \
  DB_DIALECT=postgres \
  DB_HOST=reservation-hotel-db.xxxxxx.us-east-1.rds.amazonaws.com \
  DB_PORT=5432 \
  DB_NAME=reservation_hotel \
  DB_USER=admin \
  DB_PASSWORD=votre-mot-de-passe \
  PORT=5000 \
  EMAIL_USER=votre-email@gmail.com \
  EMAIL_PASS=votre-app-password

# Redéployer
eb deploy
```

#### Tester le backend :

```bash
# Ouvrir dans le navigateur
eb open

# Ou tester le health check
curl http://votre-url.elasticbeanstalk.com/health
```

### Étape 5 : Déployer le Frontend sur S3

#### Créer le bucket S3 :

```bash
# Créer bucket
aws s3 mb s3://reservation-hotel-frontend-<votre-nom> --region us-east-1

# Configurer pour web hosting
aws s3 website s3://reservation-hotel-frontend-<votre-nom> \
  --index-document index.html \
  --error-document index.html
```

#### Rendre le bucket public :

Créer `bucket-policy.json` :

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::reservation-hotel-frontend-<votre-nom>/*"
    }
  ]
}
```

Appliquer :

```bash
aws s3api put-bucket-policy \
  --bucket reservation-hotel-frontend-<votre-nom> \
  --policy file://bucket-policy.json
```

#### Configurer et déployer le frontend :

```bash
cd ../client

# Créer .env.production
echo "VITE_API_URL=http://votre-backend.elasticbeanstalk.com" > .env.production

# Build
npm run build

# Déployer vers S3
aws s3 sync build/client s3://reservation-hotel-frontend-<votre-nom> --delete
```

#### URL du site :

```
http://reservation-hotel-frontend-<votre-nom>.s3-website-us-east-1.amazonaws.com
```

### Étape 6 : (Optionnel) CloudFront pour HTTPS

1. Aller sur https://console.aws.amazon.com/cloudfront/
2. **Create distribution**
3. **Origin domain** : votre-bucket.s3-website-us-east-1.amazonaws.com
4. **Viewer protocol policy** : Redirect HTTP to HTTPS
5. **Default root object** : index.html
6. Créer

#### Configurer error pages (pour React Router) :

1. Distribution → Error pages
2. Create custom error response :
   - Error code: 403 → Response page: /index.html → Code: 200
   - Error code: 404 → Response page: /index.html → Code: 200

#### Mettre à jour le backend avec l'URL CloudFront :

```bash
cd ../server
eb setenv CLIENT_URL=https://dxxxxx.cloudfront.net
eb deploy
```

##  Vérification

### Tester le backend :

```bash
# Health check
curl http://votre-backend.elasticbeanstalk.com/health

# API chambres
curl http://votre-backend.elasticbeanstalk.com/api/rooms
```

### Tester le frontend :

Ouvrir l'URL S3 ou CloudFront dans le navigateur

##  Fonctionnalités Bonus

### 1. Sauvegardes automatiques RDS

Déjà activé par défaut (7 jours de rétention)

Vérifier : Console RDS → votre-db → Maintenance & backups

### 2. Monitoring CloudWatch

 Déjà activé automatiquement

Voir : Console CloudWatch → Metrics

### 3. Auto-scaling

1. Console Elastic Beanstalk → Configuration → Capacity
2. Configurer :
   - Min: 1
   - Max: 4
   - Scaling trigger: CPU > 80%

##  Coûts (Tier Gratuit 12 mois)

- RDS db.t3.micro : **Gratuit**
- EC2 t2.micro : **Gratuit**
- S3 5GB : **Gratuit**
- CloudFront 50GB/mois : **Gratuit**

##  Accès à l'application

- **Frontend (Site Web)** : http://reservation-hotel-frontend-2024.s3-website-us-east-1.amazonaws.com
- **Backend (API)** : http://reservation-hotel-env.eba-nixqihwa.us-east-1.elasticbeanstalk.com

##  Problèmes rencontrés et solutions

### 1. Erreur 502 Bad Gateway
- **Cause** : Échec de connexion à la base de données (mot de passe incorrect ou mauvais nom d'utilisateur).
- **Solution** : 
    - Vérifier les logs : `eb logs`
    - Identifier l'erreur `auth_failed`
    - Corriger le `DB_USER` (attention à la casse, ex: `PostgreSQL`)
    - Réinitialiser le mot de passe RDS si nécessaire via la console AWS.

### 2. Erreur de migration automatique
- **Cause** : La commande de migration dans `.ebextensions` échouait car la connexion DB n'était pas encore établie.
- **Solution** : 
    - Désactiver temporairement la migration.
    - Déployer pour établir la connexion.
    - Réactiver la migration ou l'exécuter manuellement.

### 3. Frontend SSR sur S3
- **Cause** : React Router configuré en mode SSR par défaut.
- **Solution** : Passer en mode SPA (`ssr: false` dans `react-router.config.ts`) et adapter les `loader` en `clientLoader`.

##  Arrêter les ressources après présentation

```bash
# Supprimer backend
cd server
eb terminate reservation-hotel-env

# Supprimer base de données
aws rds delete-db-instance \
  --db-instance-identifier reservation-hotel-db \
  --skip-final-snapshot

# Vider et supprimer S3
aws s3 rm s3://reservation-hotel-frontend-<votre-nom> --recursive
aws s3 rb s3://reservation-hotel-frontend-<votre-nom>
```

