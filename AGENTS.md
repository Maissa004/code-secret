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

## Vérifier les modifications

- Définir le résultat attendu avant d’exécuter une vérification.
- Après chaque modification fonctionnelle, vérifier le cas concerné et un cas valide.
- Choisir des tests proportionnés au changement.
- Pour une correction, reproduire le défaut avant modification si possible, puis rejouer le même scénario après.
- Comparer les résultats de l’API avec l’interface visible lorsque les deux sont concernés.
- Ne jamais annoncer un test réussi sans preuve d’exécution.
- Indiquer clairement « non vérifié » lorsqu’une vérification n’a pas été réalisée.

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

## Protéger le contenu du dépôt

- Ne pas ajouter de conversation, donnée personnelle, clé d’accès ou vidéo de présentation au dépôt.
- Ne pas intégrer de service d’IA, de clé API ou de serveur applicatif au jeu.

## Rendre compte

Après une étape, résumer :
- ce qui a changé et pourquoi ;
- les vérifications exécutées et leurs résultats ;
- les limites et les points restant à vérifier.

Communiquer en français, avec des explications permettant à l’étudiant de comprendre et de présenter son projet.
