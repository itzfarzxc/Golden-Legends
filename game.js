'use strict';
const $=i=>document.getElementById(i),AS=window.AS,UI=AS.ui;
const DEF={sv:2,sens:2,size:.82,swap:0,inv:0,aim:1,gfx:1,dist:7.5,vol:.8,mus:.7,sfx:.8,fps:0,vib:1,lang:'id',kb:0,lay:{},rd:3,vd:1};
let S={name:'Pengembara',lv:1,xp:0,coins:0,unlocked:['aldric'],hero:'aldric',stage:1,mi:0,mode:'story',cfg:{...DEF}};
try{const r=JSON.parse(localStorage.getItem('gl3'));if(r)S={...S,...r,cfg:{...DEF,...(r.cfg||{})}}}catch(e){}
if(S.cfg.sv!==2){S.cfg.sens=2;S.cfg.sv=2}
if(S.cfg.v!==2){S.cfg.rd=3;S.cfg.vd=1;S.cfg.gfx=1;S.cfg.v=2}
const save=()=>{try{localStorage.setItem('gl3',JSON.stringify(S))}catch(e){}};
const ORDER=['aldric','brakk','sylva','merlin','rowan'];
const H={
aldric:{n:'Aldric',t:'The Knight',role:'Tank / Fighter',f:'Knight',hp:420,spd:6,atk:24,w:'sword',rng:0,lore:'Ksatria terakhir Kerajaan Emas, bersumpah menjaga reruntuhan.',
 sk:[['Shield Charge','charge',5,'Menerjang dengan perisai: damage + stun singkat'],['Royal Guard','guard',9,'Pertahanan: damage musuh berkurang'],["King's Judgment",'slam',16,'Melompat ke target, hantam tanah: damage area besar']]},
brakk:{n:'Brakk',t:'The Berserker',role:'Heavy Fighter / Damage',f:'Barbarian',hp:380,spd:6.4,atk:30,w:'axe',rng:0,lore:'Barbarian utara yang haus pertempuran.',
 sk:[['Savage Spin','spin',5,'Berputar mengayunkan kapak ke sekitar'],['Berserk Rush','rush',7,'Dash ke depan dengan serangan kuat'],['Wrath of Titans','quake',17,'Menghantam tanah berkali-kali: gelombang area']]},
sylva:{n:'Sylva',t:'The Shadow',role:'Assassin / Mobility',f:'Rogue_Hooded',hp:300,spd:7.4,atk:20,w:'dagger',rng:0,lore:'Pengintai berjubah hijau yang tak meninggalkan jejak.',
 sk:[['Twin Slash','twin',3.5,'Serangan cepat dua bilah'],['Shadow Blink','blink',6,'Menghilang & berpindah lokasi'],['Phantom Dance','phantom',15,'Teleportasi + tebasan ke beberapa musuh']]},
merlin:{n:'Merlin',t:'The Wizard',role:'Mage / AoE',f:'Mage',hp:270,spd:5.8,atk:26,w:'staff',rng:1,lore:'Penyihir tua penjaga pengetahuan kuno.',
 sk:[['Arcane Bolt','bolt',3,'Proyektil sihir ke arah musuh'],['Mystic Portal','blink',7,'Blink ke lokasi yang ditentukan'],['Meteor Storm','meteor',18,'Memanggil hujan meteor di area target']]},
rowan:{n:'Rowan',t:'The Ranger',role:'Ranged / Precision',f:'Ranger',hp:300,spd:6.6,atk:22,w:'bow',rng:1,lore:'Pemanah petualang dari hutan perbatasan.',
 sk:[['Piercing Arrow','pierce',4,'Panah menembus beberapa musuh'],['Wind Dash','back',6,'Melompat mundur menjaga jarak'],['Rain of Arrows','rain',16,'Menghujani area dengan panah']]}
};
const ICO={charge:'i_sword',guard:'i_shield',slam:'i_star',spin:'i_sword',rush:'i_jump',quake:'i_star',twin:'i_sword',blink:'i_jump',phantom:'i_star',bolt:'i_target',meteor:'i_star',pierce:'i_target',back:'i_jump',rain:'i_star'};
const du=k=>'data:image/webp;base64,'+UI[k],ic=(k,t)=>UI[k]?`<img class="ic" src="${du(k)}">`:`<b>${t||''}</b>`;
// ---------- audio
let AC;function snd(f,t,d,v,f2){if(!S.cfg.vol)return;try{AC=AC||new(window.AudioContext||window.webkitAudioContext)();const o=AC.createOscillator(),g=AC.createGain(),n=AC.currentTime;o.type=t||'sine';o.frequency.setValueAtTime(f,n);if(f2)o.frequency.exponentialRampToValueAtTime(f2,n+d);g.gain.setValueAtTime((v||.07)*S.cfg.vol*S.cfg.sfx,n);g.gain.exponentialRampToValueAtTime(.001,n+d);o.connect(g);g.connect(AC.destination);o.start();o.stop(n+d)}catch(e){}}
// ---------- three
const cv=$('c'),R=new THREE.WebGLRenderer({canvas:cv,antialias:true,powerPreference:'high-performance'});R.outputEncoding=THREE.sRGBEncoding;R.toneMapping=THREE.ACESFilmicToneMapping;R.toneMappingExposure=1.05;
const sc=new THREE.Scene(),cam=new THREE.PerspectiveCamera(55,1,.3,500);
const lin=h=>new THREE.Color(h).convertSRGBToLinear();
sc.add(new THREE.HemisphereLight(lin(0xdcebff),lin(0x56683f),1.0));
const sun=new THREE.DirectionalLight(lin(0xfff6e6),1.1);sun.position.set(60,90,40);sc.add(sun);
function resize(){R.setPixelRatio(Math.min(devicePixelRatio||1,S.cfg.gfx?1.6:1));R.setSize(innerWidth,innerHeight);cam.aspect=innerWidth/innerHeight;cam.updateProjectionMatrix()}
addEventListener('resize',resize);
const ss=(a,b,x)=>{const t=Math.min(1,Math.max(0,(x-a)/(b-a)));return t*t*(3-2*t)};
const b64buf=b=>{if(b instanceof ArrayBuffer)return b;const s=atob(b),u=new Uint8Array(s.length);for(let i=0;i<s.length;i++)u[i]=s.charCodeAt(i);return u.buffer};
// ---------- terrain
const WR=236,CH_=64;
const PADS=[{x:0,z:0,r:9},{x:72,z:-38,r:22},{x:-62,z:-60,r:28}];
const HILLS=[[-35,18,19,8],[30,38,21,10],[-12,-45,18,7],[50,8,17,6],[-72,34,24,10],[10,72,20,8],[85,-75,21,9],[-90,-20,19,8],[40,-8,12,4],[120,-80,24,10],[-110,60,22,9],[0,140,24,10],[140,150,22,8],[-60,-130,24,9]];
function raw(x,z){const d=Math.hypot(x,z),a=Math.atan2(z,x);
 const n=Math.sin(x*.03+1)*Math.cos(z*.035)*.5+Math.sin(x*.07+z*.05)*.3+Math.sin(z*.09-x*.04+2)*.2;
 const n2=Math.sin(x*.055+z*.04+3)*Math.cos(z*.06-x*.03)*.5+Math.sin(x*.1-z*.085+1)*.3,n3=Math.sin(x*.16+z*.13)*Math.cos(z*.15-x*.1)*.5;
 let h=(n*.5+.5)*7+(n2*.5+.5)*5+n3*.6;
 for(const q of HILLS){const dx=x-q[0],dz=z-q[1];h+=q[3]*Math.exp(-(dx*dx+dz*dz)/(2*q[2]*q[2]))}
 return h*(.55+.45*ss(0,22,d))+ss(165,250,d)*28*(1+.25*Math.sin(a*5+n))}
const rxc=z=>150+32*Math.sin(z*.011+.8)+14*Math.sin(z*.027+2);
const PLAT=[[rxc(-200),-200,48,13,0],[-150,-130,46,14,.6],[-165,115,36,10,2.2]];
function plat(x,z){let s=0;for(const q of PLAT){const dx=x-q[0],dz=z-q[1],d=Math.hypot(dx,dz);if(d>q[2]+70)continue;const th=Math.atan2(dz,dx),n=Math.sin(th*3+q[0]*.1)*5+Math.sin(th*7+q[1]*.05)*2.5;let ra=Math.abs(th-q[4]);ra=Math.min(ra,6.2832-ra);const w=3+Math.max(0,1-ra/.45)*34;s+=q[3]*(1-ss(q[2]+n-w,q[2]+n,d))}return s}
PADS.forEach(p=>p.h=raw(p.x,p.z)+plat(p.x,p.z));
function base0(x,z){let h=raw(x,z)+plat(x,z);for(const p of PADS){const k=1-ss(p.r,p.r*(p.r<12?4.4:3.1),Math.hypot(x-p.x,z-p.z));if(k>0)h=h*(1-k)+p.h*k}return h}
const LAKES=[[rxc(125),125,24],[-10,205,20]].map(([x,z,r])=>{let m=1e9;for(let i=0;i<10;i++)m=Math.min(m,base0(x+Math.cos(i*.628)*r*1.4,z+Math.sin(i*.628)*r*1.4));return{x,z,r,lv:m-.6}});
const RZ=[];(function(){let w=1e9;for(let z=-238;z<=132;z+=2){w=Math.min(base0(rxc(z),z)-.7,w-.03);RZ.push(w)}})();
let ZF=-150;(function(){let b=0;for(let i=0;i<RZ.length-1;i++){const d=RZ[i]-RZ[i+1];if(d>b){b=d;ZF=-238+i*2+1}}})();
const Ws=z=>{const f=(z+238)/2,i=Math.max(0,Math.min(RZ.length-2,Math.floor(f))),t=Math.max(0,Math.min(1,f-i));return Math.max(RZ[i]*(1-t)+RZ[i+1]*t,LAKES[0].lv)},RW=z=>5+3*ss(-100,100,z);
const ROADS=[[[0,12],[30,-5],[60,-20],[72,-38]],[[0,12],[-25,-20],[-50,-45],[-62,-60]],[[0,12],[15,45],[18,60]]];
function roadInfo(x,z){let best=1e9,lat=0,s=0;for(const R of ROADS){let acc=0;for(let i=0;i<R.length-1;i++){const ax=R[i][0],az=R[i][1],dx=R[i+1][0]-ax,dz=R[i+1][1]-az,len=Math.hypot(dx,dz),t=Math.max(0,Math.min(1,((x-ax)*dx+(z-az)*dz)/(len*len))),px=ax+dx*t-x,pz=az+dz*t-z,d=Math.hypot(px,pz);if(d<best){best=d;lat=((x-ax)*dz-(z-az)*dx)/len;s=acc+t*len}acc+=len}}return[best,lat,s]}
function roadD(x,z){return roadInfo(x,z)[0]}
function H0(x,z){let h=base0(x,z);
 if(z>-238&&z<132){const dx=Math.abs(x-rxc(z)),w=RW(z);if(dx<w*3.2){const e=ss(-238,-226,z)*(1-ss(118,132,z)),ws=Ws(z),bank=ws+.35+Math.max(0,dx-w)*.38;h=h+(Math.max(h,bank)-h)*e;const k=(1-ss(w*.6,w,dx))*e;h=h*(1-k)+(ws-1.3)*k}}
 for(const L of LAKES){const dd=Math.hypot(x-L.x,z-L.z);if(dd<L.r*1.5){const k=1-ss(L.r*.5,L.r*1.5,dd);h=h*(1-k)+(L.lv-2.6)*k}}
 return h}
function wetDepth(x,z){let m=-9;for(const L of LAKES){const dd=Math.hypot(x-L.x,z-L.z);if(dd<L.r*1.5)m=Math.max(m,L.lv-H0(x,z))}
 if(z>-238&&z<130){const dx=Math.abs(x-rxc(z));if(dx<RW(z)*1.1)m=Math.max(m,Ws(z)-H0(x,z))}return m}
function terrain(){const g=new THREE.PlaneGeometry(400,400,160,160);g.rotateX(-Math.PI/2);const p=g.attributes.position,col=new Float32Array(p.count*3),c=new THREE.Color();
 for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i),h=H0(x,z),d=Math.hypot(x,z);p.setY(i,h);const t=Math.min(1,h/20),n=Math.sin(x*.11)*Math.cos(z*.09),f=ss(70,120,d);
  c.setHSL(.27-.03*t+.012*n,.40-.08*f,.30+.08*t-.07*f+.02*n);c.convertSRGBToLinear();col[i*3]=c.r;col[i*3+1]=c.g;col[i*3+2]=c.b}
 g.setAttribute('color',new THREE.BufferAttribute(col,3));g.computeVertexNormals();sc.add(new THREE.Mesh(g,new THREE.MeshLambertMaterial({vertexColors:true})))}
// ---------- models
const MD={},CH={},ANIM={},SPR=[];
function parseG(d,cb){try{new THREE.GLTFLoader().parse(d,'',g=>cb(g),e=>{console.warn(e);cb(null)})}catch(e){console.warn(e);cb(null)}}
function bake(s){const parts=[];s.updateMatrixWorld(true);s.traverse(o=>{if(!o.isMesh)return;const g=o.geometry.clone().applyMatrix4(o.matrixWorld),m=o.material;m.roughness=1;m.metalness=0;parts.push({g,m})});
 const b=new THREE.Box3();parts.forEach(p=>{p.g.computeBoundingBox();b.union(p.g.boundingBox)});const cx=(b.min.x+b.max.x)/2,cz=(b.min.z+b.max.z)/2;
 parts.forEach(p=>p.g.translate(-cx,-b.min.y,-cz));const hh=b.max.y-b.min.y;let br=0,rr=0;parts.forEach(p=>{const a=p.g.attributes.position;for(let i=0;i<a.count;i++){const y=a.getY(i),r=Math.hypot(a.getX(i),a.getZ(i));if(y<hh*.14)br=Math.max(br,r);if(y<hh*.7)rr=Math.max(rr,r)}});return{parts,w:b.max.x-b.min.x,d:b.max.z-b.min.z,h:hh,br,rr,tri:parts.reduce((s,p)=>s+(p.g.index?p.g.index.count:p.g.attributes.position.count)/3,0)}}
