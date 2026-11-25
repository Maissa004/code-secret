(function () {
  "use strict";
  const game = CodeSecret.createGame();
  const colors = game.getConfig().colors;
  const fields = document.querySelector("#guess-fields");
  const positions = document.querySelector("#positions");
  const history = document.querySelector("#history");
  const message = document.querySelector("#message");
  const selection = Array(4).fill("");
  const positionButtons = [];
  let activePosition = 0;

  // Les boutons natifs se commandent aussi avec Tab, Entrée et Espace.
  for (let i = 0; i < 4; i++) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "position";
    const title = document.createElement("span");
    title.className = "position-label";
    title.textContent = `POSITION ${i + 1}`;
    const peg = document.createElement("span");
    peg.className = "peg";
    peg.textContent = "+";
    peg.setAttribute("aria-hidden", "true");
    const name = document.createElement("span");
    name.className = "position-name";
    button.setAttribute("aria-describedby", "selection-help");
    button.addEventListener("click", () => {
      if (game.getState().status !== "playing") return;
      activePosition = i;
      updateSelection();
    });
    button.append(title, peg, name);
    positionButtons.push(button);
    positions.append(button);
  }

  colors.forEach((color) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "palette-color";
    button.setAttribute("aria-label", `Choisir ${color}`);
    const peg = document.createElement("span");
    peg.className = `peg ${color}`;
    peg.setAttribute("aria-hidden", "true");
    const name = document.createElement("span");
    name.textContent = color[0].toUpperCase() + color.slice(1);
    button.append(peg, name);
    button.addEventListener("click", () => {
      if (game.getState().status !== "playing") return;
      selection[activePosition] = color;
      const next = selection.findIndex((value, index) => !value && index > activePosition);
      const firstEmpty = selection.indexOf("");
      if (next !== -1) activePosition = next;
      else if (firstEmpty !== -1) activePosition = firstEmpty;
      updateSelection();
    });
    document.querySelector("#palette").append(button);
  });

  function updateSelection() {
    positionButtons.forEach((button, index) => {
      const color = selection[index];
      const peg = button.children[1];
      peg.className = `peg ${color}`;
      peg.textContent = color ? "" : "+";
      button.children[2].textContent = color || "Vide";
      button.setAttribute("aria-label", `Position ${index + 1} : ${color || "vide"}`);
      button.setAttribute("aria-pressed", String(index === activePosition));
    });
    document.querySelector("#selection-count").textContent = `${selection.filter(Boolean).length} / 4`;
    document.querySelector("#active-position").textContent = `Position ${activePosition + 1} sélectionnée`;
  }

  function clearSelection() {
    selection.fill("");
    activePosition = 0;
    updateSelection();
  }

  function render() {
    const state = game.getState();
    const revealed = game.getRevealedSecret();
    const secretDisplay = document.querySelector("#secret-display");
    secretDisplay.replaceChildren();
    if (revealed) {
      revealed.forEach((color) => {
        const item = document.createElement("div");
        item.className = "solution-color";
        const peg = document.createElement("span");
        peg.className = `peg ${color}`;
        peg.setAttribute("aria-hidden", "true");
        const name = document.createElement("span");
        name.className = "solution-name";
        name.textContent = color;
        item.append(peg, name);
        secretDisplay.append(item);
      });
    } else {
      for (let i = 0; i < 4; i++) {
        const hidden = document.createElement("span");
        hidden.textContent = "?";
        secretDisplay.append(hidden);
      }
    }
    secretDisplay.setAttribute("aria-label", revealed ? `Le code secret était : ${revealed.join(", ")}` : "Code secret : quatre couleurs cachées");
    document.querySelector("#secret-caption").textContent = revealed ? "Voici le code qu’il fallait trouver." : "Le code reste caché. À vous de le déduire.";
    fields.disabled = state.status !== "playing";
    document.querySelector("#attempts").textContent = `${state.attempts} / 10 essais`;
    document.querySelector("#empty-history").hidden = state.history.length > 0;
    history.replaceChildren();
    state.history.forEach((entry, index) => {
      const row = document.createElement("li");
      row.className = "history-row";
      const number = document.createElement("span");
      number.className = "attempt-number";
      number.textContent = String(index + 1).padStart(2, "0");
      number.setAttribute("aria-label", `Essai ${index + 1}`);
      const guess = document.createElement("div");
      guess.className = "history-colors";
      entry.guess.forEach((color) => {
        const item = document.createElement("span");
        item.className = "history-color";
        const peg = document.createElement("span");
        peg.className = `small-peg ${color}`;
        peg.setAttribute("aria-hidden", "true");
        const name = document.createElement("span");
        name.textContent = color;
        item.append(peg, name);
        guess.append(item);
      });
      const result = document.createElement("div");
      result.className = "history-result";
      const exact = document.createElement("span");
      exact.textContent = `${entry.result.wellPlaced} bien placée(s)`;
      const misplaced = document.createElement("span");
      misplaced.textContent = `${entry.result.misplaced} mal placée(s)`;
      result.append(exact, misplaced);
      row.append(number, guess, result);
      history.append(row);
    });

    message.className = `message ${state.lastError ? "error" : state.status === "won" ? "success" : ""}`;
    const statusMessages = {
      "not-started": "Prêt à jouer ? Cliquez sur « Nouvelle partie ».",
      playing: state.attempts ? "À vous de jouer : appuyez-vous sur les indices précédents." : "La partie commence. Quelle est votre première intuition ?",
      won: `Bravo ! Vous avez trouvé le code en ${state.attempts} essai(s).`,
      lost: "Les dix essais sont épuisés. Le code secret est révélé ci-dessus. Retentez votre chance avec une nouvelle partie !"
    };
    message.textContent = state.lastError ? state.lastError.message : statusMessages[state.status];
  }

  async function startGame(options) {
    game.startGame(options); // En cas d’options invalides, ne changer ni l’écran ni la sélection.
    clearSelection();
    render();
    return game.getState();
  }

  async function submitGuess(guess) {
    const state = game.submitGuess(guess);
    if (!state.lastError) clearSelection();
    render();
    return game.getState();
  }

  document.querySelector("#guess-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const values = [...selection];
    if (values.some((value) => !value)) {
      // Le moteur reçoit une proposition incomplète, sans couleur artificielle.
      await submitGuess(values.filter(Boolean));
      activePosition = selection.indexOf("");
      updateSelection();
      positionButtons[activePosition].focus();
      return;
    }
    await submitGuess(values);
    if (game.getState().status === "playing") positionButtons[0].focus();
    else document.querySelector("#restart").focus();
  });
  document.querySelector("#clear").addEventListener("click", () => { clearSelection(); positionButtons[0].focus(); });
  document.querySelector("#restart").addEventListener("click", async () => { await startGame(); positionButtons[0].focus(); });

  if (new URLSearchParams(window.location.search).get("test") === "1") {
    updateSelection();
    render();
    window.codeSecretTest = { version: "0.2", getConfig: game.getConfig, getState: game.getState, startGame, submitGuess };
  } else {
    startGame();
  }
})();
