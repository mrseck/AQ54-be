<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

# AQ54 project Backend

Cette documentation fourni les étapes à suivre pour deployer le projet complet ou le backend uniquement dans un environnement local.

Il est déjà deployé et vous pouvez y accéder à son interface via l'url suivante: (http://srv507834.hstgr.cloud:8080/)

## deploiement complet du projet avec docker compose

renommer le fichier compose.example.yml en compose.yml et lancer la commande

NB: la base de donnée existe déja dans le fichier compose donc il s'uffit juste de créer le fichier d'environnement et rajouter les variables et les valeurs dans la partie prérequis un peu plus bas et d'executer la commande ci-dessous.

```js
docker compose up -d
```

## deploiement du backend uniquement

## prérequis

deployer une base de donnée postgres dans un conteneur docker

```js
services:
  database-name:
    image: postgres:16-alpine
    container_name: database-name
    ports:
      - 5432:5432
    volumes:
      - ./data:/var/lib/postgresql/data
    environment:
      - POSTGRES_PASSWORD=password
      - POSTGRES_USER=username
      - POSTGRES_DB=database
```

À la racine du projet creons un fichier .env et rajoutons les variables ci-dessous avec leurs valeurs

```js
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=database
DB_USERNAME=username
DB_PASSWORD=password
DB_URL=postgresql://username:password@localhost:5432/database

# Token
JWT_SECRET=AZERTYUIOPQSDFGHJKLMWXCVBNAZERTYUIOPQSDFGHJKLM

# Admin Credentials
ADMIN_EMAIL='admin@example.com'
ADMIN_PASSWORD='votremotdepasse'
ADMIN_USERNAME='Admin'

NB: le compte admin sera crée automatiquement au démarrage du projet et les accès ci-dessus pourront être utilisé comme credential pour se connecter

# Allow Origins
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

## II - Deployer dans un environnement local

## etape 1 : cloner le repo

```js
git clone https://github.com/mrseck/AQ54-be.git
```

## etape 2 : installer les dependances du projet

aller dans le repertoire du projet

```js
cd AQ54-be
```

puis lancer

```js
npm i ou npm install
```

## etape 3 : lancer le projet

```js
npm run start:dev
ou
npm run start
```

la documentation swagger est disponible sur

```js
http://localhost:3000/api/docs
```

puis lancer dans un navigateur l'url du frontend

```js
http://localhost:5173
```

## III - Deployer avec docker

## etape 1 : cloner le repo

```js
git clone https://github.com/mrseck/AQ54-be.git
```

## etape 2 : build l'image puis l'executer

aller dans le repertoire du projet

```js
cd AQ54-be
```

puis construire l'image

```js
docker build -t aq54-be .
```

enfin executer l'image

```js
docker run -p 3000:3000 aq54-fe
```

la documentation swagger est disponible sur

```js
http://localhost:3000/api/docs
```

puis lancer dans un navigateur l'url

```js
http://localhost:8080
```
