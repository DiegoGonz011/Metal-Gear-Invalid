const cv=document.getElementById('c'),ctx=cv.getContext('2d');cv.width=1920;cv.height=1200;ctx.scale(2,2);ctx.imageSmoothingQuality='high';
const VW=960,VH=600,WW=2000,WH=1300;
let seed=7;const rnd=()=>(seed=(seed*16807)%2147483647)/2147483647;
const D=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const norm=a=>{while(a>Math.PI)a-=2*Math.PI;while(a<-Math.PI)a+=2*Math.PI;return a};
// ---------- Nivel ----------
const rocks=[{x:600,y:200,w:40,h:340},{x:900,y:700,w:360,h:36},{x:1300,y:250,w:36,h:300},{x:300,y:800,w:260,h:36},{x:1560,y:760,w:36,h:340}];
const goal={x:1840,y:1120,w:110,h:110};
const guardDefs=[
 [[500,420],[500,120],[300,120],[300,420]],
 [[800,300],[1100,300],[1100,560],[800,560]],
 [[1000,950],[1450,950],[1450,1150],[1000,1150]],
 [[1400,420],[1700,420],[1700,200],[1400,200]],
 [[1700,900],[1700,1150]],
 [[400,1050],[700,1050],[700,900],[400,900]],
 [[1500,600],[1850,600],[1850,720],[1500,720]],
 [[200,650],[200,950]],
 [[1200,100],[1650,100],[1650,160],[1200,160]],
 [[900,500],[900,640],[1250,640]]
];
const trees=[],grass=[],water=[];
{const pts=[];guardDefs.forEach(p=>p.forEach(q=>pts.push(q)));pts.push([100,100],[1895,1175],[1230,470],[1120,1090],[350,300],[1050,760],[1600,600],[700,700],[1700,480],[1000,200]);
 const ok=(x,y,m)=>pts.every(q=>Math.hypot(q[0]-x,q[1]-y)>m);
 for(let i=0;i<700&&trees.length<95;i++){const x=rnd()*WW,y=rnd()*WH;
  if(ok(x,y,90)&&!rocks.some(r=>x>r.x-40&&x<r.x+r.w+40&&y>r.y-40&&y<r.y+r.h+40))trees.push({x,y,r:14+rnd()*8})}
 for(let i=0;i<45;i++)grass.push({x:rnd()*WW,y:rnd()*WH,r:50+rnd()*60})}
function blocked(x,y,r){
 if(x<r||y<r||x>WW-r||y>WH-r)return true;
 for(const t of trees)if(Math.hypot(x-t.x,y-t.y)<r+t.r*.55)return true;
 for(const k of rocks)if(x>k.x-r&&x<k.x+k.w+r&&y>k.y-r&&y<k.y+k.h+r)return true;
 return false}
function los(a,b){const d=D(a,b),n=Math.ceil(d/10);
 for(let i=1;i<n;i++){const t=i/n;if(blocked(a.x+(b.x-a.x)*t,a.y+(b.y-a.y)*t,0))return false}return true}
function mv(e,dx,dy,r){if(!blocked(e.x+dx,e.y,r))e.x+=dx;if(!blocked(e.x,e.y+dy,r))e.y+=dy}
const inGrass=e=>grass.some(g=>D(e,g)<g.r*.8);
// ---------- Estado ----------
let ground=null,parts=[],shk=0,lv=0,items=[],bp=0,rings=[],prog=0,P,guards,darts,bullets,state='title',msgs=[],mt=0,alertLevel=0,time=0;
function reset(){buildLevel(lv);parts=[];shk=0;
 P={x:LV[lv].start.x,y:LV[lv].start.y,a:0,hp:100,ammo:6,box:false,grab:null,sneak:false,cd:0,spd:0,cqcCd:0,docs:false,sci:false,walk:0,f:null,sta:100,gren:1,prone:false};rings=[];
 items=LV[lv].items.map(i=>({...i}));
 guards=guardDefs.map((p,i)=>({x:p[0][0],y:p[0][1],a:0,ty:i%3,vr:200+Math.random()*80,path:p,pi:0,pause:0,st:'patrol',det:0,t:0,alertT:0,target:null,shoot:0,talked:false,hp:i%3===2?2:1}));
 darts=[];bullets=[];state='play';say(LV[lv].radio)}
function say(t){msgs=[t];mt=4;try{sfx(660,.08,'sine',.05,990)}catch(e){}}
// ---------- Entrada ----------
const K={};let M={x:0,y:0},md=false;
addEventListener('keydown',e=>{const k=e.key.toLowerCase();if(K[k])return;K[k]=1;
 if(['arrowup','arrowdown','arrowleft','arrowright',' '].includes(k))e.preventDefault();
 if(state==='title'||state==='brief'){if(k==='enter'||k===' '){if(state==='title'){state='brief';bp=0}else if(++bp>=story.length)reset()}return}
 if(state!=='play'){if(k==='enter'||k===' ')proceed();return}
 if(k==='b'){if(P.grab)return;P.box=!P.box;say(P.box?'Caja de cartón puesta. Quieto, nadie sospecha.':'Caja guardada.')}
 if(k===' ')cqc();
 if(k==='e')interrogate();
 if(k==='c'&&!P.box)P.prone=!P.prone;
 if(k==='q'&&P.grab){const g=P.grab;drop(g);g.st='sleep';g.t=90;g.grabbed=false;P.grab=null;say('Estrangulamiento: el guardia duerme profundamente.')}
 if(k==='g')stun();
 if(k==='t')toss()});
addEventListener('keyup',e=>K[e.key.toLowerCase()]=0);
const MC={x:0,y:0};function pos(e){const r=cv.getBoundingClientRect();if(typeof aim3==='function')aim3()}
cv.addEventListener('mousemove',pos);
cv.addEventListener('mousedown',e=>{if(e.button===2){ads.on=1;return}pos(e);md=true;if(state==='title'){state='brief';bp=0}else if(state==='brief'){if(++bp>=story.length)reset()}else if(state!=='play')proceed()});
addEventListener('mouseup',e=>{if(e.button===2)ads.on=0;else md=false});
// ---------- Acciones ----------
function cqc(){
 if(P.cqcCd>0)return;
 if(P.grab){const g=P.grab;g.st='down';g.t=15;g.grabbed=false;g.hp=0;P.grab=null;P.cqcCd=.5;drop(g);puff(g.x,g.y,14,'180,160,120',130,.45);shk=.2;say('¡Lanzamiento CQC! Guardia inconsciente (despertará en unos segundos).');return}
 if(P.box)return;
 let best=null,bd=44;
 for(const g of guards){const d=D(g,P);if(d<bd&&g.st!=='sleep'&&g.st!=='down'){bd=d;best=g}}
 if(best){best.grabbed=true;best.st='grabbed';P.grab=best;P.cqcCd=.3;say('CQC: agarre. [ESPACIO] lanzar · [E] interrogar')}
}
function interrogate(){const g=P.grab;if(!g){const s=items.find(i=>i.t==='sci'&&D(i,P)<40);if(s&&P.docs){items=items.filter(i=>i!==s);P.sci=true;P.f={x:s.x,y:s.y};say(s.n==='El Jefazo'?'El Jefazo: "¡Ya po, me rindo! Llévame de vuelta, cachai…"':(s.n||'Dr. Kuzmin')+': "Gracias… sígueme, te cubro."')}else if(s)say('Primero completa el objetivo anterior.');return}
 if(g.talked){say('"No sé nada más…"');return}
 g.talked=true;P.ammo+=4;say('Interrogatorio: el guardia soltó 4 dardos tranquilizantes.')}
const puff=(x,y,n,c,s,l)=>{for(let i=0;i<n;i++){const a=Math.random()*6.28,v=Math.random()*s;parts.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,l:l,m:l,c,r:2+Math.random()*3})}};
function drop(g){if(g.dp)return;g.dp=1;const r=Math.random();items.push({t:r<.6?'ammo':r<.85?'gren':'ration',x:g.x,y:g.y})}
function guardFx(g){if(g.st==='alert'){ctx.strokeStyle='rgba(255,60,50,'+(.5+.3*Math.sin(time*9))+')';ctx.lineWidth=2.5;ctx.beginPath();ctx.arc(g.x,g.y,26+Math.sin(time*9)*3,0,7);ctx.stroke()}else if(g.det>.05&&g.st!=='sleep'&&g.st!=='down'){ctx.strokeStyle='rgba(255,214,10,.85)';ctx.lineWidth=3;ctx.beginPath();ctx.arc(g.x,g.y,26,-1.57,-1.57+6.28*Math.min(1,g.det));ctx.stroke()}}
function toss(){if(P.box||P.grab)return;const t={x:M.sx+cam.x,y:M.sy+cam.y};rings.push({x:t.x,y:t.y,r:0,c:'255,255,255'});
 for(const g of guards)if(D(g,t)<260&&(g.st==='patrol'||g.st==='sus')){g.st='sus';g.target={x:t.x,y:t.y};g.t=6}
 say('Lanzas un casquillo: los guardias van a investigar el ruido.')}
function stun(){if(P.gren<=0||P.box||P.grab){say('No puedes lanzar una aturdidora ahora.');return}
 P.gren--;let tx=M.sx+cam.x,ty=M.sy+cam.y;const dx=tx-P.x,dy=ty-P.y,dd=Math.hypot(dx,dy);if(dd>300){tx=P.x+dx/dd*300;ty=P.y+dy/dd*300}
 const t={x:tx,y:ty};rings.push({x:tx,y:ty,r:0,c:'255,240,150'});puff(tx,ty,30,'255,250,200',260,.5);shk=.3;
 for(const g of guards){if(g.st==='grabbed'||g.st==='sleep')continue;const d=D(g,t);
  if(d<170){g.st='down';g.t=6;g.det=0}else if(d<340&&(g.st==='patrol'||g.st==='sus')){g.st='sus';g.target={x:tx,y:ty};g.t=6}}
 say('¡Granada aturdidora! Los guardias cercanos quedan cegados unos segundos.')}
function shoot(){
 if(P.box||P.cd>0||P.grab)return;
 if(P.ammo<=0){say('Sin arma. Duerme a un guardia para que suelte munición.');P.cd=.6;return}
 P.ammo--;P.cd=.45;try{sfx(500,.12,'triangle',.07,120)}catch(e){}P.rec=.12;puff(P.x+Math.cos(P.a)*34,P.y+Math.sin(P.a)*34,4,'255,240,160',90,.15);
 {const sx=P.x+Math.cos(P.a)*28,sy=P.y+Math.sin(P.a)*28,sz=33,dx=AIM.x-sx,dy=AIM.y-sy,dz=AIM.h-sz,L=Math.hypot(dx,dy,dz)||1,sp=700;darts.push({x:sx,y:sy,z:sz,vx:dx/L*sp,vy:dy/L*sp,vz:dz/L*sp,life:1.3})}}
function alertAll(g,src){g.st='alert';g.alertT=10;g.target={x:src.x,y:src.y};
 for(const o of guards)if(o!==g&&D(o,g)<450&&(o.st==='patrol'||o.st==='sus')){o.st='alert';o.alertT=10;o.target={x:src.x,y:src.y}}}
