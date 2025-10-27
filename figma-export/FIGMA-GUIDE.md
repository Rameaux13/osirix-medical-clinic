# 🎨 Guide d'Importation OSIRIX vers Figma

Ce guide vous explique comment transformer votre code frontend OSIRIX en maquettes Figma professionnelles.

---

## 📦 Fichiers Générés

Dans le dossier `figma-export/`, vous trouverez :

1. **design-tokens.json** - Tous les tokens de design (couleurs, typographie, espacement)
2. **01-homepage.html** - Page d'accueil complète
3. **02-login.html** - Page de connexion
4. **03-register.html** - Page d'inscription multi-étapes
5. **04-patient-dashboard.html** - Dashboard patient principal
6. **05-components-library.html** - Bibliothèque complète de composants UI
7. **FIGMA-GUIDE.md** - Ce guide

---

## 🚀 MÉTHODE 1 : Import HTML vers Figma (RECOMMANDÉ)

### Étape 1 : Préparation Figma

1. **Ouvrez Figma** (https://figma.com)
2. **Créez un nouveau fichier** : "OSIRIX - Maquettes"
3. **Installez le plugin d'import HTML** :
   - Cliquez sur **Resources** (icône communauté en haut)
   - Recherchez : **"html.to.design"**
   - Cliquez sur **"Install"** (GRATUIT)

   **Alternative :**
   - Plugin : **"Figma Import"**
   - Plugin : **"Anima - HTML to Figma"**

### Étape 2 : Importer les Pages HTML

#### Option A : Via le Plugin html.to.design

1. Dans Figma, allez dans **Plugins** → **html.to.design**
2. Cliquez sur **"Import HTML"**
3. **Sélectionnez le fichier** `01-homepage.html`
4. Cliquez sur **"Import"**
5. Le plugin va générer automatiquement la maquette !

Répétez pour tous les fichiers :
- `02-login.html`
- `03-register.html`
- `04-patient-dashboard.html`
- `05-components-library.html`

#### Option B : Via Drag & Drop (si supporté par le plugin)

1. Ouvrez le plugin
2. **Glissez-déposez** les fichiers HTML directement dans Figma
3. Le plugin convertit automatiquement

### Étape 3 : Organisation dans Figma

Créez des **Pages** dans Figma pour organiser :

```
📄 OSIRIX - Maquettes
├── 🏠 Homepage
├── 🔐 Login & Register
├── 📊 Patient Dashboard
├── 🎨 Components Library
└── 🎨 Design Tokens
```

### Étape 4 : Nettoyage et Optimisation

Après l'import, faites ces ajustements :

1. **Regrouper les éléments** similaires
2. **Créer des composants** réutilisables (boutons, cartes, inputs)
3. **Renommer les layers** de manière claire
4. **Ajuster les espacements** si nécessaire
5. **Ajouter les vraies images** (remplacer les placeholders)

---

## 🎯 MÉTHODE 2 : Import des Design Tokens

### Étape 1 : Installer le Plugin Tokens

1. Dans Figma, allez dans **Plugins**
2. Recherchez : **"Figma Tokens"** ou **"Design Tokens"**
3. Installez le plugin

### Étape 2 : Importer design-tokens.json

1. Ouvrez le plugin **Figma Tokens**
2. Cliquez sur **"Import"** ou **"Load from JSON"**
3. Sélectionnez le fichier **`design-tokens.json`**
4. Le plugin créera automatiquement :
   - Tous les styles de couleurs
   - Les styles de typographie
   - Les effets d'ombre
   - Les espacements

### Étape 3 : Appliquer les Tokens

Une fois importés, vous pouvez :
- Utiliser les couleurs via le sélecteur de couleur Figma
- Appliquer les styles de texte
- Utiliser les effets d'ombre
- Référencer les espacements

---

## 🛠️ MÉTHODE 3 : Reconstruction Manuelle (Plus de Contrôle)

Si les plugins ne fonctionnent pas, voici comment recréer manuellement :

### 1️⃣ Créer les Styles de Couleur

Créez ces couleurs dans Figma (**Styles** → **Create Color Style**) :

| Nom | Hex | Usage |
|-----|-----|-------|
| Primary | #006D65 | Couleur principale, liens, accents |
| Secondary | #E6A930 | Boutons primaires, highlights |
| Neutral/900 | #343A40 | Texte principal |
| Neutral/50 | #F8F9FA | Arrière-plans |
| Success | #10B981 | États confirmés, succès |
| Error | #EF4444 | Erreurs, annulations |
| Warning | #F59E0B | États en attente |
| Info | #3B82F6 | Informations |

### 2️⃣ Créer les Styles de Texte

Créez ces styles de texte (**Text Styles**) :

| Nom | Taille | Poids | Famille |
|-----|--------|-------|---------|
| H1 / Hero | 60px | 900 | Montserrat |
| H2 / Title | 48px | 800 | Montserrat |
| H3 / Section | 36px | 700 | Montserrat |
| H4 / Card Title | 24px | 700 | Montserrat |
| H5 / Label | 20px | 600 | Montserrat |
| Body / Regular | 16px | 400 | Montserrat |
| Body / Small | 14px | 400 | Montserrat |
| Caption | 12px | 600 | Montserrat |

### 3️⃣ Créer les Composants de Base

Créez ces composants (**Components**) :

#### Bouton Principal
- Dimensions : Auto-layout
- Padding : 12px horizontal, 24px vertical
- Border radius : 12px
- Fill : Linear Gradient (#E6A930 → #d49414)
- Text : 16px, Weight 700, White
- Shadow : 0 4px 6px rgba(0,0,0,0.1)

#### Bouton Outline
- Padding : 12px horizontal, 24px vertical
- Border radius : 12px
- Stroke : 2px, #006D65
- Text : 16px, Weight 600, #006D65

#### Input Field
- Padding : 14px 16px
- Border radius : 12px
- Stroke : 2px, #DEE2E6
- Text : 16px, Montserrat
- Focus : Stroke #006D65, Shadow 0 0 0 3px rgba(0,109,101,0.1)

#### Card
- Border radius : 12px
- Stroke : 1px, #E9ECEF
- Padding : 24px
- Shadow : 0 1px 3px rgba(0,0,0,0.1)
- Background : White

### 4️⃣ Reconstruire les Pages

Ouvrez chaque fichier HTML dans un navigateur et recréez visuellement :

1. **Prenez des screenshots** de chaque page
2. **Importez les screenshots** dans Figma comme référence
3. **Recréez les layouts** par-dessus en utilisant vos composants
4. **Utilisez Auto Layout** pour les grilles et flexbox
5. **Ajoutez les vrais textes** et contenus

---

## 📐 Spécifications de Design Clés

### Espacements Standards
- 4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px

### Border Radius
- Small : 8px
- Medical (default) : 12px
- Medium : 16px
- Large : 24px
- Full : 9999px (cercles)

### Ombres
- **Small** : 0 1px 2px rgba(0,0,0,0.05)
- **Default** : 0 1px 3px rgba(0,0,0,0.1)
- **Medium** : 0 4px 6px rgba(0,0,0,0.1)
- **Large** : 0 10px 15px rgba(0,0,0,0.1)
- **XL** : 0 20px 25px rgba(0,0,0,0.1)
- **Medical** : 0 4px 12px rgba(0,109,101,0.15)

### Grilles Responsive
- **Mobile** : 1 colonne
- **Tablet (768px)** : 2 colonnes
- **Desktop (1024px)** : 3-4 colonnes
- **Max Width** : 1280px - 1400px

---

## 🎨 Conseils pour une Maquette Professionnelle

### ✅ Bonnes Pratiques

1. **Utilisez Auto Layout** partout où c'est possible
2. **Créez des composants** pour tous les éléments réutilisables
3. **Nommez vos layers** de façon cohérente :
   - `Button/Primary`
   - `Card/Appointment`
   - `Input/Text Field`
4. **Organisez en pages** logiques
5. **Ajoutez des variantes** pour les états (hover, disabled, active)
6. **Documentez vos décisions** de design dans les descriptions

### 🎯 Éléments à Créer en Composants

- [ ] Boutons (Primary, Outline, Sizes)
- [ ] Inputs (Text, Email, Password, Select, Textarea)
- [ ] Cards (Standard, Appointment, Stat, Prescription)
- [ ] Badges (Success, Warning, Error, Info)
- [ ] Alerts (Success, Error, Warning, Info)
- [ ] Avatar (Small, Medium, Large)
- [ ] Navigation Tab
- [ ] Header complet
- [ ] Footer complet

### 📱 Créer des Versions Responsive

Pour chaque page, créez 3 frames :
1. **Mobile** (375px ou 390px width)
2. **Tablet** (768px width)
3. **Desktop** (1440px width)

---

## 🔧 Dépannage

### Problème : Le plugin ne reconnaît pas le HTML

**Solution :**
1. Ouvrez le fichier HTML dans Chrome/Firefox
2. Faites un clic droit → **"Inspecter"**
3. Prenez des screenshots de chaque section
4. Importez les screenshots dans Figma comme référence
5. Recréez manuellement

### Problème : Les couleurs ne correspondent pas

**Solution :**
1. Utilisez exactement les codes HEX du fichier `design-tokens.json`
2. Vérifiez le profil de couleur Figma (RGB)
3. Créez des Color Styles pour garantir la cohérence

### Problème : Les fonts ne s'affichent pas

**Solution :**
1. Téléchargez **Montserrat** depuis Google Fonts
2. Installez tous les poids (300-900)
3. Redémarrez Figma
4. Appliquez la font à vos textes

### Problème : Les espacements sont incorrects

**Solution :**
1. Référez-vous au fichier `05-components-library.html`
2. Utilisez l'échelle d'espacement : 4, 8, 12, 16, 24, 32, 48
3. Activez la grille dans Figma (8px ou 4px)

---

## 📚 Ressources Utiles

### Plugins Figma Recommandés
- **html.to.design** - Import HTML → Figma
- **Figma Tokens** - Import design tokens
- **Anima** - Export Figma → Code
- **Autoflow** - Annotations et flows
- **Stark** - Accessibilité

### Fonts à Installer
- **Montserrat** (Google Fonts) - Tous les poids (300-900)

### Documentation
- Figma Help Center : https://help.figma.com
- html.to.design Docs : Cherchez dans les ressources du plugin
- Design Tokens Format : https://design-tokens.github.io

---

## ✅ Checklist Finale

Avant de considérer votre maquette terminée :

- [ ] Toutes les pages HTML sont importées/recréées
- [ ] Les couleurs correspondent exactement au design system
- [ ] Les typographies utilisent Montserrat avec les bons poids
- [ ] Tous les composants réutilisables sont créés
- [ ] Les espacements respectent l'échelle (4, 8, 12, 16, 24...)
- [ ] Les ombres sont appliquées correctement
- [ ] Les border radius sont cohérents (12px par défaut)
- [ ] Les états interactifs sont définis (hover, active, disabled)
- [ ] La version responsive est créée (mobile, tablet, desktop)
- [ ] Les layers sont bien organisés et nommés
- [ ] Les Color Styles et Text Styles sont créés
- [ ] La bibliothèque de composants est documentée

---

## 🎉 Résultat Attendu

Après avoir suivi ce guide, vous aurez :

✅ **5 pages Figma complètes** :
- Homepage marketing
- Login avec testimonial
- Register multi-étapes
- Patient Dashboard interactif
- Bibliothèque de composants

✅ **Un Design System complet** :
- Palette de couleurs
- Styles de typographie
- Composants réutilisables
- Tokens de design

✅ **Des maquettes pixel-perfect** prêtes pour :
- Présentation client
- Handoff développement
- Prototypage interactif
- Tests utilisateurs

---

## 💡 Prochaines Étapes

Une fois les maquettes créées :

1. **Créer un prototype interactif** dans Figma
2. **Ajouter des animations** et transitions
3. **Tester l'UX** avec des utilisateurs
4. **Exporter les assets** pour le développement
5. **Documenter les specs** de design

---

## 🆘 Besoin d'Aide ?

Si vous rencontrez des problèmes :

1. Vérifiez que vos fichiers HTML s'ouvrent correctement dans un navigateur
2. Testez avec différents plugins d'import
3. Consultez la documentation Figma
4. Rejoignez la communauté Figma sur Discord/Slack

---

**Bon courage avec vos maquettes OSIRIX ! 🎨🚀**

*Généré avec Claude Code - Janvier 2025*