function loadAll(done){const jobs=[];
 Object.keys(AS.gl).forEach(k=>jobs.push(cb=>parseG(b64buf(AS.gl[k]),g=>{if(g)MD[k]=bake(g.scene);cb()})));
 Object.keys(AS.ch).forEach(k=>jobs.push(cb=>parseG(b64buf(AS.ch[k]),g=>{if(g)CH[k]=g.scene;cb()})));
 Object.keys(AS.sk||{}).forEach(k=>jobs.push(cb=>parseG(b64buf(AS.sk[k]),g=>{if(g)SK[k]=g.scene;cb()})));
 Object.keys(AS.an).forEach(k=>jobs.push(cb=>parseG(b64buf(AS.an[k]),g=>{if(g)g.animations.forEach(a=>ANIM[a.name]=a);cb()})));
 Object.keys(AS.spr).forEach(k=>jobs.push(cb=>{const im=new Image();im.onload=()=>{const t=new THREE.Texture(im);t.needsUpdate=true;SPR.push(t);cb()};im.onerror=()=>cb();im.src='data:image/webp;base64,'+AS.spr[k]}));
 jobs.push(cb=>{const im=new Image();im.onload=()=>{const t=new THREE.Texture(im);t.mapping=THREE.EquirectangularReflectionMapping;t.encoding=THREE.sRGBEncoding;t.needsUpdate=true;sc.background=t;cb()};im.onerror=()=>cb();im.src='data:image/jpeg;base64,'+AS.sky});
 let n=jobs.length;jobs.forEach(j=>j(()=>{$('lb').style.width=(100*(1-n/jobs.length+1/jobs.length)|0)+'%';if(--n===0)done()}))}
const INST={},COLc=[],BOX=[],OBB=[],IA=[];
const addI=(k,x,z,t,byW,ry)=>{const m=MD[k];if(!m)return;(INST[k]=INST[k]||[]).push([x,z,t/(byW?m.w:m.h),ry===undefined?Math.random()*6.28:ry])};
function flush(){const M=new THREE.Matrix4(),q=new THREE.Quaternion(),v=new THREE.Vector3(),sv=new THREE.Vector3(),Y=new THREE.Vector3(0,1,0);
 for(const k in INST){const L=INST[k];MD[k].parts.forEach(p=>{const im=new THREE.InstancedMesh(p.g,p.m,L.length);L.forEach((a,i)=>{q.setFromAxisAngle(Y,a[3]);M.compose(v.set(a[0],H0(a[0],a[1])-.08,a[1]),q,sv.setScalar(a[2]));im.setMatrixAt(i,M)});im.frustumCulled=false;sc.add(im)})}}
function put(k,x,z,ry,t,y0){const m=MD[k];if(!m)return null;const g=new THREE.Group(),s=t?t/m.h:1;m.parts.forEach(p=>g.add(new THREE.Mesh(p.g,p.m)));g.scale.setScalar(s);g.rotation.y=ry||0;g.position.set(x,(y0===undefined?H0(x,z):y0),z);sc.add(g);g.userData.s=s;return g}
// ---------- world
const RUIN={x:72,z:-38},FORT={x:-62,z:-60};
function ring(cx,cz,n,gap,col){const m=MD.wall;if(!m)return;const u=m.w,d=m.d,half=n*u/2;
 for(let side=0;side<4;side++)for(let i=0;i<n;i++){if(side===2&&gap&&i===(n>>1))continue;
  const t=-half+u*(i+.5);let x,z,ry;
  if(side===0){x=cx+t;z=cz-half;ry=0}else if(side===2){x=cx+t;z=cz+half;ry=Math.PI}else if(side===1){x=cx+half;z=cz+t;ry=Math.PI/2}else{x=cx-half;z=cz+t;ry=-Math.PI/2}
  put('wall',x,z,ry,0);const hx=(side%2?d:u)/2,hz=(side%2?u:d)/2;BOX.push({x0:x-hx,x1:x+hx,z0:z-hz,z1:z+hz,y:H0(x,z),h:m.h})}
 [[-1,-1],[1,-1],[1,1],[-1,1]].forEach(([a,b])=>{const x=cx+a*half,z=cz+b*half;const mc=MD.barrier_column;put('barrier_column',x,z,0,0);COLc.push({x,z,r:mc?mc.w/2:.9,y:H0(x,z),h:mc?mc.h:3})})}
const TORCH=[];let beam=null;
function buildWorld(){let sd=11;const rnd=()=>(sd=sd*16807%2147483647)/2147483647;
 ring(RUIN.x,RUIN.z,5,true);ring(FORT.x,FORT.z,8,true);
 // props
 const prop=(k,x,z,ry,t,r)=>{const g=put(k,x,z,ry,t);if(r&&g){const m=MD[k],s=g.userData.s;OBB.push({x,z,hx:m.w*s/2,hz:m.d*s/2,c:Math.cos(ry),s:Math.sin(ry),y:H0(x,z),h:m.h*s})}};
 prop('crates_stacked',RUIN.x+6,RUIN.z-5,.4,1.8,1.1);prop('barrel_large',RUIN.x-6,RUIN.z+5,0,1.4,.8);prop('table_medium',RUIN.x+5,RUIN.z+6,1.2,1.1,1.3);prop('banner_shield_white',RUIN.x,RUIN.z-9.2,0,2.6);
 prop('crates_stacked',FORT.x+9,FORT.z+8,.2,1.8,1.1);prop('keg',FORT.x-9,FORT.z+7,0,1.1,.7);prop('barrel_large',FORT.x-11,FORT.z+9,0,1.4,.8);prop('coin_stack_large',FORT.x+3,FORT.z-10,0,.9);prop('Gold_Bars_Stack_Small',FORT.x-4,FORT.z-10,.5,.8);prop('Wood_Log_Stack',RUIN.x+9,RUIN.z+7,.3,1);prop('banner_shield_white',FORT.x,FORT.z-14.5,0,3.2);
 prop('table_medium',6,-8,.3,1.1,1.2);prop('crates_stacked',-7,-6,.8,1.6,1);prop('barrel_large',-9,-8,0,1.3,.8);prop('candle',6,-8,0,.4);
 // torches (objective stage 2)
 [[-5,-3],[5,-3],[0,4.5]].forEach(([dx,dz],i)=>{const x=RUIN.x+dx,z=RUIN.z+dz,pil=put('barrier_column',x,z,0,2.4);COLc.push({x,z,r:MD.barrier_column?MD.barrier_column.w*(2.4/MD.barrier_column.h)/2:.8,y:H0(x,z),h:2.4});
  const fl=new THREE.Sprite(new THREE.SpriteMaterial({map:SPR[3%Math.max(1,SPR.length)]||null,color:lin(0xffa040),transparent:true,blending:THREE.AdditiveBlending,depthWrite:false}));fl.scale.setScalar(2.2);fl.position.set(x,H0(x,z)+3.1,z);fl.visible=S.stage>2;sc.add(fl);
  const o={x,z,r:3.2,label:'Nyalakan Obor',gone:S.stage>2,fl,fn(){this.gone=true;this.fl.visible=true;G.torch++;snd(520,'triangle',.3,.09,880);spark(this.x,H0(x,z)+3,this.z,0xffa040,18,4,.8,1.2);if(G.torch>=3)advance(3)}};IA.push(o)});
 // chests
 [[20,26],[-34,18],[44,-6],[-20,-48],[88,-10],[-90,10],[FORT.x+5,FORT.z+6],[RUIN.x-3,RUIN.z+2]].forEach(([x,z],i)=>{const g=put('chest_gold',x,z,rnd()*6,1.1);COLc.push({x,z,r:.7});IA.push({x,z,r:2.6,label:'Buka Peti',gone:false,fn(){this.gone=true;const c=40+(rnd()*80|0);S.coins+=c;pop(new THREE.Vector3(x,H0(x,z)+1.5,z),'+'+c+' coin','#e6d27a');snd(660,'triangle',.2,.08,990);spark(x,H0(x,z)+1,z,0xffd060,14,4,.7,1);save();hudRefresh()}})});
 // lore scrolls -> unlock heroes
 [[30,-28],[-40,-22],[18,60],[-70,36]].forEach(([x,z],i)=>{const hid=ORDER[i+1],m=new THREE.Mesh(new THREE.CylinderGeometry(.18,.18,.9,10),new THREE.MeshLambertMaterial({color:lin(0xe8dcc0),emissive:lin(0x6a5a30)}));m.rotation.z=Math.PI/2;m.position.set(x,H0(x,z)+.8,z);sc.add(m);
  const gl=new THREE.Sprite(new THREE.SpriteMaterial({map:SPR[2]||null,color:lin(0xd8d0a0),transparent:true,blending:THREE.AdditiveBlending,depthWrite:false}));gl.scale.setScalar(2.6);gl.position.copy(m.position);sc.add(gl);
  IA.push({x,z,r:2.8,label:'Baca Gulungan Lore',hid,gone:S.unlocked.includes(hid),m,gl,fn(){this.gone=true;this.m.visible=this.gl.visible=false;if(!S.unlocked.includes(hid)){S.unlocked.push(hid);save();banner('Pahlawan baru: '+H[hid].n+' — '+H[hid].t,H[hid].lore);snd(440,'triangle',.5,.1,990)}}});
  if(S.unlocked.includes(hid)){m.visible=gl.visible=false}});
 beam=new THREE.Mesh(new THREE.CylinderGeometry(.7,.7,60,10,1,true),new THREE.MeshBasicMaterial({color:lin(0xf4f0d0),transparent:true,opacity:.28,side:THREE.DoubleSide,depthWrite:false}));sc.add(beam)}
// ---------- player
const P={root:new THREE.Group(),model:null,mix:null,cur:null,cn:'',hp:1,mhp:1,cd:[0,0,0,0],atk:0,vy:0,air:false,face:0,busy:0,inv:0,guard:0,dash:null,leap:null,yaw:0,pitch:.35,mv:false,dead:0,swapCd:0,vx:0,vz:0,at:0,run:0};sc.add(P.root);
const HPm={};let MODE='load',G={k:0,torch:0},T=0,shake=0;
const stat=id=>({mhp:H[id].hp*(1+.12*(S.lv-1)),atk:H[id].atk*(1+.08*(S.lv-1))});
function play(n,o){o=o||{};const c=ANIM[n];if(!c||!P.mix)return;const a=P.mix.clipAction(c);a.reset();a.setLoop(o.once?THREE.LoopOnce:THREE.LoopRepeat);a.clampWhenFinished=!!o.once;a.timeScale=o.speed||1;a.fadeIn(.22).play();if(P.cur&&P.cur!==a)P.cur.fadeOut(.22);P.cur=a;P.cn=n}
function act(n,t,sp){P.busy=t;play(n,{once:true,speed:sp||1})}
const mat=(c,e)=>new THREE.MeshLambertMaterial({color:lin(c),emissive:e?lin(e):0});
function gear(m,w){const Rh=m.getObjectByName('handslot.r'),Lh=m.getObjectByName('handslot.l'),bx=(a,b,c,col,y,z)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(a,b,c),mat(col));o.position.set(0,y||0,z||0);return o},g=new THREE.Group();
 if(w==='sword'){g.add(bx(.07,.95,.02,0xd5dbe5,.55),bx(.34,.05,.07,0x8a6a2a,.08),bx(.05,.2,.05,0x4a3320,-.05));Rh&&Rh.add(g);const s=new THREE.Group(),d=new THREE.Mesh(new THREE.CylinderGeometry(.42,.42,.07,16),mat(0x6e7380));d.rotation.z=Math.PI/2;s.add(d);const r=new THREE.Mesh(new THREE.CylinderGeometry(.14,.14,.09,10),mat(0xb09040));r.rotation.z=Math.PI/2;s.add(r);s.position.set(-.1,0,0);Lh&&Lh.add(s)}
 else if(w==='axe'){g.add(bx(.06,1.1,.06,0x6b4a2a,.5),bx(.5,.3,.06,0x9aa0aa,.98),bx(.1,.4,.07,0x555a64,.98));Rh&&Rh.add(g)}
 else if(w==='dagger'){[Rh,Lh].forEach(h=>{if(!h)return;const d=new THREE.Group();d.add(bx(.05,.5,.015,0xc8d0d8,.3),bx(.16,.03,.04,0x333a33,.05));h.add(d)})}
 else if(w==='staff'){g.add(bx(.05,1.6,.05,0x5a3a20,.7));const o=new THREE.Mesh(new THREE.SphereGeometry(.16,10,8),new THREE.MeshBasicMaterial({color:lin(0x9ad0ff)}));o.position.y=1.55;g.add(o);Rh&&Rh.add(g)}
 else if(w==='bow'){const b=new THREE.Mesh(new THREE.TorusGeometry(.5,.025,6,16,Math.PI),mat(0x6b4a2a));b.rotation.z=-Math.PI/2;b.position.set(0,.2,0);g.add(b);g.add(bx(.01,1,.01,0xdddddd,.2));Lh&&Lh.add(g)}}
function setHero(id){const h=H[id],m=CH[h.f];if(!m)return;if(P.model)P.root.remove(P.model);S.hero=id;P.model=m;m.rotation.order='YXZ';P.root.add(m);P.mix=new THREE.AnimationMixer(m);P.cur=null;if(!m.userData.armed){m.userData.armed=1;gear(m,h.w)}
 const st=stat(id);P.mhp=st.mhp;P.hp=Math.min(P.mhp,HPm[id]===undefined?P.mhp:HPm[id]);play('Idle_A');save();hudSkills()}