// ---------- IA ----------
function turn(g,ta,rate,dt){const d=norm(ta-g.a);g.a+=Math.sign(d)*Math.min(Math.abs(d),rate*dt)}
function updateGuard(g,dt){
 if(g.st==='grabbed'){g.x=P.x+Math.cos(P.a)*22;g.y=P.y+Math.sin(P.a)*22;return}
 if(g.st==='sleep'||g.st==='down'){g.t-=dt;if(g.t<=0){g.st='sus';g.hp=1;g.target={x:g.x,y:g.y};g.det=.2;say('Un guardia despertó…')}return}
 // visión
 let range=g.vr*(LV[lv].night?.8:1);
 if(P.box)range=P.spd>5?range*.4:45;
 else{if(P.prone)range*=.5;else if(P.sneak)range*=.75;if(inGrass(P))range*=P.prone?.3:P.sneak?.5:.85}
 const d=D(g,P),diff=Math.abs(norm(Math.atan2(P.y-g.y,P.x-g.x)-g.a));
 const seen=d<range&&(diff<.62||d<32)&&los(g,P);
 if(seen){g.det+=dt*(1.2+(1-d/range)*2.4);g.target={x:P.x,y:P.y};if(g.st==='patrol')g.st='sus';if(g.st==='alert')g.alertT=10}
 else g.det=Math.max(0,g.det-dt*.35);
 // ruido
 if(!P.box&&!P.sneak&&P.spd>100&&d<110&&!seen){g.det+=dt*.5;if(g.st==='patrol'){g.st='sus';g.target={x:P.x,y:P.y}}}
 // guardias caídos a la vista
 if(g.st==='patrol')for(const o of guards)if((o.st==='sleep'||o.st==='down')&&D(o,g)<220&&Math.abs(norm(Math.atan2(o.y-g.y,o.x-g.x)-g.a))<.6&&los(g,o)){g.st='sus';g.target={x:o.x,y:o.y};g.t=7;g.det=Math.max(g.det,.3)}
 if(g.det>=1&&g.st!=='alert'){alertAll(g,P);say('¡Te han descubierto!')}
 if(g.st==='patrol'){
  if(g.pause>0){g.pause-=dt;g.a+=dt*.6;return}
  const w={x:g.path[g.pi][0],y:g.path[g.pi][1]};
  if(D(g,w)<6){g.pi=(g.pi+1)%g.path.length;g.pause=1.2;return}
  const ta=Math.atan2(w.y-g.y,w.x-g.x);turn(g,ta,4,dt);mv(g,Math.cos(g.a)*65*dt,Math.sin(g.a)*65*dt,10)
 }else if(g.st==='sus'){
  g.t-=dt;const tg=g.target;if(!tg){g.st='patrol';return}
  turn(g,Math.atan2(tg.y-g.y,tg.x-g.x),5,dt);
  if(D(g,tg)>22)mv(g,Math.cos(g.a)*75*dt,Math.sin(g.a)*75*dt,10);
  else{for(const o of guards)if((o.st==='sleep'||o.st==='down')&&D(o,g)<40){o.t=0;say('Un guardia despierta a su compañero.')}
   g.pause=0;if(!seen&&g.det<.05||g.t<-2){g.st='patrol';g.t=0}}
  if(g.t<-4){g.st='patrol';g.t=0}
 }else if(g.st==='alert'){
  g.alertT-=dt;const tg=g.target;
  turn(g,Math.atan2(tg.y-g.y,tg.x-g.x),7,dt);
  if(seen&&d<170){g.shoot-=dt;if(g.shoot<=0){g.shoot=.95;const e=(Math.random()-.5)*.22;
   bullets.push({x:g.x,y:g.y,vx:Math.cos(g.a+e)*480,vy:Math.sin(g.a+e)*480,life:.55});puff(g.x+Math.cos(g.a)*30,g.y+Math.sin(g.a)*30,3,'255,200,120',80,.12)}}
  else if(D(g,tg)>20)mv(g,Math.cos(g.a)*135*dt,Math.sin(g.a)*135*dt,10);
  if(g.alertT<=0){g.st='sus';g.t=5;g.det=.3}
 }
}
// ---------- Update ----------
function update(dt){
 time+=dt;P.cd-=dt;P.cqcCd-=dt;mt-=dt;
 P.sneak=!!K.shift;
 let ix=(K.d||K.arrowright?1:0)-(K.a||K.arrowleft?1:0),iy=(K.s||K.arrowdown?1:0)-(K.w||K.arrowup?1:0);
 {const f=-iy,r=ix;ix=f*Math.cos(cm.yaw)-r*Math.sin(cm.yaw);iy=f*Math.sin(cm.yaw)+r*Math.cos(cm.yaw)}
 const l=Math.hypot(ix,iy)||1;
 let sp=P.prone?38:P.sneak?60:125;if(P.box)sp=70;if(P.sta<=0)sp*=.6;if(inWater(P))sp*=.55;if(P.grab)sp*=.6;if(ads.on)sp*=.55;
 const ox=P.x,oy=P.y;
 mv(P,ix/l*sp*dt,iy/l*sp*dt,11);
 P.spd=Math.hypot(P.x-ox,P.y-oy)/dt;
 P.walk+=P.spd*dt*.07;
 P.sta=Math.max(0,P.sta-dt*(P.spd>100?.8:.3));if(P.sta<=0){P.hp-=dt*1.5;if(P.hp<=0)state='dead'}
 for(const r of rings)r.r+=300*dt;rings=rings.filter(r=>r.r<220);
 for(const p of parts){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=.94;p.vy*=.94;p.l-=dt}parts=parts.filter(p=>p.l>0);shk=Math.max(0,shk-dt);P.rec=Math.max(0,(P.rec||0)-dt);
 if(P.spd>60&&!P.box&&Math.random()<dt*10)puff(P.x-Math.cos(P.a)*10,P.y-Math.sin(P.a)*10+8,1,'150,130,90',25,.5);
 if(inWater(P)&&P.spd>20&&Math.random()<dt*14)puff(P.x,P.y+8,1,'170,210,240',40,.5);
 for(const it of items){if(D(it,P)>22)continue;if(it.t==='doc'){P.docs=true;it.x=-999;say(it.m||'Cuaderno recuperado. SOPAIPILLA: "Bacán. Ahora el doctor, al sur."')}else if(it.t==='ration'&&(P.hp<100||P.sta<90)){P.hp=Math.min(100,P.hp+30);P.sta=Math.min(100,P.sta+45);it.x=-999;say('Ración consumida: +vida y resistencia.')}else if(it.t==='ammo'){P.ammo+=4;it.x=-999;say('Dardos tranquilizantes recogidos.')}else if(it.t==='gren'){P.gren++;it.x=-999;say('Granada aturdidora recogida.')}}
 items=items.filter(i=>i.x>-900);
 const rd=items.find(i=>i.t==='radio'&&D(i,P)<44);
 if(rd&&K.e&&!P.grab){prog+=dt;if(prog>=3){prog=0;const rx=rd.x,ry=rd.y;rd.x=-999;P.docs=true;say('Transmisor saboteado. SOPAIPILLA: "Silencio total… la raja, Culebra."');for(const g of guards)if(g.st==='patrol'&&Math.hypot(g.x-rx,g.y-ry)<400){g.st='sus';g.target={x:rx,y:ry};g.t=6}}}else prog=0;
 if(inWater(P)&&P.spd>50)for(const g of guards)if(D(g,P)<190&&g.st==='patrol'){g.st='sus';g.target={x:P.x,y:P.y};g.t=5}
 if(P.f&&D(P.f,P)>40){const fa=Math.atan2(P.y-P.f.y,P.x-P.f.x);mv(P.f,Math.cos(fa)*115*dt,Math.sin(fa)*115*dt,9)}
 const wx=M.sx+cam.x,wy=M.sy+cam.y;
 if(!P.box||P.spd>5){P.a=P.spd>5&&P.box?Math.atan2(iy,ix):Math.atan2(wy-P.y,wx-P.x)}
 if(md)shoot();
 for(const g of guards)updateGuard(g,dt);
 // dardos
 for(const d of darts){d.x+=d.vx*dt;d.y+=d.vy*dt;d.z+=d.vz*dt;d.life-=dt;
  if(d.z<=0||(d.z<100&&blocked(d.x,d.y,0))){d.life=0;puff(d.x,d.y,5,'200,200,180',70,.3)}
  for(const g of guards)if(d.life>0&&g.st!=='grabbed'&&g.st!=='sleep'&&Math.hypot(d.x-g.x,d.y-g.y)<14&&d.z>-2&&d.z<66*(g.ty===2?1.18:1)){
   d.life=0;const hs=d.z>47*(g.ty===2?1.18:1);
   if(g.hp>1&&!hs){g.hp--;g.st='sus';g.target={x:P.x,y:P.y};g.det=Math.max(g.det,.6);puff(g.x,g.y,8,'155,229,100',90,.4);say('El guardia pesado resiste el dardo. Apunta a la cabeza.')}
   else{drop(g);if(hs)P.ammo++;puff(g.x,g.y,12,'155,229,100',130,.5);g.st='sleep';g.t=70;g.det=0;say(hs?'¡Disparo a la cabeza! Dardo recuperado.':'¡Impacto! Guardia dormido.')}}}
 darts=darts.filter(d=>d.life>0);
 for(const b of bullets){b.x+=b.vx*dt;b.y+=b.vy*dt;b.life-=dt;
  if(blocked(b.x,b.y,0)){b.life=0;puff(b.x,b.y,5,'230,200,150',70,.3)}
  if(b.life>0&&Math.hypot(b.x-P.x,b.y-P.y)<12){b.life=0;puff(P.x,P.y,10,'220,60,50',110,.45);shk=.25;P.hp-=P.box?10:6;if(P.hp<=0){state='dead'}}}
 bullets=bullets.filter(b=>b.life>0);
 alertLevel=0;for(const g of guards){if(g.st==='alert')alertLevel=2;else if((g.st==='sus'||g.det>.25)&&alertLevel<1)alertLevel=1}
 if(alertLevel===0&&P.hp<100)P.hp=Math.min(100,P.hp+3*dt);
 if(P.x>goal.x&&P.y>goal.y&&P.x<goal.x+goal.w&&P.y<goal.y+goal.h){if(P.docs&&(!LV[lv].needSci||P.sci))state='win';else if(mt<=0)say('Aún no: completa los objetivos de la misión.')}
}
// ---------- Dibujo ----------
const cam={x:0,y:0};
function drawGuardOld(g){
 ctx.save();ctx.translate(g.x,g.y);
 if(g.st==='sleep'||g.st==='down'){
  ctx.rotate(1.2);ctx.fillStyle='#5a3b3b';ctx.fillRect(-12,-7,24,14);ctx.fillStyle='#caa27a';ctx.beginPath();ctx.arc(-14,0,6,0,7);ctx.fill();
  ctx.restore();ctx.fillStyle='#fff';ctx.font='bold 14px monospace';ctx.fillText(g.st==='sleep'?'Zzz':'✦',g.x+8,g.y-12+Math.sin(time*3)*2);return}
 ctx.rotate(g.a);
 ctx.fillStyle='#6b2a2a';ctx.fillRect(-8,-11,16,22);
 ctx.fillStyle='#caa27a';ctx.beginPath();ctx.arc(0,0,7,0,7);ctx.fill();
 ctx.fillStyle='#3a3d2c';ctx.beginPath();ctx.arc(0,0,7,Math.PI*.55,Math.PI*1.45,true);ctx.fill();
 ctx.fillStyle='#222';ctx.fillRect(4,5,16,4);
 ctx.restore();
 if(g.st==='patrol'||g.st==='sus'||g.st==='alert')drawCone(g);
 if(g.st==='alert'){ctx.fillStyle='#ff3b30';ctx.font='bold 22px monospace';ctx.fillText('!',g.x-4,g.y-18)}
 else if(g.st==='sus'||g.det>.15){ctx.fillStyle='#ffd60a';ctx.font='bold 22px monospace';ctx.fillText('?',g.x-5,g.y-18);
  ctx.fillRect(g.x-12,g.y-14,24*Math.min(1,g.det),2)}
}
function drawCone(g){return;
 const R=g.st==='alert'?300:280;
 ctx.fillStyle=g.st==='alert'?'rgba(255,60,50,.16)':g.st==='sus'?'rgba(255,214,10,.14)':'rgba(255,255,200,.08)';
 ctx.beginPath();ctx.moveTo(g.x,g.y);
 for(let i=-10;i<=10;i++){const a=g.a+i*.062;let d=0;
  while(d<R){d+=12;if(blocked(g.x+Math.cos(a)*d,g.y+Math.sin(a)*d,0))break}
  ctx.lineTo(g.x+Math.cos(a)*d,g.y+Math.sin(a)*d)}
 ctx.closePath();ctx.fill()}
function drawPlayerOld(){
 ctx.save();ctx.translate(P.x,P.y);
 if(P.box){
  ctx.fillStyle='#b98a52';ctx.fillRect(-15,-15,30,30);ctx.strokeStyle='#7d5a30';ctx.lineWidth=2;ctx.strokeRect(-15,-15,30,30);
  ctx.beginPath();ctx.moveTo(-15,0);ctx.lineTo(15,0);ctx.stroke();ctx.fillStyle='#5b3d1d';ctx.fillRect(-8,-4,16,3);
  ctx.restore();return}
 ctx.rotate(P.a);
 ctx.fillStyle=inGrass(P)?'#3d5a2a':'#556b2f';ctx.fillRect(-7,-12,14,24);
 ctx.strokeStyle='#2a3a18';ctx.lineWidth=2;for(let i=-8;i<10;i+=6){ctx.beginPath();ctx.moveTo(-7,i);ctx.lineTo(7,i+3);ctx.stroke()}
 ctx.fillStyle='#caa27a';ctx.beginPath();ctx.arc(0,0,7,0,7);ctx.fill();
 ctx.fillStyle='#2f3b1c';ctx.beginPath();ctx.arc(0,0,7.5,Math.PI*.5,Math.PI*1.5,true);ctx.fill();
 ctx.fillStyle='#d4d4c8';ctx.fillRect(-9,-1,20,3);ctx.fillRect(-9,-8,4,3);
 ctx.fillStyle='#222';ctx.fillRect(7,4,14,4);
 ctx.restore()}
