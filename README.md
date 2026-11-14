# Code secret en couleurs

Projet individuel réalisé dans le cadre du cours Atelier techno à la HEG Genève, avec l’aide de Codex.

## Objectif

Créer un jeu web solo inspiré du Mastermind, puis le publier sur GitHub Pages. Le projet doit fonctionner sur ordinateur et smartphone.

Codex accompagne la création du projet. Les choix, les modifications et les résultats sont relus et vérifiés par l’étudiant.

## Sources de référence

- « Projet — Code secret en couleurs, inspiré du Mastermind », édition 2.2.
- Annexe des règles communes : `code-couleurs-1.0`.
- « API commune de test — Code secret en couleurs », contrat 0.2.
- « Atelier 4 du 11 novembre 2026 — Démarrer et vérifier le Code secret ».

L’annexe du projet fait référence pour les règles. Le contrat 0.2 fait référence pour le comportement de l’API.

## Règles du jeu

- Le programme choisit un code secret de quatre couleurs parmi : rouge, bleu, vert, jaune, orange et violet.
- Les répétitions sont autorisées. Le code reste fixe et caché pendant la partie.
- Le joueur dispose de dix essais pour trouver le code.
- Chaque proposition contient quatre couleurs ordonnées, modifiables avant validation.
- Une proposition incomplète ou contenant une couleur interdite est refusée avec une explication. Elle ne consomme aucun essai et ne modifie pas l’historique.
- Chaque proposition valide consomme un essai et reste visible avec ses indices.
- Les indices indiquent le nombre de couleurs bien placées et le nombre de couleurs présentes mais mal placées, sans préciser leurs positions.
- Les couleurs bien placées sont comptées en premier. Chaque occurrence ne compte qu’une fois.
- Quatre couleurs bien placées donnent la victoire, même au dixième essai.
- Après dix essais sans victoire, la partie est perdue.
- Après la fin, aucune proposition ne modifie la partie.
- Une nouvelle partie choisit un code au hasard et remet à zéro les essais, l’historique et les indices. Le même code peut être tiré à nouveau par hasard.

## Utilisation et accès

État actuel : cadrage du projet, application non créée.

- Lancement local : à compléter lorsque la première version sera disponible.
- Dépôt GitHub : [Maissa004/code-secret](https://github.com/Maissa004/code-secret).
- Application publiée : à compléter.

L’interface devra afficher les règles, les essais et les indices. Les couleurs seront aussi identifiables par un nom ou un symbole. Les commandes devront fonctionner au clavier et sur écran tactile.

## API commune de test

L’application devra respecter le contrat 0.2.

L’ouverture de l’application avec `?test=1` exposera `window.codeSecretTest`, avec les fonctions suivantes :

- `getConfig()` : lire la configuration.
- `startGame(options?)` : démarrer ou recommencer une partie, avec un code aléatoire ou imposé pour les tests.
- `submitGuess(guess)` : envoyer une proposition.
- `getState()` : lire l’état de la partie.

L’API et l’interface utiliseront le même moteur et la même partie. Sans `?test=1`, l’objet de test ne sera pas exposé.

Le détail des formats, des états et des erreurs est défini dans le contrat 0.2.

## Choix du projet

### Décisions établies

- Développer d’abord en local, puis publier sur GitHub Pages.
- Avancer par petites modifications pour pouvoir comprendre et vérifier chaque étape.
- Utiliser le même moteur pour l’interface et l’API afin de garantir des règles et des résultats cohérents.
- Conserver une documentation courte et actualisée.

### Choix encore ouverts

- Apparence et disposition de l’interface.
- Manière de sélectionner et de modifier les couleurs.
- Organisation technique des fichiers.

Les décisions prises avec Codex seront expliquées ici au fur et à mesure.

## Vérifications

Aucun test du jeu n’a encore été exécuté.

| Comportement à vérifier | Résultat attendu | Résultat observé | Statut |
| --- | --- | --- | --- |
| Valider seulement trois couleurs pendant une partie | Refus expliqué ; compteur et historique inchangés | Non vérifié | Prévu |
| Secret rouge, rouge, bleu, vert ; proposition rouge, bleu, rouge, rouge | 1 bien placée et 2 mal placées ; un essai consommé | Non vérifié | Prévu |
| Trouver le code au dixième essai | Victoire avec dix essais et dix entrées dans l’historique | Non vérifié | Prévu |
| Envoyer dix propositions valides incorrectes | Défaite au dixième essai | Non vérifié | Prévu |
| Envoyer une proposition après la fin | Aucun changement des données de la partie | Non vérifié | Prévu |
| Démarrer une nouvelle partie | Compteur à zéro, historique et indices effacés | Non vérifié | Prévu |

Pour chaque vérification exécutée, noter :

- la version ou le commit testé ;
- le scénario et le résultat attendu ;
- le résultat réellement observé ;
- le type de test : manuel ou automatisé ;
- les limites, notamment le navigateur ou l’appareil utilisé.

Pour une correction, conserver la preuve du défaut avant modification et le résultat du même essai après correction.

## Limites actuelles

- Le jeu et l’API ne sont pas encore implémentés.
- Le dépôt GitHub est créé et relié au dossier local. La documentation initiale est enregistrée dans le commit `2f6631e` et envoyée sur la branche `main`.
- La publication de l’application n’est pas encore configurée.
- Aucun comportement sur ordinateur ou smartphone n’est encore vérifié.

## Jalons

### J1 — 20 novembre 2026

- Première version publiée et vérifiée, éventuellement incomplète.
- Liens du dépôt et de l’application.
- Version identifiée par le tag `jalon-1`.
- README avec règles, sources, choix, vérifications et questions ouvertes.
- Une décision prise avec Codex et une correction documentée avec preuves avant/après.

### J2 — 18 décembre 2026

- Version finale identifiée par le tag `final`.
- API 0.2 fonctionnelle sur l’application publiée.
- Vérifications des règles, de l’API et du fonctionnement sur smartphone.
- Bref retour après avoir essayé le jeu d’un camarade.
- Documentation actualisée.
- Vidéo individuelle de 4 à 5 minutes, à remettre sur Cyberlearn.

Les heures exactes de remise sont indiquées sur Cyberlearn.

## Périmètre et confidentialité

Le projet ne comporte ni compte utilisateur, paiement, serveur applicatif, classement en ligne, service d’IA intégré ou clé API.

Les extensions, la PWA et le fonctionnement hors ligne sont facultatifs.

Ne publier dans GitHub aucune conversation, donnée personnelle, clé d’accès ou vidéo de présentation.
