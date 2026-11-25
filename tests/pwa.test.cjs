const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync, existsSync } = require('node:fs');
const { join } = require('node:path');
const vm = require('node:vm');
const root = join(__dirname, '..');

function worker({ offline = false } = {}) {
  const scope = 'https://example.test/code-secret/';
  const handlers = {}, stores = new Map();
  const calls = { network: 0, claimed: 0, skipped: 0 };
  const context = vm.createContext({ URL, Request, Response, Set,
    self: {
      registration: {scope}, location: {origin: 'https://example.test'},
      addEventListener: (name, fn) => { handlers[name] = fn; },
      clients: {claim: async () => { calls.claimed++; }},
      skipWaiting: async () => { calls.skipped++; }
    },
    caches: {
      keys: async () => [...stores.keys()],
      delete: async key => stores.delete(key),
      open: async key => {
        if (!stores.has(key)) stores.set(key, new Map());
        const values = stores.get(key);
        return {
          addAll: async requests => {
            if (offline) throw Error('offline');
            for (const request of requests) {
              assert.equal(request.cache, 'reload');
              const relative = new URL(request.url).pathname.replace('/code-secret/', '');
              values.set(request.url, new Response(readFileSync(join(root, relative))));
            }
          },
          match: async key => values.get(key)?.clone()
        };
      }
    },
    fetch: async () => { calls.network++; if (offline) throw Error('offline'); return new Response('network'); }
  });
  vm.runInContext(readFileSync(join(root,'service-worker.js'),'utf8'), context);
  const lifecycle = name => { let promise; handlers[name]({waitUntil: value => {promise = value;}}); return promise; };
  const fetchRequest = (url, {mode='navigate', referrer='', method='GET'} = {}) => {
    let response;
    handlers.fetch({request: {url,mode,referrer,method}, respondWith: value => {response = value;}});
    return response;
  };
  return {handlers, stores, calls, lifecycle, fetchRequest, scope};
}

test('Manifeste : portée relative, icônes PNG présentes et dimensions correctes', () => {
  const manifest=JSON.parse(readFileSync(join(root,'manifest.webmanifest'),'utf8'));
  assert.equal(manifest.start_url,'./'); assert.equal(manifest.scope,'./');
  assert.equal(manifest.id,'./'); assert.equal(manifest.display,'standalone');
  assert.deepEqual(manifest.icons.map(icon=>icon.sizes),['192x192','512x512']);
  for(const icon of manifest.icons) {
    const png=readFileSync(join(root,icon.src)); const size=Number(icon.sizes.split('x')[0]);
    assert.equal(png.subarray(1,4).toString(),'PNG');
    assert.equal(png.readUInt32BE(16),size); assert.equal(png.readUInt32BE(20),size);
  }
  assert.ok(existsSync(join(root,'icons/planet-180.png')));
});

test('Hors-ligne : toute l’application est précachée et la navigation retrouve le jeu', async () => {
  const w=worker(); await w.lifecycle('install');
  const files=[...w.stores.values()][0]; assert.equal(files.size,10);
  const page=await w.fetchRequest(w.scope); assert.match(await page.text(), /VERSION 0.4/);
  const style=await w.fetchRequest(w.scope+'style.css',{mode:'cors'});
  assert.match(await style.text(), /--paper: #f5f0fc/);
  assert.equal(w.calls.network,0);
});

test('Activation : seuls les anciens caches de ce projet sont supprimés', async () => {
  const w=worker(); await w.lifecycle('install');
  w.stores.set('code-secret:'+w.scope+':old',new Map());
  w.stores.set('autre-projet',new Map()); await w.lifecycle('activate');
  assert.equal(w.stores.size,2); assert.ok(w.stores.has('autre-projet'));
  assert.equal(w.calls.claimed,1);
});

test('Installation interrompue : nouveau cache supprimé, version précédente conservée', async () => {
  const w=worker({offline:true}); const old='code-secret:'+w.scope+':old';
  w.stores.set(old,new Map());
  await assert.rejects(w.lifecycle('install'),/offline/);
  assert.deepEqual([...w.stores.keys()],[old]);
});

test('Mode API : page et ressources vont au réseau sans utiliser le cache', async () => {
  const w=worker(); await w.lifecycle('install');
  // Utiliser de vrais Request dans les scénarios réseau.
  let result;
  w.handlers.fetch({request:new Request(w.scope+'?test=1'),respondWith:value=>{result=value;}});
  assert.equal(await (await result).text(),'network');
  w.handlers.fetch({request:new Request(w.scope+'engine.js',{referrer:w.scope+'?test=1'}),respondWith:value=>{result=value;}});
  assert.equal(await (await result).text(),'network');
  assert.equal(w.calls.network,2);
  assert.equal(w.fetchRequest('https://other.test/style.css'),undefined);
  assert.equal(w.fetchRequest(w.scope+'README.md'),undefined);
});

test('Mise à jour : activation forcée uniquement sur message explicite', async () => {
  const w=worker(); await w.lifecycle('install'); assert.equal(w.calls.skipped,0);
  let pending; w.handlers.message({data:{type:'SKIP_WAITING'},waitUntil:value=>{pending=value;}});
  await pending; assert.equal(w.calls.skipped,1);
});