const STORY1=[
['1964 · GUERRA FRÍA','Una facción rebelde ha tomado un complejo de investigación en una selva remota.','Su científico jefe, el Dr. Kuzmin, quiere desertar a Occidente.','Nadie oficial puede intervenir.'],
['MISIÓN: CULEBRA DESNUDA','Operativo solitario, sin bandera, sin uniforme… y casi sin camisa.','1) Recupera el cuaderno de rutas del convoy (campamento central).','2) Libera al Dr. Kuzmin (zona sur) con [E].','3) Llega al punto de extracción dorado.'],
['RADIO · CORONEL SOPAIPILLA','"Sin armas letales, Culebra, cachai. Si te pillan, negaremos tu existencia.','Usa la selva, el cartón y tus manos."','El Jefazo en persona te entrenó. Confías en él… por ahora.']];
let story=STORY1;
const inWater=e=>water.some(w=>e.x>w.x&&e.x<w.x+w.w&&e.y>w.y&&e.y<w.y+w.h);
const LV=[
{name:'Selva Tropical',seed:7,rocks:rocks.map(r=>({...r})),goal:{...goal},guards:guardDefs.slice(),water:[],start:{x:100,y:100},trees:95,grass:45,bg:'#223318',needSci:true,
 radio:'CORONEL SOPAIPILLA (radio): "Cuaderno de rutas en el campamento central. Al tiro, Culebra, no te quedís pegao."',
 obj:['OBJETIVO: cuaderno de rutas (centro)','OBJETIVO: liberar al Dr. Kuzmin (sur) con [E]','OBJETIVO: llevar al doctor a la extracción'],
 items:[{t:'doc',x:1230,y:470},{t:'sci',x:1120,y:1090},{t:'ration',x:350,y:300},{t:'ration',x:1050,y:760},{t:'ration',x:1600,y:600},{t:'ammo',x:700,y:700},{t:'ammo',x:1700,y:480},{t:'gren',x:1000,y:200}],
 end:['Kuzmin está a salvo, pero susurra un código: "La Tejedora".','En la radio, Sopaipilla se queda callado… algo no cuadra, po.']},
{name:'Río de Ceniza',seed:19,bg:'#1f3320',needSci:false,start:{x:100,y:1150},goal:{x:1800,y:100,w:110,h:110},trees:70,grass:35,
 water:[{x:880,y:0,w:140,h:520},{x:880,y:640,w:140,h:420},{x:880,y:1180,w:140,h:120}],
 rocks:[{x:300,y:300,w:200,h:30},{x:300,y:300,w:30,h:200},{x:1300,y:560,w:30,h:140},{x:1300,y:700,w:250,h:30},{x:1600,y:260,w:200,h:30},{x:1560,y:900,w:30,h:110},{x:200,y:900,w:300,h:30},{x:1100,y:1000,w:200,h:30}],
 guards:[[[200,1000],[600,1000],[600,1150],[200,1150]],[[400,650],[400,380],[750,380],[750,650]],[[800,580],[1100,580]],[[800,1120],[1100,1120]],[[1150,200],[1150,500],[1450,500],[1450,200]],[[1200,800],[1500,800],[1500,950],[1200,950]],[[1700,500],[1700,900]],[[1600,350],[1800,350],[1800,500]],[[500,800],[750,800],[750,1000]],[[1300,1150],[1700,1150],[1700,1050],[1300,1050]]],
 radio:'CORONEL SOPAIPILLA (radio): "Hay un transmisor al este del río. Cruza por los puentes… o mójate y sé ruidoso, tú sabís."',
 obj:['OBJETIVO: sabotear el transmisor (este) · mantén [E]','','OBJETIVO: ve a la extracción (noreste)'],
 items:[{t:'radio',x:1780,y:700},{t:'ration',x:200,y:500},{t:'ration',x:1000,y:900},{t:'ration',x:1450,y:300},{t:'ammo',x:600,y:500},{t:'ammo',x:1300,y:900},{t:'gren',x:700,y:1100},{t:'gren',x:1500,y:650}],
 story:[['MISIÓN 2 · RÍO DE CENIZA','Kuzmin habló: los rebeldes se comunican con un transmisor en las ruinas, al otro lado del río.','SOPAIPILLA: "Sabotéalo antes del amanecer, po."','El agua te frena y hace ruido. Mantén [E] junto al transmisor para sabotearlo.']],
 end:['El transmisor calla. En la radio, una voz desconocida ríe:','"Culebra… el Jefazo también trabaja para nosotros."']},
{name:'Fortaleza Nocturna',seed:31,bg:'#262b28',needSci:true,night:true,start:{x:100,y:650},goal:{x:1840,y:1120,w:110,h:110},trees:40,grass:20,water:[],
 rocks:[{x:900,y:300,w:300,h:30},{x:1400,y:300,w:300,h:30},{x:900,y:1000,w:300,h:30},{x:1400,y:1000,w:300,h:30},{x:900,y:300,w:30,h:300},{x:900,y:700,w:30,h:330},{x:1670,y:300,w:30,h:300},{x:1670,y:700,w:30,h:330},{x:1050,y:450,w:120,h:100},{x:1450,y:600,w:120,h:100}],
 guards:[[[300,300],[300,900]],[[500,500],[700,500],[700,800],[500,800]],[[800,150],[1800,150]],[[800,1150],[1700,1150]],[[1850,300],[1850,1000]],[[1000,380],[1600,380]],[[1000,950],[1600,950]],[[1000,650],[1000,900]],[[1350,520],[1350,900],[1250,900]],[[1250,250],[1350,250]],[[1600,700],[1600,900]]],
 radio:'CORONEL SOPAIPILLA (radio): "Es de noche, Culebra. Solo verás lo que tienes cerca. El libro de mando está dentro."',
 obj:['OBJETIVO: libro de mando (dentro de la fortaleza)','OBJETIVO: liberar al Capitán Ortiz con [E]','OBJETIVO: escapar por la extracción (sureste)'],
 items:[{t:'doc',x:1300,y:750,m:'Libro de mando recuperado. Las órdenes llevan la firma del Jefazo…'},{t:'sci',x:1550,y:450,n:'Capitán Ortiz'},{t:'ration',x:600,y:300},{t:'ration',x:1100,y:700},{t:'ration',x:1500,y:800},{t:'ammo',x:400,y:1000},{t:'ammo',x:1750,y:700},{t:'gren',x:700,y:900},{t:'gren',x:1300,y:450}],
 story:[['MISIÓN 3 · FORTALEZA NOCTURNA','La voz habló del Jefazo. El rastro lleva a una fortaleza rebelde.','Dentro está el Capitán Ortiz, tu antiguo compañero, y el libro de mando.','Es de noche: solo ves a tu alrededor. Confía en el sigilo.']],
 end:['Ortiz confirma la verdad: el Jefazo vendió a tu equipo a los rebeldes.','Un helicóptero se acerca. Hay una cuenta pendiente con el Jefazo.','La pista final lleva al escondite del Jefazo, un cañón fortificado…']},
{name:'Cañón del Trueno',seed:43,bg:'#3a3a26',needSci:true,start:{x:100,y:1150},goal:{x:1850,y:80,w:110,h:110},trees:55,grass:30,water:[],
 rocks:[{x:300,y:200,w:30,h:400},{x:300,y:600,w:400,h:30},{x:700,y:300,w:30,h:330},{x:900,y:150,w:400,h:30},{x:1100,y:300,w:30,h:350},{x:700,y:900,w:500,h:30},{x:1400,y:500,w:30,h:400},{x:1400,y:500,w:300,h:30},{x:1700,y:200,w:30,h:300},{x:500,y:1000,w:30,h:250},{x:1000,y:1100,w:30,h:200},{x:1650,y:850,w:250,h:30}],
 guards:[[[200,200],[200,500]],[[450,300],[600,300],[600,500],[450,500]],[[500,750],[900,750]],[[800,500],[1000,500],[1000,700]],[[1000,250],[1250,250]],[[1250,500],[1250,800],[1150,800]],[[1550,300],[1550,600]],[[1800,400],[1800,700]],[[900,1000],[1300,1000]],[[1500,950],[1750,950],[1750,1150]],[[300,1100],[600,1100]],[[1600,100],[1900,100]]],
 radio:'ORTIZ (radio): "el Jefazo está en el cañón, con guardias por todas partes. Los pesados aguantan un dardo: apunta a la cabeza."',
 obj:['OBJETIVO: planos del búnker (centro)','OBJETIVO: capturar al Jefazo (sureste) con [E]','OBJETIVO: extracción (noreste)'],
 items:[{t:'doc',x:1250,y:650,m:'Planos del búnker recuperados. El Jefazo está al sureste.'},{t:'sci',x:1600,y:1050,n:'El Jefazo'},{t:'ration',x:400,y:900},{t:'ration',x:1200,y:400},{t:'ration',x:1600,y:700},{t:'ammo',x:600,y:850},{t:'ammo',x:1300,y:900},{t:'ammo',x:1700,y:400},{t:'gren',x:850,y:300},{t:'gren',x:1500,y:1100}],
 story:[['MISIÓN 4 · CAÑÓN DEL TRUENO','Ortiz y tú rastrearon al Jefazo hasta un cañón fortificado.','Los guardias pesados resisten un dardo… salvo en la cabeza.','Mantén el CLIC DERECHO para apuntar con precisión.']],
 end:['El Jefazo cae. Traicionó a su propio equipo por un puñado de pesos…','FIN DE LA OPERACIÓN · Gracias por jugar.']}];
function buildLevel(n){const L=LV[n];seed=L.seed;prog=0;story=n?L.story:STORY1;
 rocks.length=0;L.rocks.forEach(r=>rocks.push({...r}));Object.assign(goal,L.goal);
 guardDefs.length=0;L.guards.forEach(g=>guardDefs.push(g));water.length=0;L.water.forEach(w=>water.push(w));
 trees.length=0;grass.length=0;
 const pts=[[L.start.x,L.start.y],[goal.x+50,goal.y+50]];guardDefs.forEach(p=>p.forEach(q=>pts.push(q)));L.items.forEach(i=>pts.push([i.x,i.y]));
 const ok=(x,y,m)=>pts.every(q=>Math.hypot(q[0]-x,q[1]-y)>m);
 for(let i=0;i<900&&trees.length<L.trees;i++){const x=rnd()*WW,y=rnd()*WH;
  if(ok(x,y,90)&&!rocks.some(r=>x>r.x-40&&x<r.x+r.w+40&&y>r.y-40&&y<r.y+r.h+40)&&!water.some(w=>x>w.x-30&&x<w.x+w.w+30&&y>w.y-30&&y<w.y+w.h+30))trees.push({x,y,r:14+rnd()*8})}
 for(let i=0;i<L.grass;i++)grass.push({x:rnd()*WW,y:rnd()*WH,r:50+rnd()*60});ground=makeGround(L)}
function makeGround(L){const c=document.createElement('canvas');c.width=WW;c.height=WH;const x=c.getContext('2d');
 x.fillStyle=L.bg;x.fillRect(0,0,WW,WH);
 for(let i=0;i<260;i++){const px=rnd()*WW,py=rnd()*WH,r=60+rnd()*140,g=x.createRadialGradient(px,py,0,px,py,r);
  g.addColorStop(0,rnd()<.5?'rgba(0,0,0,.16)':'rgba(255,255,220,.07)');g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(px-r,py-r,r*2,r*2)}
 for(let i=0;i<3500;i++){const px=rnd()*WW,py=rnd()*WH,k=rnd();x.fillStyle=k<.5?'rgba(0,0,0,.18)':k<.8?'rgba(200,230,150,.12)':'rgba(120,100,70,.25)';x.beginPath();x.arc(px,py,.8+rnd()*1.8,0,7);x.fill()}
 x.strokeStyle='rgba(20,40,10,.3)';x.lineWidth=1;
 for(let i=0;i<1200;i++){const px=rnd()*WW,py=rnd()*WH;x.beginPath();x.moveTo(px,py);x.lineTo(px+rnd()*4-2,py-5-rnd()*5);x.stroke()}
 return c}