// ---------- fx
const FX=[],PT=[],Q=[];const later=(t,f)=>Q.push({t,f});
function spark(x,y,z,col,n,sp,life,size){for(let i=0;i<n;i++){const s=new THREE.Sprite(new THREE.SpriteMaterial({map:SPR[(Math.random()*SPR.length)|0]||null,color:lin(col),transparent:true,blending:THREE.AdditiveBlending,depthWrite:false}));s.position.set(x,y,z);s.scale.setScalar(size*(.6+Math.random()*.8));const a=Math.random()*6.283;PT.push({s,vx:Math.cos(a)*sp*Math.random(),vy:sp*(.3+Math.random()),vz:Math.sin(a)*sp*Math.random(),t:life,T:life});sc.add(s)}}
function fxRing(x,z,r,col,life,op){const m=new THREE.Mesh(new THREE.RingGeometry(r*.8,r,40),new THREE.MeshBasicMaterial({color:lin(col),transparent:true,opacity:op||.7,side:THREE.DoubleSide,depthWrite:false}));m.rotation.x=-Math.PI/2;m.position.set(x,H0(x,z)+.2,z);sc.add(m);FX.push({m,t:life,T:life,k:.5,o:op||.7})}
function fxSlash(col,big){const g=new THREE.Group(),p=P.root.position;g.position.set(p.x,p.y+1.1,p.z);g.rotation.y=P.face;[[1.0,big?3.2:2.5,col],[1.5,big?2.8:2.2,0xffffff]].forEach(([i,o,c])=>{const m=new THREE.Mesh(new THREE.RingGeometry(i,o,24,1,-1,2),new THREE.MeshBasicMaterial({color:lin(c),transparent:true,opacity:.85,side:THREE.DoubleSide,depthWrite:false}));m.rotation.set(-Math.PI/2,0,-Math.PI/2);g.add(m)});sc.add(g);FX.push({m:g,t:.22,T:.22,k:.8,o:.85})}
function pillar(x,z,r,col,life){const m=new THREE.Mesh(new THREE.CylinderGeometry(r*.5,r*.5,10,16,1,true),new THREE.MeshBasicMaterial({color:lin(col),transparent:true,opacity:.5,side:THREE.DoubleSide,depthWrite:false}));m.position.set(x,H0(x,z)+5,z);sc.add(m);FX.push({m,t:life,T:life,k:.3,o:.5})}
function pop(v,txt,col){const p=v.clone().project(cam);if(p.z>1)return;const d=document.createElement('div');d.className='pp';d.textContent=txt;d.style.color=col||'#fff';d.style.left=((p.x+1)/2*innerWidth)+'px';d.style.top=((1-p.y)/2*innerHeight)+'px';document.body.appendChild(d);setTimeout(()=>d.remove(),700)}
function banner(a,b){const e=$('bn');e.innerHTML='<b>'+a+'</b><small>'+(b||'')+'</small>';e.classList.add('on');clearTimeout(banner.t);banner.t=setTimeout(()=>e.classList.remove('on'),3600)}
// ---------- enemies
const E=[],PR=[];
function spawnE(x,z,boss){const g=new THREE.Group(),s=boss?2.4:1,col=boss?0x7a3a30:[0x5e7a5a,0x7a5a5a,0x5a6a8a,0x6a5a7a][(Math.random()*4)|0],bm=mat(col),body=new THREE.Mesh(new THREE.SphereGeometry(.7*s,14,10),bm);body.scale.y=.9;body.position.y=.65*s;g.add(body);
 [-.25,.25].forEach(a=>{const e=new THREE.Mesh(new THREE.SphereGeometry(.12*s,8,6),new THREE.MeshBasicMaterial({color:0xffe8a0}));e.position.set(a*s,.8*s,.6*s);g.add(e)});
 if(boss)[-1,1].forEach(a=>{const h=new THREE.Mesh(new THREE.ConeGeometry(.2*s,.8*s,6),mat(0xe0d8b0));h.position.set(a*.5*s,1.5*s,0);h.rotation.z=-a*.4;g.add(h)});
 g.position.set(x,H0(x,z),z);sc.add(g);const hp=(boss?900:60+S.lv*8);E.push({m:g,bm,hp,max:hp,spd:boss?3.2:3+Math.random(),dmg:boss?22:7+S.lv,r:.8*s,st:0,cd:1,fl:0,boss,xp:boss?200:20,ph:Math.random()*6,wave:0})}
function nearest(rng,fx,fz){let b=null,bd=rng*rng;const p=P.root.position;fx=fx===undefined?p.x:fx;fz=fz===undefined?p.z:fz;for(const e of E){const dx=e.m.position.x-fx,dz=e.m.position.z-fz,d=dx*dx+dz*dz;if(d<bd){bd=d;b=e}}return b}
function dmgE(e,d,stun){e.hp-=d;e.fl=.12;pop(e.m.position.clone().setY(e.m.position.y+1.6*e.r),Math.round(d),'#ffffff');if(stun)e.st=Math.max(e.st,stun);sfx(.85+Math.random()*.35,.55);spark(e.m.position.x,e.m.position.y+1,e.m.position.z,0xffd890,4,3,.3,.8);if(e.hp<=0)killE(e)}
function area(x,z,r,d,stun){E.slice().forEach(e=>{if(Math.hypot(e.m.position.x-x,e.m.position.z-z)<r+e.r)dmgE(e,d,stun)})}
function killE(e){sc.remove(e.m);E.splice(E.indexOf(e),1);S.xp+=e.xp;S.coins+=e.boss?300:5;while(S.xp>=50*S.lv){S.xp-=50*S.lv;S.lv++;const st=stat(S.hero);P.mhp=st.mhp;P.hp=P.mhp;banner('Level '+S.lv,'HP dan damage meningkat')}
 spark(e.m.position.x,e.m.position.y+1,e.m.position.z,0xffffff,10,4,.6,1);if(S.stage===1){G.k++;if(G.k>=8)advance(2)}else if(e.boss){advance(4)}save();hudRefresh()}
function advance(n){if(S.stage>=n)return;S.stage=n;save();snd(520,'triangle',.5,.1,1040);banner(n===2?'Stage 2 — Reruntuhan':n===3?'Stage 3 — Benteng Raja':'Dunia Terbuka','Stage selesai! '+(n===4?'Jelajahi & cari gulungan lore.':'Ikuti pilar cahaya.'));if(n===2)G.torch=0;if(n===4)S.coins+=500;hudRefresh()}
function hurtP(d){if(P.inv>0||P.dead>0)return;d*=P.guard>0?.35:1;P.hp-=d;HPm[S.hero]=P.hp;shake=.25;pop(P.root.position.clone().setY(P.root.position.y+2),Math.round(d),'#ff9a9a');snd(120,'sawtooth',.12,.08,60);if(S.cfg.vib&&navigator.vibrate)navigator.vibrate(30);
 if(P.hp<=0){P.dead=2.2;act('Death_A',2.2,1);P.busy=2.2;banner('Terkapar...','Bangkit di titik awal')}else if(P.busy<=0){act('Hit_A',.3,1.4)}}
// ---------- input
const JOY={x:0,y:0};let jp=null;
function bindJoy(){const w=$('joy'),n=$('nub');const set=(e)=>{const r=w.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2,m=r.width*.34;let dx=e.clientX-cx,dy=e.clientY-cy;const d=Math.hypot(dx,dy);if(d>m){dx*=m/d;dy*=m/d}n.style.transform=`translate(${dx}px,${dy}px)`;JOY.x=dx/m;JOY.y=dy/m};
 w.addEventListener('pointerdown',e=>{jp=e.pointerId;w.setPointerCapture(e.pointerId);set(e)});w.addEventListener('pointermove',e=>{if(e.pointerId===jp)set(e)});
 const up=e=>{if(e.pointerId===jp){jp=null;JOY.x=JOY.y=0;n.style.transform=''}};w.addEventListener('pointerup',up);w.addEventListener('pointercancel',up)}
let cp=null,cx0=0,cy0=0;
cv.addEventListener('pointerdown',e=>{if(MODE==='play'&&cp===null&&(S.cfg.swap?e.clientX<innerWidth*.55:e.clientX>innerWidth*.45)){cp=e.pointerId;cx0=e.clientX;cy0=e.clientY}});
addEventListener('pointermove',e=>{if(e.pointerId===cp){const k=.006*S.cfg.sens;P.yaw-=(e.clientX-cx0)*k;P.pitch=Math.max(-.15,Math.min(1.35,P.pitch+(e.clientY-cy0)*k*(S.cfg.inv?-1:1)));cx0=e.clientX;cy0=e.clientY}});
addEventListener('pointerup',e=>{if(e.pointerId===cp)cp=null});
const press=(id,f)=>$(id).addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();if(MODE==='play'&&P.dead<=0)f()});
// ---------- combat actions
function castDir(rng){const t=S.cfg.aim?nearest(rng||14):null,p=P.root.position;if(t){const dx=t.m.position.x-p.x,dz=t.m.position.z-p.z,l=Math.hypot(dx,dz)||1;return{x:dx/l,z:dz/l,t,d:l}}
 if(Math.hypot(JOY.x,JOY.y)>.2){const fx=Math.sin(P.yaw),fz=Math.cos(P.yaw),mx=fx*(-JOY.y)-fz*JOY.x,mz=fz*(-JOY.y)+fx*JOY.x,l=Math.hypot(mx,mz)||1;return{x:mx/l,z:mz/l,t:null,d:8}}
 return{x:Math.sin(P.face),z:Math.cos(P.face),t:null,d:8}}
function dashTo(dx,dz,dist,time,dmg,stun,col){P.face=Math.atan2(dx,dz);P.dash={dx,dz,v:dist/time,t:time,hit:new Set(),dmg,stun};P.inv=Math.max(P.inv,time+.1)}
function proj(dx,dz,spd,dmg,col,pierce,size,life){const m=new THREE.Mesh(new THREE.SphereGeometry(size||.3,8,6),new THREE.MeshBasicMaterial({color:lin(col)}));const p=P.root.position;m.position.set(p.x+dx*.8,p.y+1.2,p.z+dz*.8);sc.add(m);PR.push({m,vx:dx*spd,vz:dz*spd,dmg,pierce,hit:new Set(),t:life||1.2})}
function attack(){if(P.atk>0)return;const h=H[S.hero],st=stat(S.hero),d=castDir(h.rng?h.pr:h.ar+2.5),p=P.root.position;P.face=Math.atan2(d.x,d.z);P.atk=h.acd;act('Throw',.35,2.4);snd(300,'sawtooth',.08,.06,120);
 if(h.rng){{const sp=h.w==='bow'?34:24;proj(d.x,d.z,sp,st.atk,h.w==='bow'?0xe8e0c0:0x9ad0ff,false,h.w==='bow'?.14:.3,h.pr/sp)}}else{fxSlash(0xffffff);later(.12,()=>area(p.x+d.x*h.ar*.55,p.z+d.z*h.ar*.55,h.ar*.85,st.atk,0))}}
function skill(i){if(i===3)return regenSkill();const h=H[S.hero],st=stat(S.hero),sk=h.sk[i];if(P.cd[i]>0)return;const cost=[15,20,45][i];if(P.mp<cost){pop(P.root.position.clone().setY(P.root.position.y+2.3),L('Mana kurang|No mana'),'#7aa8ff');return}P.mp-=cost;P.cd[i]=sk[2]*(i===2?.55:.42);const ty=sk[1],d=castDir(i===2?16:12),p=P.root.position,A=st.atk;P.face=Math.atan2(d.x,d.z);
 const cast=(n,t,s)=>act(n||'Throw',t||.5,s||1.6);sfx(.6+i*.25,.6);
 if(ty==='charge'){cast('Throw',.4,2);dashTo(d.x,d.z,9,.28,A*1.6,1.2);fxSlash(0xaab6d0,true)}
 else if(ty==='guard'){cast('Use_Item',.6,1.4);P.guard=5;fxRing(p.x,p.z,2.2,0x90b0ff,.6);spark(p.x,p.y+1,p.z,0x90b0ff,14,3,.6,1)}
 else if(ty==='slam'){cast('Jump_Full_Short',.9,1.2);const tx=d.t?d.t.m.position.x:p.x+d.x*8,tz=d.t?d.t.m.position.z:p.z+d.z*8;P.leap={sx:p.x,sz:p.z,tx,tz,t:0,T:.55};P.inv=.7;later(.55,()=>{area(tx,tz,6.5,A*3.4,1.4);fxRing(tx,tz,6.5,0xffe0a0,.5,.9);pillar(tx,tz,5,0xffe0a0,.4);spark(tx,H0(tx,tz)+.5,tz,0xffe0a0,24,6,.7,1.4);shake=.35;snd(90,'square',.3,.12,40)})}
 else if(ty==='spin'){cast('Throw',.7,2.2);[0,.2,.4].forEach(t=>later(t,()=>{const q=P.root.position;area(q.x,q.z,4.2,A*1.2,.3);fxRing(q.x,q.z,4.2,0xff9a6a,.3);P.face+=2.1;snd(220,'sawtooth',.1,.07,140)}))}
 else if(ty==='rush'){cast('Throw',.4,2);dashTo(d.x,d.z,11,.3,A*2.2,.5);fxSlash(0xff8a5a,true)}
 else if(ty==='quake'){cast('Jump_Full_Short',1.2,1.3);for(let k=0;k<4;k++)later(.3+k*.35,()=>{const q=P.root.position;area(q.x,q.z,5+k*1.6,A*1.6,.6);fxRing(q.x,q.z,5+k*1.6,0xffc070,.5,.8);shake=.25;snd(80,'square',.2,.1,40)})}
 else if(ty==='twin'){cast('Throw',.45,2.6);[0,.14].forEach(t=>later(t,()=>{const q=P.root.position;fxSlash(0xb0ffb0);area(q.x+d.x*1.8,q.z+d.z*1.8,2.6,A*1.1,0)}))}
 else if(ty==='blink'){cast('Use_Item',.35,2);const dist=d.t?Math.min(d.d+1.5,10):9;let sd=0;for(let st=.5;st<=dist;st+=.5){if(blockedAt(p.x+d.x*st,p.z+d.z*st,p.y))break;sd=st}const nx=p.x+d.x*sd,nz=p.z+d.z*sd;spark(p.x,p.y+1,p.z,h.n==='Merlin'?0xa090ff:0x70ff90,16,4,.5,1.2);p.x=nx;p.z=nz;P.inv=.5;spark(nx,H0(nx,nz)+1,nz,h.n==='Merlin'?0xa090ff:0x70ff90,16,4,.5,1.2);fxRing(nx,nz,2,0xa0a0ff,.4)}
 else if(ty==='phantom'){cast('Throw',2,2);const L=E.slice().sort((a,b)=>Math.hypot(a.m.position.x-p.x,a.m.position.z-p.z)-Math.hypot(b.m.position.x-p.x,b.m.position.z-p.z)).slice(0,5);P.inv=.3+L.length*.22;
  L.forEach((e,k)=>later(k*.2,()=>{if(!e.m.parent)return;const q=P.root.position;spark(q.x,q.y+1,q.z,0x70ff90,10,4,.4,1);q.x=e.m.position.x+1.3;q.z=e.m.position.z;P.face=Math.atan2(-1,0);fxSlash(0x70ff90,true);dmgE(e,A*1.8,.5)}));if(!L.length)P.cd[i]=2}
 else if(ty==='bolt'){cast('Throw',.45,2);proj(d.x,d.z,26,A*2.4,0xb090ff,false,.5,1.4);spark(p.x,p.y+1.5,p.z,0xb090ff,8,3,.4,1)}
 else if(ty==='meteor'){cast('Use_Item',1.2,1.1);const tx=d.t?d.t.m.position.x:p.x+d.x*10,tz=d.t?d.t.m.position.z:p.z+d.z*10;for(let k=0;k<8;k++){const a=k*2.4,r=k===0?0:2+k*.6,x=tx+Math.cos(a)*r,z=tz+Math.sin(a)*r;later(k*.22,()=>{fxRing(x,z,3.4,0xff7a3a,.7,.6);later(.7,()=>{area(x,z,3.4,A*2,.5);pillar(x,z,3,0xff9a4a,.3);spark(x,H0(x,z)+.5,z,0xff9a4a,12,5,.6,1.4);snd(100,'square',.2,.1,40)})})}}
 else if(ty==='pierce'){cast('Throw',.45,2);proj(d.x,d.z,34,A*2.6,0xf0f0d0,true,.18,1.2)}
 else if(ty==='back'){cast('Jump_Full_Short',.6,1.6);dashTo(-d.x,-d.z,9,.35,0,0);P.face=Math.atan2(d.x,d.z);spark(p.x,p.y+.5,p.z,0xc0ffd0,14,3,.5,1.2)}
 else if(ty==='rain'){cast('Use_Item',1.2,1.1);const tx=d.t?d.t.m.position.x:p.x+d.x*10,tz=d.t?d.t.m.position.z:p.z+d.z*10;fxRing(tx,tz,7,0xe0f0c0,1.6,.5);for(let k=0;k<12;k++)later(.2+k*.12,()=>{const a=Math.random()*6.28,r=Math.random()*6.5,x=tx+Math.cos(a)*r,z=tz+Math.sin(a)*r;area(x,z,1.6,A*.9,0);spark(x,H0(x,z)+1,z,0xf0f0c0,3,3,.3,.8)})}
 hudCd()}
