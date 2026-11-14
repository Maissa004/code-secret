(function () {
  "use strict";
  const game = CodeSecret.createGame();
  const colors = game.getConfig().colors;
  const fields = document.querySelector("#guess-fields");
  const positions = document.querySelector("#positions");
  const history = document.querySelector("#history");
  const message = document.querySelector("#message");
  const selects = [];

  // Les listes natives sont utilisables au clavier et sur écran tactile.
  for (let i = 0; i < 4; i++) {
    const label = document.createElement("label");
    label.className = "position";
    const title = document.createElement("span");
    title.className = "position-label";
    title.textContent = `POSITION ${i + 1}`;
    const peg = document.createElement("span");
    peg.className = "peg";
    peg.textContent = "+";
    peg.setAttribute("aria-hidden", "true");
    const select = document.createElement("select");
    select.setAttribute("aria-label", `Couleur en position ${i + 1}`);
    select.setAttribute("aria-describedby", "selection-help");
    select.add(new Option("Choisir…", ""));
    colors.forEach((color) => select.add(new Option(color[0].toUpperCase() + color.slice(1), color)));
    select.addEventListener("change", updateSelection);
    selects.push(select);
    label.append(title, peg, select);
    positions.append(label);
  }

  function updateSelection() {
    selects.forEach((select) => {
      const peg = select.previousElementSibling;
      peg.className = `peg ${select.value}`;
      peg.textContent = select.value ? "" : "+";
    });
    document.querySelector("#selection-count").textContent = `${selects.filter((select) => select.value).length} / 4`;
  }

  function clearSelection() {
    selects.forEach((select) => { select.value = ""; });
    updateSelection();
  }

  function render() {
    const state = game.getState();
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
      lost: "Les dix essais sont épuisés. Retentez votre chance avec une nouvelle partie !"
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
    const values = selects.map((select) => select.value);
    if (values.some((value) => !value)) {
      // Le moteur reçoit une proposition incomplète, sans couleur artificielle.
      await submitGuess(values.filter(Boolean));
      selects.find((select) => !select.value)?.focus();
      return;
    }
    await submitGuess(values);
    if (game.getState().status === "playing") selects[0].focus();
    else document.querySelector("#restart").focus();
  });
  document.querySelector("#clear").addEventListener("click", () => { clearSelection(); selects[0].focus(); });
  document.querySelector("#restart").addEventListener("click", async () => { await startGame(); selects[0].focus(); });

  if (new URLSearchParams(window.location.search).get("test") === "1") {
    render();
    window.codeSecretTest = { version: "0.2", getConfig: game.getConfig, getState: game.getState, startGame, submitGuess };
  } else {
    startGame();
  }
})();