function proceed(){if(state==='win'){if(lv<LV.length-1){lv++;story=LV[lv].story;state='brief';bp=0}else{lv=0;story=STORY1;state='title'}}else reset()}
const GRD={body:'#9b6a46',boot:'#222',hat:'#5c7a62',vest:'#2b2b2b',gun:18,helmet:1},PLY={body:'#c99a72',pants:'#4a6a2a',boot:'#2a2a1e',hair:'#4a3220',gun:0,sup:0,paint:1,camo:1,harness:1,knife:1},SCI={body:'#e8e8e0',boot:'#333',gun:0},OFC={body:'#8a8a66',pants:'#5a5a48',boot:'#222',hat:'#b02a2a',beret:1,vest:'#3a3a2a',gun:12},HVY={body:'#6a7872',boot:'#111',hat:'#46604a',helmet:1,vest:'#1d1d1d',gun:24,sc:1.18},GT=[GRD,OFC,HVY];
function person(x,y,a,o,w){
 ctx.save();ctx.translate(x,y);const sg=ctx.createRadialGradient(3,5,2,3,5,19);sg.addColorStop(0,'rgba(0,0,0,.45)');sg.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=sg;ctx.beginPath();ctx.ellipse(3,5,20,15,0,0,7);ctx.fill();
 ctx.rotate(a);ctx.scale(o.sc||1,o.sc||1);const s=Math.sin(w)*6;
 ctx.fillStyle=o.pants||o.body;ctx.fillRect(-6+s,-11,12,7);ctx.fillRect(-6-s,4,12,7);ctx.fillStyle=o.boot;ctx.fillRect(2+s,-11,6,7);ctx.fillRect(2-s,4,6,7);
 if(o.pack){ctx.fillStyle=o.pack;ctx.fillRect(-15,-8,9,16);ctx.fillStyle='rgba(0,0,0,.25)';ctx.fillRect(-15,-1,9,2)}
 if(o.roll){ctx.fillStyle='#6b5a3a';ctx.fillRect(-19,-10,5,20);ctx.fillStyle='#3a2f1c';ctx.fillRect(-19,-4,5,2);ctx.fillRect(-19,3,5,2)}
 ctx.fillStyle=o.body;ctx.beginPath();ctx.ellipse(0,0,8,14,0,0,7);ctx.fill();const tg=ctx.createLinearGradient(0,-14,0,14);tg.addColorStop(0,'rgba(255,255,255,.2)');tg.addColorStop(.5,'rgba(255,255,255,0)');tg.addColorStop(1,'rgba(0,0,0,.28)');ctx.fillStyle=tg;ctx.fill();ctx.strokeStyle='#0a0a08';ctx.lineWidth=1.6;ctx.stroke();
 if(o.vest){ctx.fillStyle=o.vest;ctx.fillRect(-4,-10,9,20);ctx.fillStyle='rgba(255,255,255,.12)';ctx.fillRect(-4,-10,2,20)}
 ctx.fillStyle='#3d3526';ctx.fillRect(-3,-14,6,4);ctx.fillRect(-3,10,6,4);ctx.fillStyle='rgba(0,0,0,.22)';ctx.beginPath();ctx.arc(0,-11,4.5,0,7);ctx.arc(0,11,4.5,0,7);ctx.fill();
 if(o.camo){for(let i=0;i<8;i++){ctx.fillStyle=i%2?'#3a4f20':'#7a8a42';ctx.beginPath();ctx.arc(Math.cos(i*2.1)*4,Math.sin(i*1.7)*9,2.6,0,7);ctx.fill()}}
 if(o.harness){ctx.strokeStyle='#2b2418';ctx.lineWidth=2.2;ctx.beginPath();ctx.moveTo(-6,-10);ctx.lineTo(6,9);ctx.moveTo(6,-10);ctx.lineTo(-6,9);ctx.stroke();ctx.fillStyle='#9a9a88';ctx.fillRect(-1,-1,3,3);ctx.fillStyle='#2b2418';ctx.fillRect(-3,8,6,4)}
 if(o.knife){ctx.fillStyle='#c8c8c0';ctx.fillRect(1,11,9,2);ctx.fillStyle='#2b2418';ctx.fillRect(-3,11,4,2)}
 if(o.paint){ctx.strokeStyle='#2a3a18';ctx.lineWidth=2;for(let i=-9;i<10;i+=6){ctx.beginPath();ctx.moveTo(-6,i);ctx.lineTo(6,i+3);ctx.stroke()}}
 ctx.lineCap='round';ctx.strokeStyle='#0a0a08';ctx.lineWidth=7.5;ctx.beginPath();ctx.moveTo(0,-11);ctx.lineTo(13,-5);ctx.moveTo(0,11);ctx.lineTo(15,3);ctx.stroke();ctx.strokeStyle=o.body;ctx.lineWidth=5.2;ctx.beginPath();ctx.moveTo(0,-11);ctx.lineTo(13,-5);ctx.moveTo(0,11);ctx.lineTo(15,3);ctx.stroke();
 if(o.gun){ctx.fillStyle='#1c1c1c';ctx.fillRect(7,-2,o.gun,4);if(o.sup){ctx.fillStyle='#555';ctx.fillRect(7+o.gun,-1.5,7,3)}}
 ctx.fillStyle='#caa27a';ctx.beginPath();ctx.arc(14,-5,2.6,0,7);ctx.arc(16,3,2.6,0,7);ctx.fill();
 ctx.beginPath();ctx.arc(0,0,7,0,7);ctx.fill();ctx.strokeStyle='#0a0a08';ctx.lineWidth=1.4;ctx.stroke();
 if(o.helmet){ctx.fillStyle=o.hat;ctx.beginPath();ctx.arc(0,0,8.5,0,7);ctx.fill();ctx.fillStyle='rgba(0,0,0,.25)';ctx.fillRect(2,-8,2,16)}
 else if(o.hair){ctx.fillStyle='#caa27a';ctx.beginPath();ctx.arc(0,-7.4,1.9,0,7);ctx.arc(0,7.4,1.9,0,7);ctx.fill();ctx.fillStyle=o.hair;ctx.beginPath();ctx.arc(-.6,0,7.4,0,7);ctx.fill();ctx.fillStyle='rgba(255,255,255,.12)';ctx.beginPath();ctx.ellipse(-2,-2,3.5,2,.5,0,7);ctx.fill();ctx.strokeStyle='rgba(0,0,0,.3)';ctx.lineWidth=1;for(let i=0;i<4;i++){ctx.beginPath();ctx.arc(-.6,0,2.5+i*1.2,2.3,4);ctx.stroke()}ctx.fillStyle='#caa27a';ctx.beginPath();ctx.ellipse(4.8,0,2.8,5.4,0,0,7);ctx.fill();ctx.beginPath();ctx.arc(7.6,0,1.2,0,7);ctx.fill()}
 else if(o.beret){ctx.fillStyle=o.hat;ctx.beginPath();ctx.ellipse(-1,0,8.5,9.5,0,0,7);ctx.fill();ctx.fillStyle='rgba(0,0,0,.3)';ctx.fillRect(-1,-1,3,2)}
 else if(o.hat){ctx.fillStyle=o.hat;ctx.beginPath();ctx.arc(0,0,7.5,Math.PI*.45,Math.PI*1.55,true);ctx.fill();ctx.fillStyle='#5a1a14';ctx.fillRect(-14,-1.5,9,3);ctx.fillRect(-19,-3.5,6,2);ctx.fillRect(-19,1.5,6,2)}
 if(o.paint){ctx.fillStyle='#1b2610';ctx.fillRect(4,-5,2,3);ctx.fillRect(4,2,2,3)}
 ctx.restore()}
function drawGuard(g){
 if(g.st==='sleep'||g.st==='down'){person(g.x,g.y,1.2,GT[g.ty],0);ctx.fillStyle='#fff';ctx.font='bold 14px monospace';ctx.fillText(g.st==='sleep'?'Zzz':'✦',g.x+10,g.y-12+Math.sin(time*3)*2);return}
 person(g.x,g.y,g.a,GT[g.ty],(g.x+g.y)*.08);guardFx(g);
 if(g.st==='patrol'||g.st==='sus'||g.st==='alert')drawCone(g);
 if(g.st==='alert'){ctx.fillStyle='#ff3b30';ctx.font='bold 22px monospace';ctx.fillText('!',g.x-4,g.y-18)}
 else if(g.st==='sus'||g.det>.15){ctx.fillStyle='#ffd60a';ctx.font='bold 22px monospace';ctx.fillText('?',g.x-5,g.y-18);ctx.fillRect(g.x-12,g.y-14,24*Math.min(1,g.det),2)}}
function drawPlayer(){
 if(P.box){ctx.save();ctx.translate(P.x,P.y);ctx.fillStyle='rgba(0,0,0,.3)';ctx.fillRect(-12,-10,30,30);ctx.fillStyle='#b98a52';ctx.fillRect(-15,-15,30,30);ctx.strokeStyle='#7d5a30';ctx.lineWidth=2;ctx.strokeRect(-15,-15,30,30);ctx.beginPath();ctx.moveTo(-15,0);ctx.lineTo(15,0);ctx.stroke();ctx.fillStyle='#e3d3b0';ctx.fillRect(-4,-14,8,6);ctx.fillStyle='#5b3d1d';ctx.fillRect(-8,3,16,3);ctx.restore();return}
 
 PLY.gun=P.ammo>0?14:0;PLY.sup=P.ammo>0?1:0;
 person(P.x-Math.cos(P.a)*(P.rec||0)*40,P.y-Math.sin(P.a)*(P.rec||0)*40,P.a,PLY,P.walk)}
function drawItem(it){
 const p=1+Math.sin(time*4)*.15;
 if(it.t==='sci'){person(it.x,it.y,.6,SCI,0);ctx.strokeStyle='#8a6b3a';ctx.lineWidth=2;ctx.beginPath();ctx.arc(it.x,it.y,12,0,7);ctx.stroke();if(D(it,P)<40){ctx.fillStyle='#fff';ctx.font='bold 12px monospace';ctx.fillText('[E] liberar',it.x-30,it.y-22)}return}
 ctx.save();ctx.translate(it.x,it.y);ctx.scale(p,p);
 if(it.t==='doc'){ctx.fillStyle='rgba(255,255,255,.18)';ctx.beginPath();ctx.arc(0,0,18,0,7);ctx.fill();ctx.fillStyle='#e8e2c8';ctx.fillRect(-8,-10,16,20);ctx.fillStyle='#555';for(let i=-6;i<8;i+=4)ctx.fillRect(-5,i,10,1.5)}
 else if(it.t==='radio'){ctx.fillStyle='#333';ctx.fillRect(-12,-9,24,18);ctx.fillStyle='#9be564';ctx.fillRect(-9,-6,10,5);ctx.strokeStyle='#bbb';ctx.beginPath();ctx.moveTo(8,-9);ctx.lineTo(12,-20);ctx.stroke();if(prog>0){ctx.fillStyle='#ffd60a';ctx.fillRect(-12,12,24*prog/3,3)}}
 else if(it.t==='ammo'){ctx.fillStyle='#4a6b3a';ctx.fillRect(-7,-5,14,10);ctx.fillStyle='#9be564';ctx.fillRect(-1,-4,2,8)}
 else if(it.t==='gren'){ctx.fillStyle='#777';ctx.beginPath();ctx.arc(0,0,6,0,7);ctx.fill();ctx.fillStyle='#ddd';ctx.fillRect(-1,-9,2,5)}
 else{ctx.fillStyle='#c9622f';ctx.fillRect(-6,-5,12,10);ctx.fillStyle='#f0d9a0';ctx.fillRect(-6,-2,12,3)}
 ctx.restore()}
function draw2D(){
 cam.x=Math.max(0,Math.min(WW-VW,P.x-VW/2));cam.y=Math.max(0,Math.min(WH-VH,P.y-VH/2));
 ctx.fillStyle='#1c2a14';ctx.fillRect(0,0,VW,VH);
 ctx.save();ctx.translate(-cam.x+(Math.random()-.5)*shk*30,-cam.y+(Math.random()-.5)*shk*30);
 ctx.drawImage(ground,0,0);
 for(const g of grass){const gg=ctx.createRadialGradient(g.x,g.y,g.r*.2,g.x,g.y,g.r);gg.addColorStop(0,'rgba(50,95,30,.75)');gg.addColorStop(1,'rgba(50,95,30,0)');ctx.fillStyle=gg;ctx.beginPath();ctx.arc(g.x,g.y,g.r,0,7);ctx.fill()}
 ctx.strokeStyle='rgba(120,160,70,.25)';ctx.lineWidth=1;for(const g of grass){for(let i=0;i<8;i++){const a=i*.8+g.x,r=g.r*.6;ctx.beginPath();ctx.moveTo(g.x+Math.cos(a)*r,g.y+Math.sin(a)*r);ctx.lineTo(g.x+Math.cos(a)*r+2+Math.sin(time*2+i+g.x)*2.5,g.y+Math.sin(a)*r-8);ctx.stroke()}}
 for(const w of water){const wg=ctx.createLinearGradient(w.x,0,w.x+w.w,0);wg.addColorStop(0,'#2a6a8a');wg.addColorStop(.5,'#1d4f6e');wg.addColorStop(1,'#2a6a8a');ctx.fillStyle=wg;ctx.fillRect(w.x,w.y,w.w,w.h);ctx.fillStyle='rgba(180,230,255,.14)';ctx.fillRect(w.x,w.y,4,w.h);ctx.fillRect(w.x+w.w-4,w.y,4,w.h);ctx.fillStyle='rgba(150,200,230,.15)';for(let y=w.y+10;y<w.y+w.h;y+=40)ctx.fillRect(w.x+10+Math.sin(time*2+y)*8,y,w.w-30,3)}
 ctx.fillStyle='rgba(255,230,120,'+(.15+.1*Math.sin(time*3))+')';ctx.fillRect(goal.x,goal.y,goal.w,goal.h);ctx.strokeStyle='#ffd60a';ctx.setLineDash([8,6]);ctx.strokeRect(goal.x,goal.y,goal.w,goal.h);ctx.setLineDash([]);
 ctx.fillStyle='#ffd60a';ctx.font='12px monospace';ctx.fillText('EXTRACCIÓN',goal.x+12,goal.y+goal.h/2);
 for(const k of rocks){ctx.fillStyle='rgba(0,0,0,.35)';ctx.fillRect(k.x+5,k.y+7,k.w,k.h);const rg=ctx.createLinearGradient(k.x,k.y,k.x+k.w,k.y+k.h);rg.addColorStop(0,'#66665c');rg.addColorStop(1,'#3c3c36');ctx.fillStyle=rg;ctx.fillRect(k.x,k.y,k.w,k.h);ctx.fillStyle='rgba(255,255,255,.14)';ctx.fillRect(k.x,k.y,k.w,4);ctx.fillStyle='rgba(0,0,0,.2)';ctx.fillRect(k.x,k.y+k.h-4,k.w,4);ctx.strokeStyle='rgba(0,0,0,.35)';ctx.lineWidth=1;ctx.strokeRect(k.x+.5,k.y+.5,k.w-1,k.h-1)}
 for(const t of trees){ctx.fillStyle='rgba(0,0,0,.28)';ctx.beginPath();ctx.ellipse(t.x+t.r*.7,t.y+t.r*.6,t.r*1.6,t.r*1.1,.5,0,7);ctx.fill();ctx.fillStyle='#3e2b19';ctx.beginPath();ctx.arc(t.x,t.y,t.r*.5,0,7);ctx.fill();ctx.fillStyle='#6a4a2a';ctx.beginPath();ctx.arc(t.x-1.5,t.y-1.5,t.r*.28,0,7);ctx.fill()}
 for(const r of rings){ctx.strokeStyle='rgba('+r.c+','+((1-r.r/220)*.6)+')';ctx.lineWidth=2;ctx.beginPath();ctx.arc(r.x,r.y,r.r,0,7);ctx.stroke()}
 for(const it of items)drawItem(it);
 for(const g of guards)drawGuard(g);
 if(P.f)person(P.f.x,P.f.y,Math.atan2(P.y-P.f.y,P.x-P.f.x),SCI,(P.f.x+P.f.y)*.08);
 drawPlayer();
 for(const p of parts){ctx.fillStyle='rgba('+p.c+','+(p.l/p.m)+')';ctx.beginPath();ctx.arc(p.x,p.y,p.r*(p.l/p.m+.3),0,7);ctx.fill()}
 ctx.fillStyle='#9be564';for(const d of darts){ctx.save();ctx.translate(d.x,d.y);ctx.rotate(Math.atan2(d.vy,d.vx));ctx.fillRect(-6,-1,12,2);ctx.restore()}
 ctx.strokeStyle='#ffb070';ctx.lineWidth=2.5;for(const b of bullets){ctx.globalAlpha=Math.min(1,b.life*3);ctx.beginPath();ctx.moveTo(b.x,b.y);ctx.lineTo(b.x-b.vx*.03,b.y-b.vy*.03);ctx.stroke()}ctx.globalAlpha=1;
 // copas de árboles
 for(const t of trees){ctx.fillStyle='rgba(18,45,14,.7)';ctx.beginPath();ctx.arc(t.x+Math.sin(time*.8+t.x)*2,t.y,t.r*1.9,0,7);ctx.fill();ctx.fillStyle='rgba(30,70,22,.75)';ctx.beginPath();ctx.arc(t.x-4,t.y-4,t.r*1.3,0,7);ctx.fill();ctx.fillStyle='rgba(90,140,50,.35)';ctx.beginPath();ctx.arc(t.x-7,t.y-8,t.r*.7,0,7);ctx.fill();ctx.fillStyle='rgba(10,30,8,.35)';ctx.beginPath();ctx.arc(t.x+6,t.y+6,t.r*.8,0,7);ctx.fill()}
 ctx.restore();
 for(let i=0;i<26;i++){ctx.fillStyle='rgba(220,255,140,'+(.35+.35*Math.sin(time*3+i))+')';ctx.fillRect((i*173+time*(8+i%5))%VW,(i*97+Math.sin(time+i)*30+i*40)%VH,2,2)}
 if(!LV[lv].night){for(let i=0;i<4;i++){const sx=((i*260+time*6)%(VW+200))-100;ctx.fillStyle='rgba(255,240,170,.035)';ctx.beginPath();ctx.moveTo(sx,0);ctx.lineTo(sx+90,0);ctx.lineTo(sx-120,VH);ctx.lineTo(sx-210,VH);ctx.fill()}}
 if(LV[lv].night){const px=P.x-cam.x,py=P.y-cam.y,ng=ctx.createRadialGradient(px,py,70,px,py,340);ng.addColorStop(0,'rgba(0,0,12,0)');ng.addColorStop(1,'rgba(0,0,12,.9)');ctx.fillStyle=ng;ctx.fillRect(0,0,VW,VH)}
 const vg=ctx.createRadialGradient(VW/2,VH/2,VH*.35,VW/2,VH/2,VH*.85);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(0,0,0,.55)');ctx.fillStyle=vg;ctx.fillRect(0,0,VW,VH);
 if(alertLevel===2){ctx.fillStyle='rgba(255,0,0,'+(.08+.06*Math.sin(time*8))+')';ctx.fillRect(0,0,VW,VH)}
 hud()}
