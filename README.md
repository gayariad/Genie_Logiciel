# Genie_Logiciel – Cinema BI

Ce projet est une application web de Business Intelligence (BI) dédiée à l'analyse et la gestion des données d'un cinéma. Il s'appuie sur Nuxt, intègre Chart.js pour la visualisation de données, et utilise une base de données MySQL. Des outils d'authentification sécurisée et une API backend sont inclus.

## Table des matières

- [Fonctionnalités](#fonctionnalités)
- [Architecture](#architecture-du-projet)
- [Installation](#installation)
- [Configuration](#configuration)
- [Déploiement](#déploiement)
- [Aperçu](#aperçu)
- [Ressources](#ressources)
- [Licence](#licence)

## Fonctionnalités

- Tableau de bord de statistiques cinéma (fréquentation, recettes, etc.)
- Visualisation interactive via Chart.js, Vue Chart.js
- Authentification utilisateur sécurisée (nuxt-auth-utils, bcryptjs)
- API backend (Node.js)
- Support de Docker pour le développement
- Scripts et schéma SQL (`cinemaBI.sql`)
- Configuration partagée (dossier `shared`)

## Architecture du projet

```
.
├── app/                # Frontend Nuxt
├── server/             # Backend/api Node.js
├── shared/             # Types et modules partagés
├── public/             # Assets statiques
├── cinemaBI.sql        # Schéma de base de données
├── Dockerfile.dev
├── docker-compose.dev.yml
├── nuxt.config.ts
├── package.json
├── Rapport_genie_logiciel.pdf
```

## Installation

1. Cloner le dépôt et installer les dépendances (`npm install`, `yarn`, ou autre).
2. Importer le schéma de base de données depuis `cinemaBI.sql` si besoin.

## Configuration

- Voir `nuxt.config.ts` pour les variables d’environnement base de données :
  - `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
- Optionnel : `TMDB_API_READ_TOKEN` (connexion à TheMovieDB)
- Par défaut, utilisateur : `dev_user`, mot de passe : `dev_pass`

## Déploiement

Le site est accessible à l'adresse suivante :

**http://178.63.252.204/dashboard**

## Aperçu

![Aperçu de l'application](Home.png)

## Ressources

- [Rapport Génie Logiciel (PDF)](Rapport_genie_logiciel.pdf)
- [Schéma SQL](cinemaBI.sql)
- [Documentation Nuxt](https://nuxt.com/docs)
- [Chart.js](https://www.chartjs.org/)

## Licence

