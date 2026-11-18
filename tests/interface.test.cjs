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
    },
    Option: class extends Element { constructor(text, value) { super(); this.textContent = text; this.value = value; } }
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
  const selects = e['#positions'].children.map(label => label.children[2]);
  selects.slice(0,3).forEach(select => { select.value = 'rouge'; });
  await e['#guess-form'].listeners.submit({preventDefault() {}});
  assert.equal(e['#attempts'].textContent, '0 / 10 essais');
  assert.equal(e['#history'].children.length, 0);
  selects[3].value = 'bleu';
  await e['#guess-form'].listeners.submit({preventDefault() {}});
  assert.equal(e['#attempts'].textContent, '1 / 10 essais');
  assert.equal(e['#history'].children.length, 1);
  await e['#restart'].listeners.click();
  assert.equal(e['#attempts'].textContent, '0 / 10 essais');
  assert.equal(e['#secret-display'].textContent, '????');
  assert.equal(e['#history'].children.length, 0);
});
