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

État actuel : première version locale jouable, version 0.1.

- Lancement local : ouvrir `index.html` dans un navigateur (double-clic sur le fichier). Aucune installation ni compilation n’est nécessaire pour jouer.
- Dépôt GitHub : [Maissa004/code-secret](https://github.com/Maissa004/code-secret).
- Application publiée : à compléter.

L’interface affiche les règles, les essais et les indices. Les noms accompagnent les couleurs. Les sélecteurs natifs sont prévus pour le clavier et le tactile ; leur utilisation réelle reste à vérifier dans les navigateurs ciblés.

### Organisation des fichiers

- `index.html` : structure et textes de la page.
- `style.css` : apparence et adaptation à la largeur de l’écran.
- `engine.js` : règles, validation, calcul des indices et état de la partie.
- `script.js` : sélection des couleurs, affichage et API de test.
- `tests/engine.test.cjs` : tests automatisés du moteur.

Avec Node.js disponible, lancer les tests depuis le dossier du projet :

```sh
node --test tests/engine.test.cjs
```

## API commune de test

L’API est implémentée pour le contrat 0.2. Son intégration dans un véritable navigateur et sa conformité sur la version publiée restent à vérifier.

L’ouverture de l’application avec `?test=1` expose `window.codeSecretTest`, avec les fonctions suivantes :

- `getConfig()` : lire la configuration.
- `startGame(options?)` : démarrer ou recommencer une partie, avec un code aléatoire ou imposé pour les tests.
- `submitGuess(guess)` : envoyer une proposition.
- `getState()` : lire l’état de la partie.

L’API et l’interface utilisent le même moteur et la même partie. Sans `?test=1`, l’objet de test n’est pas exposé et une partie aléatoire démarre automatiquement. Avec ce paramètre, le jeu attend un démarrage (`not-started`). Le bouton « Nouvelle partie » permet aussi de démarrer.

Pour l’accès local, ajouter `?test=1` après `index.html` dans l’adresse du navigateur. Le code imposé par `startGame({ secret: [...] })` n’est jamais affiché séparément ni inclus dans l’état retourné.

Le détail des formats, des états et des erreurs est défini dans le contrat 0.2.

### Essayer l’API dans le navigateur

1. Ouvrir le jeu, ajouter `?test=1` après `index.html` dans la barre d’adresse, puis appuyer sur Entrée : l’adresse se termine par `index.html?test=1`.
2. Ouvrir les outils de développement avec F12, puis l’onglet **Console**.
3. Exécuter les commandes suivantes une par une, en attendant le résultat de chacune :

```javascript
// Vérifier l’accès à l’API : résultat attendu "0.2".
window.codeSecretTest.version;

// Démarrer une partie avec un code connu pour rendre le test reproductible.
await window.codeSecretTest.startGame({
  secret: ["rouge", "rouge", "bleu", "vert"]
});

// Envoyer une proposition et observer la mise à jour de l’écran.
await window.codeSecretTest.submitGuess(
  ["rouge", "bleu", "rouge", "rouge"]
);

// Relire l’état sans le modifier.
window.codeSecretTest.getState();
```

Résultat attendu : `status` vaut `"playing"`, `attempts` vaut `1`, l’historique contient une proposition et `lastResult` vaut `{ wellPlaced: 1, misplaced: 2 }`. `lastError` vaut `null`. L’écran doit afficher le même essai et les mêmes indices : **1 bien placée et 2 mal placées**.

Le paramètre `?test=1` active l’accès à l’API ; il ne lance aucun test automatiquement. Recharger la page sans ce paramètre pour revenir au mode normal. Si l’adresse contient déjà des paramètres, ajouter `&test=1` au lieu d’un second `?`.

Ce scénario est une procédure à exécuter : sa présence dans le README ne constitue pas une preuve de réussite. Noter ensuite le résultat réellement observé, la version et le navigateur utilisés dans les vérifications.

## Choix du projet

### Décisions établies

- Développer d’abord en local, puis publier sur GitHub Pages.
- Avancer par petites modifications pour pouvoir comprendre et vérifier chaque étape.
- Utiliser le même moteur pour l’interface et l’API afin de garantir des règles et des résultats cohérents.
- Conserver une documentation courte et actualisée.
- Utiliser HTML, CSS et JavaScript sans framework : aucune compilation n’est nécessaire et les fichiers restent faciles à lire.
- Séparer le moteur de l’affichage pour vérifier les règles indépendamment et partager une seule partie avec l’API.
- Choisir quatre listes de couleurs avec des noms visibles, plutôt que des commandes reposant uniquement sur la couleur.
- Adopter une première apparence crème et vert, avec une disposition sur une colonne sur petit écran.

### Choix encore ouverts

- Ajustements de l’interface après les premiers essais de l’étudiant.
- Validation du confort des sélecteurs sur smartphone.

Les décisions prises avec Codex seront expliquées ici au fur et à mesure.

## Vérifications

Version testée : 0.1 (première version du code). Le 14 novembre 2026, les 14 tests automatisés de `tests/engine.test.cjs` ont réussi avec Node.js. Ils portent sur le moteur ; ils ne prouvent pas le rendu ni les interactions dans un navigateur.

### Premiers tests manuels de l’interface

L’étudiant a confirmé dans la conversation que les trois scénarios ci-dessous fonctionnent sur sa version locale 0.1 (code du commit `988a2ab`). Ces résultats sont rapportés par l’étudiant et n’ont pas été reproduits par Codex dans un navigateur. La date exacte d’exécution, le navigateur et l’appareil ne sont pas renseignés.

| Scénario manuel | Résultat attendu | Résultat observé rapporté | Statut |
| --- | --- | --- | --- |
| Démarrer une partie, sélectionner seulement trois couleurs et valider | Message de refus ; compteur à 0 et historique vide | Comportement conforme confirmé par l’étudiant | Réussi, manuel |
| Ajouter la quatrième couleur et valider | Compteur à 1 ; une ligne avec les quatre couleurs et les deux nombres d’indices | Comportement conforme confirmé par l’étudiant | Réussi, manuel |
| Cliquer sur « Nouvelle partie » après un essai | Compteur à 0 ; historique et sélection effacés | Comportement conforme confirmé par l’étudiant | Réussi, manuel |

Ces essais vérifient les premiers comportements de l’interface. Ils ne valident pas l’exactitude des indices par rapport à un code connu, la conformité de l’API ni l’utilisation sur smartphone. Les tests détaillés de l’API restent **à vérifier**.

### Tests du moteur et vérifications restantes

| Comportement à vérifier | Résultat attendu | Résultat observé | Statut |
| --- | --- | --- | --- |
| Soumettre trois couleurs au moteur pendant une partie | `invalid-length` ; compteur et historique inchangés | Résultat conforme | Réussi, automatisé |
| Secret rouge, rouge, bleu, vert ; proposition rouge, bleu, rouge, rouge | 1 bien placée et 2 mal placées ; un essai consommé | Résultat conforme | Réussi, automatisé |
| Les neuf exemples T01 à T09 du contrat | Indices attendus, un essai et une entrée d’historique par cas | Neuf cas conformes | Réussi, automatisé |
| Trouver le code au dixième essai, après un refus au neuvième | Victoire avec dix essais et dix entrées dans l’historique | Résultat conforme | Réussi, automatisé |
| Envoyer dix propositions valides incorrectes | Défaite au dixième essai | Résultat conforme | Réussi, automatisé |
| Envoyer une proposition après la fin | Seul `lastError` change ; données de jeu inchangées | Résultat conforme | Réussi, automatisé |
| Démarrer une nouvelle partie après victoire ou défaite | Compteur à zéro, historique vide et champs `last…` à null | Résultat conforme | Réussi, automatisé |
| Démarrage invalide et entrées incorrectes | Erreurs normalisées dans l’ordre prévu ; démarrage invalide sans mutation | Résultat conforme | Réussi, automatisé |
| Modifier les tableaux fournis et les objets retournés | Aucun changement indirect de l’état interne | Résultat conforme | Réussi, automatisé |
| Comparer l’API avec l’écran, avec et sans `?test=1` | État cohérent et exposition conditionnelle de l’API | Non vérifié dans un navigateur | Prévu |
| Jouer au clavier et sur smartphone | Sélection, validation et historique utilisables | Non vérifié | Prévu, manuel |

Pour chaque vérification exécutée, noter :

- la version ou le commit testé ;
- le scénario et le résultat attendu ;
- le résultat réellement observé ;
- le type de test : manuel ou automatisé ;
- les limites, notamment le navigateur ou l’appareil utilisé.

Pour une correction, conserver la preuve du défaut avant modification et le résultat du même essai après correction.

## Limites actuelles

- Trois premiers tests manuels de l’interface ont été confirmés réussis par l’étudiant ; ils ne constituent pas une vérification complète. Le navigateur et l’appareil utilisés restent à renseigner. Codex n’a pas reproduit ces essais : son outil de navigateur a refusé l’ouverture de l’URL locale `file:`.
- Le dépôt GitHub est créé et relié au dossier local. La documentation initiale est enregistrée dans le commit `2f6631e` et envoyée sur la branche `main`.
- La publication de l’application n’est pas encore configurée.
- La conformité complète de l’API dans un navigateur et sur GitHub Pages reste à vérifier.
- Les essais sur smartphone, au clavier et au tactile restent à effectuer.
- Aucune correction fonctionnelle avec preuve avant/après n’a encore été documentée ; ne pas en inventer pour le rendu.

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