function jump(){if(P.air||P.dash||P.leap)return;P.vy=9.4;P.air=true;act('Jump_Full_Short',.5,1.8);snd(380,'sine',.12,.05,600)}
let swpOn=false,swpT=null;
function swapHero(id){if(id===S.hero||!S.unlocked.includes(id)||P.swapCd>0)return;HPm[S.hero]=P.hp;const p=P.root.position;spark(p.x,p.y+1,p.z,0xffffff,16,4,.5,1.2);setHero(id);P.swapCd=1.2;P.cd=[0,0,0];snd(500,'triangle',.2,.08,900);hudRefresh()}
function bindSwap(){const b=$('swap'),pn=$('swp');const show=()=>{pn.innerHTML=ORDER.map(id=>`<div class="sc ${S.unlocked.includes(id)?'':'lk'} ${S.hero===id?'sel':''}" data-id="${id}">${S.unlocked.includes(id)?H[id].n:'🔒'}<small>${S.unlocked.includes(id)?H[id].t:'Terkunci'}</small></div>`).join('');pn.classList.add('on');swpOn=true};
 b.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();if(MODE!=='play')return;b.setPointerCapture(e.pointerId);swpT=setTimeout(show,320)});
 b.addEventListener('pointerup',e=>{clearTimeout(swpT);if(MODE!=='play')return;if(swpOn){const el=document.elementFromPoint(e.clientX,e.clientY),c=el&&el.closest('.sc');if(c)swapHero(c.dataset.id);pn.classList.remove('on');swpOn=false}else{const l=S.unlocked,i=l.indexOf(S.hero);if(l.length>1)swapHero(l[(i+1)%l.length])}});
 b.addEventListener('pointercancel',()=>{clearTimeout(swpT);pn.classList.remove('on');swpOn=false})}
// ---------- update
let near=null;
function collide(p){const fy=p.y;for(let k=0;k<2;k++){
 for(const c of COLc){if(c.h&&fy>c.y+c.h-.15)continue;const dx=p.x-c.x,dz=p.z-c.z,d=Math.hypot(dx,dz),m=c.r+.3;if(d<m&&d>1e-4){p.x+=dx/d*(m-d);p.z+=dz/d*(m-d)}}
 for(const o of OBB){if(o.h&&fy>o.y+o.h-.15)continue;const dx=p.x-o.x,dz=p.z-o.z,lx=dx*o.c-dz*o.s,lz=dx*o.s+dz*o.c,cx=Math.max(-o.hx,Math.min(o.hx,lx)),cz=Math.max(-o.hz,Math.min(o.hz,lz));let ex=lx-cx,ez=lz-cz;const d=Math.hypot(ex,ez);
  if(d<.3){if(d>1e-4){ex=ex/d*(.3-d);ez=ez/d*(.3-d)}else{const px=o.hx-Math.abs(lx),pz=o.hz-Math.abs(lz);if(px<pz){ex=(lx>0?1:-1)*(px+.3);ez=0}else{ez=(lz>0?1:-1)*(pz+.3);ex=0}}p.x+=ex*o.c+ez*o.s;p.z+=-ex*o.s+ez*o.c}}
 for(const b of BOX){if(b.h&&fy>b.y+b.h-.15)continue;const cx=Math.max(b.x0,Math.min(p.x,b.x1)),cz=Math.max(b.z0,Math.min(p.z,b.z1)),dx=p.x-cx,dz=p.z-cz,d=Math.hypot(dx,dz);if(d<.3){if(d>1e-4){p.x+=dx/d*(.3-d);p.z+=dz/d*(.3-d)}else{p.x=b.x0-.3}}}}}
function blockedAt(x,z,y){const q={x,z,y};collide(q);return Math.hypot(q.x-x,q.z-z)>.02}
function update(dt){T+=dt;manaTick(dt);P.cd=P.cd.map(c=>Math.max(0,c-dt));P.atk=Math.max(0,P.atk-dt);P.busy=Math.max(0,P.busy-dt);P.inv=Math.max(0,P.inv-dt);P.guard=Math.max(0,P.guard-dt);P.swapCd=Math.max(0,P.swapCd-dt);
 for(let i=Q.length-1;i>=0;i--){Q[i].t-=dt;if(Q[i].t<=0){const f=Q[i].f;Q.splice(i,1);f()}}
 const h=H[S.hero],p=P.root.position;
 if(P.dead>0){P.dead-=dt;if(P.dead<=0){p.set(0,H0(0,12),12);P.hp=P.mhp;HPm[S.hero]=P.hp;P.busy=0;play('Idle_A')}}
 else{
  const fx=Math.sin(P.yaw),fz=Math.cos(P.yaw),mag=Math.min(1,Math.hypot(JOY.x,JOY.y)),mx=fx*(-JOY.y)-fz*JOY.x,mz=fz*(-JOY.y)+fx*JOY.x,ml=Math.hypot(mx,mz)||1;
  if(P.dash){const D=P.dash,s=D.v*dt,ns=Math.max(1,Math.ceil(s/.18));for(let q=0;q<ns;q++){p.x+=D.dx*s/ns;p.z+=D.dz*s/ns;collide(p)}E.slice().forEach(e=>{if(!D.hit.has(e)&&Math.hypot(e.m.position.x-p.x,e.m.position.z-p.z)<1.6+e.r){D.hit.add(e);if(D.dmg)dmgE(e,D.dmg,D.stun)}});if(Math.random()<.6)spark(p.x,p.y+.8,p.z,0xffffff,1,1,.3,.8);D.t-=dt;if(D.t<=0)P.dash=null}
  else if(P.leap){const L=P.leap;L.t+=dt;const k=Math.min(1,L.t/L.T);p.x=L.sx+(L.tx-L.sx)*k;p.z=L.sz+(L.tz-L.sz)*k;p.y=H0(p.x,p.z)+Math.sin(k*Math.PI)*4;if(k>=1){P.leap=null;P.vy=0;P.air=false}}
  else{if(P.run&&mag>.12){P.run=0;const rbb=$('run');if(rbb)rbb.classList.remove('act')}const can=P.busy<=.15||P.cn==='Jump_Full_Short',sp=h.spd*(P.guard>0?.7:1)*((P.run||keys.ShiftLeft)?1.65:1),tx=can&&mag>.12?mx/ml*sp*mag:(can&&P.run?fx*sp:0),tz=can&&mag>.12?mz/ml*sp*mag:(can&&P.run?fz*sp:0),kk=Math.min(1,dt*((tx||tz)?8:11));P.vx+=(tx-P.vx)*kk;P.vz+=(tz-P.vz)*kk;p.x+=P.vx*dt;p.z+=P.vz*dt;if(Math.hypot(P.vx,P.vz)>.5)P.face=Math.atan2(P.vx,P.vz)}
  P.mv=Math.hypot(P.vx,P.vz)>.9&&!P.dash&&!P.leap;
  const gh=H0(p.x,p.z);
  if(!P.leap){const gap=p.y-gh;if(!P.air&&gap<=.55&&P.vy<=0){p.y+=(gh-p.y)*Math.min(1,dt*28);if(Math.abs(p.y-gh)<.02)p.y=gh;P.at=0}
   else{P.vy-=(P.vy>0?26:42)*dt;p.y+=P.vy*dt;P.at+=dt;if(p.y<=gh&&P.vy<=0){p.y=gh;P.vy=0;P.air=false;P.at=0}else P.air=true}}
  collide(p);
  const dd=Math.hypot(p.x,p.z);if(dd>WR){p.x*=WR/dd;p.z*=WR/dd}
  if(wetDepth(p.x,p.z)>.9&&P.sx!==undefined){p.x=P.sx;p.z=P.sz}P.sx=p.x;P.sz=p.z;
  if(P.busy<=0&&!P.air){const w=P.mv?'Running_A':'Idle_A';if(P.cn!==w)play(w)}else if(P.air&&P.at>.2&&P.busy<=0&&P.cn!=='Jump_Idle')play('Jump_Idle')}
 if(P.model)P.model.rotation.y+=((P.face-P.model.rotation.y+Math.PI*3)%(Math.PI*2)-Math.PI)*Math.min(1,dt*10);if(P.model){const sp0=Math.hypot(P.vx,P.vz);P.model.rotation.x+=((P.mv&&!P.air?Math.min(.16,sp0*.016):0)-P.model.rotation.x)*Math.min(1,dt*7);if(P.cur&&P.cn==='Running_A')P.cur.timeScale=Math.max(.8,Math.min(1.8,sp0/6.5))}
 // enemies
 const pp=p;
 E.forEach(e=>{const m=e.m,ex=m.position.x,ez=m.position.z,dx=pp.x-ex,dz=pp.z-ez,d=Math.hypot(dx,dz);e.ph+=dt*6;e.st=Math.max(0,e.st-dt);e.cd-=dt;e.fl=Math.max(0,e.fl-dt);e.bm.emissive.setHex(e.fl>0?0x883322:0);
  if(e.st<=0&&d<(e.boss?40:22)&&d>(e.keep||1.2+e.r)){const s=e.spd*dt;m.position.x+=dx/d*s;m.position.z+=dz/d*s;m.rotation.y=Math.atan2(dx,dz)}
  m.position.y=H0(m.position.x,m.position.z)+Math.abs(Math.sin(e.ph))*.12;
  if(e.st<=0&&d<1.6+e.r&&e.cd<=0){e.cd=e.boss?1.4:1.1;hurtP(e.dmg)}
  if(e.boss&&e.st<=0){e.wave-=dt;if(e.wave<=0&&d<30){e.wave=6;const tx=pp.x,tz=pp.z;fxRing(tx,tz,6,0xff4040,.9,.6);later(.9,()=>{fxRing(tx,tz,6,0xff6040,.4,.9);if(Math.hypot(P.root.position.x-tx,P.root.position.z-tz)<6.4)hurtP(e.dmg*1.6);shake=.3;snd(80,'square',.25,.1,40)})}}});
 // projectiles
 for(let i=PR.length-1;i>=0;i--){const q=PR[i];q.m.position.x+=q.vx*dt;q.m.position.z+=q.vz*dt;q.t-=dt;if(Math.random()<.7)spark(q.m.position.x,q.m.position.y,q.m.position.z,0xffffff,1,.5,.25,.6);
  let hit=false;E.slice().forEach(e=>{if(q.hit.has(e))return;if(Math.hypot(e.m.position.x-q.m.position.x,e.m.position.z-q.m.position.z)<e.r+.5){q.hit.add(e);dmgE(e,q.dmg,0);if(!q.pierce)hit=true}});
  if(hit||q.t<=0){sc.remove(q.m);PR.splice(i,1)}}
 // fx
 for(let i=FX.length-1;i>=0;i--){const f=FX[i];f.t-=dt;f.m.scale.addScalar(f.k*dt*3);const o=Math.max(0,f.t/f.T)*f.o;f.m.traverse(x=>{if(x.material)x.material.opacity=o});if(f.t<=0){sc.remove(f.m);FX.splice(i,1)}}
 for(let i=PT.length-1;i>=0;i--){const q=PT[i];q.t-=dt;q.s.position.x+=q.vx*dt;q.s.position.y+=q.vy*dt;q.s.position.z+=q.vz*dt;q.vy-=5*dt;q.s.material.opacity=Math.max(0,q.t/q.T);if(q.t<=0){sc.remove(q.s);q.s.material.dispose();PT.splice(i,1)}}
 // interact
 near=null;let bd=1e9;IA.forEach(a=>{if(a.gone||a.off)return;const d=Math.hypot(p.x-a.x,p.z-a.z);if(d<a.r&&d<bd){bd=d;near=a}});
 const ub=$('use');if(near){ub.style.display='flex';$('usel').textContent=L(near.label)}else ub.style.display='none';
 // objective beam/compass
 let tg=tgt();
 if(beam){beam.visible=!!tg&&!!MIS[S.mi]&&MIS[S.mi].k!=='kill'&&S.mode==='story';if(tg)beam.position.set(tg.x,H0(tg.x,tg.z)+30,tg.z)}
 const cmp=$('cmp');if(tg){const a=Math.atan2(tg.x-p.x,tg.z-p.z)-P.yaw;cmp.style.display='block';cmp.style.transform=`rotate(${-a*180/Math.PI}deg)`;$('cmpd').textContent=Math.round(Math.hypot(tg.x-p.x,tg.z-p.z))+'m'}else{cmp.style.display='none';$('cmpd').textContent=''}
 hudTick()}
// ---------- camera
function updCam(dt,lobby){const p=P.root.position,dist=lobby?4.6:S.cfg.dist,pit=lobby?.16:P.pitch,yw=lobby?P.yaw:P.yaw;
 const tx=p.x,ty=p.y+(lobby?1.1:1.5),tz=p.z,cp_=Math.cos(pit),dx=-Math.sin(yw)*dist*cp_,dz=-Math.cos(yw)*dist*cp_;let cx=tx+dx,cz=tz+dz,cy=ty+Math.sin(pit)*dist+.4;const g=H0(cx,cz)+.7;if(cy<g)cy=g;
 const k=1-Math.exp(-dt*(lobby?4:14));cam.position.x+=(cx-cam.position.x)*k;cam.position.y+=(cy-cam.position.y)*k;cam.position.z+=(cz-cam.position.z)*k;
 if(shake>0){shake-=dt;cam.position.x+=(Math.random()-.5)*shake*.6;cam.position.y+=(Math.random()-.5)*shake*.6}cam.lookAt(tx,ty,tz)}
