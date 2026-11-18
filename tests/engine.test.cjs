const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createGame } = require('../engine.js');

const R = 'rouge', B = 'bleu', V = 'vert', J = 'jaune', O = 'orange', Vi = 'violet';
const common = [R, B, V, J], repeated = [R, R, B, V];
const cases = [
  [common, [R,V,B,O], 1,2], [common,[O,Vi,R,B],0,2],
  [common,[B,R,J,V],0,4], [common,[R,B,J,V],2,2], [common,common,4,0],
  [repeated,[R,R,R,R],2,0], [repeated,[R,B,R,V],2,2],
  [repeated,repeated,4,0], [repeated,[R,B,R,R],1,2]
];
cases.forEach(([secret, guess, wellPlaced, misplaced], index) => {
  test(`T${String(index+1).padStart(2,'0')} : indices et historique`, () => {
    const game = createGame(); game.startGame({secret});
    const state = game.submitGuess(guess);
    assert.deepEqual(state.lastResult, {wellPlaced, misplaced});
    assert.equal(state.attempts, 1);
    assert.deepEqual(state.history, [{guess, result: {wellPlaced, misplaced}}]);
    assert.equal(state.status, wellPlaced === 4 ? 'won' : 'playing');
    assert.equal(state.lastError, null);
  });
});

test('Refus : priorités, sans essai et sans changement des données de jeu', () => {
  const game = createGame();
  assert.equal(game.getState().status, 'not-started');
  assert.equal(game.submitGuess(null).lastError.code, 'game-not-started');
  game.startGame({secret: common});
  for (const [guess, code] of [[null,'invalid-type'], [[R,null],'invalid-type'], [Array(4),'invalid-type'], [[R,B,V],'invalid-length'], [[R,B,V,'Violet'],'invalid-color'], [[R,B,V,'violet '],'invalid-color']]) {
    const state = game.submitGuess(guess);
    assert.equal(state.lastError.code, code);
    assert.deepEqual({...state,lastError:null}, {status:'playing',attempts:0,history:[],lastGuess:null,lastResult:null,lastError:null});
  }
  assert.equal(game.submitGuess(common).lastError, null);
  assert.equal(game.submitGuess(null).lastError.code, 'game-finished');
});

test('Victoire au dixième, refus à neuf essais, blocage et redémarrage', () => {
  const game = createGame(); game.startGame({secret:[R,R,R,R]});
  for (let i=0; i<9; i++) game.submitGuess([B,B,B,B]);
  assert.equal(game.submitGuess([R]).attempts, 9);
  const won = game.submitGuess([R,R,R,R]);
  assert.equal(won.status, 'won'); assert.equal(won.attempts, 10);
  const refused = game.submitGuess([B,B,B,B]);
  assert.deepEqual({...refused,lastError:null}, won);
  assert.equal(refused.lastError.code, 'game-finished');
  assert.deepEqual(game.startGame(), {status:'playing',attempts:0,history:[],lastGuess:null,lastResult:null,lastError:null});
});

test('Défaite au dixième et redémarrage après défaite', () => {
  const game = createGame(); game.startGame({secret:[R,R,R,R]});
  for (let i=0; i<10; i++) game.submitGuess([B,B,B,B]);
  const lost = game.getState();
  assert.equal(lost.status, 'lost'); assert.equal(lost.history.length,10);
  assert.deepEqual(lost.lastResult, {wellPlaced:0,misplaced:0});
  assert.equal(game.submitGuess(null).lastError.code,'game-finished');
  assert.equal(game.startGame({}).attempts, 0);
});

test('Démarrage invalide : erreur précise et état intégralement conservé', () => {
  const game=createGame(); game.startGame({secret:common}); game.submitGuess([R]);
  const before=game.getState();
  for(const [options,code] of [[null,'invalid-options'], [[], 'invalid-options'], [{other:1},'invalid-options'], [{secret:undefined},'invalid-type'], [{secret:[R]},'invalid-length'], [{secret:[R,R,R,'purple']},'invalid-color']]) {
    assert.throws(()=>game.startGame(options), error=>error.code===code && !!error.message);
    assert.deepEqual(game.getState(), before);
  }
});

test('Isolation des tableaux entrants, états et configuration retournés', () => {
  const game=createGame(); const secret=[...repeated]; game.startGame({secret}); secret.fill(B);
  const guess=[R,B,R,R]; const state=game.submitGuess(guess); guess.fill(J);
  state.history[0].guess.fill(Vi); state.lastResult.wellPlaced=99;
  const config=game.getConfig(); config.colors.fill('invalide');
  assert.deepEqual(game.getState().history[0].guess,[R,B,R,R]);
  assert.deepEqual(game.getState().lastResult,{wellPlaced:1,misplaced:2});
  assert.deepEqual(game.getConfig().colors,[R,B,V,J,O,Vi]);
  assert.equal('secret' in game.getState(),false);
});

test('Révélation uniquement après dix essais valides perdus, sans modifier la partie', () => {
  const game = createGame();
  assert.equal(game.getRevealedSecret(), null);
  game.startGame({secret: repeated});
  for (let i = 0; i < 9; i++) {
    assert.equal(game.getRevealedSecret(), null);
    game.submitGuess([J,J,J,J]);
  }
  game.submitGuess([R]); // Un refus au neuvième ne déclenche pas la révélation.
  assert.equal(game.getRevealedSecret(), null);
  game.submitGuess([J,J,J,J]);
  const before = game.getState();
  const revealed = game.getRevealedSecret();
  assert.deepEqual(revealed, repeated);
  revealed.fill(B); // Le code renvoyé ne permet pas de modifier le moteur.
  assert.deepEqual(game.getRevealedSecret(), repeated);
  assert.deepEqual(game.getState(), before);
  assert.equal('secret' in before, false);
  assert.equal('solution' in before, false);
  game.submitGuess(null);
  assert.equal(game.getState().lastError.code, 'game-finished');
  assert.deepEqual(game.getRevealedSecret(), repeated);
  assert.equal(game.getState().attempts, 10);
  assert.equal(game.getState().history.length, 10);
  assert.throws(() => game.startGame({secret: [R]}));
  assert.deepEqual(game.getRevealedSecret(), repeated);
  game.startGame({secret: common});
  assert.equal(game.getRevealedSecret(), null);
});

test('Une victoire au dixième reste une victoire et ne déclenche pas la révélation de défaite', () => {
  const game = createGame(); game.startGame({secret: repeated});
  for (let i = 0; i < 9; i++) game.submitGuess([J,J,J,J]);
  assert.equal(game.submitGuess(repeated).status, 'won');
  assert.equal(game.getRevealedSecret(), null);
});