function bar(x,y,w,v,c,label){ctx.fillStyle='rgba(8,14,6,.72)';ctx.beginPath();ctx.roundRect(x-2,y-2,w+4,16,6);ctx.fill();ctx.strokeStyle='rgba(180,210,140,.35)';ctx.lineWidth=1;ctx.stroke();const bw=(w-2)*Math.max(0,Math.min(1,v));if(bw>1){ctx.fillStyle=c;ctx.beginPath();ctx.roundRect(x+1,y+1,bw,10,4);ctx.fill();ctx.fillStyle='rgba(255,255,255,.22)';ctx.beginPath();ctx.roundRect(x+1,y+1,bw,4,3);ctx.fill()}ctx.fillStyle='#e8f0d0';ctx.font='11px monospace';ctx.fillText(label,x,y-6)}
function hud(){
 if(false){const tt=!P.docs?items.find(i=>i.t==='doc'||i.t==='radio'):(LV[lv].needSci&&!P.sci)?items.find(i=>i.t==='sci'):goal;
 if(tt){const tx=tt.x+(tt.w?tt.w/2:0),ty=tt.y+(tt.h?tt.h/2:0),aa=Math.atan2(ty-P.y,tx-P.x);
  if(Math.hypot(tx-P.x,ty-P.y)>90){ctx.save();ctx.translate(P.x-cam.x+Math.cos(aa)*62,P.y-cam.y+Math.sin(aa)*62);ctx.rotate(aa);ctx.fillStyle='rgba(255,214,10,'+(.55+.3*Math.sin(time*5))+')';ctx.beginPath();ctx.moveTo(10,0);ctx.lineTo(-7,-8);ctx.lineTo(-7,8);ctx.fill();ctx.restore()}}}
 bar(16,28,180,P.hp/100,'#d94f3d','VIDA');
 const camo=P.box?(P.spd>5?55:92):Math.min(99,Math.round((inGrass(P)?70:30)+(P.prone?28:P.sneak?15:0)));
 bar(16,60,180,camo/100,'#8fbf5a','CAMUFLAJE '+camo+'%');
 ctx.fillStyle='#e8f0d0';ctx.font='13px monospace';bar(16,118,180,P.sta/100,'#d9a441','RESISTENCIA');ctx.fillStyle='#e8f0d0';ctx.font='13px monospace';ctx.fillText('DARDOS: '+P.ammo+'  ATURDIDORAS: '+P.gren+(P.prone?'  [PRONO]':''),16,92);
 const LL=LV[lv],ob=!P.docs?LL.obj[0]:(LL.needSci&&!P.sci)?LL.obj[1]:LL.obj[2];ctx.fillStyle='#ffd60a';ctx.fillText(ob,16,146);
 const st=['INFILTRACIÓN','PRECAUCIÓN','¡ALERTA!'][alertLevel],col=['#8fbf5a','#ffd60a','#ff3b30'][alertLevel];
 ctx.fillStyle=col;ctx.font='bold 16px monospace';ctx.textAlign='right';ctx.fillText(st,VW-16,28);ctx.font='11px monospace';ctx.fillStyle='#9aa88a';ctx.fillText('MISIÓN '+(lv+1)+' · '+LV[lv].name,VW-16,VH-8);ctx.textAlign='left';
 if(P.grab){ctx.fillStyle='#fff';ctx.fillText('[ESPACIO] Lanzar  [E] Interrogar  [Q] Estrangular',VW/2-190,VH-40)}
 if(mt>0&&msgs[0]){ctx.fillStyle='rgba(8,14,6,.78)';ctx.beginPath();ctx.roundRect(VW/2-300,VH-32,600,26,8);ctx.fill();ctx.strokeStyle='rgba(180,210,140,.4)';ctx.stroke();ctx.fillStyle='#d6f0b0';ctx.font='13px monospace';ctx.textAlign='center';ctx.fillText(msgs[0],VW/2,VH-13);ctx.textAlign='left'}
 // minimapa
 if(true){const mw=130,mh=mw*WH/WW,mx=VW-mw-12,my=44;
 ctx.fillStyle='rgba(0,0,0,.55)';ctx.fillRect(mx,my,mw,mh);
 const s=mw/WW;ctx.fillStyle='#ffd60a';ctx.fillRect(mx+goal.x*s,my+goal.y*s,goal.w*s,goal.h*s);for(const it of items)if(it.t!=='ration'){ctx.fillStyle='#fff';ctx.fillRect(mx+it.x*s-2,my+it.y*s-2,4,4)}
 for(const g of guards){ctx.fillStyle=g.st==='alert'?'#f33':(g.st==='sleep'||g.st==='down')?'#777':'#e2a84b';ctx.fillRect(mx+g.x*s-1.5,my+g.y*s-1.5,3,3)}
 ctx.fillStyle='#9be564';ctx.fillRect(mx+P.x*s-2,my+P.y*s-2,4,4)}}
function overlay(t,sub,col){ctx.fillStyle='rgba(0,0,0,.72)';ctx.fillRect(0,0,VW,VH);ctx.fillStyle='rgba(14,22,10,.88)';ctx.beginPath();ctx.roundRect(60,VH/2-125,VW-120,290,14);ctx.fill();ctx.strokeStyle=col;ctx.globalAlpha=.5;ctx.lineWidth=2;ctx.stroke();ctx.globalAlpha=1;ctx.textAlign='center';ctx.fillStyle=col;ctx.font='bold 34px monospace';ctx.fillText(t,VW/2,VH/2-70);
 ctx.fillStyle='#cfd8b0';ctx.font='14px monospace';sub.forEach((l,i)=>ctx.fillText(l,VW/2,VH/2-25+i*22));ctx.textAlign='left'}
const help=['WASD / flechas: mover · SHIFT: avanzar sigilosamente (menos visible)','Ratón: cámara y mira (clic lo captura) · CLIC: disparar · RUEDA: zoom · CLIC DER: apuntar','ESPACIO: CQC → de nuevo para lanzar · E: interrogar · Q: estrangular · Mantén E: sabotear radio','B: caja de cartón (quieto = casi invisible) · C: tumbarte (más sigilo, más lento)','G: granada aturdidora · T: lanzar casquillo para distraer · ¡No se ve el campo de visión enemigo!','Empiezas con 6 dardos y 1 aturdidora: duerme o estrangula guardias para conseguir más.','Resistencia: come raciones o empezarás a perder vida.','Los conos de visión se bloquean con árboles y rocas. La hierba te oculta.','Recoge el cuaderno, libera al Dr. Kuzmin (E) y llega a la zona dorada. Las raciones curan.'];
let last=performance.now();
function loop(n){const dt=Math.min(.05,(n-last)/1000);last=n;
 if(state==='play')update(dt);
 if(P){draw()}else{ctx.fillStyle='#16200f';ctx.fillRect(0,0,VW,VH)}
 if(state==='title')overlay('METAL GEAR INVALID',help.concat(['','Pulsa ENTER o haz clic para empezar']),'#9be564');
 if(state==='brief')overlay(story[bp][0],story[bp].slice(1).concat(['','ENTER / clic: continuar']),'#9be564');
 if(state==='dead')overlay('MISIÓN FALLIDA',['Pulsa ENTER o clic para reintentar'],'#ff3b30');
 if(state==='win')overlay('MISIÓN CUMPLIDA',LV[lv].end.concat(['',lv<LV.length-1?'ENTER / clic: siguiente misión':'ENTER / clic: volver al inicio']),'#ffd60a');
 requestAnimationFrame(loop)}
// ================= RENDER 3D (Three.js) =================
// La lógica del juego sigue siendo la misma (x,y del mundo 2D -> X,Z en 3D).
const R3=new THREE.WebGLRenderer({canvas:document.getElementById('g'),antialias:true});
R3.setPixelRatio(Math.min(2,window.devicePixelRatio||1));R3.setSize(VW,VH,false);
R3.shadowMap.enabled=true;R3.shadowMap.type=THREE.PCFSoftShadowMap;
const scn=new THREE.Scene(),cam3=new THREE.PerspectiveCamera(50,VW/VH,5,4000);
const hemi=new THREE.HemisphereLight(0xdfffd0,0x2a3a1a,.8),sun=new THREE.DirectionalLight(0xfff0c0,1),pt=new THREE.PointLight(0xffe6b0,1.5,480,1.4);
sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.bias=-.0006;
Object.assign(sun.shadow.camera,{left:-650,right:650,top:650,bottom:-650,near:10,far:1800});
scn.add(hemi,sun,sun.target,pt);
const mat=(c,o)=>new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:.85,metalness:.05},o));
const bx=(w,h,d)=>new THREE.BoxGeometry(w,h,d);
const mesh=(geo,m,x,y,z,par)=>{const o=new THREE.Mesh(geo,m);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;if(par)par.add(o);return o};
function tex(t,c){const k=document.createElement('canvas');k.width=k.height=128;const x=k.getContext('2d');x.font='bold 104px monospace';x.textAlign='center';x.textBaseline='middle';x.lineWidth=10;x.strokeStyle='#000';x.strokeText(t,64,68);x.fillStyle=c;x.fillText(t,64,68);return new THREE.CanvasTexture(k)}
const TE=tex('!','#ff3b30'),TQ=tex('?','#ffd60a'),TZ=tex('z','#ffffff');
// ---------- Modelos ----------
const cyl=(r,l,c,x,y,z,p)=>{const m=mesh(new THREE.CylinderGeometry(r,r,l,8),mat(c),x,y,z,p);m.rotation.z=Math.PI/2;return m};
function mkWeapon(len){
 const g=new THREE.Group(),K='#1c1c1c',M='#3a3a3a',fl=new THREE.Mesh(new THREE.SphereGeometry(3,8,6),new THREE.MeshBasicMaterial({color:0xffc060}));
 if(len===14){mesh(bx(9,3.2,2.6),mat(M),1,1.8,0,g);mesh(bx(3,6,2.4),mat(K),-2,-2,0,g);cyl(1.4,8,'#222',8,1.8,0,g);mesh(bx(2,1,1),mat('#9be564',{emissive:'#9be564'}),2,3.8,0,g);fl.position.set(13,1.8,0)}
 else if(len===18){mesh(bx(16,3.6,3),mat(K),4,1.5,0,g);mesh(bx(8,4,2.6),mat('#5a3d22'),-8,.5,0,g);cyl(.9,12,M,17,2,0,g);mesh(bx(3,7,2.4),mat(K),2,-3,0,g);mesh(bx(4,2.2,2),mat(K),-1,5,0,g);fl.position.set(24,2,0)}
 else if(len===12){mesh(bx(11,3.6,3),mat(M),3,1.5,0,g);mesh(bx(2.4,8,2.4),mat(K),4,-4,0,g);mesh(bx(3,5,2.4),mat(K),-2,-2,0,g);cyl(.8,6,K,11,2,0,g);fl.position.set(15,2,0)}
 else{mesh(bx(20,5,4),mat(K),6,1.5,0,g);mesh(bx(9,5,3.5),mat('#3a3a2a'),-7,.5,0,g);cyl(1.2,16,M,24,2.5,0,g);mesh(bx(7,6,5),mat('#2f3a24'),5,-4.5,0,g);mesh(bx(3,1.5,5),mat(K),20,4.5,0,g);mesh(bx(.8,7,.8),mat(M),19,-3,2,g).rotation.x=.4;mesh(bx(.8,7,.8),mat(M),19,-3,-2,g).rotation.x=-.4;fl.position.set(33,2.5,0)}
 fl.visible=false;g.add(fl);g.userData.fl=fl;return g}
