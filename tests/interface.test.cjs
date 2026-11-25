const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const vm = require('node:vm');
const { createGame } = require('../engine.js');

// Petit DOM simulé : vérifie les commandes et le contenu, pas le rendu d’un navigateur.
class Element {
  constructor() { this.children = []; this.attributes = {}; this.listeners = {}; this.value = ''; this._text = ''; }
  append(...items) { for (const item of items) { item.parent = this; this.children.push(item); } }
  replaceChildren(...items) { this.children = []; this._text = ''; this.append(...items); }
  set textContent(value) { this._text = value; this.children = []; }
  get textContent() { return this._text + this.children.map(child => child.textContent).join(''); }
  get previousElementSibling() { return this.parent.children[this.parent.children.indexOf(this) - 1]; }
  setAttribute(name, value) { this.attributes[name] = value; }
  addEventListener(name, handler) { this.listeners[name] = handler; }
  add(option) { this.append(option); }
  focus() {}
}

function loadInterface(search = '?test=1') {
  const html = readFileSync(join(__dirname, '../index.html'), 'utf8');
  const elements = Object.fromEntries([...html.matchAll(/id="([^"]+)"/g)].map(match => [`#${match[1]}`, new Element()]));
  const window = { location: { search } };
  const context = vm.createContext({
    CodeSecret: { createGame }, window, URLSearchParams,
    document: {
      querySelector: selector => { assert.ok(elements[selector], `Élément présent : ${selector}`); return elements[selector]; },
      createElement: () => new Element()
    }
  });
  vm.runInContext(readFileSync(join(__dirname, '../script.js'), 'utf8'), context);
  return { api: window.codeSecretTest, elements };
}

test('Affichage : secret caché à neuf essais, révélé après défaite puis masqué au redémarrage', async () => {
  const { api, elements: e } = loadInterface();
  const secret = ['rouge','rouge','bleu','vert'];
  const wrong = ['jaune','jaune','jaune','jaune'];
  assert.equal(e['#secret-display'].textContent, '????');
  await api.startGame({secret});
  for (let i=0; i<9; i++) await api.submitGuess(wrong);
  assert.equal(e['#secret-display'].textContent, '????');
  await api.submitGuess(['rouge']);
  assert.equal(e['#secret-display'].textContent, '????');
  const lost = await api.submitGuess(wrong);
  assert.equal(lost.status, 'lost');
  assert.deepEqual(e['#secret-display'].children.map(item => item.textContent), secret);
  assert.equal(e['#secret-display'].attributes['aria-label'], 'Le code secret était : rouge, rouge, bleu, vert');
  assert.equal(e['#history'].children.length, 10);
  assert.equal(e['#guess-fields'].disabled, true);
  assert.match(e['#message'].textContent, /révélé/);
  assert.equal('getRevealedSecret' in api, false);
  assert.equal('secret' in lost, false);
  assert.equal('solution' in lost, false);
  await api.startGame({secret: ['violet','violet','violet','violet']});
  assert.equal(e['#secret-display'].textContent, '????');
  assert.equal(e['#guess-fields'].disabled, false);
  assert.equal(e['#history'].children.length, 0);
  assert.equal(e['#attempts'].textContent, '0 / 10 essais');
});

test('Affichage : victoire au dixième conservée sans révélation de défaite', async () => {
  const { api, elements: e } = loadInterface();
  const secret = ['rouge','rouge','bleu','vert'];
  await api.startGame({secret});
  for (let i=0; i<9; i++) await api.submitGuess(['jaune','jaune','jaune','jaune']);
  assert.equal((await api.submitGuess(secret)).status, 'won');
  assert.match(e['#message'].textContent, /Bravo/);
  assert.equal(e['#secret-display'].textContent, '????');
});

test('Mode normal : pas d’API, validation incomplète et valide, bouton nouvelle partie', async () => {
  const { api, elements: e } = loadInterface('');
  assert.equal(api, undefined);
  const palette = e['#palette'].children;
  for (let i=0; i<3; i++) palette[0].listeners.click();
  await e['#guess-form'].listeners.submit({preventDefault() {}});
  assert.equal(e['#attempts'].textContent, '0 / 10 essais');
  assert.equal(e['#history'].children.length, 0);
  palette[1].listeners.click();
  await e['#guess-form'].listeners.submit({preventDefault() {}});
  assert.equal(e['#attempts'].textContent, '1 / 10 essais');
  assert.equal(e['#history'].children.length, 1);
  await e['#restart'].listeners.click();
  assert.equal(e['#attempts'].textContent, '0 / 10 essais');
  assert.equal(e['#secret-display'].textContent, '????');
  assert.equal(e['#history'].children.length, 0);
});

test('Palette commune : répétitions, correction ciblée et état API cohérent après validation', async () => {
  const { api, elements: e } = loadInterface();
  await api.startGame({secret: ['rouge','rouge','bleu','vert']});
  const palette = e['#palette'].children;
  const positions = e['#positions'].children;
  assert.equal(palette.length, 6);
  for (const index of [0,0,1,2]) palette[index].listeners.click();
  assert.equal(e['#selection-count'].textContent, '4 / 4');
  assert.equal(api.getState().attempts, 0);
  positions[1].listeners.click();
  assert.equal(positions[1].attributes['aria-pressed'], 'true');
  palette[1].listeners.click();
  assert.deepEqual(positions.map(button => button.children[2].textContent), ['rouge','bleu','bleu','vert']);
  assert.equal(positions[1].attributes['aria-label'], 'Position 2 : bleu');
  await e['#guess-form'].listeners.submit({preventDefault() {}});
  assert.deepEqual(api.getState().lastGuess, ['rouge','bleu','bleu','vert']);
  assert.deepEqual(api.getState().lastResult, {wellPlaced:3,misplaced:0});
  assert.equal(e['#history'].children.length, 1);
  assert.equal(e['#selection-count'].textContent, '0 / 4');
  assert.equal(positions[0].attributes['aria-pressed'], 'true');
});

test('Palette : refus conserve la saisie, effacer ne consomme pas d’essai, démarrage API réinitialise', async () => {
  const { api, elements: e } = loadInterface();
  const palette = e['#palette'].children;
  palette[0].listeners.click();
  assert.equal(e['#selection-count'].textContent, '0 / 4'); // Pas de partie démarrée.
  await api.startGame({secret: ['rouge','rouge','bleu','vert']});
  palette[5].listeners.click();
  await e['#guess-form'].listeners.submit({preventDefault() {}});
  assert.equal(api.getState().lastError.code, 'invalid-length');
  assert.equal(e['#positions'].children[0].children[2].textContent, 'violet');
  assert.equal(api.getState().attempts, 0);
  e['#clear'].listeners.click();
  assert.equal(e['#selection-count'].textContent, '0 / 4');
  assert.equal(api.getState().attempts, 0);
  palette[2].listeners.click();
  await assert.rejects(api.startGame({secret: ['rouge']}));
  assert.equal(e['#selection-count'].textContent, '1 / 4');
  await api.startGame();
  assert.equal(e['#selection-count'].textContent, '0 / 4');
});
