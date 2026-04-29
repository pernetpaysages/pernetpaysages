# Pernet Paysages

Site vitrine statique FR/EN pour Pernet Paysages, généré avec Vite et déployable sur GitHub Pages.

## Stack

- Vite 5
- HTML statique généré depuis `src/data/site.js`
- CSS vanilla dans `src/styles/main.css`
- JavaScript minimal dans `src/scripts/main.js`
- Aucun backend, aucune base de données

## Commandes

```bash
npm install
npm run generate
npm run check
npm run dev
npm run build
npm run preview
```

`npm run build` génère les pages, lance le build Vite, puis vérifie les liens internes, placeholders visibles, sitemap et robots.

## Pages

FR:

- `/fr/`
- `/fr/prestations/`
- `/fr/realisations/`
- `/fr/a-propos/`
- `/fr/contact/`
- `/fr/confidentialite/`
- `/fr/mentions-legales/`

EN:

- `/en/`
- `/en/services/`
- `/en/projects/`
- `/en/about/`
- `/en/contact/`
- `/en/privacy/`
- `/en/legal/`

## Contenu

Les informations importantes sont centralisées dans `src/data/site.js`:

- coordonnées
- routes FR/EN
- SEO par page
- textes principaux
- services
- réalisations
- FAQ
- contenus confidentialité et mentions légales
- valeurs à confirmer, dont l'année du CFC

Après modification de ce fichier, lancer:

```bash
npm run generate
```

## Images

Les originaux restent dans `public/media/`.

Les pages utilisent les dérivés optimisés dans `public/media/optimized/`, générés à partir des vraies images du repo avec auto-orientation, compression et redimensionnement.

Pour générer les variantes responsives AVIF/WebP/JPEG utilisées par `srcset`, ImageMagick doit être disponible localement, puis lancer:

```bash
npm run optimize:images
```

Important: `public/media/about.jpg` contient un filigrane indiquant une image générée par IA. Le site ne l'utilise pas comme réalisation.

## Formulaire

Le formulaire utilise Web3Forms:

- action: `https://api.web3forms.com/submit`
- méthode: `POST`
- clé centralisée dans `src/data/site.js`
- honeypot anti-spam
- validation côté navigateur avec fallback sans JavaScript

Le site ne propose pas WhatsApp tant que l'usage du numéro n'est pas confirmé.

## SEO et GitHub Pages

- Domaine custom: `public/CNAME`
- Sitemap: `public/sitemap.xml`
- Robots: `public/robots.txt`
- Déploiement: `.github/workflows/deploy.yml`
- Vite base par défaut: `/`, adapté au domaine `https://pernet-paysages.ch`

Pour un build de test avec un autre base path:

```powershell
$env:BASE_PATH='/pernetpaysages/'; npm run build
```