function mkPerson(o){
 const g=new THREE.Group(),inn=new THREE.Group(),tor=new THREE.Group(),pc=o.pants||o.body,sk='#caa27a';g.add(inn);inn.add(tor);g.scale.setScalar((o.sc||1)*1.25);tor.position.y=17;
 const leg=z=>{const t=new THREE.Group();t.position.set(0,17,z);mesh(bx(6.4,9,6.4),mat(pc),0,-4.5,0,t);const q=new THREE.Group();q.position.y=-9;mesh(bx(5.6,8,5.6),mat(pc),0,-4,0,q);mesh(bx(10,4,7),mat(o.boot),1.8,-7.5,0,q);t.add(q);inn.add(t);return[t,q]};
 const[t1,s1]=leg(-4),[t2,s2]=leg(4);
 mesh(bx(9,4,13),mat(pc),0,0,0,tor);mesh(bx(9.8,2,14),mat('#2b2418'),0,2.5,0,tor);
 mesh(bx(9.5,14,16),mat(o.body),0,9,0,tor);
 if(o.vest){mesh(bx(10.4,12,13.5),mat(o.vest),.4,9,0,tor);mesh(bx(2.5,4,4),mat(o.vest),5.4,5,-4,tor);mesh(bx(2.5,4,4),mat(o.vest),5.4,5,4,tor)}
 if(o===PLY){mesh(bx(6,12,11),mat('#3a4a22'),-7.5,9,0,tor);mesh(bx(10.2,2.2,21),mat('#2b2418'),.2,9,0,tor).rotation.x=.75}
 mesh(new THREE.CylinderGeometry(2.4,2.4,3,8),mat(sk),0,17.5,0,tor);
 const hd=new THREE.Group();hd.position.y=24;tor.add(hd);
 mesh(new THREE.SphereGeometry(6.5,12,10),mat(sk),0,0,0,hd);
 mesh(bx(1,1.4,1.8),mat('#111'),5.9,.8,-2.5,hd);mesh(bx(1,1.4,1.8),mat('#111'),5.9,.8,2.5,hd);
 const hc=(o.helmet||o.beret)?o.hat:o.hair;
 if(hc){const h=mesh(new THREE.SphereGeometry(o.helmet?7.4:7,12,8,0,Math.PI*2,0,Math.PI*(o.beret?.45:.6)),mat(hc),0,.3,0,hd);if(o.beret)h.scale.y=.6}
 if(o.helmet)mesh(new THREE.CylinderGeometry(7.5,7.5,1.2,12),mat('#222'),0,1.5,0,hd);
 if(o===PLY)mesh(new THREE.CylinderGeometry(6.8,6.8,2.2,12),mat('#8a1f1f'),0,2.8,0,hd);
 const arm=z=>{const a=new THREE.Group();a.position.set(0,16,z);a.rotation.set(z<0?-.6:.6,0,1.1);mesh(bx(5,7,5),mat(o.body),0,-3.5,0,a);const f=new THREE.Group();f.position.y=-7;mesh(bx(4.4,6,4.4),mat(o.body),0,-3,0,f);mesh(new THREE.SphereGeometry(2.4,8,6),mat(sk),0,-6.2,0,f);f.rotation.z=-.3;a.add(f);tor.add(a)};
 arm(-8.5);arm(8.5);
 const len=o.gun||(o===PLY?14:0),wp=len?mkWeapon(len):null;if(wp){wp.position.set(10.5,9,0);tor.add(wp)}
 const mark=new THREE.Sprite(new THREE.SpriteMaterial({map:TQ,depthTest:false,transparent:true}));mark.scale.set(22,22,1);mark.position.y=58;mark.visible=false;mark.renderOrder=10;g.add(mark);
 g.userData={t1,s1,t2,s2,inn,tor,hd,wp,mark};return g}
function setPerson(g,x,y,a,w,gun,lie,pr,amp,kick){const u=g.userData;amp=amp===undefined?1:amp;kick=kick||0;
 g.position.set(x,0,y);g.rotation.y=-a;const c=Math.cos(w)*amp,sn=Math.sin(w)*amp;
 u.t1.rotation.z=sn*.75;u.t2.rotation.z=-sn*.75;u.s1.rotation.z=-Math.max(0,c)*.9;u.s2.rotation.z=-Math.max(0,-c)*.9;
 u.inn.rotation.z=lie?-Math.PI/2:0;u.inn.position.y=lie?8:Math.abs(c)*1.1;u.inn.scale.y=pr?.5:1;
 u.tor.rotation.z=-.07*amp;u.tor.rotation.x=sn*.05;u.tor.scale.y=1+Math.sin(time*2+x)*.015;
 u.hd.rotation.y=Math.sin(time*.9+x*.1)*.3*(1-amp);
 if(u.wp){u.wp.visible=gun>0;u.wp.position.set(10.5-kick*3,9+Math.sin(w*2)*.5*amp+kick*.8,0);u.wp.rotation.z=kick*.22;const f=u.wp.userData.fl;f.visible=kick>.55;f.scale.setScalar(.8+Math.random()*.6)}}
function mkBox(){const g=new THREE.Group();mesh(bx(30,30,30),mat('#b98a52'),0,15,0,g);mesh(bx(8,1,30.5),mat('#e3d3b0'),0,30.3,0,g);mesh(bx(16,3,.6),mat('#5b3d1d'),0,10,15.2,g);return g}
function mkItem(it){
 if(it.t==='sci')return mkPerson(SCI);
 const g=new THREE.Group(),t=it.t,[w,h,d,c]=t==='doc'?[12,2,16,'#e8e2c8']:t==='radio'?[24,16,12,'#333']:t==='ammo'?[14,10,10,'#4a6b3a']:t==='gren'?[10,10,10,'#777']:[12,10,10,'#c9622f'];
 mesh(t==='gren'?new THREE.SphereGeometry(6,12,10):bx(w,h,d),mat(c,{emissive:c,emissiveIntensity:.3}),0,0,0,g);
 if(t==='radio'){mesh(new THREE.CylinderGeometry(.8,.8,22),mat('#bbb'),9,14,0,g);mesh(bx(10,1,5),mat('#9be564',{emissive:'#9be564'}),-3,8.5,0,g)}
 g.userData.base=(t==='radio'?9:14)*1.4;g.scale.setScalar(1.4);return g}
// ---------- Escenario ----------
const nz=(x,y,z)=>{const h=Math.sin(x*12.9898+y*78.233+z*37.719)*43758.5453;return h-Math.floor(h)};
function rough(geo,a){const q=geo.attributes.position;for(let n=0;n<q.count;n++){const x=q.getX(n),y=q.getY(n),z=q.getZ(n),f=1+(nz(x,y,z)-.5)*a;q.setXYZ(n,x*f,y*f,z*f)}geo.computeVertexNormals();return geo}
let LG=null,lastG=null,treeC=[],goalM=null,padL=[],waterT=[],swayT=[];
function buildScene(){
 if(LG){scn.remove(LG);LG.traverse(o=>{if(o.geometry)o.geometry.dispose()})}
 const L=LV[lv],ng=!!L.night,sky=ng?0x070d18:0xb4cdb0;LG=new THREE.Group();scn.add(LG);treeC=[];
 {const k=document.createElement('canvas');k.width=2;k.height=256;const x=k.getContext('2d'),gr=x.createLinearGradient(0,0,0,256);if(ng){gr.addColorStop(0,'#02030a');gr.addColorStop(1,'#0b1424')}else{gr.addColorStop(0,'#3d78b8');gr.addColorStop(.55,'#9cc3c8');gr.addColorStop(1,'#c9dcb4')}x.fillStyle=gr;x.fillRect(0,0,2,256);scn.background=new THREE.CanvasTexture(k)}scn.fog=new THREE.Fog(sky,ng?420:900,ng?700:1700);
 hemi.intensity=ng?.28:.8;sun.intensity=ng?.05:1;pt.visible=ng;
 const flat=(geo,c,x,y,z,o)=>{const m=new THREE.Mesh(geo,new THREE.MeshLambertMaterial(Object.assign({color:c},o)));m.rotation.x=-Math.PI/2;m.position.set(x,y,z);LG.add(m);return m};
 const gt=new THREE.CanvasTexture(ground);gt.anisotropy=8;
 const gm=flat(new THREE.PlaneGeometry(WW,WH),0xffffff,WW/2,0,WH/2,{map:gt});gm.receiveShadow=true;
 flat(new THREE.PlaneGeometry(WW+4000,WH+4000),ng?0x02040a:0x16200f,WW/2,-1,WH/2);
 [[WW/2,-5,WW,10],[WW/2,WH+5,WW,10],[-5,WH/2,10,WH],[WW+5,WH/2,10,WH]].forEach(([x,z,w,d])=>mesh(bx(w,26,d),mat('#3a3a30'),x,13,z,LG));
 const rt=document.createElement('canvas');rt.width=rt.height=64;{const x=rt.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,64,64);x.strokeStyle='rgba(120,190,230,.55)';x.lineWidth=2;for(let n=0;n<4;n++){x.beginPath();x.moveTo(0,8+n*16);x.bezierCurveTo(16,n*16,40,16+n*16,64,8+n*16);x.stroke()}}
 waterT=[];water.forEach(w=>{flat(new THREE.PlaneGeometry(w.w+16,w.h+16),0xcfe8d0,w.x+w.w/2,1.2,w.y+w.h/2,{transparent:true,opacity:.35});
  const t=new THREE.CanvasTexture(rt);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(w.w/64,w.h/64);waterT.push(t);
  flat(new THREE.PlaneGeometry(w.w,w.h),0x2a7a9a,w.x+w.w/2,1.6,w.y+w.h/2,{map:t,transparent:true,opacity:.88,emissive:0x0a2a3a})});

 rocks.forEach(k=>{mesh(bx(k.w-2,95,k.h-2),mat('#55554c'),k.x+k.w/2,47,k.y+k.h/2,LG);
  const m=Math.min(k.w,k.h),n=Math.max(1,Math.round(Math.max(k.w,k.h)/(m*.8))),hz=k.w>=k.h;
  for(let n2=0;n2<n;n2++){const f=(n2+.5)/n,b=mesh(rough(new THREE.IcosahedronGeometry(m*.62,1),.35),mat(n2%2?'#6f6f64':'#7b7a6c',{flatShading:true}),hz?k.x+k.w*f:k.x+k.w/2,88+Math.random()*10,hz?k.y+k.h/2:k.y+k.h*f,LG);b.scale.set(hz?1.25:1,(.8+Math.random()*.4)*1.9,hz?1:1.25);b.rotation.y=Math.random()*3}});
 swayT=[];
 trees.forEach((t,n)=>{const ty=n%3,cm=mat(ty===2?0x24532e:0x2f6b25,{transparent:true,flatShading:true}),sw=new THREE.Group();sw.position.set(t.x,0,t.y);LG.add(sw);sw.scale.set(1.15,1.7,1.15);
  const trunk=mesh(new THREE.CylinderGeometry(t.r*.28,t.r*.45,ty===0?70:60,8),mat(ty===2?'#4a3220':'#6a4a2a'),0,ty===0?35:30,0,sw);if(ty===0)trunk.rotation.z=.12;
  const top=new THREE.Group();top.position.y=ty===0?70:56;sw.add(top);
  if(ty===0)for(let k=0;k<7;k++){const f=new THREE.Group();f.rotation.y=k*.9;const m=mesh(new THREE.ConeGeometry(4.5,38,3),cm,19,0,0,f);m.rotation.z=-Math.PI/2-.4;m.scale.z=.5;top.add(f)}
  else if(ty===1){mesh(new THREE.IcosahedronGeometry(t.r*2,1),cm,0,14,0,top).scale.y=.8;mesh(new THREE.IcosahedronGeometry(t.r*1.3,1),cm,t.r*.9,28,-t.r*.4,top);mesh(new THREE.IcosahedronGeometry(t.r*1.1,1),cm,-t.r*.9,24,t.r*.5,top)}
  else for(let k=0;k<4;k++)mesh(new THREE.ConeGeometry(t.r*(2.4-k*.45),26,8),cm,0,k*17-4,0,top);
  swayT.push({g:top,p:t.x*.05,a:ty===0?.06:.03});treeC.push({m:cm,x:t.x,y:t.y})});
 const okp=()=>{for(let n=0;n<8;n++){const x=Math.random()*WW,y=Math.random()*WH;if(!blocked(x,y,6)&&!inWater({x,y}))return[x,y]}return[50,50]};
 const scat=(geo,m,N,fn)=>{const im=new THREE.InstancedMesh(geo,m,N),d=new THREE.Object3D(),c=new THREE.Color();for(let n=0;n<N;n++){const[x,y]=okp();fn(d,c,x,y);d.updateMatrix();im.setMatrixAt(n,d.matrix);im.setColorAt(n,c)}im.castShadow=true;LG.add(im)};
 scat(new THREE.DodecahedronGeometry(1,0),mat(0xffffff,{flatShading:true}),280,(d,c,x,y)=>{const r=2+Math.random()*4;d.position.set(x,r*.4,y);d.scale.set(r,r*.6,r);d.rotation.set(Math.random(),Math.random()*6,0);c.setHSL(.1,.05,.3+Math.random()*.2)});
 scat(new THREE.IcosahedronGeometry(1,1),mat(0xffffff,{flatShading:true}),90,(d,c,x,y)=>{const r=11+Math.random()*10;d.position.set(x,r*.6,y);d.scale.set(r,r*.9,r);d.rotation.set(0,Math.random()*6,0);c.setHSL(.27+Math.random()*.06,.5,.2+Math.random()*.1)});
 scat(new THREE.SphereGeometry(2.6,6,5),new THREE.MeshLambertMaterial({color:0xffffff}),220,(d,c,x,y)=>{d.position.set(x,9,y);d.scale.setScalar(1);d.rotation.set(0,0,0);c.setHex([0xffe066,0xffffff,0xff7aa8,0xb48cff][Math.random()*4|0])});
 grass.forEach(g=>flat(new THREE.CircleGeometry(g.r*.85,24),0x3f7a2a,g.x,.8,g.y,{transparent:true,opacity:.55}));
 const im=new THREE.InstancedMesh(new THREE.ConeGeometry(3.2,42,4),mat(0x5c9a38),grass.length*16),d=new THREE.Object3D();
 grass.forEach((g,i)=>{for(let j=0;j<16;j++){const a=Math.random()*6.28,r=Math.sqrt(Math.random())*g.r*.8;d.position.set(g.x+Math.cos(a)*r,16,g.y+Math.sin(a)*r);d.rotation.set(0,Math.random()*6,0);d.scale.y=.6+Math.random()*.9;d.updateMatrix();im.setMatrixAt(i*16+j,d.matrix)}});LG.add(im);
 goalM=mesh(bx(goal.w,170,goal.h),new THREE.MeshBasicMaterial({color:0xffd60a,transparent:true,opacity:.12,depthWrite:false}),goal.x+goal.w/2,85,goal.y+goal.h/2,LG);goalM.castShadow=goalM.receiveShadow=false;
 {const k=document.createElement('canvas');k.width=k.height=128;const x=k.getContext('2d');x.fillStyle='rgba(30,30,28,.9)';x.fillRect(0,0,128,128);x.strokeStyle='#ffd60a';x.lineWidth=5;x.beginPath();x.arc(64,64,52,0,7);x.stroke();x.fillStyle='#ffd60a';x.font='bold 70px monospace';x.textAlign='center';x.textBaseline='middle';x.fillText('H',64,68);
  flat(new THREE.PlaneGeometry(goal.w,goal.h),0xffffff,goal.x+goal.w/2,1.2,goal.y+goal.h/2,{map:new THREE.CanvasTexture(k),transparent:true})}
 padL=[[0,0],[1,0],[0,1],[1,1]].map(([a,b])=>mesh(new THREE.SphereGeometry(3,8,6),new THREE.MeshBasicMaterial({color:0xffd60a}),goal.x+a*goal.w,6,goal.y+b*goal.h,LG));buildEnv(ng)}
