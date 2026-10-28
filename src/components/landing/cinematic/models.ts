import * as T from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import type { CinematicText } from './copy';

// Original parametric automotive design, authored for JOUW DRIVER. See ASSETS.md.
const metal = (color: string, roughness = .25, metalness = .85) => new T.MeshPhysicalMaterial({ color, roughness, metalness, clearcoat: 1, clearcoatRoughness: .16 });
function mesh(g: T.BufferGeometry, m: T.Material, parent: T.Object3D, p: number[] = [0, 0, 0]) {
 const o = new T.Mesh(g, m); o.position.set(p[0], p[1], p[2]); o.castShadow = true; o.receiveShadow = true; parent.add(o); return o;
}
function box(parent: T.Object3D, size: number[], p: number[], material: T.Material, radius = .04) {
 return mesh(new RoundedBoxGeometry(size[0], size[1], size[2], 3, radius), material, parent, p);
}
function tube(parent: T.Object3D, points: number[][], material: T.Material, radius = .012) {
 return mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p => new T.Vector3(...p as [number,number,number]))), 48, radius, 6, false), material, parent);
}
function surface(rows: number[][][], material: T.Material, parent: T.Object3D) {
 const v: number[] = [], indices: number[] = []; const width = rows[0].length;
 rows.forEach(row => row.forEach(p => v.push(...p)));
 for (let i=0;i<rows.length-1;i++) for(let j=0;j<width-1;j++){const a=i*width+j;indices.push(a,a+width,a+1,a+1,a+width,a+width+1);}
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(v,3));g.setIndex(indices);g.computeVertexNormals();return mesh(g,material,parent);
}
export function textTexture(text: string, foreground='#EAC080', background='#0B1929', w=1024, h=256) {
 const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;const c=canvas.getContext('2d')!;c.fillStyle=background;c.fillRect(0,0,w,h);c.fillStyle=foreground;c.textAlign='center';c.textBaseline='middle';c.font=`600 ${h*.38}px system-ui`;c.fillText(text,w/2,h/2,w*.92);const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;return texture;
}
export function createCar(low: boolean) {
 const group=new T.Group();group.name='JD Aster concept sedan';
 const paint=metal('#536777',.23), chrome=metal('#b5c0cb',.2), dark=metal('#080e16',.4,.35), rubber=new T.MeshStandardMaterial({color:'#10151b',roughness:.92});
 const glass=new T.MeshPhysicalMaterial({color:'#0b2637',metalness:.5,roughness:.1,clearcoat:1,transparent:true,opacity:.86,side:T.DoubleSide});
 const led=new T.MeshStandardMaterial({color:'#b6e9ff',emissive:'#9fdcf6',emissiveIntensity:3});const red=new T.MeshStandardMaterial({color:'#ff3544',emissive:'#ff1524',emissiveIntensity:2});
 const n=low?40:72, top:number[][][]=[], sideA:number[][][]=[], sideB:number[][][]=[];
 for(let i=0;i<=n;i++){
  const x=-2.65+i/n*5.3; const width=.96*Math.pow(Math.max(.02,1-Math.pow(Math.abs(x)/2.85,6)),.3); const y=1.02+.17*Math.sin((x+2.65)/5.3*Math.PI);
  const row:number[][]=[];for(let j=0;j<=20;j++){const z=(-1+j/10)*width;row.push([x,y+.11*(1-(z/width)**2),z]);}top.push(row);
  const arch=Math.max(...[-1.66,1.61].map(a=>Math.abs(x-a)<.53?.48+Math.sqrt(.53**2-(x-a)**2):.38));
  sideA.push([[x,y,width],[x,(y+arch)/2,width+.022],[x,arch,width*.98]]);sideB.push([[x,arch,-width*.98],[x,(y+arch)/2,-width-.022],[x,y,-width]]);
 }
 paint.side=T.DoubleSide;surface(top,paint,group);surface(sideA,paint,group);surface(sideB,paint,group);
 box(group,[4.05,.12,1.72],[0,.32,0],dark);box(group,[.23,.35,1.62],[-2.48,.66,0],paint,.1);box(group,[.22,.35,1.62],[2.48,.66,0],paint,.1);
 // Curved glass greenhouse, panoramic roof, independently removable for cabin camera.
 const cabin=new T.Group();group.add(cabin);const roof:number[][][]=[];
 for(let i=0;i<=32;i++){const t=i/32,x=-1.52+t*2.95;const y=1.16+.72*Math.sin(Math.PI*t)**.72; const w=.82-.16*Math.sin(Math.PI*t);const row:number[][]=[];for(let j=0;j<=24;j++){const q=-1+j/12;row.push([x,1.17+(y-1.17)*Math.cos(q*Math.PI/2)**.4,w*q]);}roof.push(row);}surface(roof,glass,cabin);
 for(const s of [-1,1]){
  tube(cabin,[[-1.52,1.17,s*.82],[-.85,1.76,s*.61],[.2,1.88,s*.62],[1.43,1.17,s*.82]],chrome,.022);
  tube(group,[[-2.4,.9,s*.87],[-1.5,1.05,s*.98],[.5,1.06,s*.98],[2.35,.95,s*.87]],chrome,.012);
  tube(cabin,[[.2,1.19,s*.82],[.18,1.55,s*.76],[.15,1.86,s*.65]],dark,.035);
  for(const x of [-.6,.9]) {tube(group,[[x,1.13,s*.97],[x-.04,.93,s*.99],[x-.07,.55,s*.98]],dark,.006);box(group,[.23,.024,.03],[x-.25,1.04,s*.993],chrome,.01);}
  box(group,[.29,.12,.19],[-1.05,1.2,s*1.04],paint,.05);
  const brand=mesh(new T.PlaneGeometry(.78,.14),new T.MeshBasicMaterial({map:textTexture('JOUW DRIVER','#EAC080','#536777'),side:T.DoubleSide}),group,[.18,.88,s*1.001]);brand.rotation.y=s===1?0:Math.PI;
 }
 // Front and rear signatures, grille and aero details.
 tube(group,[[-2.58,.98,-.75],[-2.65,1.02,0],[-2.58,.98,.75]],led,.024);
 tube(group,[[2.58,1.01,-.8],[2.65,1.06,0],[2.58,1.01,.8]],red,.022);
 for(const s of [-1,1]){box(group,[.04,.13,.33],[-2.61,.86,s*.64],dark);for(let i=0;i<4;i++)box(group,[.05,.012,.2],[-2.64,.82+i*.026,s*.64],chrome,.004);}
 box(group,[.04,.12,.6],[-2.62,.6,0],dark);for(let j=0;j<14;j++)box(group,[.04,.09,.012],[-2.65,.6,-.26+j*.04],chrome,.002);
 const plate=mesh(new T.PlaneGeometry(.43,.1),new T.MeshBasicMaterial({map:textTexture('JOUW DRIVER','#233244','#eef3f5')}),group,[-2.677,.77,0]);plate.rotation.y=-Math.PI/2;
 const wheels:T.Group[]=[];
 for(const x of [-1.66,1.61]) for(const s of [-1,1]){
  const wheel=new T.Group();wheel.position.set(x,.48,s*.94);group.add(wheel);wheels.push(wheel);
  mesh(new T.TorusGeometry(.365,.105,12,low?32:64),rubber,wheel);
  mesh(new T.CylinderGeometry(.305,.305,.16,48),chrome,wheel).rotation.x=Math.PI/2;
  mesh(new T.CylinderGeometry(.27,.27,.17,48),dark,wheel).rotation.x=Math.PI/2;
  const disk=mesh(new T.CylinderGeometry(.235,.235,.185,40),metal('#646f78',.55),wheel);disk.rotation.x=Math.PI/2;
  for(let j=0;j<10;j++){const a=j/10*Math.PI*2;const spoke=box(wheel,[.055,.29,.04],[Math.sin(a)*.15,Math.cos(a)*.15,s*.12],chrome,.01);spoke.rotation.z=-a;}
  mesh(new T.SphereGeometry(.075,16,8),chrome,wheel,[0,0,s*.15]);
  for(let j=0;j<(low?32:64);j++){const a=j/(low?32:64)*Math.PI*2;const tread=box(wheel,[.027,.01,.145],[Math.sin(a)*.466,Math.cos(a)*.466,0],dark,.003);tread.rotation.z=-a;}
  for(let j=0;j<5;j++){const a=j/5*Math.PI*2;mesh(new T.SphereGeometry(.013,6,4),dark,wheel,[Math.sin(a)*.09,Math.cos(a)*.09,s*.16]);}
 }
 const taxiMaterial=new T.MeshStandardMaterial({color:'#ead7a9',emissive:'#EAC080',emissiveIntensity:0});
 box(cabin,[.62,.22,.3],[.08,2.01,0],taxiMaterial,.06);
 const taxi=mesh(new T.PlaneGeometry(.48,.15),new T.MeshBasicMaterial({map:textTexture('TAXI','#141e2a','#EAC080')}),cabin,[.08,2.01,.155]);taxi.name='TAXI';
 // Cabin: dashboard, console, instrument cluster, steering wheel and stitched seats.
 const interior=new T.Group();group.add(interior);
 box(interior,[.5,.25,1.55],[-.97,1.1,0],dark,.09);tube(interior,[[-.86,1.23,-.74],[-.85,1.25,0],[-.86,1.23,.74]],new T.MeshStandardMaterial({color:'#EAC080',emissive:'#EAC080',emissiveIntensity:.6}),.009);
 box(interior,[1.25,.25,.33],[.15,.62,0],dark,.08);
 const steering=new T.Group();steering.position.set(-.48,1.16,.43);steering.rotation.y=Math.PI/2;steering.rotation.x=.1;interior.add(steering);
 mesh(new T.TorusGeometry(.245,.026,10,48),dark,steering);box(steering,[.12,.1,.06],[0,0,0],paint);tube(steering,[[-.2,.08,0],[0,0,0],[.2,.08,0]],chrome,.016);tube(steering,[[0,0,0],[0,-.22,0]],chrome,.016);
 for(const x of [.35,1.15])for(const z of [-.46,.46]){box(interior,[.65,.18,.61],[x,.55,z],dark,.1);const seat=box(interior,[.18,.72,.58],[x+.26,.94,z],dark,.09);seat.rotation.z=.1;box(interior,[.14,.22,.3],[x+.29,1.42,z],dark,.05);for(const dz of [-.18,.18])tube(interior,[[x-.2,.65,z+dz],[x+.12,.65,z+dz],[x+.16,1.24,z+dz]],chrome,.003);}
 return {group,wheels,cabin,taxiMaterial};
}
export function createPhone(t:CinematicText,rtl:boolean){
 const group=new T.Group();const body=metal('#344452',.23);box(group,[.76,1.5,.085],[0,0,0],body,.08);box(group,[.73,1.46,.09],[0,0,.012],metal('#030609'),.07);
 const canvas=document.createElement('canvas');canvas.width=512;canvas.height=1024;const ctx=canvas.getContext('2d')!;const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;
 mesh(new T.PlaneGeometry(.68,1.36),new T.MeshBasicMaterial({map:texture}),group,[0,0,.063]);box(group,[.2,.036,.01],[0,.65,.072],new T.MeshBasicMaterial({color:'#020509'}),.015);box(group,[.018,.15,.025],[.39,.25,0],body,.008);
 let last='';function update(p:number){const mode=p<.16?'start':p<.56?'active':p<.72?'meter':'complete';const fare=12.4+Math.min(1,Math.max(0,(p-.56)/.16))*12.4;const value=mode==='meter'?fare.toFixed(2):'24.80';const key=mode+value+(p>.12&&p<.2?p.toFixed(3):'');if(key===last)return;last=key;
 ctx.fillStyle='#0B1929';ctx.fillRect(0,0,512,1024);ctx.textAlign='center';ctx.direction=rtl?'rtl':'ltr';ctx.fillStyle='#A6B8C9';ctx.font='24px system-ui';ctx.fillText('09:41',75,47);ctx.font='bold 32px system-ui';ctx.fillStyle='#EAC080';ctx.fillText('JOUW DRIVER',256,130);ctx.fillStyle='#F3F5F7';ctx.font='28px system-ui';ctx.fillText(mode==='start'?t.ready:mode==='active'?t.active:mode==='meter'?t.meter:t.complete,256,203,470);
 ctx.strokeStyle='#38546b';ctx.lineWidth=5;ctx.beginPath();ctx.arc(256,435,156,.75*Math.PI,2.25*Math.PI);ctx.stroke();ctx.strokeStyle='#EAC080';ctx.lineWidth=12;ctx.beginPath();ctx.arc(256,435,156,.75*Math.PI,mode==='start'?1.25*Math.PI:2.2*Math.PI);ctx.stroke();
 ctx.fillStyle='#F3F5F7';ctx.font='bold 63px monospace';ctx.fillText(mode==='start'||mode==='active'?'128 640':'€ '+value,256,435);ctx.font='23px system-ui';ctx.fillStyle='#A6B8C9';ctx.fillText(mode==='start'||mode==='active'?t.odometer:t.demo,256,484,445);
 ctx.font='25px monospace';ctx.fillText('8.4 km   ·   18:00',256,664);ctx.fillStyle='#14283D';ctx.fillRect(28,717,456,70);ctx.fillStyle='#A9D8F2';ctx.font='24px system-ui';ctx.fillText('Bruxelles · Brussel',256,761);
 ctx.fillStyle='#EAC080';ctx.beginPath();ctx.roundRect(28,826,456,88,28);ctx.fill();ctx.fillStyle='#0B1929';ctx.font='bold 28px system-ui';ctx.fillText(mode==='start'?t.start:mode==='active'?t.active:mode==='meter'?t.end:t.complete,256,882,430);
 if(p>.12&&p<.2){ctx.strokeStyle='#fff';ctx.lineWidth=5;ctx.beginPath();ctx.arc(256,870,30+(p-.12)*600,0,Math.PI*2);ctx.stroke();}ctx.fillStyle='#A6B8C9';ctx.font='19px system-ui';ctx.fillText(t.demo,256,978,470);texture.needsUpdate=true;}
 update(0);return{group,update};
}
export function createPrinter(t:CinematicText,qr:HTMLCanvasElement){
 const group=new T.Group();const shell=metal('#243647',.4,.55),black=metal('#050a10',.65,.2);box(group,[1.35,.68,.95],[0,.34,0],shell,.14);box(group,[1.17,.14,.72],[0,.72,0],black,.06);box(group,[1.05,.035,.13],[0,.81,.12],black,.015);
 const roller=mesh(new T.CylinderGeometry(.047,.047,1.04,24),metal('#586775'),group,[0,.82,.12]);roller.rotation.z=Math.PI/2;
 const indicator=new T.MeshStandardMaterial({color:'#EAC080',emissive:'#EAC080',emissiveIntensity:0});mesh(new T.SphereGeometry(.026,12,8),indicator,group,[.45,.8,-.18]);
 const button=mesh(new T.CylinderGeometry(.065,.065,.02,20),black,group,[-.43,.8,-.18]);button.rotation.x=.05;
 for(let i=0;i<12;i++)box(group,[.025,.13,.012],[-.4+i*.074,.4,.479],black,.005);
 const canvas=document.createElement('canvas');canvas.width=512;canvas.height=900;const c=canvas.getContext('2d')!;c.fillStyle='#fffdf7';c.fillRect(0,0,512,900);c.fillStyle='#172839';c.textAlign='center';c.font='bold 34px system-ui';c.fillText('JOUW DRIVER',256,70);c.font='22px system-ui';c.fillText(t.receipt,256,118,470);c.font='22px monospace';['DEMO–018','Bruxelles / Brussel','8.4 km · 18 min','------------------------','TOTAL    € 24.80'].forEach((s,i)=>c.fillText(s,256,188+i*55));c.drawImage(qr,146,490,220,220);c.font='19px system-ui';c.fillText(t.demo,256,768,470);c.fillText(t.email,256,826,460);
 const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;
 const paper=new T.Group();paper.position.set(0,.82,.12);group.add(paper);const sheet=mesh(new T.PlaneGeometry(.94,1.65,1,24),new T.MeshStandardMaterial({map:texture,side:T.DoubleSide,roughness:.9}),paper,[0,.825,0]);sheet.rotation.x=-.18;paper.scale.y=.001;
 const branding=mesh(new T.PlaneGeometry(.74,.1),new T.MeshBasicMaterial({map:textTexture('JOUW DRIVER')}),group,[0,.58,.48]);branding.rotation.x=-.1;
 return{group,paper,indicator,roller};
}
