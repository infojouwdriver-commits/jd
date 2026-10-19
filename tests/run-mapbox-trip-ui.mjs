// Synthetic local driver and GPS only. Never creates or sends a production trip.
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {randomBytes} from 'node:crypto';
import {pathToFileURL} from 'node:url';
const {chromium} = await import(pathToFileURL(process.env.UI_PLAYWRIGHT_PATH).href);
const base = 'http://127.0.0.1:3013';
const server = spawn(process.execPath, ['node_modules/next/dist/bin/next','start','--hostname','127.0.0.1','--port','3013'], {env:{...process.env,NODE_ENV:'production',APP_ORIGIN:base,JWT_SECRET:randomBytes(48).toString('hex'),POSTGREST_URL:'http://127.0.0.1:39999',POSTGREST_SCHEMA:'public',SCHEMA_USER:'browser',SCHEMA_ADMIN_USER:'service',NEXT_TELEMETRY_DISABLED:'1'},stdio:['ignore','pipe','pipe']});
let browser;
function syntheticGPS(){
  let nextId=0,position={latitude:50.85,longitude:4.35,accuracy:5};const watchers=new Map();
  const point=()=>({coords:{...position,speed:null},timestamp:Date.now()});
  Object.defineProperty(navigator,'geolocation',{value:{watchPosition(success){const id=++nextId;watchers.set(id,success);setTimeout(()=>{if(watchers.has(id))success(point());},0);return id;},clearWatch(id){watchers.delete(id);}}});
  window.__setSyntheticPosition=value=>{position=value;for(const callback of watchers.values())callback(point());};
  window.__syntheticWatchCount=()=>watchers.size;
}
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
    await context.addInitScript(syntheticGPS);
    let mapboxCalls=0, tripWrites=0, loggedIn=true;const fleetWrites=[];
    const handleRoute=async route=>{
      const request=route.request(),url=new URL(request.url());
      if(url.hostname==='api.mapbox.com'){
        if(url.pathname.includes('/tiles/')) {
          assert.equal(request.headers().referer,base+'/');
          return route.fulfill({status:200,contentType:'image/png',body:Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a5WQAAAAASUVORK5CYII=','base64')});
        }
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
      if(url.pathname==='/next_api/auth/user'){
        if(!loggedIn)return route.fulfill({status:401,contentType:'application/json',body:JSON.stringify({success:false,errorCode:'TOKEN_MISSING'})});
        data={sub:'9002',email:'driver@example.invalid',isAdmin:false,userType:'driver'};
      }
      else if(url.pathname==='/next_api/auth/logout'){loggedIn=false;data=true;}
      else if(url.pathname==='/next_api/drivers/shifts')data={active:{id:'00000000-0000-4000-8000-000000000001',plate_number:'TEST-1',work_status:'available',version:1},shifts:[]};
      else if(url.pathname==='/next_api/drivers/pricing')data={company_id:1,company_name:'Synthetic company',pricing:{base_fee:3,km_rate:2,minute_rate:0.3,minimum_fare:10},chiron_mode:'TEST'};
      else if(url.pathname==='/next_api/drivers/me')data={id:9002,name:'Synthetic Driver',company_id:1};
      else if(url.pathname==='/next_api/fleet/location'){
        if(request.method()==='POST'){fleetWrites.push(request.postDataJSON());data=request.postDataJSON();}
        else data={shift_active:false,sharing_enabled:false};
      }
      if(url.pathname.startsWith('/next_api/trips') && request.method()==='POST')tripWrites++;
      return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({success:true,data})});
    };
    await context.route('**/*',handleRoute);
    const logoutContext=await browser.newContext({viewport,locale:'fr-BE',permissions:['geolocation'],geolocation:{latitude:50.85,longitude:4.35,accuracy:5},serviceWorkers:'block'});
    await logoutContext.addInitScript(()=>{localStorage.setItem('driver_language','fr');localStorage.setItem('gdpr_cookie_consent',JSON.stringify({version:'1.0',timestamp:new Date().toISOString(),categories:{essential:true,analytics:false,marketing:false}}));});
    await logoutContext.addInitScript(syntheticGPS);
    await logoutContext.route('**/*',handleRoute);
    const logoutPage=await logoutContext.newPage();await logoutPage.goto(base+'/driver/taximeter');
    await logoutPage.getByText('Position partagée avec votre société et l’administration',{exact:true}).waitFor();
    await logoutPage.getByRole('button',{name:'Déconnexion',exact:true}).click();await logoutPage.waitForURL(base+'/driver-login');
    assert.deepEqual(fleetWrites.at(-1),{shift_active:false,sharing_enabled:false});
    await logoutContext.close();loggedIn=true;
    const page=await context.newPage();
    await page.goto(base+'/driver/taximeter');
    await page.getByText('Position partagée avec votre société et l’administration',{exact:true}).waitFor();
    assert.equal(fleetWrites[0].shift_active,true);assert.equal(fleetWrites[0].sharing_enabled,true);assert.equal(fleetWrites[0].latitude,50.85);
    assert.equal(await page.getByTestId('fleet-sharing-indicator').getByRole('button').count(),0);
    assert.equal(await page.getByRole('button',{name:'Commencer le service et partager',exact:true}).count(),0);
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
    await page.getByTestId('active-trip-map').locator('.leaflet-tile-loaded').first().waitFor();
    await page.getByTestId('active-trip-map').getByRole('button',{name:'Suivre la position',exact:true}).click();
    await page.evaluate(()=>window.__setSyntheticPosition({latitude:50.851,longitude:4.352,accuracy:5}));
    await page.locator('[data-map-point="driver"][data-lat="50.851"]').waitFor();
    await page.reload();
    await page.getByRole('button',{name:'Terminer Course',exact:true}).waitFor();
    await page.getByText('Position partagée avec votre société et l’administration',{exact:true}).waitFor();
    await page.getByTestId('active-trip-map').locator('.leaflet-container').waitFor();
    assert.equal(tripWrites,0,'Starting and restoring the synthetic trip must not submit a completed trip');
    console.log('Passed: automatic disclosed fleet sharing starts without buttons, stops/clears on logout and resumes on login/reload; Mapbox failure and active trip map restore on '+viewport.width+'px');
    await context.close();
  }
} finally {await browser?.close();server.kill('SIGTERM');}
