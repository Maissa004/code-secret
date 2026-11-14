/* Le moteur ne dépend pas de la page : les mêmes règles servent au jeu et aux tests. */
(function (root) {
  "use strict";

  const COLORS = ["rouge", "bleu", "vert", "jaune", "orange", "violet"];
  const messages = {
    "game-not-started": "Démarrez une nouvelle partie pour jouer.",
    "game-finished": "Cette partie est terminée. Démarrez une nouvelle partie.",
    "invalid-options": "Les options de démarrage ne sont pas valides.",
    "invalid-type": "La proposition doit contenir uniquement des noms de couleurs.",
    "invalid-length": "Choisissez exactement quatre couleurs avant de valider.",
    "invalid-color": "Une couleur proposée n’est pas autorisée."
  };
  const copy = (value) => JSON.parse(JSON.stringify(value));
  const error = (code) => ({ code, message: messages[code] });

  function validate(code) {
    if (!Array.isArray(code)) return "invalid-type";
    for (let i = 0; i < code.length; i++) {
      if (!Object.hasOwn(code, i) || typeof code[i] !== "string") return "invalid-type";
    }
    if (code.length !== 4) return "invalid-length";
    if (code.some((color) => !COLORS.includes(color))) return "invalid-color";
    return null;
  }

  function score(secret, guess) {
    let wellPlaced = 0;
    const remainingSecret = [];
    const remainingGuess = [];
    secret.forEach((color, index) => {
      if (color === guess[index]) wellPlaced++;
      else {
        remainingSecret.push(color);
        remainingGuess.push(guess[index]);
      }
    });
    // Retirer chaque occurrence utilisée empêche de compter deux fois une couleur.
    let misplaced = 0;
    remainingGuess.forEach((color) => {
      const index = remainingSecret.indexOf(color);
      if (index !== -1) {
        misplaced++;
        remainingSecret.splice(index, 1);
      }
    });
    return { wellPlaced, misplaced };
  }

  function createGame() {
    let secret = [];
    let state = { status: "not-started", attempts: 0, history: [], lastGuess: null, lastResult: null, lastError: null };
    const getState = () => copy(state);
    const getConfig = () => ({ apiVersion: "0.2", rulesVersion: "code-couleurs-1.0", secretLength: 4, maxAttempts: 10, allowDuplicates: true, colors: [...COLORS] });

    function startGame(options = {}) {
      const plainObject = options !== null && typeof options === "object" &&
        (Object.getPrototypeOf(options) === Object.prototype || Object.getPrototypeOf(options) === null);
      let code = !plainObject || Reflect.ownKeys(options).some((key) => key !== "secret") ? "invalid-options" : null;
      const imposed = !code && Object.hasOwn(options, "secret");
      if (!code && imposed) code = validate(options.secret);
      if (code) throw Object.assign(new Error(messages[code]), { code });

      secret = imposed ? [...options.secret] : Array.from({ length: 4 }, () => COLORS[Math.floor(Math.random() * COLORS.length)]);
      state = { status: "playing", attempts: 0, history: [], lastGuess: null, lastResult: null, lastError: null };
      return getState();
    }

    function submitGuess(guess) {
      const code = state.status === "not-started" ? "game-not-started" :
        state.status !== "playing" ? "game-finished" : validate(guess);
      if (code) {
        state.lastError = error(code);
        return getState();
      }
      const result = score(secret, guess);
      state.history.push({ guess: [...guess], result });
      state.attempts++;
      state.lastGuess = [...guess];
      state.lastResult = result;
      state.lastError = null;
      state.status = result.wellPlaced === 4 ? "won" : state.attempts === 10 ? "lost" : "playing";
      return getState();
    }
    return { getConfig, startGame, submitGuess, getState };
  }

  if (typeof module !== "undefined" && module.exports) module.exports = { createGame };
  else root.CodeSecret = { createGame };
})(globalThis);