// ---------- Entorno: cubo de acantilados, cielo y montañas ----------
const dome=new THREE.Mesh(new THREE.SphereGeometry(3200,32,16),new THREE.MeshBasicMaterial({side:THREE.BackSide,fog:false,depthWrite:false}));dome.renderOrder=-1;scn.add(dome);
let envG=null,flames=[],mists=[],shafts=[];
const haloT=(()=>{const k=document.createElement('canvas');k.width=k.height=64;const x=k.getContext('2d'),g=x.createRadialGradient(32,32,0,32,32,32);g.addColorStop(0,'rgba(255,200,100,1)');g.addColorStop(.3,'rgba(255,140,40,.45)');g.addColorStop(1,'rgba(255,100,20,0)');x.fillStyle=g;x.fillRect(0,0,64,64);return new THREE.CanvasTexture(k)})();
const fallT=(()=>{const k=document.createElement('canvas');k.width=64;k.height=128;const x=k.getContext('2d');for(let i=0;i<60;i++){x.fillStyle='rgba('+(190+Math.random()*60|0)+',235,255,'+(.25+Math.random()*.6)+')';x.fillRect(Math.random()*64,Math.random()*128,1+Math.random()*3,10+Math.random()*50)}const t=new THREE.CanvasTexture(k);t.wrapS=t.wrapT=THREE.RepeatWrapping;return t})();
function skyTex(ng){const k=document.createElement('canvas');k.width=1024;k.height=512;const x=k.getContext('2d'),g=x.createLinearGradient(0,0,0,512);
 if(ng){g.addColorStop(0,'#01020a');g.addColorStop(.5,'#0a1428');g.addColorStop(1,'#16283a')}else{g.addColorStop(0,'#2f6db5');g.addColorStop(.5,'#8fc0d8');g.addColorStop(1,'#d8e6c0')}
 x.fillStyle=g;x.fillRect(0,0,1024,512);
 if(ng){for(let i=0;i<260;i++){x.fillStyle='rgba(255,255,255,'+(.3+Math.random()*.7)+')';x.fillRect(Math.random()*1024,Math.random()*300,1+Math.random()*1.5,1+Math.random()*1.5)}
  const mg=x.createRadialGradient(780,110,2,780,110,60);mg.addColorStop(0,'#fff');mg.addColorStop(.15,'#eef');mg.addColorStop(1,'rgba(200,220,255,0)');x.fillStyle=mg;x.fillRect(700,30,160,160)}
 else{const sg=x.createRadialGradient(780,150,2,780,150,130);sg.addColorStop(0,'#fff');sg.addColorStop(.1,'rgba(255,250,200,.95)');sg.addColorStop(1,'rgba(255,240,180,0)');x.fillStyle=sg;x.fillRect(600,0,360,320)}
 for(let i=0;i<46;i++){const cx=Math.random()*1024,cy=120+Math.random()*190;for(let j=0;j<7;j++){const r=18+Math.random()*34,gx=cx+(Math.random()-.5)*110,gy=cy+(Math.random()-.5)*16,cg=x.createRadialGradient(gx,gy,0,gx,gy,r);cg.addColorStop(0,ng?'rgba(60,80,110,.28)':'rgba(255,255,255,.45)');cg.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=cg;x.fillRect(gx-r,gy-r,r*2,r*2)}}
 return new THREE.CanvasTexture(k)}
function buildEnv(ng){
 if(envG){scn.remove(envG);envG.traverse(o=>{if(o.geometry)o.geometry.dispose()})}
 envG=new THREE.Group();scn.add(envG);flames=[];mists=[];shafts=[];
 dome.material.map=skyTex(ng);dome.material.needsUpdate=true;
 const d=new THREE.Object3D(),c=new THREE.Color(),R=(a,b)=>a+Math.random()*(b-a);
 const inst=(geo,m,N)=>{const im=new THREE.InstancedMesh(geo,m,N);im.receiveShadow=true;envG.add(im);return im};
 const ring=(off,st,fn)=>{for(let x=-off;x<=WW+off;x+=st){fn(x,-off,0);fn(x,WH+off,1)}for(let z=-off+st;z<WH+off;z+=st){fn(-off,z,2);fn(WW+off,z,3)}};
 const IN=[[0,1],[0,-1],[1,0],[-1,0]];
 // muros de roca: dos filas de peñascos gigantes + respaldo oscuro
 [[WW/2,-110,WW+500,140],[WW/2,WH+110,WW+500,140],[-110,WH/2,140,WH+500],[WW+110,WH/2,140,WH+500]].forEach(([x,z,w,h])=>mesh(bx(w,150,h),mat('#2a2a24'),x,75,z,envG));
 const rows=[[70,50,100,70],[130,70,170,120]],tops=[[],[]];let N=0;rows.forEach(r=>ring(r[0],r[1],()=>N++));
 const cl=inst(rough(new THREE.IcosahedronGeometry(1,1),.45),mat(0xffffff,{flatShading:true}),N);let n=0;
 rows.forEach((r,ri)=>ring(r[0],r[1],(x,z,sd)=>{const h=R(r[2],r[2]+r[3]),w=R(38,66);d.position.set(x+R(-10,10),h*.5,z+R(-10,10));d.scale.set(w,h,w);d.rotation.set(0,R(0,6),0);d.updateMatrix();cl.setMatrixAt(n,d.matrix);c.setHSL(R(.08,.13),R(.08,.2),R(.2,.34));cl.setColorAt(n++,c);tops[ri].push([d.position.x,d.position.z,h*1.5,sd])}));
 // pinos sobre la cresta
 const pa=inst(new THREE.ConeGeometry(1,1.7,7),mat(0xffffff,{flatShading:true}),tops[1].length),pb=inst(new THREE.ConeGeometry(1,1.7,7),mat(0xffffff,{flatShading:true}),tops[1].length);
 tops[1].forEach(([x,z,t],i)=>{const sz=R(24,46);c.setHSL(R(.3,.38),.5,R(.14,.22));d.rotation.set(0,0,0);d.position.set(x,t+sz*.6,z);d.scale.set(sz,sz*1.8,sz);d.updateMatrix();pa.setMatrixAt(i,d.matrix);pa.setColorAt(i,c);d.position.y=t+sz*1.7;d.scale.set(sz*.7,sz*1.4,sz*.7);d.updateMatrix();pb.setMatrixAt(i,d.matrix);pb.setColorAt(i,c)});
 // lianas colgando en la cara interior
 const vn=inst(bx(1,1,1),mat(0xffffff),tops[0].length);
 tops[0].forEach(([x,z,t,sd],i)=>{const l=Math.random()<.7?R(30,90):0,iv=IN[sd];d.rotation.set(0,0,0);d.position.set(x+iv[0]*R(30,44),t*.8-l/2,z+iv[1]*R(30,44));d.scale.set(R(1.5,3),l,R(1.5,3));d.updateMatrix();vn.setMatrixAt(i,d.matrix);c.setHSL(R(.25,.35),.55,R(.15,.28));vn.setColorAt(i,c)});
 // cascadas con niebla en la base
 [[500,6,0],[1450,6,0],[6,900,Math.PI/2]].forEach(([x,z,ry])=>{const g=new THREE.Group();g.position.set(x,112,z);g.rotation.y=ry;envG.add(g);
  const a=new THREE.Mesh(new THREE.PlaneGeometry(60,220),new THREE.MeshBasicMaterial({color:0x3a8ab0,transparent:true,opacity:.55,side:THREE.DoubleSide}));g.add(a);
  const b=new THREE.Mesh(new THREE.PlaneGeometry(60,220),new THREE.MeshBasicMaterial({map:fallT,transparent:true,side:THREE.DoubleSide,depthWrite:false}));b.position.z=.5;g.add(b);
  const m=new THREE.Mesh(new THREE.CircleGeometry(42,20),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.3,depthWrite:false}));m.rotation.x=-Math.PI/2;m.position.set(0,-109.6,24);g.add(m)});
 // torres de esquina
 [[-50,-50],[WW+50,-50],[-50,WH+50],[WW+50,WH+50]].forEach(([x,z])=>{mesh(new THREE.CylinderGeometry(42,48,360,12),mat('#7d7a6a',{flatShading:true}),x,180,z,envG);mesh(new THREE.CylinderGeometry(50,46,16,12),mat('#5d5a4c'),x,368,z,envG);mesh(new THREE.ConeGeometry(56,72,12),mat('#6a3322'),x,412,z,envG);
  for(let k=0;k<4;k++)mesh(bx(8,18,3),mat('#111'),x+Math.cos(k*1.57+.8)*43,230+k*14,z+Math.sin(k*1.57+.8)*43,envG).rotation.y=-(k*1.57+.8)})
 // antorchas con halo
 const torch=(x,z)=>{mesh(bx(3,90,3),mat('#4a3220'),x,45,z,envG);const f=new THREE.Mesh(new THREE.ConeGeometry(6.5,19,6),new THREE.MeshBasicMaterial({color:0xff9a30}));f.position.set(x,100,z);envG.add(f);const h=new THREE.Sprite(new THREE.SpriteMaterial({map:haloT,blending:THREE.AdditiveBlending,depthWrite:false,transparent:true}));h.scale.set(64,64,1);h.position.set(x,102,z);envG.add(h);flames.push(f,h)};
 for(let x=250;x<WW;x+=250){torch(x,5);torch(x,WH-5)}for(let z=250;z<WH;z+=250){torch(5,z);torch(WW-5,z)}
 // montañas lejanas (dos capas)
 [[2300,24,ng?'#0a1420':'#47685f'],[3000,30,ng?'#111c2c':'#7f9f9a']].forEach(([r,k,col],ri)=>{const mt=inst(new THREE.ConeGeometry(1,1,6),new THREE.MeshBasicMaterial({color:col,fog:false}),k);for(let i=0;i<k;i++){const a=i/k*6.283+ri,h=R(450,900),w=R(300,520);d.rotation.set(0,R(0,6),0);d.position.set(WW/2+Math.cos(a)*r,h/2-80,WH/2+Math.sin(a)*r*.8);d.scale.set(w,h,w);d.updateMatrix();mt.setMatrixAt(i,d.matrix)}});
 // neblina baja y rayos de luz
 for(let i=0;i<14;i++){const m=new THREE.Mesh(new THREE.CircleGeometry(R(120,220),20),new THREE.MeshBasicMaterial({color:ng?0x6080a0:0xffffff,transparent:true,opacity:ng?.07:.1,depthWrite:false}));m.rotation.x=-Math.PI/2;m.position.set(R(0,WW),5,R(0,WH));m.userData.p=i;envG.add(m);mists.push(m)}
 if(!ng)for(let i=0;i<7;i++){const m=new THREE.Mesh(new THREE.PlaneGeometry(50,340),new THREE.MeshBasicMaterial({color:0xfff2b0,transparent:true,opacity:.07,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}));m.position.set(R(100,WW-100),160,R(100,WH-100));m.rotation.set(0,R(0,3),.35);m.userData.p=i;envG.add(m);shafts.push(m)}}
