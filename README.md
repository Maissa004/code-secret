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
- Après cette défaite uniquement, le code secret est révélé avec les couleurs et leurs noms. Une nouvelle partie masque la solution précédente.
- Après la fin, aucune proposition ne modifie la partie.
- Une nouvelle partie choisit un code au hasard et remet à zéro les essais, l’historique et les indices. Le même code peut être tiré à nouveau par hasard.

## Utilisation et accès

État actuel : version 0.3 publiée sur GitHub Pages le 25 novembre 2026, avec palette commune cliquable et nouveau design lilas/violet. Le code du design est enregistré dans le commit `9216766`. La version 0.2 publiée pour `jalon-1` reste identifiable dans Git. La version de l’application est distincte de la version du contrat API (0.2).

- Lancement local : ouvrir `index.html` dans un navigateur (double-clic sur le fichier). Aucune installation ni compilation n’est nécessaire pour jouer.
- Dépôt GitHub : [Maissa004/code-secret](https://github.com/Maissa004/code-secret).
- Application GitHub Pages : [jouer à Code secret](https://maissa004.github.io/code-secret/).
- Mode API : [ouvrir le jeu avec `?test=1`](https://maissa004.github.io/code-secret/?test=1), puis utiliser la console comme indiqué dans « Essayer l’API dans le navigateur ».

GitHub Pages publie la racine de la branche `main`. Les prochains envois sur cette branche déclencheront la mise à jour du site. Le tag `jalon-1` identifie la version de remise de J1 ; il n’est pas déplacé lors des modifications suivantes.

L’interface affiche les règles, les essais et les indices. Les noms accompagnent les couleurs. Pour jouer :

1. Cliquer sur les couleurs de la palette commune : elles remplissent les positions vides de gauche à droite.
2. Pour corriger une position, cliquer sur cette position puis sur une couleur. La position active est entourée et indiquée par un texte.
3. Cliquer sur « Valider la proposition ». « Effacer » vide les quatre positions sans consommer d’essai.

Les boutons natifs s’utilisent aussi avec Tab, puis Entrée ou Espace. Sur ordinateur, l’historique est à droite du jeu et les règles en dessous. Sur petit écran, l’ordre est jeu, historique, règles. Le rendu et le confort sur appareils réels restent à vérifier pour cette version.

### Organisation des fichiers

- `index.html` : structure et textes de la page.
- `style.css` : apparence et adaptation à la largeur de l’écran.
- `engine.js` : règles, validation, calcul des indices et état de la partie.
- `script.js` : sélection des couleurs, affichage et API de test.
- `planet.svg` : petit logo de planète bleue avec anneau, utilisé aussi comme icône d’onglet.
- `tests/engine.test.cjs` : tests automatisés du moteur.
- `tests/interface.test.cjs` : tests de l’interface et de son lien avec l’API en DOM simulé (sans rendu de navigateur).

Avec Node.js disponible, lancer les tests depuis le dossier du projet :

```sh
node --test tests/engine.test.cjs tests/interface.test.cjs
```

## API commune de test

L’API est implémentée pour le contrat 0.2. Des premiers scénarios manuels sur la version publiée 0.3 sont rapportés comme fonctionnels par l’étudiant (voir « Retour manuel sur l’API »). Sa conformité complète reste à vérifier.

L’ouverture de l’application avec `?test=1` expose `window.codeSecretTest`, avec les fonctions suivantes :

- `getConfig()` : lire la configuration.
- `startGame(options?)` : démarrer ou recommencer une partie, avec un code aléatoire ou imposé pour les tests.
- `submitGuess(guess)` : envoyer une proposition.
- `getState()` : lire l’état de la partie.

L’API et l’interface utilisent le même moteur et la même partie. Sans `?test=1`, l’objet de test n’est pas exposé et une partie aléatoire démarre automatiquement. Avec ce paramètre, le jeu attend un démarrage (`not-started`). Le bouton « Nouvelle partie » permet aussi de démarrer.

Pour l’accès local, ajouter `?test=1` après `index.html` dans l’adresse du navigateur. Le code imposé par `startGame({ secret: [...] })` reste caché pendant la partie et n’est jamais inclus dans l’état retourné. Il apparaît dans l’interface uniquement après une défaite, conformément à l’évolution autorisée par le professeur et rapportée par l’étudiant le 18 novembre 2026.

Cette autorisation fait évoluer le comportement visuel par rapport au contrat écrit initial qui excluait la révélation indépendante du code. Les quatre méthodes et le format des états de l’API restent inchangés : aucun champ `secret` ou `solution`, ni méthode de révélation, n’est ajouté à `window.codeSecretTest`. La compatibilité avec l’outil de test du professeur reste à vérifier ; ne pas annoncer une conformité complète sur la seule base des tests locaux.

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
- À partir de la version 0.3, remplacer les quatre listes par une palette commune de six boutons colorés avec leurs noms : moins de répétitions visuelles et une sélection directe. La position à modifier reste explicite et accessible au clavier.
- Appliquer la première maquette choisie par l’étudiant : fond lilas pastel, textes et boutons violets, cartes blanches et planète bleue. Conserver exactement les six couleurs du jeu. Les maquettes rose et violet lavande n’ont pas été retenues.
- Placer l’historique à côté du jeu et les règles en bas, avec une seule colonne sur petit écran.
- Afficher automatiquement la solution uniquement après une défaite au dixième essai, selon l’accord du professeur rapporté par l’étudiant le 18 novembre 2026. Les indices, les dix essais et la priorité à la victoire restent inchangés.

### Choix encore ouverts

- Ajustements de l’interface après les premiers essais de l’étudiant.
- Validation du confort de la palette sur smartphone.
- Ajouter la PWA dans une étape distincte, conformément à la nouvelle consigne rapportée par l’étudiant ; périmètre exact de l’installation et du hors-ligne à préciser.

Les décisions prises avec Codex seront expliquées ici au fur et à mesure.

## Vérifications

### Retour manuel sur l’API — version publiée 0.3 (25 novembre 2026)

L’étudiant rapporte que les scénarios API proposés dans la conversation semblent fonctionner avec le nouveau design. Version visée : application 0.3 publiée depuis `main` (code du design `9216766`, dernière publication documentée `7140176`, qui ne change que la documentation). URL utilisée pour les essais proposés : [mode test API](https://maissa004.github.io/code-secret/?test=1).

Type : **tests manuels rapportés par l’étudiant**, sans nouvelle exécution par Codex. Le navigateur, sa version, l’appareil et les valeurs détaillées retournées par la console ne sont pas renseignés. La confirmation est globale, pas un relevé individuel de chaque commande.

| Scénario proposé | Résultat attendu | Résultat observé rapporté | Statut |
| --- | --- | --- | --- |
| `startGame` avec le secret rouge, rouge, bleu, vert | Partie en cours, 0 essai et historique vide | Retour global de fonctionnement ; état exact non fourni | Fonctionnel selon l’étudiant, détail non relevé |
| `submitGuess` avec rouge, bleu, rouge, rouge | 1 essai ; 1 bien placée et 2 mal placées | Retour global de fonctionnement ; valeurs exactes non fournies | Fonctionnel selon l’étudiant, détail non relevé |
| `submitGuess` avec seulement rouge, bleu, vert | Refus `invalid-length` ; compteur à 1 et historique inchangé | Retour global de fonctionnement ; erreur et compteur non relevés individuellement | Fonctionnel selon l’étudiant, détail non relevé |
| `submitGuess` avec rouge, rouge, bleu, vert après les étapes précédentes | Victoire en 2 essais ; 4 bien placées et 0 mal placée | Retour global de fonctionnement ; état exact non fourni | Fonctionnel selon l’étudiant, détail non relevé |
| Lire `getState()` | État consultable sans jouer de coup ; après cette séquence, `status` à `won` et `attempts` à 2 | Utilité de la commande expliquée ; résultat de lecture non communiqué séparément | Exécution individuelle non confirmée |

Portée : ce retour complète les 21 tests automatisés existants et apporte une première confirmation manuelle de fonctionnement. Il ne constitue pas une preuve de conformité de toute l’API. Restent notamment à documenter : les résultats détaillés, les erreurs et priorités restantes, l’absence de l’API sans `?test=1`, ainsi que les essais clavier et smartphone. La PWA sera traitée dans une étape suivante ; aucun fichier du jeu n’est changé à l’occasion de cette mise à jour documentaire.

### Version 0.3 — design et palette commune (25 novembre 2026)

Changement d’interface demandé après validation d’une maquette. Le moteur `engine.js`, le calcul des indices, la limite de dix essais et les méthodes de l’API ne sont pas modifiés. Le tag `jalon-1` est conservé.

- Avant modification : **19 tests réussis, 0 échec**, sur le code `dc12ee8`.
- Après modification : **21 tests réussis, 0 échec**, avec Node.js. Les 16 tests du moteur sont conservés sans changement. Le test de saisie de l’interface utilise désormais les pastilles au lieu des listes. Deux nouveaux tests portent sur la sélection commune et la correction d’une position.

| Vérification automatisée | Résultat attendu | Résultat observé |
| --- | --- | --- |
| Remplir les positions avec la palette, y compris une couleur répétée | Quatre couleurs ordonnées, aucun essai avant validation | Conforme en DOM simulé |
| Cliquer sur une position remplie puis choisir une autre couleur | Seule la position choisie change ; sélection et nom accessibles mis à jour | Conforme en DOM simulé |
| Valider trois couleurs | Refus, saisie conservée, compteur et historique inchangés | Conforme en DOM simulé |
| Valider quatre couleurs | Proposition identique dans l’API et l’historique, un seul essai et sélection remise à zéro | Conforme en DOM simulé |
| Effacer, démarrer ou redémarrer via l’API | Effacement sans essai ; nouveau départ avec sélection vide ; démarrage invalide sans altérer la saisie | Conforme en DOM simulé |
| Indices, répétitions, victoire au dixième, défaite et révélation | Comportements conservés | Tests existants réussis |

Retour de l’étudiant le 25 novembre 2026 : l’apparence locale est approuvée après ouverture du jeu. Ce retour porte sur le design ; il ne confirme pas tous les scénarios fonctionnels. Le navigateur et l’appareil ne sont pas renseignés.

Limite : l’outil de navigateur n’a pas pu démarrer lors de la réalisation du design. Les clics réels, le parcours au clavier et le rendu sur téléphone de la version 0.3 restent **non vérifiés par Codex dans un navigateur**. Les tests en DOM simulé ne les remplacent pas. La publication est demandée séparément par l’étudiant ; son suivi figure ci-dessous.

### Publication de la version 0.3 (25 novembre 2026)

- Publication demandée par l’étudiant après validation de l’apparence locale.
- Documentation actualisée : accès au mode API, choix du design et consignes durables dans `AGENTS.md`.
- Avant publication, les **21 tests automatisés ont été relancés avec succès (0 échec)** sur le code `9216766`, avec Node.js.
- Le [déploiement du commit `ff0d895`](https://github.com/Maissa004/code-secret/actions/runs/45681673787) s’est terminé avec succès. Les cinq fichiers publics (`index.html`, `style.css`, `script.js`, `engine.js`, `planet.svg`) répondent en HTTP 200 et leur contenu correspond aux fichiers locaux, après normalisation des fins de ligne Windows et du marqueur UTF-8. La page publiée affiche `VERSION 0.3`.
- L’URL `https://maissa004.github.io/code-secret/?test=1` répond en HTTP 200. Ce contrôle HTTP ne vérifie pas l’exécution de l’API ni les interactions dans un navigateur. Les limites de validation manuelle décrites ci-dessus restent applicables.
- Le tag `jalon-1` reste sur la version de remise et n’est pas déplacé.

Essais manuels de la palette restant à documenter : ouvrir `index.html`, choisir trois pastilles puis valider (refus sans essai), ajouter la quatrième (un essai), corriger une position avant une autre validation, puis utiliser « Nouvelle partie ». Refaire la sélection avec Tab et Entrée/Espace, et vérifier la disposition sur téléphone. Le scénario API à code imposé a fait l’objet du retour global de l’étudiant consigné ci-dessus ; les résultats détaillés restent à relever.

### Version 0.2 — révélation après défaite (18 novembre 2026)

Objectif : permettre de comprendre la solution après une défaite, tout en conservant les comportements déjà fonctionnels.

- Avant modification fonctionnelle : les 14 tests d’origine passent sur le code de la version 0.1 (dernier commit de documentation : `c624846`). Les deux nouveaux tests du moteur échouent ensuite, car la fonction de révélation n’existe pas encore.
- Après modification : les 14 tests d’origine sont conservés sans changement et passent toujours. Deux nouveaux tests du moteur et trois tests de l’interface en DOM simulé passent également, soit **19 tests réussis, 0 échec**, avec Node.js.
- Il s’agit d’une évolution autorisée, pas d’une correction d’un défaut préexistant. Cette comparaison avant/après ne doit pas être présentée comme une correction pour le rendu.

| Vérification automatisée | Résultat attendu | Résultat observé |
| --- | --- | --- |
| Avant le démarrage et jusqu’au neuvième essai, y compris après un refus | Solution indisponible pour l’affichage ; quatre « ? » dans le DOM simulé | Conforme |
| Dix propositions valides incorrectes | État `lost`, dix essais et dix entrées d’historique ; code exact dans l’ordre avec ses noms dans le DOM simulé | Conforme |
| Nouvelle proposition après défaite | Refus `game-finished` ; historique et code révélé inchangés | Conforme pour le moteur |
| Modifier la copie du code révélé | Aucune modification du code interne | Conforme |
| Victoire au dixième essai | État `won`, message de victoire et aucune révélation de défaite | Conforme |
| Nouvelle partie après défaite | Solution précédente masquée ; historique vide et compteur à zéro | Conforme |
| API et interface normale | Pas de champ `secret`/`solution` dans l’état, pas de méthode de révélation dans l’API ; validation et remise à zéro préservées | Conforme dans les cas automatisés |

Limites : ces tests contrôlent le moteur et le contenu d’un DOM simulé, pas le rendu visuel, l’accessibilité réelle ou le tactile. Le contrôle complet de la révélation dans un navigateur reste **à vérifier** ; le retour de l’étudiant et les contrôles de publication ci-dessous ont une portée limitée. Les essais manuels de la version 0.1 ci-dessous ne valent pas comme validation manuelle de cette évolution.

Pour vérifier rapidement la nouvelle fonction dans le navigateur, ouvrir `index.html?test=1` puis exécuter dans la console :

```javascript
await window.codeSecretTest.startGame({
  secret: ["rouge", "rouge", "bleu", "vert"]
});
for (let i = 0; i < 10; i++) {
  await window.codeSecretTest.submitGuess(["jaune", "jaune", "jaune", "jaune"]);
}
```

Attendu : après le dixième essai, les quatre couleurs **rouge, rouge, bleu, vert** apparaissent en haut, avec leurs noms. Le compteur indique 10/10, les dix lignes d’historique restent visibles et la saisie est désactivée. Cliquer ensuite sur « Nouvelle partie » : les quatre « ? » réapparaissent, le compteur revient à zéro et l’historique se vide.

Retour manuel du 18 novembre 2026 : l’étudiant confirme que la nouvelle fonctionnalité fonctionne sur sa version locale (code du commit `8812b41`). Le scénario exact, le navigateur et l’appareil ne sont pas renseignés ; cette confirmation ne valide pas à elle seule chaque étape du scénario reproductible ci-dessus.

### Publication GitHub Pages — préparation de J1

Le 18 novembre 2026, le déploiement GitHub Pages du code `8812b41` s’est terminé avec succès. Contrôles effectués par Codex dans le navigateur intégré de l’application, sur l’URL publique :

| Vérification | Attendu | Observé | Statut |
| --- | --- | --- | --- |
| Ouvrir le site publié | Page version 0.2, mise en forme et commandes présentes | Page chargée, code caché et compteur à 0/10 ; rendu inspecté | Réussi, navigateur |
| Choisir rouge, bleu, vert puis valider | Message de refus ; compteur à 0 et historique vide | Message « Choisissez exactement quatre couleurs avant de valider. », 0/10, historique vide | Réussi, navigateur |
| Ajouter jaune puis valider | Un essai et une entrée d’historique avec les quatre couleurs et les indices | 1/10, ligne rouge/bleu/vert/jaune, indices affichés 0 bien placée et 2 mal placées | Réussi, navigateur |
| Cliquer sur « Nouvelle partie » | Compteur à 0, historique vide et sélection effacée | Remise à zéro conforme | Réussi, navigateur |

Le code de cette partie était aléatoire : les indices ont été observés, mais leur exactitude n’a pas été validée avec un secret imposé. Ces essais ne couvrent ni la conformité complète de l’API, ni la révélation après dix essais, ni un smartphone réel. La version du logiciel de navigation n’a pas été relevée. Le tag `jalon-1` conserve ce même code avec la documentation de remise actualisée.

### Historique des vérifications de la version 0.1

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

- Les premiers essais locaux sont rapportés par l’étudiant, sans indication du navigateur et de l’appareil. Codex a ensuite vérifié les trois comportements de base sur la version publiée, comme détaillé ci-dessus. Cela ne constitue pas une vérification complète.
- Le dépôt GitHub est créé et relié au dossier local. La documentation initiale est enregistrée dans le commit `2f6631e` et envoyée sur la branche `main`.
- GitHub Pages est configuré sur `main` à la racine du dépôt.
- La conformité complète de l’API dans un navigateur et sur GitHub Pages reste à vérifier.
- Les essais sur smartphone, au clavier et au tactile restent à effectuer.
- Aucune correction fonctionnelle avec preuve avant/après n’a encore été documentée ; ne pas en inventer pour le rendu.

## Jalons

### J1 — 20 novembre 2026

Version préparée le 18 novembre 2026 : application 0.2, repérée par le tag Git `jalon-1`. Les liens du dépôt et de l’application figurent dans « Utilisation et accès ». Les 19 tests automatisés ont été relancés et passent (0 échec) avant publication. Les limites restantes sont conservées ci-dessus, notamment l’absence de correction d’un défaut réel documentée avant/après. La création du tag ne certifie pas à elle seule que toutes les exigences pédagogiques sont remplies. La remise sur Cyberlearn reste à effectuer par l’étudiant.

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

Les extensions restent facultatives. La PWA, facultative dans l’énoncé initial, devient une exigence selon la nouvelle consigne rapportée par l’étudiant le 25 novembre 2026. Elle n’est pas encore implémentée ; le périmètre exact de l’installation et du fonctionnement hors ligne reste à préciser avant cette étape.

Ne publier dans GitHub aucune conversation, donnée personnelle, clé d’accès ou vidéo de présentation.
