# Pernet Paysages - Site vitrine Vite (FR/EN)

## Installation
- `npm install`
- `npm run dev`
- `npm run build`
- `npm run preview`

## Structure
- Pages FR: `/fr/`, `/fr/prestations/`, `/fr/realisations/`, `/fr/a-propos/`, `/fr/contact/`, `/fr/confidentialite/`
- Pages EN: `/en/`, `/en/services/`, `/en/projects/`, `/en/about/`, `/en/contact/`, `/en/privacy/`

## Media
Placez les images dans `public/media/` (accessibles via `/media/...`).
- Logo principal: `public/media/logo-pernet-paysages.png`
- Symbole/logo simplifie: `public/media/logo-symbol.svg`
- Favicon: `public/media/favicon.svg`
- Hero: `public/media/hero.jpg`
- About: `public/media/about.jpg`
- Realisations: `public/media/realisations/projet-XX/`

Note: le logo PNG 3170x3170 doit etre vectorise ensuite en SVG propre pour un rendu optimal.

## Formulaire Web3Forms
Le formulaire est sur:
- `fr/contact/index.html`
- `en/contact/index.html`

Remplacez:
- `WEB3FORMS_ACCESS_KEY`

## Google Analytics (optionnel)
Dans `src/scripts/main.js`:
- `const GA_MEASUREMENT_ID = "G-XXXXXXXXXX"`

Si la valeur reste `G-XXXXXXXXXX`, GA n'est pas charge.

## Textes FR/EN
- Donnees projets: `src/data/content.js`
- Pages statiques: fichiers `fr/...` et `en/...`

## Ajouter une realisation
1. Ajouter les images dans `public/media/realisations/projet-0X/`
2. Ajouter/modifier l'entree dans `src/data/content.js`
3. La page `/fr/realisations/` et `/en/projects/` se met a jour automatiquement

## GitHub Pages
- Workflow: `.github/workflows/deploy.yml`
- Config Vite: `vite.config.js`

`vite.config.js` utilise `BASE_PATH`:
- Domaine personnalise: `BASE_PATH=/`
- GitHub Pages projet: `BASE_PATH=/NOM_DU_REPO/`

Exemple build local avec base projet:
- PowerShell: `$env:BASE_PATH='/NOM_DU_REPO/'; npm run build`