// ---------- UI
function hudSkills(){const h=H[S.hero];[0,1,2].forEach(i=>{const s=h.sk[i];$('s'+i).innerHTML=ic(ICO[s[1]],'S'+(i+1))+'<span class="lb">'+s[0].split(' ').slice(-1)[0]+'</span><div class="cd" id="c'+i+'"></div>'});$('s3').innerHTML=ic('i_burst','R')+'<span class="lb">'+L('Regen|Regen')+'</span><div class="cd" id="c3"></div>';hudRefresh()}
function hudCd(){}
function hudRefresh(){const h=H[S.hero];$('hn').textContent=h.n;$('hl').textContent='Lv.'+S.lv;$('cn').textContent=S.coins;$('an').textContent=S.name;$('al').textContent='Lv.'+S.lv;$('ac').textContent=S.coins;$('av').textContent=h.n[0];$('ot').innerHTML=objText();$('play').textContent=S.stage>1||S.coins>0?'Lanjutkan Petualangan':'Mulai Petualangan'}
function objText(){const t=S.stage===1?`<b>Stage 1 — Padang Awal</b>Kalahkan monster (${Math.min(G.k,8)}/8)`:S.stage===2?`<b>Stage 2 — Reruntuhan</b>Nyalakan obor kuno (${G.torch}/3)`:S.stage===3?`<b>Stage 3 — Benteng Raja</b>Kalahkan Raja Penjaga`:`<b>Dunia Terbuka</b>Jelajahi & temukan gulungan lore (${S.unlocked.length}/5 pahlawan)`;return t}
let hl=0;function hudTick(){$('hf').style.width=Math.max(0,P.hp/P.mhp*100)+'%';$('mf').style.width=Math.max(0,Math.min(100,P.mp/P.mmp*100))+'%';hl+=1;if(hl%20===0)$('ot').innerHTML=objText();[0,1,2,3].forEach(i=>{const e=$('c'+i);if(e){e.style.display=P.cd[i]>0?'flex':'none';e.textContent=P.cd[i]>0?P.cd[i].toFixed(P.cd[i]<10?1:0):''}});
 const b=E.find(e=>e.boss);$('bb').style.display=b&&Math.hypot(b.m.position.x-P.root.position.x,b.m.position.z-P.root.position.z)<45?'block':'none';if(b)$('bf').style.width=Math.max(0,b.hp/b.max*100)+'%'}
function modal(id,on){$(id).classList.toggle('on',on)}
function heroModal(){$('hm').innerHTML=ORDER.map(id=>{const h=H[id],un=S.unlocked.includes(id);return `<div class="hc ${un?'':'lk'} ${S.hero===id?'sel':''}" data-id="${id}"><b>${un?h.n:'???'}</b><small>${un?h.t+' · '+h.role:'Terkunci — temukan gulungan lore di dunia'}</small>${un?h.sk.map(s=>`<p><i>${s[0]}</i> ${s[3]}</p>`).join(''):''}</div>`}).join('')}
const SETS=[['sens','Sensitivitas kamera',.4,2.2,.1],['dist','Jarak kamera',5,11,.5],['size','Ukuran kontrol',.8,1.3,.05],['vol','Volume suara',0,1,.1]],TGS=[['inv','Balik sumbu Y kamera'],['swap','Tukar posisi joystick & tombol'],['aim','Bidik otomatis ke musuh'],['gfx','Grafis tinggi (lebih tajam)'],['fps','Tampilkan FPS'],['vib','Getar saat terkena serangan']];
const fmt=(k,v)=>['sens','size','vol','mus','sfx'].includes(k)?Math.round(v*100)+'%':v;
function setModal(){$('sm').innerHTML=SETS.map(s=>`<label>${s[1]}<span id="v_${s[0]}">${S.cfg[s[0]]}</span><input type="range" data-k="${s[0]}" min="${s[2]}" max="${s[3]}" step="${s[4]}" value="${S.cfg[s[0]]}"></label>`).join('')+TGS.map(t=>`<label class="tg">${t[1]}<input type="checkbox" data-k="${t[0]}" ${S.cfg[t[0]]?'checked':''}></label>`).join('')+'<button class="bt" id="rst">Reset data permainan</button>';
 $('sm').querySelectorAll('input').forEach(i=>i.oninput=()=>{const k=i.dataset.k;S.cfg[k]=i.type==='checkbox'?(i.checked?1:0):+i.value;if($('v_'+k))$('v_'+k).textContent=S.cfg[k];save();applyCfg()});$('rst').onclick=()=>{if(confirm('Hapus semua progres?')){localStorage.removeItem('gl3');location.reload()}}}
function applyCfg(){document.documentElement.style.setProperty('--k',S.cfg.size);$('hud').classList.toggle('flip',!!S.cfg.swap);$('fps').style.display=S.cfg.fps?'block':'none';resize()}
function toPlay(){MODE='play';modal('lobby',false);$('hud').classList.add('on');const p=P.root.position;p.set(0,H0(0,12),12);P.yaw=Math.PI;P.face=Math.PI;P.pitch=.35;cam.position.set(0,8,26);HPm[S.hero]=P.hp;if(P.hp<=0)P.hp=P.mhp;banner(S.stage>3?'Dunia Terbuka':'Stage '+S.stage,objText().replace(/<[^>]+>/g,' '))}
function toLobby(){P.run=0;const rbb=$('run');if(rbb)rbb.classList.remove('act');MODE='lobby';$('hud').classList.remove('on');modal('lobby',true);modal('pause',false);P.root.position.set(0,H0(0,0),0);P.yaw=.4;E.forEach(e=>{});hudRefresh()}
let last=performance.now(),fc=0,ft=0;
function loop(now){requestAnimationFrame(loop);const dt=Math.min(.05,(now-last)/1000);last=now;
 if(MODE==='play'&&!$('pause').classList.contains('on')&&!$('setm').classList.contains('on')){update(dt);updCam(dt,false)}else if(MODE==='lobby'){P.yaw+=dt*.25;P.face=P.yaw+Math.PI;if(P.model)P.model.rotation.y=P.face;P.root.position.y=H0(0,0);updCam(dt,true)}
 if(P.mix)P.mix.update(MODE==='play'&&($('pause').classList.contains('on')||$('setm').classList.contains('on'))?0:dt);
 R.render(sc,cam);fc++;ft+=dt;if(ft>=.5){$('fps').textContent=Math.round(fc/ft)+' FPS';fc=0;ft=0}}
// ======== v3 additions (override earlier declarations) ========
const L=s=>{const a=String(s).split('|');return a[S.cfg.lang==='en'&&a[1]?1:0]};
const SK={},DEAD=[],CR=[],EP=[];let setFrom='',prevMode='lobby',rebind=null,bv=0,av=0;
const MIS=[
{k:'kill',n:6,t:'Bersihkan Padang|Clear the Meadow',d:'Kalahkan 6 monster di sekitar padang|Defeat 6 monsters around the meadow'},
{k:'collect',n:3,t:'Kristal Roh|Spirit Crystals',d:'Kumpulkan 3 kristal roh yang berpendar|Collect 3 glowing spirit crystals'},
{k:'reach',x:RUIN.x,z:RUIN.z,r:10,t:'Jejak Kuno|Ancient Trail',d:'Ikuti pilar cahaya sampai ke reruntuhan|Follow the light pillar to the ruins'},
{k:'torch',n:3,t:'Obor Kuno|Ancient Torches',d:'Nyalakan 3 obor sambil melawan penjaga|Light 3 torches while fighting the guards'},
{k:'survive',s:40,x:RUIN.x,z:RUIN.z,r:22,t:'Pertahankan Altar|Hold the Altar',d:'Bertahan 40 detik dari gelombang tengkorak|Survive 40s of skeleton waves'},
{k:'elite',n:1,t:'Kapten Tengkorak|Skeleton Captain',d:'Kalahkan Kapten Tengkorak di jalan benteng|Defeat the Skeleton Captain on the fortress road'},
{k:'boss',n:1,t:'Raja Penjaga|The Guardian King',d:'Masuki benteng dan kalahkan Raja Penjaga|Enter the fortress and defeat the Guardian King'}];
Object.assign(H.aldric,{ar:2.8,acd:.45});Object.assign(H.brakk,{ar:3.4,acd:.62});Object.assign(H.sylva,{ar:2.2,acd:.28});Object.assign(H.merlin,{pr:20,acd:.55});Object.assign(H.rowan,{pr:30,acd:.5});
Object.entries({aldric:[7.7,100,9],brakk:[8,100,8],sylva:[9.3,110,11],merlin:[7.3,140,14],rowan:[8.3,110,10]}).forEach(([k,v])=>{H[k].spd=v[0];H[k].mp=v[1];H[k].mr=v[2];H[k].hp=Math.round(H[k].hp*1.4)});
// ---- enemies
const TYPES={blob:{hp:1,spd:1},skel_min:{n:'Skeleton_Minion',hp:.8,spd:1.15,s:1},skel_war:{n:'Skeleton_Warrior',hp:1.6,spd:.95,s:1.1},skel_rogue:{n:'Skeleton_Rogue',hp:.9,spd:1.7,s:1},skel_mage:{n:'Skeleton_Mage',hp:.9,spd:.9,s:1,ranged:1}};
function spawnE(x,z,boss,type,elite){for(let t=0;t<9&&wetDepth(x,z)>-.4;t++){x*=.9;z*=.9}const T=TYPES[type||'blob']||TYPES.blob,hasSk=T.n&&SK[T.n]&&THREE.SkeletonUtils;
 if(!hasSk&&!boss&&!elite){type='blob'}
 let g,mix=null,bm,r=.8,s=1;
 if(hasSk||((boss||elite)&&SK.Skeleton_Warrior&&THREE.SkeletonUtils)){const nm=(boss||elite)?'Skeleton_Warrior':T.n;g=THREE.SkeletonUtils.clone(SK[nm]);s=boss?2.4:elite?1.5:T.s;g.scale.setScalar(s);mix=new THREE.AnimationMixer(g);bm={emissive:{setHex(){}}};r=.8*s;
  const sh=new THREE.Mesh(new THREE.CircleGeometry(.7,14),new THREE.MeshBasicMaterial({color:0,transparent:true,opacity:.35,depthWrite:false}));sh.rotation.x=-Math.PI/2;sh.position.y=.05;sh.scale.setScalar(1/s);g.add(sh)}
 else{g=new THREE.Group();s=boss?2.4:1;const col=boss?0x7a3a30:[0x5e7a5a,0x7a5a5a,0x5a6a8a,0x6a5a7a][(Math.random()*4)|0];bm=mat(col);const body=new THREE.Mesh(new THREE.SphereGeometry(.7*s,14,10),bm);body.scale.y=.9;body.position.y=.65*s;g.add(body);
  [-.25,.25].forEach(a=>{const e=new THREE.Mesh(new THREE.SphereGeometry(.12*s,8,6),new THREE.MeshBasicMaterial({color:0xffe8a0}));e.position.set(a*s,.8*s,.6*s);g.add(e)});r=.8*s}
 g.position.set(x,H0(x,z),z);sc.add(g);const hp=Math.round((boss?900:elite?320:(50+S.lv*8)*T.hp));
 const e={m:g,mix,bm,hp,max:hp,spd:(boss?3.2:elite?3.4:(2.6+Math.random()*.8)*T.spd),dmg:boss?18:elite?11:(5+S.lv*.7)*(type==='skel_rogue'?.8:1),r,st:0,cd:1,fl:0,boss:!!boss,elite:!!elite,xp:boss?200:elite?80:20,ph:Math.random()*6,wave:0,ranged:T.ranged,keep:T.ranged?9:0,px:x,pz:z,pcd:1,sh:0};E.push(e);return e}
const pickT=()=>{const r=Math.random();return r<.3?'blob':r<.55?'skel_min':r<.75?'skel_war':r<.88?'skel_rogue':'skel_mage'};
function ringE(cx,cz,a,b,n){for(let i=0;i<n;i++){const an=Math.random()*6.283,r=a+Math.random()*(b-a);spawnE(cx+Math.cos(an)*r,cz+Math.sin(an)*r,false,pickT())}}
function killE(e){const i=E.indexOf(e);if(i<0)return;E.splice(i,1);if(e.mix&&ANIM.Death_A){e.mix.stopAllAction();const a=e.mix.clipAction(ANIM.Death_A);a.reset();a.setLoop(THREE.LoopOnce);a.clampWhenFinished=true;a.play();DEAD.push({e,t:1.6})}else sc.remove(e.m);
 S.xp+=e.xp;S.coins+=e.boss?300:e.elite?60:5;while(S.xp>=50*S.lv){S.xp-=50*S.lv;S.lv++;const st=stat(S.hero);P.mhp=st.mhp;P.hp=P.mhp;banner(L('Level '+S.lv+'|Level '+S.lv),L('HP dan damage meningkat|HP and damage increased'))}
 spark(e.m.position.x,e.m.position.y+1,e.m.position.z,0xffffff,10,4,.6,1);const m=S.mode==='story'&&MIS[S.mi];if(m){if(m.k==='kill'&&!e.boss)G.p++;if(m.k==='elite'&&e.elite)G.p++;if(m.k==='boss'&&e.boss)G.p=1;mcheck()}save();hudRefresh()}
// ---- missions
function advance(){mcheck()}
function mcheck(){if(S.mode!=='story')return;const m=MIS[S.mi];if(!m||G.done)return;let ok=false;
 if(m.k==='kill'||m.k==='collect'||m.k==='elite'||m.k==='boss')ok=G.p>=m.n;else if(m.k==='torch')ok=G.torch>=m.n;else if(m.k==='survive')ok=G.t>=m.s;else if(m.k==='reach')ok=Math.hypot(P.root.position.x-m.x,P.root.position.z-m.z)<m.r;
 if(ok){G.done=true;S.coins+=80;S.xp+=60;snd(520,'triangle',.5,.1,1040);banner(L('Misi selesai|Mission complete'),L(m.t)+' +80 coin');S.mi++;save();later(3,()=>{G.done=false;startMission(S.mi)})}hudRefresh()}
