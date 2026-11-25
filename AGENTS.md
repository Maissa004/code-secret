# Instructions pour Codex

## Lire le contexte

- Avant toute modification, lire `README.md` et examiner les fichiers existants.
- Consulter les sources nécessaires au changement demandé : énoncé, règles `code-couleurs-1.0` et contrat API 0.2.
- Si une source nécessaire est inaccessible, le signaler.
- Ne pas inventer de règle. Signaler toute ambiguïté ou contradiction.

## Avancer par étapes

- Limiter les modifications à la demande en cours.
- Préférer une organisation simple, compréhensible et compatible avec GitHub Pages.
- Préserver les éléments utiles déjà présents.
- Expliquer brièvement les choix techniques et leurs conséquences.
- Ne pas ajouter de dépendance, d’extension ou de fonctionnalité sans besoin lié à la demande.

## Respecter le jeu et l’API

- Appliquer les règles décrites dans le README et leur source de référence.
- Utiliser le même moteur et le même état de partie pour l’interface et l’API.
- Respecter le contrat API 0.2, notamment les formats, les états, l’ordre des validations et les erreurs.
- Exposer `window.codeSecretTest` uniquement avec le paramètre `test=1`.
- Utiliser des chemins relatifs compatibles avec GitHub Pages.
- Prévoir une interface utilisable au clavier, au tactile et sur petit écran.
- Identifier les couleurs également par un nom ou un symbole.

## Préserver l’interface validée

- Suivre les choix visuels du README : fond lilas pastel, textes violets, cartes blanches et planète bleue.
- Conserver la palette commune, la correction par sélection d’une position, l’historique à côté du jeu et les règles en dessous ; sur petit écran, garder l’ordre jeu, historique, règles.
- Lors d’un changement visuel, préserver les six couleurs du jeu et éviter de modifier `engine.js` sans nécessité fonctionnelle.
- Garder les noms des couleurs, le repère de position active et des boutons utilisables au clavier.
- Préserver le manifeste, les icônes planète et le fonctionnement hors ligne de la PWA décrits dans le README.

## Vérifier les modifications

- Définir le résultat attendu avant d’exécuter une vérification.
- Après chaque modification fonctionnelle, vérifier le cas concerné et un cas valide.
- Choisir des tests proportionnés au changement.
- Pour une correction, reproduire le défaut avant modification si possible, puis rejouer le même scénario après.
- Comparer les résultats de l’API avec l’interface visible lorsque les deux sont concernés.
- Ne jamais annoncer un test réussi sans preuve d’exécution.
- Indiquer clairement « non vérifié » lorsqu’une vérification n’a pas été réalisée.
- Relancer `node --test tests/engine.test.cjs tests/interface.test.cjs tests/pwa.test.cjs` avant publication d’une modification de l’application.
- Vérifier la sélection, la correction d’une position, le refus d’une proposition incomplète et un cas valide. Distinguer les tests du moteur, le DOM simulé et les essais réels dans un navigateur.
- Pour un changement PWA, exécuter aussi `tests/pwa-browser.cjs` si Playwright et Edge sont disponibles ; sinon signaler les scénarios de navigateur non vérifiés.

## Maintenir la PWA

- Incrémenter `APP_VERSION` dans `service-worker.js` à chaque changement d’un fichier précaché, et conserver ce nom de fichier pour permettre les mises à jour.
- Maintenir `APP_FILES` à jour et conserver les chemins relatifs compatibles avec `/code-secret/`.
- Ne pas forcer l’activation à l’installation : proposer « Mettre à jour » et prévenir que la partie recommence après rechargement.
- Garder le cache limité aux fichiers publics de ce jeu ; ne pas y écrire le secret, l’historique ou des données personnelles, et ne pas supprimer les caches d’autres projets.
- Conserver le mode `?test=1` hors cache : pas d’enregistrement PWA depuis ce mode, requêtes réseau pour la page et ses ressources. Ce mode nécessite une connexion.
- Vérifier une installation du cache, un rechargement hors connexion, l’API en ligne et une mise à jour avant/après. Distinguer l’installabilité détectée par le navigateur d’une installation native réellement effectuée par l’étudiant.

## Garder une trace

- Mettre à jour le README quand une règle documentée, un choix, une commande d’utilisation, une vérification ou une limite évolue.
- Distinguer les tests prévus des tests réellement exécutés.
- Pour les tests exécutés, noter attendu, observé, type de test, version et limites.
- Ne pas inventer de résultat, de défaut corrigé ou de référence de commit.
- Garder visibles les questions ouvertes.

## Utiliser Git

- Examiner les changements avant de créer un commit.
- Ne pas écraser ni annuler le travail de l’étudiant sans demande explicite.
- Faire un commit après chaque changement important et cohérent, lorsque Git est initialisé.
- Utiliser des messages de commit courts et explicites.
- Si le commit est impossible, expliquer ce qui le bloque.
- Créer les tags de remise uniquement lorsque la version correspondante est prête.
- Conserver le tag `jalon-1` sur sa version de remise ; les changements suivants se font sur `main` sans déplacer ce tag.
- Distinguer le commit local, l’envoi sur GitHub et le déploiement GitHub Pages. Après un envoi destiné à publier, vérifier les fichiers servis à l’URL publique et signaler les contrôles de navigateur non réalisés.

## Protéger le contenu du dépôt

- Ne pas ajouter de conversation, donnée personnelle, clé d’accès ou vidéo de présentation au dépôt.
- Ne pas intégrer de service d’IA, de clé API ou de serveur applicatif au jeu.

## Rendre compte

Après une étape, résumer :
- ce qui a changé et pourquoi ;
- les vérifications exécutées et leurs résultats ;
- les limites et les points restant à vérifier.

Communiquer en français, avec des explications permettant à l’étudiant de comprendre et de présenter son projet.
