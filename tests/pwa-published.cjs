/* Contrôle volontaire de l’application HTTPS publiée, profil Edge temporaire. */
const assert=require('node:assert/strict');
const path=require('node:path');
const {chromium}=require('playwright');

(async()=>{
  const context=await chromium.launchPersistentContext('',{channel:'msedge',headless:true,serviceWorkers:'allow'});
  try {
    const url='https://maissa004.github.io/code-secret/';
    const page=await context.newPage();
    await page.goto(url);
    await page.getByText('VERSION 0.4',{exact:true}).waitFor();
    await page.waitForFunction(()=>navigator.serviceWorker.controller);
    await page.getByText('Le jeu est prêt à être utilisé hors connexion.',{exact:true}).waitFor();
    const scope=await page.evaluate(async()=>(await navigator.serviceWorker.getRegistration()).scope);
    assert.equal(scope,url);
    const cdp=await context.newCDPSession(page);
    const errors=await cdp.send('Page.getInstallabilityErrors');
    assert.deepEqual(errors.installabilityErrors,[]);
    console.log('PASS HTTPS : version 0.4, cache prêt, portée /code-secret/ et aucun blocage d’installabilité.');
    const apiPage=await context.newPage();await apiPage.goto(url+'?test=1');
    const state=await apiPage.evaluate(async()=>{
      await window.codeSecretTest.startGame({secret:['rouge','rouge','bleu','vert']});
      return await window.codeSecretTest.submitGuess(['rouge','bleu','rouge','rouge']);
    });
    assert.deepEqual(state.lastResult,{wellPlaced:1,misplaced:2});
    assert.equal(await apiPage.locator('#attempts').innerText(),'1 / 10 essais');
    await apiPage.close();
    console.log('PASS HTTPS : API et historique cohérents (1 bien placée, 2 mal placées).');
    await context.setOffline(true);await page.reload();
    for(const color of ['rouge','rouge','bleu','vert']) await page.getByRole('button',{name:'Choisir '+color,exact:true}).click();
    await page.getByRole('button',{name:'Valider la proposition',exact:true}).click();
    assert.equal(await page.locator('#attempts').innerText(),'1 / 10 essais');
    assert.equal(await page.locator('#history li').count(),1);
    await page.getByRole('button',{name:/Nouvelle partie/}).click();
    console.log('PASS HTTPS : le jeu publié se recharge hors connexion et accepte une proposition.');
    if(process.env.PWA_SCREENSHOT_DIR) {
      await page.setViewportSize({width:1280,height:1000});
      await page.screenshot({path:path.join(process.env.PWA_SCREENSHOT_DIR,'code-secret-pwa-published.png'),fullPage:true});
    }
    console.log('Navigateur : Edge '+context.browser().version()+'. Installation native manuelle non effectuée.');
  } finally {await context.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