function startMission(i){G.p=0;G.t=0;G.torch=0;G.wave=0;CR.forEach(c=>{sc.remove(c.m);sc.remove(c.gl);c.gone=true});CR.length=0;const m=MIS[i];
 if(!m){banner(L('Cerita selesai|Story complete'),L('Lanjutkan di Free Mode untuk berpetualang bebas|Continue in Free Mode for open adventure'));hudRefresh();return}
 if(m.k==='kill')ringE(0,10,22,50,m.n+2);
 else if(m.k==='collect'){for(let k=0;k<m.n;k++){const a=k*2.1+Math.random(),r=28+Math.random()*30,x=Math.cos(a)*r,z=Math.sin(a)*r+8,mm=new THREE.Mesh(new THREE.OctahedronGeometry(.5,0),new THREE.MeshBasicMaterial({color:lin(0xbfe8ff)}));mm.position.set(x,H0(x,z)+1.2,z);sc.add(mm);
   const gl=new THREE.Sprite(new THREE.SpriteMaterial({map:SPR[1]||null,color:lin(0x9ad0ff),transparent:true,blending:THREE.AdditiveBlending,depthWrite:false}));gl.scale.setScalar(3);gl.position.copy(mm.position);sc.add(gl);
   const c={x,z,r:2.8,label:'Ambil Kristal|Take Crystal',kind:'crystal',m:mm,gl,fn(){this.gone=true;sc.remove(mm);sc.remove(gl);G.p++;snd(700,'triangle',.2,.08,1200);mcheck()}};CR.push(c);IA.push(c)}ringE(0,10,20,45,3)}
 else if(m.k==='torch'){IA.forEach(a=>{if(a.kind==='torch'){a.gone=false;a.fl.visible=false}});ringE(RUIN.x,RUIN.z,10,18,6)}
 else if(m.k==='elite'){spawnE(-28,-30,false,'skel_war',true);ringE(-28,-30,6,10,3)}
 else if(m.k==='boss'){spawnE(FORT.x,FORT.z-4,true);ringE(FORT.x,FORT.z,8,14,6)}
 banner(L(m.t),L(m.d));hudRefresh()}
function tgt(){if(S.mode!=='story')return null;const m=MIS[S.mi],p=P.root.position;if(!m)return null;
 if(m.k==='reach'||m.k==='survive')return new THREE.Vector3(m.x,0,m.z);
 if(m.k==='torch'){const t=IA.find(a=>a.kind==='torch'&&!a.gone);return t?new THREE.Vector3(t.x,0,t.z):new THREE.Vector3(RUIN.x,0,RUIN.z)}
 if(m.k==='collect'){let b=null,bd=1e9;CR.forEach(c=>{if(!c.gone){const d=Math.hypot(c.x-p.x,c.z-p.z);if(d<bd){bd=d;b=c}}});return b?new THREE.Vector3(b.x,0,b.z):null}
 if(m.k==='boss'&&!E.some(e=>e.boss))return new THREE.Vector3(FORT.x,0,FORT.z);const t=m.k==='elite'?E.find(e=>e.elite):nearest(300);return t?t.m.position:null}
function objText(){if(S.mode!=='story')return `<b>${L('Free Mode|Free Mode')}</b>${L('Jelajahi bebas & lawan monster|Explore freely & fight monsters')}`;const m=MIS[S.mi];if(!m)return `<b>${L('Cerita selesai|Story complete')}</b>${L('Coba Free Mode|Try Free Mode')} (${S.unlocked.length}/5)`;
 const pr=m.k==='torch'?G.torch+'/'+m.n:m.k==='survive'?Math.min(m.s,G.t|0)+'/'+m.s+'s':m.k==='reach'?'':m.n>1?Math.min(G.p,m.n)+'/'+m.n:'';return `<b>${S.mi+1}/${MIS.length} · ${L(m.t)}</b>${L(m.d)} ${pr}`}
function hudRefresh(){const h=H[S.hero];$('hn').textContent=h.n;$('hl').textContent='Lv.'+S.lv;$('cn').textContent=S.coins;$('an').textContent=S.name;$('al').textContent='Lv.'+S.lv;$('ac').textContent=S.coins;$('av').textContent=h.n[0];$('ot').innerHTML=objText();$('play').textContent=L(S.mi>0||S.coins>0?'Lanjutkan Petualangan|Continue Adventure':'Mulai Petualangan|Start Adventure')}
function extra(dt){worldTick(dt);
 if(P.cur&&P.cn==='Running_A')P.cur.timeScale=(P.run||keys.ShiftLeft)?1.45:1;
 if(S.mode==='story'){const m=MIS[S.mi];if(m&&!G.done){if(m.k==='reach')mcheck();if(m.k==='survive'){const p=P.root.position;if(Math.hypot(p.x-m.x,p.z-m.z)<m.r+14){G.t+=dt;G.wave-=dt;if(G.wave<=0){G.wave=7;ringE(m.x,m.z,14,18,3)}if(G.t>=m.s)mcheck()}}}}
 else{G.fs=(G.fs||0)-dt;if(G.fs<=0&&E.length<16){G.fs=4;const p=P.root.position,a=Math.random()*6.283;spawnE(Math.max(-WR,Math.min(WR,p.x+Math.cos(a)*45)),Math.max(-WR,Math.min(WR,p.z+Math.sin(a)*45)),false,pickT())}}
 const p=P.root.position;
 E.forEach(e=>{if(!e.mix)return;const mv=Math.hypot(e.m.position.x-e.px,e.m.position.z-e.pz)>.015;e.px=e.m.position.x;e.pz=e.m.position.z;const w=e.st>0?'Idle_A':mv?'Running_A':'Idle_A';if(e.cn!==w&&ANIM[w]){e.cn=w;const a=e.mix.clipAction(ANIM[w]);a.reset().fadeIn(.2).play();if(e.ca)e.ca.fadeOut(.2);e.ca=a}
  if(e.cd>e.pcd+.5&&ANIM.Throw){const a=e.mix.clipAction(ANIM.Throw);a.reset().setLoop(THREE.LoopOnce).setEffectiveTimeScale(2).play()}e.pcd=e.cd;e.mix.update(dt)});
 E.forEach(e=>{if(e.ranged&&e.st<=0){e.sh-=dt;const d=Math.hypot(p.x-e.m.position.x,p.z-e.m.position.z);if(e.sh<=0&&d<18&&d>3){e.sh=2.4;const dx=(p.x-e.m.position.x)/d,dz=(p.z-e.m.position.z)/d,m=new THREE.Mesh(new THREE.SphereGeometry(.28,8,6),new THREE.MeshBasicMaterial({color:lin(0x9aff9a)}));m.position.set(e.m.position.x,p.y+1.2,e.m.position.z);sc.add(m);EP.push({m,vx:dx*13,vz:dz*13,t:2,d:e.dmg})}}});
 for(let i=EP.length-1;i>=0;i--){const q=EP[i];q.m.position.x+=q.vx*dt;q.m.position.z+=q.vz*dt;q.t-=dt;if(Math.hypot(q.m.position.x-p.x,q.m.position.z-p.z)<.9){hurtP(q.d);q.t=0}if(q.t<=0){sc.remove(q.m);EP.splice(i,1)}}
 for(let i=DEAD.length-1;i>=0;i--){const d=DEAD[i];d.t-=dt;d.e.mix.update(dt);if(d.t<=0){sc.remove(d.e.m);DEAD.splice(i,1)}}}
// ---- run flow
function applyMode(){const st=S.mode==='story';IA.forEach(a=>{if(a.label==='Nyalakan Obor'){a.kind='torch';a.gone=true;a.fl.visible=false}else if(a.label==='Buka Peti'){a.gone=false}else if(a.label==='Baca Gulungan Lore'){const have=S.unlocked.includes(a.hid);a.off=!st;a.gone=have;a.m.visible=a.gl.visible=st&&!have}})}
function fade(cb){const f=$('fd');f.classList.add('on');setTimeout(()=>{cb();setTimeout(()=>f.classList.remove('on'),450)},750)}
function startRun(){fade(()=>{MODE='play';modal('lobby',false);modal('sel',false);$('hud').classList.add('on');E.slice().forEach(e=>sc.remove(e.m));E.length=0;DEAD.forEach(d=>sc.remove(d.e.m));DEAD.length=0;PR.forEach(q=>sc.remove(q.m));PR.length=0;EP.forEach(q=>sc.remove(q.m));EP.length=0;Q.length=0;
 CR.forEach(c=>{sc.remove(c.m);sc.remove(c.gl);c.gone=true});CR.length=0;G.done=false;G.p=0;G.t=0;G.torch=0;G.fs=0;applyMode();setHero(S.hero);P.hp=P.mhp;HPm[S.hero]=P.hp;P.dead=0;P.vx=P.vz=0;P.mp=H[S.hero].mp;
 const p=P.root.position;p.set(0,H0(0,12),12);P.yaw=Math.PI;P.face=Math.PI;P.pitch=.35;cam.position.set(0,8,26);play('Idle_A');
 if(S.mode==='story')startMission(S.mi);else{ringE(0,10,25,55,12);banner('Free Mode',L('Jelajahi bebas|Explore freely'))}hudRefresh()})}
function toPlay(){startRun()}
function toLobby(){MODE='lobby';$('hud').classList.remove('on');modal('lobby',true);modal('pause',false);modal('sel',false);P.root.position.set(0,H0(0,0),0);P.yaw=.4;setHero(S.hero);play('Idle_A');hudRefresh()}
function selModal(){const st=S.mode==='story';$('selm').innerHTML=['story','free'].map(m=>`<button class="bt ${S.mode===m?'on':''}" data-m="${m}">${L(m==='story'?'Story Mode (Misi)|Story Mode (Missions)':'Free Mode (Bebas)|Free Mode (Open)')}</button>`).join('');
 $('selh').innerHTML=ORDER.map(id=>{const h=H[id],un=S.unlocked.includes(id);return `<div class="hc ${un?'':'lk'} ${S.hero===id?'sel':''}" data-id="${id}"><b>${un?h.n:'??'}</b><small>${un?h.t:L('Dapatkan di story mode|Get it in story mode')}</small>${un?`<p>${h.role}</p>`:''}</div>`}).join('')}
// ---- settings
const ACTS=[['atk','Serang|Attack','KeyJ'],['s0','Skill 1','KeyK'],['s1','Skill 2','KeyL'],['s2','Ultimate','KeyO'],['s3','Regen','KeyR'],['jmp','Lompat|Jump','Space'],['use','Interaksi|Interact','KeyE'],['pause','Jeda|Pause','Escape']];
const kbm=()=>Object.assign({},...ACTS.map(a=>({[a[0]]:a[2]})),S.cfg.keys||{});
function setModal(){const C=S.cfg,sl=[['sens','Sensitivitas kamera|Camera sensitivity',.2,4,.1],['dist','Jarak kamera|Camera distance',5,11,.5],['size','Ukuran kontrol|Control size',.6,1.3,.05],['vol','Volume utama|Master volume',0,1,.05],['mus','Volume musik|Music volume',0,1,.05],['sfx','Volume efek|Effects volume',0,1,.05],['rd','Render distance (chunk)|Render distance (chunks)',2,6,1],['vd','Jarak objek kecil|Small-object distance',1,4,1]],tg=[['inv','Balik sumbu Y kamera|Invert camera Y'],['aim','Bidik otomatis|Auto aim'],['vib','Getar|Vibration'],['fps','Tampilkan FPS|Show FPS'],['kb','Keyboard / Kontroler|Keyboard / Controller']];
 const seg=(k,opts)=>`<div class="sg">${opts.map(o=>`<button class="bt ${C[k]==o[0]?'on':''}" data-sk="${k}" data-sv="${o[0]}">${L(o[1])}</button>`).join('')}</div>`;
 $('sm').innerHTML=`<label>${L('Bahasa|Language')}${seg('lang',[['id','Indonesia'],['en','English']])}</label><label>${L('Kualitas grafis|Graphics quality')}${seg('gfx',[[0,'Low'],[1,'Mid'],[2,'High']])}</label>`+sl.map(s=>`<label>${L(s[1])}<span id="v_${s[0]}">${fmt(s[0],C[s[0]])}</span><input type="range" data-k="${s[0]}" min="${s[2]}" max="${s[3]}" step="${s[4]}" value="${C[s[0]]}"></label>`).join('')+tg.map(t=>`<label class="tg">${L(t[1])}<input type="checkbox" data-k="${t[0]}" ${C[t[0]]?'checked':''}></label>`).join('')+`<button class="bt" id="edl">${L('Sesuaikan tata letak kontrol|Adjust control layout')}</button>`+(C.kb?`<div class="kl">${ACTS.map(a=>`<button class="bt" data-act="${a[0]}">${L(a[1])}: ${rebind===a[0]?'...':kbm()[a[0]]}</button>`).join('')}<small>${L('Mouse: klik kiri serang, gerak = kamera. Kontroler: stik kiri/kanan, A lompat, X serang.|Mouse: left click attack, move = camera. Gamepad: sticks, A jump, X attack.')}</small></div>`:'')+`<button class="bt" id="rst">${L('Reset data permainan|Reset game data')}</button>`;
 const q=$('sm');q.querySelectorAll('input').forEach(i=>i.oninput=()=>{const k=i.dataset.k;C[k]=i.type==='checkbox'?(i.checked?1:0):+i.value;if($('v_'+k))$('v_'+k).textContent=fmt(k,C[k]);save();applyCfg();if(k==='kb')setModal()});
 q.querySelectorAll('[data-sk]').forEach(b=>b.onclick=()=>{const v=b.dataset.sv;C[b.dataset.sk]=isNaN(v)?v:+v;save();applyCfg();applyLang();setModal()});
 q.querySelectorAll('[data-act]').forEach(b=>b.onclick=()=>{rebind=b.dataset.act;setModal()});
 $('edl').onclick=()=>{prevMode=MODE;MODE='edit';modal('setm',false);modal('lobby',false);modal('pause',false);$('hud').classList.add('on');$('ed').classList.add('on')};
 $('rst').onclick=()=>{if(confirm(L('Hapus semua progres?|Delete all progress?'))){localStorage.removeItem('gl3');location.reload()}}}