// ---------- Partículas ----------
const PN=700,PG=new THREE.BufferGeometry(),pp=new Float32Array(PN*3),pcl=new Float32Array(PN*3);
PG.setAttribute('position',new THREE.BufferAttribute(pp,3));PG.setAttribute('color',new THREE.BufferAttribute(pcl,3));
const PT=new THREE.Points(PG,new THREE.PointsMaterial({size:6,vertexColors:true,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false}));PT.frustumCulled=false;scn.add(PT);
// ---------- Cámara, puntería y registro de objetos ----------
const RC=new THREE.Raycaster(),GP=new THREE.Plane(new THREE.Vector3(0,1,0),0),HIT=new THREE.Vector3(),V3=new THREE.Vector3();
const AIM={x:0,y:0,h:0,g:null},ads={on:0,f:0};
function aim3(){RC.setFromCamera(MC,cam3);const o=RC.ray.origin,r=RC.ray.direction,t0=r.y<-.0001?-o.y/r.y:1e9,te=Math.min(t0,1500);let th=te,gh=null;
 for(let t=30;t<te;t+=6){const x=o.x+r.x*t,y=o.y+r.y*t,z=o.z+r.z*t;
  for(const g of guards)if(g.st!=='grabbed'&&g.st!=='sleep'&&y<64&&Math.hypot(x-g.x,z-g.y)<13){gh=g;break}
  if(gh||(y<100&&blocked(x,z,0))){th=t;break}}
 AIM.x=o.x+r.x*th;AIM.h=Math.max(0,o.y+r.y*th);AIM.y=o.z+r.z*th;AIM.g=gh;M.sx=AIM.x;M.sy=AIM.y}
cv.addEventListener('contextmenu',e=>e.preventDefault());
const scr=(x,y,z)=>{V3.set(x,y,z).project(cam3);return[(V3.x+1)/2*VW,(1-V3.y)/2*VH]};
const FFN=50,FG=new THREE.BufferGeometry(),ffp=new Float32Array(FFN*3);FG.setAttribute('position',new THREE.BufferAttribute(ffp,3));
const FF=new THREE.Points(FG,new THREE.PointsMaterial({size:3.5,color:0xd8ff80,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false}));FF.frustumCulled=false;scn.add(FF);
let AC=null,prevA=0;const aud=()=>{try{AC=AC||new(window.AudioContext||window.webkitAudioContext)()}catch(e){}};addEventListener('keydown',aud);addEventListener('mousedown',aud);
function sfx(f,d,ty,v,f2){if(!AC)return;const t=AC.currentTime,o=AC.createOscillator(),g=AC.createGain();o.type=ty||'square';o.frequency.setValueAtTime(f,t);if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+d);g.gain.setValueAtTime(v||.06,t);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g);g.connect(AC.destination);o.start();o.stop(t+d)}
const BEAM=new THREE.Mesh(new THREE.CylinderGeometry(4,4,260,10,1,true),new THREE.MeshBasicMaterial({color:0xffd60a,transparent:true,opacity:.25,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}));scn.add(BEAM);
const cm={yaw:.78,pitch:.25},cf={x:0,z:0},zm={v:1},OBJ=new Map(),BOXK={};let fr=0;
addEventListener('mousemove',e=>{if(document.pointerLockElement===cv){cm.yaw+=e.movementX*.0025;cm.pitch=Math.max(.05,Math.min(.75,cm.pitch+e.movementY*.002))}});
cv.addEventListener('mousedown',()=>{if(document.pointerLockElement!==cv&&cv.requestPointerLock)cv.requestPointerLock()});
addEventListener('wheel',e=>{zm.v=Math.max(.6,Math.min(1.7,zm.v*(e.deltaY>0?1.08:.93)))},{passive:true});
function get(k,mk){let o=OBJ.get(k);if(!o){o=mk();scn.add(o);OBJ.set(k,o)}o.userData.seen=fr;return o}
const proj=(d,col)=>{const o=get(d,()=>mesh(bx(14,1.6,1.6),mat(col,{emissive:col}),0,0,0));o.position.set(d.x,d.z===undefined?28:d.z,d.y);o.rotation.y=-Math.atan2(d.vy,d.vx);o.rotation.z=Math.atan2(d.vz||0,Math.hypot(d.vx,d.vy))};
function draw(){
 if(lastG!==ground){lastG=ground;buildScene();cf.x=P.x;cf.z=P.y}
 fr++;const T=time;ads.f+=((ads.on?1:0)-ads.f)*.18;cam3.fov=50-20*ads.f;cam3.updateProjectionMatrix();
 cf.x=P.x;cf.z=P.y;const sh=(Math.random()-.5)*shk*6,cy=cm.yaw,cp=cm.pitch,bk=95*zm.v*(1-.3*ads.f),fx=Math.cos(cy),fz=Math.sin(cy);
 cam3.position.set(P.x-fx*bk-fz*26+sh,68+16*zm.v+Math.sin(P.walk*2)*.8*Math.min(1,P.spd/110),P.y-fz*bk+fx*26+sh);
 cam3.position.x=Math.max(14,Math.min(WW-14,cam3.position.x));cam3.position.z=Math.max(14,Math.min(WH-14,cam3.position.z));
 cam3.lookAt(cam3.position.x+fx*Math.cos(cp)*100,cam3.position.y-Math.sin(cp)*100,cam3.position.z+fz*Math.cos(cp)*100);cam3.updateMatrixWorld();aim3();
 sun.position.set(cf.x+280,640,cf.z+160);sun.target.position.set(cf.x,0,cf.z);pt.position.set(P.x,70,P.y);
 goalM.material.opacity=.1+.06*Math.sin(T*3);
 {const LL=LV[lv],tt=!P.docs?items.find(i=>i.t==='doc'||i.t==='radio'):(LL.needSci&&!P.sci)?items.find(i=>i.t==='sci'):goal;BEAM.visible=!!tt&&state==='play';if(tt)BEAM.position.set(tt.x+(tt.w?tt.w/2:0),130,tt.y+(tt.h?tt.h/2:0));BEAM.material.opacity=.18+.1*Math.sin(T*4)}
 if(alertLevel===2&&prevA!==2){try{sfx(880,.25,'sawtooth',.06,440);setTimeout(()=>sfx(880,.25,'sawtooth',.06,440),300)}catch(e){}}prevA=alertLevel;
 padL.forEach((m,n)=>m.visible=Math.sin(T*6+n*1.6)>-.3);
 dome.position.copy(cam3.position);dome.rotation.y=T*.004;fallT.offset.y=-T*.7;
 flames.forEach((f,i)=>{f.scale.y=.85+.3*Math.sin(T*14+i*3)});
 for(const m of mists){m.position.x+=Math.sin(T*.1+m.userData.p)*.12;m.position.z+=Math.cos(T*.08+m.userData.p)*.08}
 for(const m of shafts)m.material.opacity=.05+.04*Math.sin(T*.6+m.userData.p*2);
 for(const t of waterT){t.offset.x=T*.05;t.offset.y=T*.03}
 for(const q of swayT){q.g.rotation.z=Math.sin(T*1.2+q.p)*q.a;q.g.rotation.x=Math.cos(T*.9+q.p)*q.a*.6}
 for(let n=0;n<FFN;n++){const a=n*2.4+T*.12*(1+n%3*.3),r=60+(n*37%260);ffp[n*3]=P.x+Math.cos(a)*r;ffp[n*3+1]=15+(n*13%50)+Math.sin(T*1.5+n)*8;ffp[n*3+2]=P.y+Math.sin(a*1.3)*r*.9}
 FG.attributes.position.needsUpdate=true;FF.material.opacity=LV[lv].night?1:.45;
 for(const c of treeC)c.m.opacity=Math.min(Math.hypot(c.x-P.x,c.y-P.y),Math.hypot(c.x-cam3.position.x,c.y-cam3.position.z))<95?.28:1;
 // jugador
 PLY.gun=P.ammo>0?14:0;
 const pl=get(P,()=>mkPerson(PLY));pl.visible=!P.box;setPerson(pl,P.x,P.y,P.a,P.walk,PLY.gun,false,P.prone,Math.min(1,P.spd/110),Math.max(0,(P.rec||0)/.12));
 if(P.box){get(BOXK,mkBox).position.set(P.x,0,P.y)}
 if(P.f){const o=get(P.f,()=>mkPerson(SCI));setPerson(o,P.f.x,P.f.y,Math.atan2(P.y-P.f.y,P.x-P.f.x),(P.f.x+P.f.y)*.08,0,false,false,D(P.f,P)>40?1:0)}
 // guardias
 for(const g of guards){const gd=GT[g.ty],o=get(g,()=>mkPerson(gd)),lie=g.st==='sleep'||g.st==='down';
  const mvd=Math.hypot(g.x-(g._lx||g.x),g.y-(g._ly||g.y))>.15;g._lx=g.x;g._ly=g.y;
  setPerson(o,g.x,g.y,lie?1.2:g.a,(g.x+g.y)*.08,gd.gun,lie,false,lie||!mvd?0:g.st==='alert'?1.4:1,g.st==='alert'?Math.max(0,Math.min(1,(g.shoot-.83)/.12)):0);
  const m=o.userData.mark,t=lie?TZ:g.st==='alert'?TE:(g.st==='sus'||g.det>.15)?TQ:null;
  m.visible=!!t;if(t){m.material.map=t;m.position.y=58+Math.sin(T*6)*2}}
 // objetos
 for(const it of items){const o=get(it,()=>mkItem(it));
  if(it.t==='sci')setPerson(o,it.x,it.y,.6,0,0,false,false,0);
  else{o.position.set(it.x,o.userData.base+(it.t==='radio'?0:Math.sin(T*3+it.x)*2.5),it.y);if(it.t!=='radio')o.rotation.y=T*1.5}}
 for(const d of darts)proj(d,'#9be564');
 for(const b of bullets)proj(b,'#ffb070');
 for(const r of rings){const o=get(r,()=>{const m=new THREE.Mesh(new THREE.RingGeometry(.95,1,48),new THREE.MeshBasicMaterial({color:new THREE.Color('rgb('+r.c+')'),transparent:true,side:THREE.DoubleSide}));m.rotation.x=-Math.PI/2;return m});
  o.position.set(r.x,2,r.y);o.scale.set(r.r+.01,r.r+.01,1);o.material.opacity=(1-r.r/220)*.8}
 // partículas
 const n=Math.min(parts.length,PN);
 for(let i=0;i<n;i++){const p=parts[i],f=Math.max(0,p.l/p.m);if(!p.rgb)p.rgb=p.c.split(',').map(v=>v/255);
  pp[i*3]=p.x;pp[i*3+1]=10+(1-f)*22;pp[i*3+2]=p.y;pcl[i*3]=p.rgb[0]*f;pcl[i*3+1]=p.rgb[1]*f;pcl[i*3+2]=p.rgb[2]*f}
 PG.setDrawRange(0,n);PG.attributes.position.needsUpdate=true;PG.attributes.color.needsUpdate=true;
 for(const[k,o]of OBJ)if(o.userData.seen!==fr){scn.remove(o);OBJ.delete(k)}
 R3.render(scn,cam3);
 // ---- capa 2D: HUD y avisos ----
 ctx.clearRect(0,0,VW,VH);
 for(const it of items){
  if(it.t==='sci'&&D(it,P)<40){const[x,y]=scr(it.x,80,it.y);ctx.fillStyle='#fff';ctx.font='bold 12px monospace';ctx.textAlign='center';ctx.fillText('[E] liberar',x,y);ctx.textAlign='left'}
  if(it.t==='radio'&&prog>0){const[x,y]=scr(it.x,34,it.y);ctx.fillStyle='rgba(0,0,0,.6)';ctx.fillRect(x-24,y,48,5);ctx.fillStyle='#ffd60a';ctx.fillRect(x-24,y,48*prog/3,5)}}
 const vg=ctx.createRadialGradient(VW/2,VH/2,VH*.35,VW/2,VH/2,VH*.85);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(0,0,0,.5)');ctx.fillStyle=vg;ctx.fillRect(0,0,VW,VH);
 if(alertLevel===2){ctx.fillStyle='rgba(255,0,0,'+(.08+.06*Math.sin(T*8))+')';ctx.fillRect(0,0,VW,VH)}
 if(state==='play'){ctx.strokeStyle=AIM.g?'rgba(255,70,60,.95)':'rgba(255,255,255,.9)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(VW/2-10,VH/2);ctx.lineTo(VW/2-3,VH/2);ctx.moveTo(VW/2+3,VH/2);ctx.lineTo(VW/2+10,VH/2);ctx.moveTo(VW/2,VH/2-10);ctx.lineTo(VW/2,VH/2-3);ctx.moveTo(VW/2,VH/2+3);ctx.lineTo(VW/2,VH/2+10);ctx.stroke();
  if(document.pointerLockElement!==cv){ctx.fillStyle='#ffd60a';ctx.font='13px monospace';ctx.textAlign='center';ctx.fillText('Haz clic para controlar la cámara con el ratón (Esc lo suelta)',VW/2,70);ctx.textAlign='left'}}
 hud()}

reset();state='title';requestAnimationFrame(loop);