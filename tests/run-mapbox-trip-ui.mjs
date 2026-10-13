// Synthetic local driver and GPS only. Never creates or sends a production trip.
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {randomBytes} from 'node:crypto';
import {pathToFileURL} from 'node:url';
const {chromium} = await import(pathToFileURL(process.env.UI_PLAYWRIGHT_PATH).href);
const base = 'http://127.0.0.1:3013';
const server = spawn(process.execPath, ['node_modules/next/dist/bin/next','start','--hostname','127.0.0.1','--port','3013'], {env:{...process.env,NODE_ENV:'production',APP_ORIGIN:base,JWT_SECRET:randomBytes(48).toString('hex'),POSTGREST_URL:'http://127.0.0.1:39999',POSTGREST_SCHEMA:'public',SCHEMA_USER:'browser',SCHEMA_ADMIN_USER:'service',NEXT_TELEMETRY_DISABLED:'1'},stdio:['ignore','pipe','pipe']});
let browser;
try {
  let ready=false;
  for(let i=0;i<60;i++){try{ready=(await fetch(base+'/login')).ok;}catch{}if(ready)break;await new Promise(r=>setTimeout(r,500));}
  assert.ok(ready);
  browser=await chromium.launch({headless:true});
  for(const viewport of [{width:1280,height:900},{width:390,height:844}]) {
    const context=await browser.newContext({viewport,locale:'fr-BE',permissions:['geolocation'],geolocation:{latitude:50.85,longitude:4.35,accuracy:5},serviceWorkers:'block'});
    await context.addInitScript(()=>{
      localStorage.setItem('driver_language','fr');
      localStorage.setItem('gdpr_cookie_consent',JSON.stringify({version:'1.0',timestamp:new Date().toISOString(),categories:{essential:true,analytics:false,marketing:false}}));
    });
    let mapboxCalls=0, tripWrites=0;const fleetWrites=[];
    await context.route('**/*',async route=>{
      const request=route.request(),url=new URL(request.url());
      if(url.hostname==='api.mapbox.com'){
        mapboxCalls++;
        assert.equal(request.headers().referer,base+'/');
        return route.fulfill({status:403,contentType:'application/json',body:JSON.stringify({message:'Forbidden'})});
      }
      if(url.hostname==='nominatim.openstreetmap.org'){
        const name=url.searchParams.get('q')||'Synthetic start';
        return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify([{display_name:name,lat:'50.85',lon:name.includes('Destination')?'4.36':'4.35',address:{country_code:'be'}}])});
      }
      if(url.origin!==base)return route.abort();
      if(!url.pathname.startsWith('/next_api/'))return route.continue();
      let data=[];
      if(url.pathname==='/next_api/auth/user')data={sub:'9002',email:'driver@example.invalid',isAdmin:false,userType:'driver'};
      else if(url.pathname==='/next_api/drivers/pricing')data={company_id:1,company_name:'Synthetic company',pricing:{base_fee:3,km_rate:2,minute_rate:0.3,minimum_fare:10},chiron_mode:'TEST'};
      else if(url.pathname==='/next_api/drivers/me')data={id:9002,name:'Synthetic Driver',company_id:1};
      else if(url.pathname==='/next_api/fleet/location'){
        if(request.method()==='POST'){fleetWrites.push(request.postDataJSON());data=request.postDataJSON();}
        else data={shift_active:false,sharing_enabled:false};
      }
      if(url.pathname.startsWith('/next_api/trips') && request.method()==='POST')tripWrites++;
      return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({success:true,data})});
    });
    const page=await context.newPage();
    await page.goto(base+'/driver/taximeter');
    await page.getByRole('button',{name:'Commencer le service et partager',exact:true}).click();
    await page.getByText('Partage de position actif',{exact:true}).waitFor();
    assert.equal(fleetWrites[0].shift_active,true);assert.equal(fleetWrites[0].sharing_enabled,true);assert.equal(fleetWrites[0].latitude,50.85);
    await page.getByRole('button',{name:'Terminer le service',exact:true}).click();
    await page.getByText('Position non partagée',{exact:true}).waitFor();
    assert.deepEqual(fleetWrites.at(-1),{shift_active:false,sharing_enabled:false});
    await page.getByPlaceholder("Entrez l'adresse de départ").fill('Synthetic start');
    await page.getByPlaceholder("Entrez l'adresse d'arrivée").fill('Destination test');
    await page.getByRole('combobox').click();
    await page.getByRole('option',{name:'Espèces',exact:true}).click();
    await page.getByRole('button',{name:'Calculer le prix',exact:true}).click();
    await page.getByTestId('route-unavailable').waitFor();
    assert.equal(mapboxCalls,1);
    const agreed=page.getByRole('spinbutton',{name:'Prix convenu',exact:true});
    assert.equal(await agreed.inputValue(),'');
    await page.getByRole('button',{name:'Démarrer Course',exact:true}).click();
    await page.getByText('Entrez un prix valide',{exact:true}).waitFor();
    assert.equal(await page.getByRole('button',{name:'Terminer Course',exact:true}).count(),0);
    await agreed.fill('25');
    await page.getByRole('button',{name:'Démarrer Course',exact:true}).click();
    await page.getByRole('button',{name:'Terminer Course',exact:true}).waitFor();
    await page.reload();
    await page.getByRole('button',{name:'Terminer Course',exact:true}).waitFor();
    assert.equal(tripWrites,0,'Starting and restoring the synthetic trip must not submit a completed trip');
    console.log('Passed: driver starts/stops fleet sharing; Mapbox 403 shows manual agreed price, rejects blank price, starts with GPS and restores the saved trip on '+viewport.width+'px');
    await context.close();
  }
} finally {await browser?.close();server.kill('SIGTERM');}
