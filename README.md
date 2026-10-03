# Angular POS Showcase

Application de caisse enregistreuse développée avec Angular 22 dans le cadre de ma formation Concepteur Développeur d'Applications chez Diginamic.

Le projet a été réalisé à partir d'un énoncé fonctionnel fourni pendant la formation.  
Le backend Java / Spring était également fourni. Mon travail porte sur le frontend Angular 22 ainsi que sur son intégration avec l'API.

## Fonctionnalités

- Authentification utilisateur
- Navigation protégée par guards
- Interceptor HTTP
- Affichage du catalogue
- Gestion des stocks
- Gestion d'une note avec quantités et suppression
- Création de formules
- Paiement d'une commande
- Affichage de la dernière commande payée
- Affichage des totaux journaliers
- Réinitialisation de l'application
- Gestion des erreurs côté frontend

## Stack

### Frontend

- Angular 22
- TypeScript
- HTML5
- CSS3
- Signals
- Reactive Forms
- HttpClient
- Vitest

### Backend fourni

- Java
- Spring Boot
- Maven

## Tests

Des tests unitaires ont été ajoutés sur la gestion de la note et plusieurs règles métier du frontend, notamment :

- ajout et suppression de produits ;
- gestion des quantités ;
- respect des stocks disponibles ;
- ajout et suppression de formules ;
- validation de la composition d'une formule ;
- conversion de la note en commande.

Résultat actuel :

```text
13 tests passed
```

## Installation et lancement

### Backend

À la racine du projet :

```bash
./mvnw spring-boot:run
```

Sous Windows :

```powershell
.\mvnw.cmd spring-boot:run
```

### Frontend

Dans un second terminal :

```bash
cd front
npm install
npm start
```

L'application est ensuite accessible à l'adresse :

```text
http://localhost:4200
```

## Vérifications

Lancer les tests :

```bash
cd front
npm test -- --watch=false
```

Vérifier le build :

```bash
npm run build
```

## Contexte

Ce dépôt est une version publique destinée à présenter le travail réalisé sur la partie frontend Angular du projet.

Le sujet fonctionnel ainsi que le backend Java / Spring ont été fournis dans le cadre de la formation.