function applyLang(){document.querySelectorAll('[data-t]').forEach(e=>e.textContent=L(e.dataset.t));hudRefresh();hudSkills()}
const _ac=applyCfg;function applyCfg(){document.documentElement.style.setProperty('--k',S.cfg.size);$('hud').classList.toggle('flip',!!S.cfg.swap);$('fps').style.display=S.cfg.fps?'block':'none';resize();applyLay();if(typeof worldCfg==='function')worldCfg()}
function resize(){R.setPixelRatio(Math.min(devicePixelRatio||1,[.8,1,1.3][S.cfg.gfx]||1));R.setSize(innerWidth,innerHeight);cam.aspect=innerWidth/innerHeight;cam.updateProjectionMatrix()}
function heroModal(){$('hm').innerHTML=ORDER.map(id=>{const h=H[id],un=S.unlocked.includes(id);return `<div class="hc ${un?'':'lk'} ${S.hero===id?'sel':''}" data-id="${id}"><b>${un?h.n:'??'}</b><small>${un?h.t+' · '+h.role:L('Dapatkan di story mode|Get it in story mode')}</small>${un?h.sk.map(s=>`<p><i>${s[0]}</i> ${s[3]}</p>`).join(''):''}</div>`}).join('')}
// ---- layout editor
const LAYID=['joy','run','atk','s0','s1','s2','jmp','s3'];
function applyLay(){const l=S.cfg.lay||{};LAYID.forEach(id=>{const o=l[id];$(id).style.translate=o?o[0]+'px '+o[1]+'px':''})}
LAYID.forEach(id=>{const el=$(id);let dr=null;el.addEventListener('pointerdown',e=>{if(MODE!=='edit')return;e.preventDefault();e.stopImmediatePropagation();S.cfg.lay=S.cfg.lay||{};dr={x:e.clientX,y:e.clientY,o:(S.cfg.lay[id]||[0,0]).slice()};el.setPointerCapture(e.pointerId)},true);el.addEventListener('pointermove',e=>{if(!dr)return;S.cfg.lay[id]=[dr.o[0]+e.clientX-dr.x,dr.o[1]+e.clientY-dr.y];applyLay()});el.addEventListener('pointerup',()=>{if(dr){dr=null;save()}})});
// ---- keyboard / gamepad / mouse
const keys={};let gpPrev=[];
addEventListener('keydown',e=>{if(rebind){(S.cfg.keys=S.cfg.keys||{})[rebind]=e.code;rebind=null;save();setModal();e.preventDefault();return}keys[e.code]=1;if(!S.cfg.kb||MODE!=='play')return;const k=kbm();if(e.code===k.atk)attack();else if(e.code===k.s0)skill(0);else if(e.code===k.s1)skill(1);else if(e.code===k.s2)skill(2);else if(e.code===k.s3)skill(3);else if(e.code===k.jmp){e.preventDefault();jump()}else if(e.code===k.use&&near){near.fn();near.gone=true}else if(e.code===k.pause){document.exitPointerLock&&document.exitPointerLock();modal('pause',!$('pause').classList.contains('on'))}});
addEventListener('keyup',e=>keys[e.code]=0);
cv.addEventListener('click',()=>{if(S.cfg.kb&&MODE==='play'&&cv.requestPointerLock)cv.requestPointerLock()});
addEventListener('mousedown',e=>{if(S.cfg.kb&&MODE==='play'&&document.pointerLockElement===cv&&e.button===0&&P.dead<=0)attack()});
addEventListener('mousemove',e=>{if(document.pointerLockElement===cv){const k=.003*S.cfg.sens;P.yaw-=e.movementX*k;P.pitch=Math.max(-.15,Math.min(1.35,P.pitch+e.movementY*k*(S.cfg.inv?-1:1)))}});
function pollInput(dt){if(!S.cfg.kb||MODE!=='play')return;const k=kbm(),ax=(keys.KeyD?1:0)-(keys.KeyA?1:0),ay=(keys.KeyS?1:0)-(keys.KeyW?1:0);let jx=ax,jy=ay;
 const gp=navigator.getGamepads?navigator.getGamepads()[0]:null;if(gp){const dz=v=>Math.abs(v)>.18?v:0;if(!jx&&!jy){jx=dz(gp.axes[0]);jy=dz(gp.axes[1])}const rx=dz(gp.axes[2]),ry=dz(gp.axes[3]);P.yaw-=rx*dt*2.6*S.cfg.sens;P.pitch=Math.max(-.15,Math.min(1.35,P.pitch+ry*dt*1.8*S.cfg.sens*(S.cfg.inv?-1:1)));
  const b=i=>gp.buttons[i]&&gp.buttons[i].pressed,ed=(i,f)=>{if(b(i)&&!gpPrev[i]&&P.dead<=0)f();gpPrev[i]=b(i)};ed(0,jump);ed(2,attack);ed(3,()=>skill(0));ed(1,()=>skill(1));ed(5,()=>skill(2));ed(4,()=>{if(near){near.fn();near.gone=true}})}
 if(jp===null){const l=Math.hypot(jx,jy);JOY.x=l>1?jx/l:jx;JOY.y=l>1?jy/l:jy}}
// ---- audio
const bgm=$('bgm');let ambN=null,sfxBuf=null;
function audioInit(){try{AC=AC||new(window.AudioContext||window.webkitAudioContext)();AC.resume();if(!sfxBuf&&AS.sfx){AC.decodeAudioData(b64buf(AS.sfx),b=>sfxBuf=b,()=>{});}
 if(!ambN){const g=AC.createGain();g.gain.value=0;const f=AC.createBiquadFilter();f.type='lowpass';f.frequency.value=520;[110,164.81,220.5].forEach((fr,i)=>{const o=AC.createOscillator();o.type=i?'triangle':'sine';o.frequency.value=fr;o.detune.value=i*7;o.connect(f);o.start()});const lf=AC.createOscillator(),lg=AC.createGain();lf.frequency.value=.07;lg.gain.value=240;lf.connect(lg);lg.connect(f.frequency);lf.start();f.connect(g);g.connect(AC.destination);ambN=g}
 if(bgm.paused)bgm.play().catch(()=>{})}catch(e){}}
['pointerdown','keydown'].forEach(ev=>addEventListener(ev,audioInit));
function sfx(rate,v){if(!AC||!sfxBuf)return;const s=AC.createBufferSource(),g=AC.createGain();s.buffer=sfxBuf;s.playbackRate.value=rate||1;g.gain.value=(v||.6)*S.cfg.sfx*S.cfg.vol;s.connect(g);g.connect(AC.destination);s.start(0,0,.5)}
function audioTick(dt){const m=S.cfg.mus*S.cfg.vol,wb=(MODE==='play'||MODE==='edit')?0:m,wa=MODE==='play'?m*.07:0;bv+=(wb-bv)*Math.min(1,dt*2);av+=(wa-av)*Math.min(1,dt*1.2);try{bgm.volume=Math.max(0,Math.min(1,bv));if(ambN)ambN.gain.value=av}catch(e){}}
// ---- loop
function frozen(){return $('pause').classList.contains('on')||$('setm').classList.contains('on')}
function loop(now){requestAnimationFrame(loop);const dt=Math.min(.05,(now-last)/1000);last=now;pollInput(dt);
 if(MODE==='play'&&!frozen()){update(dt);extra(dt);updCam(dt,false)}else if(MODE==='lobby'){P.yaw+=dt*.25;P.face=P.yaw+Math.PI;if(P.model)P.model.rotation.y=P.face;P.root.position.y=H0(0,0);updCam(dt,true)}
 if(P.mix)P.mix.update(MODE==='play'&&frozen()?0:dt);audioTick(dt);R.render(sc,cam);fc++;ft+=dt;if(ft>=.5){$('fps').textContent=Math.round(fc/ft)+' FPS';fc=0;ft=0}}
// ---- boot
function boot(){bgm.src=URL.createObjectURL(new Blob([AS.mus],{type:'audio/mpeg'}));
 $('play').onclick=()=>{snd(500,'triangle',.15,.07);S.mode=S.mode||'story';selModal();modal('sel',true)};
 $('selm').onclick=e=>{const b=e.target.closest('[data-m]');if(b){S.mode=b.dataset.m;save();selModal()}};
 $('selh').onclick=e=>{const c=e.target.closest('.hc');if(c&&S.unlocked.includes(c.dataset.id)){setHero(c.dataset.id);selModal()}};
 $('selgo').onclick=()=>{if(!S.unlocked.includes(S.hero))setHero('aldric');startRun()};
 $('bhero').onclick=()=>{heroModal();modal('herom',true)};$('bset').onclick=()=>{setFrom='';setModal();modal('setm',true)};
 $('hm').onclick=e=>{const c=e.target.closest('.hc');if(c&&S.unlocked.includes(c.dataset.id)){setHero(c.dataset.id);heroModal()}};
 document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>{modal(b.dataset.close,false);if(b.dataset.close==='setm'&&setFrom==='pause'){setFrom='';modal('pause',true)}});
 $('pbt').onclick=()=>modal('pause',true);$('pres').onclick=()=>modal('pause',false);$('pset').onclick=()=>{setFrom='pause';setModal();modal('pause',false);modal('setm',true)};$('plob').onclick=toLobby;
 $('edok').onclick=()=>{MODE=prevMode;$('ed').classList.remove('on');if(MODE==='lobby'){$('hud').classList.remove('on');modal('lobby',true)}setFrom='';setModal();modal('setm',true)};$('edrs').onclick=()=>{S.cfg.lay={};save();applyLay()};
 bindJoy();(()=>{const rb=$('run');rb.addEventListener('pointerdown',e=>{if(MODE!=='play')return;e.preventDefault();e.stopPropagation();P.run=P.run?0:1;rb.classList.toggle('act',!!P.run)});})();press('atk',attack);press('s0',()=>skill(0));press('s1',()=>skill(1));press('s2',()=>skill(2));press('s3',()=>skill(3));press('jmp',jump);press('use',()=>{if(near){near.fn();near.gone=true}});
 hudSkills();applyCfg();applyLang();setHero(S.hero);buildWorld();initWorld();applyMode();$('ld').style.display='none';toLobby();cam.position.set(0,3,6);requestAnimationFrame(loop)}

resize();
if(!THREE.GLTFLoader){$('lt').textContent='Gagal memuat pustaka model (butuh internet).'}else loadPacks(()=>loadAll(boot));
// ===== v6 world engine: chunk streaming, textured terrain, lakes, river, waterfall =====
const TEX={},VAR={},IMS={},TCH=new Map(),GEN=new Map(),WATERS=[];
let TMAT=null,WFP=null,wfGain=null,wfBuf=null,pcx0=1e9,pcz0=1e9,tq=[],instDirty=true,wReady=false;
const FAMS={treeC:/^CommonTree/,treeP:/^Pine/,treeT:/^TwistedTree/,treeD:/^DeadTree/,rock:/^Rock_Medium/,bush:/^Bush_/,flw:/^(Flower|Clover)/,gr:/^Grass_/,fern:/^(Fern|Plant)/,mush:/^Mushroom/,peb:/^Pebble/};
const SMALL=/^(Grass|Flower|Clover|Fern|Plant|Mushroom|Pebble)/,CAPF={treeC:240,treeP:240,treeT:120,treeD:120,rock:500,bush:400,flw:500,gr:1800,fern:500,mush:200,peb:300};
const TINT=[[1,1,1],[1,.96,.86],[.93,1,.8],[1,.84,.8],[.86,1,.92],[1,.9,.72],[1,1,1],[.95,.98,1]];
const slopeAt=(x,z)=>Math.hypot(H0(x+1.2,z)-H0(x-1.2,z),H0(x,z+1.2)-H0(x,z-1.2))/2.4;
const nearRoad=(x,z,m)=>roadD(x,z)<m;
const forestN=(x,z)=>Math.max(0,Math.min(1,(Math.sin(x*.021+1)*Math.sin(z*.019+2)+Math.sin(x*.043-z*.031)*.5+1.5)/3));
function genChunk(cx,cz){const key=cx+','+cz;let c=GEN.get(key);if(c)return c;c={L:{},col:[]};GEN.set(key,c);
 let sd=((cx*73856093)^(cz*19349663))>>>0||1;const r=()=>(sd=(sd*1664525+1013904223)>>>0)/4294967296,x0=cx*CH_,z0=cz*CH_,G=[.6,1,1.4][S.cfg.gfx]||1;
 const pick=f=>{const a=VAR[f];return a&&a.length?a[(r()*a.length)|0]:null};
 const ok=(x,z,sl,m)=>{if(wetDepth(x,z)>-.7)return false;if(slopeAt(x,z)>sl)return false;for(const p of PADS)if(Math.hypot(x-p.x,z-p.z)<p.r*(m||1.1))return false;return roadD(x,z)>3.2};
 const add=(kind,x,z,t,byW,colK)=>{const m=MD[kind];if(!m)return;const s=t/(byW?m.w:m.h);let yy=H0(x,z);const rr=colK?Math.max(.2,m[colK]*s*.8):0;if(rr>.3)for(const [ox,oz] of [[rr,0],[-rr,0],[0,rr],[0,-rr]])yy=Math.min(yy,H0(x+ox,z+oz));yy-=colK==='rr'?t*.06:.08;(c.L[kind]=c.L[kind]||[]).push([x,yy,z,s,r()*6.283,r()]);if(colK&&m[colK]*s>.25)c.col.push({x,z,r:Math.max(.3,m[colK]*s*.95),d:1,y:yy,h:colK==='rr'?m.h*s*.9:0})};
 for(let i=0,N=11*G|0;i<N;i++){const x=x0+r()*CH_,z=z0+r()*CH_,f=forestN(x,z);if(r()>f*1.25||!ok(x,z,.75,1.4))continue;const h=H0(x,z),wd=-wetDepth(x,z),q=r();
  const fm=q<.05||slopeAt(x,z)>.5?'treeD':wd<2.2&&r()<.4?'treeT':h>15||(f>.7&&q<.5)?'treeP':'treeC';const k=pick(fm);if(k)add(k,x,z,fm==='treeD'?6+r()*3:7+r()*5,false,'br')}
 for(let i=0,N=5*G|0;i<N;i++){const x=x0+r()*CH_,z=z0+r()*CH_;if(!ok(x,z,1.2,1))continue;const big=r()<.14,k=pick('rock');if(k)add(k,x,z,big?7+r()*6:2+r()*3,true,'rr')}
 for(let i=0,N=3*G|0;i<N;i++){const x=x0+r()*CH_,z=z0+r()*CH_;if(slopeAt(x,z)<.5||wetDepth(x,z)>-.7||roadD(x,z)<3)continue;const k=pick('rock');if(k)add(k,x,z,3+r()*5,true,'rr')}
 for(let i=0,N=5*G|0;i<N;i++){const x=x0+r()*CH_,z=z0+r()*CH_;if(!ok(x,z,.6)||r()>.4+forestN(x,z)*.6)continue;const k=pick('bush');if(k)add(k,x,z,1.1+r()*.9)}
 for(let i=0,N=260*G|0;i<N;i++){const x=x0+r()*CH_,z=z0+r()*CH_;if(!ok(x,z,.7,1)||r()>.9)continue;const k=pick('gr');if(k)add(k,x,z,.55+r()*.6)}
 for(let i=0,N=22*G|0;i<N;i++){const x=x0+r()*CH_,z=z0+r()*CH_;if(!ok(x,z,.6)||forestN(x,z)>.75)continue;const k=pick('flw');if(k)add(k,x,z,.5+r()*.4)}
 for(let i=0,N=9*G|0;i<N;i++){const x=x0+r()*CH_,z=z0+r()*CH_;if(!ok(x,z,.6)||forestN(x,z)<.35)continue;const k=pick('fern');if(k)add(k,x,z,.7+r()*.5)}
 for(let i=0,N=3;i<N;i++){const x=x0+r()*CH_,z=z0+r()*CH_;if(!ok(x,z,.5)||forestN(x,z)<.5)continue;const k=pick('mush');if(k)add(k,x,z,.4+r()*.3)}
 for(let i=0,N=6;i<N;i++){const x=x0+r()*CH_,z=z0+r()*CH_,w=wetDepth(x,z);if(w<-1.6||w>-.1||slopeAt(x,z)>.5)continue;const k=pick('peb');if(k)add(k,x,z,.4+r()*.5,true)}
 return c}
