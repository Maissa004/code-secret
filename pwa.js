(function () {
  "use strict";
  const status = document.querySelector("#pwa-status");
  const installButton = document.querySelector("#install-app");
  const updateNotice = document.querySelector("#app-update");
  const updateButton = document.querySelector("#update-app");
  const testMode = new URLSearchParams(window.location.search).get("test") === "1";
  if (testMode) {
    status.textContent = "Mode de test API · connexion requise.";
    return;
  }
  if (!/^https?:$/.test(window.location.protocol) || !window.isSecureContext || !("serviceWorker" in navigator)) {
    status.textContent = "Pour installer le jeu, ouvrez sa version en ligne.";
    return;
  }

  let readyOffline = false;
  let installPrompt = null;
  let registration = null;
  let updating = false;
  let reloading = false;
  function updateStatus() {
    status.textContent = !navigator.onLine ? "Hors connexion · vous pouvez continuer à jouer." :
      readyOffline ? "Le jeu est prêt à être utilisé hors connexion." : "Préparation du jeu hors connexion…";
  }
  window.addEventListener("online", updateStatus);
  window.addEventListener("offline", updateStatus);
  window.addEventListener("beforeinstallprompt", event => {
    event.preventDefault();
    installPrompt = event;
    installButton.hidden = false;
  });
  window.addEventListener("appinstalled", () => {
    installPrompt = null;
    installButton.hidden = true;
  });
  installButton.addEventListener("click", async () => {
    if (!installPrompt) return;
    const prompt = installPrompt;
    installPrompt = null;
    installButton.hidden = true;
    try { await prompt.prompt(); await prompt.userChoice; }
    catch { status.textContent = "Vous pourrez installer le jeu depuis le menu du navigateur."; }
  });
  updateButton.addEventListener("click", () => {
    if (registration?.waiting) {
      updating = true;
      updateButton.disabled = true;
      registration.waiting.postMessage({ type: "SKIP_WAITING" });
    } else {
      window.location.reload();
    }
  });
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (updating && !reloading) {
      reloading = true;
      window.location.reload();
    }
    // Ne pas interrompre automatiquement une partie dans les autres onglets.
  });

  updateStatus();
  navigator.serviceWorker.register("./service-worker.js", { scope: "./", updateViaCache: "none" }).then(reg => {
    registration = reg;
    if (reg.waiting) updateNotice.hidden = false;
    reg.addEventListener("updatefound", () => {
      const worker = reg.installing;
      if (!worker) return;
      worker.addEventListener("statechange", () => {
        if (worker.state === "installed" && navigator.serviceWorker.controller) updateNotice.hidden = false;
      });
    });
    navigator.serviceWorker.ready.then(() => {
      readyOffline = true;
      updateStatus();
    });
  }).catch(() => {
    status.textContent = "Le jeu reste disponible en ligne. Le mode hors connexion n’a pas pu être préparé.";
  });
})();
