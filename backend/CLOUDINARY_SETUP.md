# Configuration Cloudinary pour OSIRIX

## Pourquoi Cloudinary?

Render.com utilise un **système de fichiers éphémère**, ce qui signifie que les fichiers uploadés sur le serveur sont perdus après chaque redémarrage. Pour résoudre ce problème, nous utilisons **Cloudinary**, un service cloud gratuit pour stocker les fichiers médicaux.

## Étapes de configuration

### 1. Créer un compte Cloudinary (GRATUIT)

1. Aller sur [https://cloudinary.com](https://cloudinary.com)
2. Cliquer sur **"Sign Up for Free"**
3. Créer un compte (25GB gratuits, 25 000 transformations/mois)
4. Vérifier votre email

### 2. Récupérer vos identifiants

Une fois connecté à votre dashboard Cloudinary:

1. Aller sur le **Dashboard** (page d'accueil)
2. Vous verrez une section **"Account Details"** avec:
   - **Cloud Name** (ex: `osirix-medical`)
   - **API Key** (ex: `123456789012345`)
   - **API Secret** (cliquer sur "Reveal" pour voir)

### 3. Configurer les variables d'environnement

#### En développement local (`.env`)

```env
CLOUDINARY_CLOUD_NAME=votre_cloud_name
CLOUDINARY_API_KEY=votre_api_key
CLOUDINARY_API_SECRET=votre_api_secret
```

#### En production sur Render.com

1. Aller sur votre service backend sur [https://dashboard.render.com](https://dashboard.render.com)
2. Cliquer sur votre service **"osirix-backend"**
3. Aller dans l'onglet **"Environment"**
4. Ajouter ces 3 variables:
   - `CLOUDINARY_CLOUD_NAME` = votre_cloud_name
   - `CLOUDINARY_API_KEY` = votre_api_key
   - `CLOUDINARY_API_SECRET` = votre_api_secret
5. Cliquer sur **"Save Changes"**
6. Le service va redémarrer automatiquement

### 4. Tester l'upload

1. Redémarrer votre backend local:
   ```bash
   cd backend
   npm run start:dev
   ```

2. Connectez-vous en tant que secrétaire sur le frontend

3. Envoyez une analyse médicale avec un fichier PDF

4. Le fichier sera uploadé sur Cloudinary et l'URL sera automatiquement accessible en ligne

## Comment ça marche?

### Avant (système local éphémère ❌)
```
Secrétaire upload PDF
  ↓
Stocké sur /uploads/lab-results/fichier.pdf (Render.com)
  ↓
❌ Perdu après redémarrage du serveur
```

### Maintenant (Cloudinary cloud ✅)
```
Secrétaire upload PDF
  ↓
Envoyé vers Cloudinary
  ↓
Cloudinary retourne une URL permanente
  ↓
URL stockée dans la base de données
  ↓
✅ Accessible partout, tout le temps
```

## Structure des fichiers sur Cloudinary

Les fichiers seront organisés dans le dossier:
```
osirix/
  └── lab-results/
      ├── lab-result-123456789.pdf
      ├── lab-result-987654321.png
      └── ...
```

## Dépannage

### Erreur: "Cannot GET /uploads/..."
- Vous n'avez pas encore configuré Cloudinary
- Les variables d'environnement ne sont pas définies
- Suivez les étapes ci-dessus

### Erreur: "Invalid cloud_name"
- Vérifiez que `CLOUDINARY_CLOUD_NAME` est correct
- Pas d'espaces, pas de majuscules dans le cloud_name

### Les fichiers ne s'affichent pas
- Vérifiez que l'URL dans la base de données commence par `https://res.cloudinary.com/`
- Si l'URL commence par `/uploads/`, c'est un ancien fichier local (non disponible)

## Support

Plan gratuit Cloudinary:
- ✅ 25 GB de stockage
- ✅ 25 000 transformations/mois
- ✅ Bande passante: 25 GB/mois
- ✅ Parfait pour OSIRIX!

Pour plus d'infos: [https://cloudinary.com/documentation](https://cloudinary.com/documentation)
