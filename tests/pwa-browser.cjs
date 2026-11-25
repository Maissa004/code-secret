/* Test optionnel avec Playwright et Edge installés, sans profil utilisateur. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { chromium } = require('playwright');
const root = path.join(__dirname, '..');
const mime = {'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml','.webmanifest':'application/manifest+json','.png':'image/png'};
const allowed = new Set(['index.html','style.css','engine.js','script.js','pwa.js','planet.svg','service-worker.js','manifest.webmanifest','icons/planet-192.png','icons/planet-512.png','icons/planet-180.png']);
let nextVersion = false;
const server=http.createServer((req,res)=>{
  const url=new URL(req.url,'http://localhost');
  const file=url.pathname.replace(/^\/code-secret\//,'') || 'index.html';
  if(!url.pathname.startsWith('/code-secret/') || !allowed.has(file)) {res.writeHead(404);res.end();return;}
  let data=fs.readFileSync(path.join(root,file));
  if(nextVersion && file==='service-worker.js') data=Buffer.from(data.toString().replace('APP_VERSION = "0.4.0"','APP_VERSION = "0.4.1"'));
  if(nextVersion && file==='index.html') data=Buffer.from(data.toString().replace('VERSION 0.4','VERSION 0.4.1'));
  res.writeHead(200,{'Content-Type':mime[path.extname(file)],'Cache-Control':'no-store'});res.end(data);
});

(async()=>{
  let context;
  try {
    await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
    const url=`http://127.0.0.1:${server.address().port}/code-secret/`;
    // Profil temporaire créé et nettoyé par Playwright ; aucun profil personnel.
    // Un contexte privé empêcherait volontairement l’installation d’une PWA.
    context=await chromium.launchPersistentContext('',{channel:'msedge',headless:true,serviceWorkers:'allow'});
    console.log('Navigateur de test : Edge '+context.browser().version());
    const page=await context.newPage(); const errors=[];
    page.on('pageerror',error=>errors.push(error.message));
    await page.goto(url);
    await page.waitForFunction(()=>navigator.serviceWorker.controller);
    await page.getByText('Le jeu est prêt à être utilisé hors connexion.',{exact:true}).waitFor();
    const cdp=await context.newCDPSession(page);
    const manifest=await cdp.send('Page.getAppManifest');
    assert.ok(manifest.data.includes('standalone'));
    const installation=await cdp.send('Page.getInstallabilityErrors');
    assert.deepEqual(installation.installabilityErrors,[]);
    console.log('PASS : manifeste reconnu et aucun blocage d’installabilité signalé par Edge.');

    await context.setOffline(true); await page.reload();
    await page.getByRole('button',{name:'Choisir rouge',exact:true}).click();
    await page.getByRole('button',{name:'Choisir rouge',exact:true}).click();
    await page.getByRole('button',{name:'Choisir bleu',exact:true}).click();
    await page.getByRole('button',{name:'Valider la proposition',exact:true}).click();
    assert.equal(await page.locator('#attempts').innerText(),'0 / 10 essais');
    await page.getByRole('button',{name:'Choisir vert',exact:true}).click();
    await page.getByRole('button',{name:'Valider la proposition',exact:true}).click();
    assert.equal(await page.locator('#attempts').innerText(),'1 / 10 essais');
    assert.equal(await page.locator('#history li').count(),1);
    console.log('PASS : rechargement hors connexion, palette, refus incomplet et essai valide.');
    const offlineAPI=await context.newPage(); let apiRequiresNetwork=false;
    try { await offlineAPI.goto(url+'?test=1'); } catch { apiRequiresNetwork=true; }
    assert.equal(apiRequiresNetwork,true); await offlineAPI.close();
    console.log('PASS : le mode API hors connexion ne réutilise pas une page de test en cache.');

    await context.setOffline(false);
    const apiPage=await context.newPage(); await apiPage.goto(url+'?test=1');
    const state=await apiPage.evaluate(async()=>{
      const api=window.codeSecretTest;
      if(api.getState().status!=='not-started') throw Error('état initial');
      await api.startGame({secret:['rouge','rouge','bleu','vert']});
      return await api.submitGuess(['rouge','bleu','rouge','rouge']);
    });
    assert.deepEqual(state.lastResult,{wellPlaced:1,misplaced:2});
    assert.equal(await apiPage.locator('#attempts').innerText(),'1 / 10 essais');
    await apiPage.close();
    console.log('PASS : API réelle et écran cohérents après installation du service worker.');

    await page.getByRole('button',{name:'Nouvelle partie',exact:false}).click();
    await page.getByRole('button',{name:'Position 2 : vide',exact:true}).press('Enter');
    await page.getByRole('button',{name:'Choisir bleu',exact:true}).press('Space');
    assert.equal(await page.getByRole('button',{name:'Position 2 : bleu',exact:true}).count(),1);
    await page.getByRole('button',{name:'Effacer',exact:true}).click();
    console.log('PASS : sélection de position et de couleur au clavier (Entrée et Espace).');
    await page.getByRole('button',{name:'Choisir rouge',exact:true}).click();
    nextVersion=true;
    await page.evaluate(async()=>{const r=await navigator.serviceWorker.getRegistration();await r.update();});
    await page.locator('#app-update').waitFor({state:'visible'});
    assert.equal(await page.locator('#selection-count').innerText(),'1 / 4');
    await page.getByRole('button',{name:'Mettre à jour',exact:true}).click();
    await page.getByText('VERSION 0.4.1',{exact:true}).waitFor();
    assert.equal(await page.locator('#selection-count').innerText(),'0 / 4');
    const cachesLeft=await page.evaluate(()=>caches.keys());
    assert.equal(cachesLeft.filter(key=>key.startsWith('code-secret:')).length,1);
    await context.setOffline(true); await page.reload();
    await page.getByText('VERSION 0.4.1',{exact:true}).waitFor();
    console.log('PASS : mise à jour proposée sans interrompre la partie, appliquée au clic, nouvelle version hors ligne.');
    await context.setOffline(false);
    await page.setViewportSize({width:390,height:844});
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),true);
    if(process.env.PWA_SCREENSHOT_DIR) {
      await page.screenshot({path:path.join(process.env.PWA_SCREENSHOT_DIR,'code-secret-pwa-mobile.png'),fullPage:true});
      await page.setViewportSize({width:1280,height:1000});
      await page.screenshot({path:path.join(process.env.PWA_SCREENSHOT_DIR,'code-secret-pwa-desktop.png'),fullPage:true});
    }
    assert.deepEqual(errors,[]);
    console.log('PASS : petit écran sans débordement horizontal et aucune exception JavaScript.');
    console.log('Ces contrôles ne remplacent pas une installation native manuelle.');
  } finally {
    if(context) await context.close();
    await new Promise(resolve=>server.close(resolve));
  }
})().catch(error=>{console.error(error);process.exitCode=1;});