function tmat(){const m=new THREE.MeshLambertMaterial({vertexColors:true});m.onBeforeCompile=sh=>{sh.uniforms.tG={value:TEX.grass_c};sh.uniforms.tR={value:TEX.rock_c};sh.uniforms.tD={value:TEX.road_c};
 sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nattribute vec3 aW;attribute vec2 aR;varying vec2 vR;varying vec3 vW;varying vec3 vWp;').replace('#include <begin_vertex>','#include <begin_vertex>\nvR=aR;vW=aW;vWp=(modelMatrix*vec4(position,1.0)).xyz;');
 sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying vec2 vR;varying vec3 vW;varying vec3 vWp;uniform sampler2D tG;uniform sampler2D tR;uniform sampler2D tD;').replace('#include <map_fragment>','vec2 uv=vWp.xz*0.10;vec3 cg=pow(texture2D(tG,uv).rgb,vec3(2.2)),cr=pow(texture2D(tR,uv*0.8).rgb,vec3(2.2)),cd=pow(texture2D(tD,vR).rgb,vec3(2.2));vec3 c2=pow(texture2D(tG,uv*0.21+vec2(0.37,0.11)).rgb,vec3(2.2));cg=mix(cg,c2,0.45);float lm=dot(cg,vec3(0.33));cg=mix(vec3(lm),cg,0.68)*0.78;diffuseColor.rgb*=(cg*vW.x+cr*vW.y+cd*vW.z)*1.0;')};return m}
function buildTerrain(cx,cz){const SG=24,RU=new Float32Array((CH_*0+25*25)*2),g=new THREE.PlaneGeometry(CH_,CH_,SG,SG);g.rotateX(-Math.PI/2);const p=g.attributes.position,n=p.count,W=new Float32Array(n*3),N=new Float32Array(n*3),C=new Float32Array(n*3),ox=(cx+.5)*CH_,oz=(cz+.5)*CH_;
 for(let i=0;i<n;i++){const x=p.getX(i)+ox,z=p.getZ(i)+oz,h=H0(x,z),hx=(H0(x+1,z)-H0(x-1,z))/2,hz=(H0(x,z+1)-H0(x,z-1))/2,l=Math.hypot(hx,1,hz),sl=Math.hypot(hx,hz);p.setXYZ(i,x,h,z);N[i*3]=-hx/l;N[i*3+1]=1/l;N[i*3+2]=-hz/l;
  const wr=Math.min(1,Math.max(0,(sl-.42)/.35)),ri=roadInfo(x,z),rd=1-ss(1.8,3.8,ri[0]),wt=wetDepth(x,z),wd=Math.min(1,rd+(wt>-1.2?.55:0))*(1-wr),wg=Math.max(0,1-wr-wd);W[i*3]=wg;W[i*3+1]=wr;W[i*3+2]=wd;RU[i*2]=ri[1]*.17;RU[i*2+1]=ri[2]*.17;
  const pm=Math.sin(x*.045+z*.06)*Math.cos(z*.05-x*.035),pn=Math.sin(x*.21+z*.17)*Math.sin(x*.13-z*.19),hf=Math.min(1,Math.max(0,h/22));C[i*3]=1+.1*pm+.05*pn+.08*hf;C[i*3+1]=1+.06*pn-.04*hf;C[i*3+2]=1-.09*pm-.05*hf}
 g.setAttribute('aW',new THREE.BufferAttribute(W,3));g.setAttribute('aR',new THREE.BufferAttribute(RU,2));g.setAttribute('normal',new THREE.BufferAttribute(N,3));g.setAttribute('color',new THREE.BufferAttribute(C,3));g.computeBoundingSphere();
 const m=new THREE.Mesh(g,TMAT);m.userData.ij=[cx,cz];sc.add(m);TCH.set(cx+','+cz,m);instDirty=true}
function fogD(){return 1.9/(S.cfg.rd*CH_)}
function worldCfg(){if(!wReady)return;sc.fog.density=fogD();pcx0=1e9;instDirty=true}
const _M=new THREE.Matrix4(),_Q=new THREE.Quaternion(),_V=new THREE.Vector3(),_S=new THREE.Vector3(),_Y=new THREE.Vector3(0,1,0);
let lRX=1e9,lRZ=1e9;
function rebuildInst(){const rd=S.cfg.rd,gq=S.cfg.gfx,pp=P.root.position,px=Math.floor(pp.x/CH_),pz=Math.floor(pp.z/CH_),TR=Math.min(rd*CH_*.85,[80,115,155][gq]||115),SR=([24,34,48][gq]||34)*(.7+.3*S.cfg.vd),TR2=TR*TR,SR2=SR*SR;
 for(let i=COLc.length-1;i>=0;i--)if(COLc[i].d)COLc.splice(i,1);const cnt={};for(const k in IMS)cnt[k]=0;
 TCH.forEach(m=>{const [i,j]=m.userData.ij;if(Math.max(Math.abs(i-px),Math.abs(j-pz))>rd)return;const g=genChunk(i,j);
  for(const kind in g.L){const ims=IMS[kind];if(!ims)continue;const lim=SMALL.test(kind)?SR2:TR2,cap=ims[0].userData.cap;for(const a of g.L[kind]){const dx=a[0]-pp.x,dz=a[2]-pp.z;if(dx*dx+dz*dz>lim)continue;if(cnt[kind]>=cap)break;const n=cnt[kind]++,t=TINT[(a[5]*TINT.length)|0];_Q.setFromAxisAngle(_Y,a[4]);_M.compose(_V.set(a[0],a[1],a[2]),_Q,_S.setScalar(a[3]));
   for(const im of ims){im.setMatrixAt(n,_M);const ca=im.instanceColor.array;ca[n*3]=t[0];ca[n*3+1]=t[1];ca[n*3+2]=t[2]}}}
  g.col.forEach(c=>{const dx=c.x-pp.x,dz=c.z-pp.z;if(dx*dx+dz*dz<=TR2)COLc.push(c)})});
 for(const k in IMS)IMS[k].forEach(im=>{im.count=cnt[k];im.instanceMatrix.needsUpdate=true;im.instanceColor.needsUpdate=true});instDirty=false;lRX=pp.x;lRZ=pp.z}
function updateWorld(force){if(!wReady)return;const px=Math.floor(P.root.position.x/CH_),pz=Math.floor(P.root.position.z/CH_),rd=S.cfg.rd;
 if(px!==pcx0||pz!==pcz0){pcx0=px;pcz0=pz;tq=[];for(let i=px-rd;i<=px+rd;i++)for(let j=pz-rd;j<=pz+rd;j++){if(i<-4||i>3||j<-4||j>3||TCH.has(i+','+j))continue;tq.push([i,j])}tq.sort((a,b)=>Math.hypot(a[0]-px,a[1]-pz)-Math.hypot(b[0]-px,b[1]-pz));
  TCH.forEach((m,k)=>{const [i,j]=m.userData.ij;if(Math.abs(i-px)>rd+1||Math.abs(j-pz)>rd+1){sc.remove(m);m.geometry.dispose();TCH.delete(k);instDirty=true}});
  if(GEN.size>260)GEN.clear()}
 let n=force?9999:1;while(n-->0&&tq.length){const q=tq.shift();buildTerrain(q[0],q[1])}
 if(instDirty&&!tq.length)rebuildInst()}
function waterMat(rep){const t=TEX.water_n.clone();t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rep,rep);t.needsUpdate=true;return new THREE.MeshStandardMaterial({color:lin(0x4aa8cc),transparent:true,opacity:.62,roughness:.05,metalness:.2,normalMap:t,normalScale:new THREE.Vector2(.5,.5),depthWrite:false,side:THREE.DoubleSide})}
function buildWater(){LAKES.forEach(L=>{const m=new THREE.Mesh(new THREE.CircleGeometry(L.r*1.5,56),waterMat(9));m.rotation.x=-Math.PI/2;m.position.set(L.x,L.lv,L.z);sc.add(m);WATERS.push(m)});
 const zs=[];for(let z=-236;z<=128;z+=Math.abs(z-ZF)<9?1.5:6)zs.push(z);const pos=[],uv=[],idx=[];
 zs.forEach((z,i)=>{const xc=rxc(z),w=RW(z)*1.15,y=Ws(z)+.08;pos.push(xc-w,y,z,xc+w,y,z);uv.push(0,z/7,1,z/7);if(i<zs.length-1){const a=i*2;idx.push(a,a+1,a+2,a+1,a+3,a+2)}});
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();const m=new THREE.Mesh(g,waterMat(1));m.material.normalMap.repeat.set(1.5,1);sc.add(m);WATERS.push(m);
 WFP=[rxc(ZF+3),Ws(ZF+6)+.6,ZF+3]}
function initWorld(){TMAT=tmat();
 const LIM={treeC:4200,treeP:4200,treeT:10500,treeD:6600,rock:600,bush:1400,flw:800,gr:340,fern:300,mush:900,peb:200};
 for(const f in FAMS)VAR[f]=Object.keys(MD).filter(k=>FAMS[f].test(k)&&MD[k].tri<=LIM[f]);
 for(const f in FAMS)VAR[f].forEach(k=>{const m=MD[k],fol=/^(Grass|Flower|Clover|Fern|Plant|Bush|Mushroom|Common|Pine|Twisted|Dead)/.test(k);IMS[k]=m.parts.map(p=>{const mt=new THREE.MeshLambertMaterial({map:p.m.map,alphaTest:Math.max(p.m.alphaTest||0,fol?.4:0),side:fol?THREE.DoubleSide:THREE.FrontSide});const im=new THREE.InstancedMesh(p.g,mt,CAPF[f]);im.userData.cap=CAPF[f];im.count=0;im.frustumCulled=false;im.instanceMatrix.setUsage(THREE.DynamicDrawUsage);im.instanceColor=new THREE.InstancedBufferAttribute(new Float32Array(CAPF[f]*3).fill(1),3);sc.add(im);return im})});
 sc.fog=new THREE.FogExp2(lin(AS.fog||0xadc2f2),fogD());buildWater();wReady=true;pcx0=1e9;updateWorld(true);rebuildInst()}
function worldTick(dt){if(!wReady)return;const pq=P.root.position;if(Math.hypot(pq.x-lRX,pq.z-lRZ)>9)instDirty=true;updateWorld(false);const t=performance.now()*.001;WATERS.forEach((m,i)=>{m.material.normalMap.offset.set(t*.02*(i?0:1),-t*(i?.22:.03));m.material.opacity=.6+Math.sin(t*1.3+i)*.03});
 if(WFP){if(Math.random()<.35)spark(WFP[0]+(Math.random()-.5)*9,WFP[1]+Math.random()*2.5,WFP[2]+Math.random()*3,0xffffff,1,1.6,1.3,3.6);
  if(AC&&AS.rain&&!wfBuf&&!wfBuf_){wfBuf_=1;AC.decodeAudioData(AS.rain.slice(0),b=>{wfBuf=b;const s=AC.createBufferSource();s.buffer=b;s.loop=true;wfGain=AC.createGain();wfGain.gain.value=0;s.connect(wfGain);wfGain.connect(AC.destination);s.start()},()=>{})}
  if(wfGain){const p=P.root.position,d=Math.hypot(p.x-WFP[0],p.z-WFP[2]);wfGain.gain.value=Math.pow(Math.max(0,1-d/120),2)*.9*S.cfg.sfx*S.cfg.vol}}}
let wfBuf_=0;
async function loadPacks(done){try{AS.ch={};AS.an={};AS.sk={};AS.gl={};const tx={};const r=await fetch('pack1.bin');if(!r.ok)throw new Error('pack1.bin '+r.status);const tot=+r.headers.get('content-length')||0,rd=r.body.getReader(),parts=[];let got=0;
 for(;;){const {done:dn,value}=await rd.read();if(dn)break;parts.push(value);got+=value.length;$('lb').style.width=(tot?Math.min(100,got/tot*100):50)+'%';$('lt').textContent=(L('Mengunduh aset|Downloading assets'))+' '+(got/1048576).toFixed(1)+' MB'}
 const u=new Uint8Array(got);let o=0;parts.forEach(p=>{u.set(p,o);o+=p.length});const buf=u.buffer,dv=new DataView(buf),jl=dv.getUint32(4,true),idx=JSON.parse(new TextDecoder().decode(new Uint8Array(buf,8,jl))),base=8+jl;
 for(const k in idx){const b=buf.slice(base+idx[k][0],base+idx[k][0]+idx[k][1]),[a,n]=k.split('/');if(a==='ch')AS.ch[n]=b;else if(a==='an')AS.an[n]=b;else if(a==='sk')AS.sk[n]=b;else if(a==='gl')AS.gl[n]=b;else if(a==='tex')tx[n]=b;else AS[k]=b}
 await Promise.all(Object.keys(tx).map(k=>new Promise(res=>{const im=new Image();im.onload=()=>{const t=new THREE.Texture(im);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=4;t.needsUpdate=true;TEX[k]=t;res()};im.onerror=()=>res();im.src=URL.createObjectURL(new Blob([tx[k]],{type:'image/jpeg'}))})));
 done()}catch(e){console.error(e);$('lt').textContent='Gagal memuat aset: '+e.message}}

function manaTick(dt){const h=H[S.hero];if(P.mmp!==h.mp){P.mmp=h.mp;P.mp=Math.min(P.mp===undefined?h.mp:P.mp,h.mp)}P.mp=Math.min(P.mmp,P.mp+h.mr*dt);
 if(P.regen>0){P.regen-=dt;P.hp=Math.min(P.mhp,P.hp+14*dt);HPm[S.hero]=P.hp;P.rg=(P.rg||0)+dt;if(P.rg>.45){P.rg=0;const p=P.root.position;spark(p.x,p.y+1,p.z,0x7dff9a,3,2,.8,1.2)}}}
function regenSkill(){if(P.cd[3]>0)return;if(P.mp<25){pop(P.root.position.clone().setY(P.root.position.y+2.3),L('Mana kurang|No mana'),'#7aa8ff');return}P.mp-=25;P.cd[3]=14;P.regen=6;P.rg=0;sfx(1.4,.5);act('Use_Item',.5,1.6);const p=P.root.position;spark(p.x,p.y+1,p.z,0x7dff9a,14,3,.7,1.3);fxRing(p.x,p.z,1.8,0x7dff9a,.6)}
