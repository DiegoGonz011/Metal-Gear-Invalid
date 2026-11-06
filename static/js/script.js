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
 P={x:LV[lv].start.x,y:LV[lv].start.y,a:0,hp:100,ammo:0,box:false,grab:null,sneak:false,cd:0,spd:0,cqcCd:0,docs:false,sci:false,walk:0,f:null,sta:100,gren:0,prone:false};rings=[];
 items=LV[lv].items.map(i=>({...i}));
 guards=guardDefs.map((p,i)=>({x:p[0][0],y:p[0][1],a:0,ty:i%3,vr:240+Math.random()*90,path:p,pi:0,pause:0,st:'patrol',det:0,t:0,alertT:0,target:null,shoot:0,talked:false,hp:1}));
 darts=[];bullets=[];state='play';say(LV[lv].radio)}
function say(t){msgs=[t];mt=4}
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
function pos(e){const r=cv.getBoundingClientRect();M.sx=(e.clientX-r.left)*VW/r.width;M.sy=(e.clientY-r.top)*VH/r.height}
cv.addEventListener('mousemove',pos);
cv.addEventListener('mousedown',e=>{pos(e);md=true;if(state==='title'){state='brief';bp=0}else if(state==='brief'){if(++bp>=story.length)reset()}else if(state!=='play')proceed()});
addEventListener('mouseup',()=>md=false);
// ---------- Acciones ----------
function cqc(){
 if(P.cqcCd>0)return;
 if(P.grab){const g=P.grab;g.st='down';g.t=15;g.grabbed=false;g.hp=0;P.grab=null;P.cqcCd=.5;drop(g);puff(g.x,g.y,14,'180,160,120',130,.45);shk=.2;say('¡Lanzamiento CQC! Guardia inconsciente (despertará en unos segundos).');return}
 if(P.box)return;
 let best=null,bd=44;
 for(const g of guards){const d=D(g,P);if(d<bd&&g.st!=='sleep'&&g.st!=='down'){bd=d;best=g}}
 if(best){best.grabbed=true;best.st='grabbed';P.grab=best;P.cqcCd=.3;say('CQC: agarre. [ESPACIO] lanzar · [E] interrogar')}
}
function interrogate(){const g=P.grab;if(!g){const s=items.find(i=>i.t==='sci'&&D(i,P)<40);if(s&&P.docs){items=items.filter(i=>i!==s);P.sci=true;P.f={x:s.x,y:s.y};say((s.n||'Dr. Kuzmin')+': "Gracias… sígueme, te cubro."')}else if(s)say('Primero completa el objetivo anterior.');return}
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
 P.ammo--;P.cd=.45;P.rec=.12;puff(P.x+Math.cos(P.a)*34,P.y+Math.sin(P.a)*34,4,'255,240,160',90,.15);
 darts.push({x:P.x+Math.cos(P.a)*18,y:P.y+Math.sin(P.a)*18,vx:Math.cos(P.a)*650,vy:Math.sin(P.a)*650,life:.6})}
function alertAll(g,src){g.st='alert';g.alertT=14;g.target={x:src.x,y:src.y};
 for(const o of guards)if(o!==g&&D(o,g)<450&&(o.st==='patrol'||o.st==='sus')){o.st='alert';o.alertT=14;o.target={x:src.x,y:src.y}}}
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
 if(seen){g.det+=dt*(1.6+(1-d/range)*3.2);g.target={x:P.x,y:P.y};if(g.st==='patrol')g.st='sus';if(g.st==='alert')g.alertT=14}
 else g.det=Math.max(0,g.det-dt*.35);
 // ruido
 if(!P.box&&!P.sneak&&P.spd>100&&d<130&&!seen){g.det+=dt*.5;if(g.st==='patrol'){g.st='sus';g.target={x:P.x,y:P.y}}}
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
  if(seen&&d<170){g.shoot-=dt;if(g.shoot<=0){g.shoot=.7;const e=(Math.random()-.5)*.22;
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
 const l=Math.hypot(ix,iy)||1;
 let sp=P.prone?38:P.sneak?60:125;if(P.box)sp=70;if(P.sta<=0)sp*=.6;if(inWater(P))sp*=.55;if(P.grab)sp*=.6;
 const ox=P.x,oy=P.y;
 mv(P,ix/l*sp*dt,iy/l*sp*dt,11);
 P.spd=Math.hypot(P.x-ox,P.y-oy)/dt;
 P.walk+=P.spd*dt*.07;
 P.sta=Math.max(0,P.sta-dt*(P.spd>100?1.2:.5));if(P.sta<=0){P.hp-=dt*1.5;if(P.hp<=0)state='dead'}
 for(const r of rings)r.r+=300*dt;rings=rings.filter(r=>r.r<220);
 for(const p of parts){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=.94;p.vy*=.94;p.l-=dt}parts=parts.filter(p=>p.l>0);shk=Math.max(0,shk-dt);P.rec=Math.max(0,(P.rec||0)-dt);
 if(P.spd>60&&!P.box&&Math.random()<dt*10)puff(P.x-Math.cos(P.a)*10,P.y-Math.sin(P.a)*10+8,1,'150,130,90',25,.5);
 if(inWater(P)&&P.spd>20&&Math.random()<dt*14)puff(P.x,P.y+8,1,'170,210,240',40,.5);
 for(const it of items){if(D(it,P)>22)continue;if(it.t==='doc'){P.docs=true;it.x=-999;say(it.m||'Cuaderno recuperado. VARGA: "Bien. Ahora el doctor, al sur."')}else if(it.t==='ration'&&(P.hp<100||P.sta<90)){P.hp=Math.min(100,P.hp+30);P.sta=Math.min(100,P.sta+45);it.x=-999;say('Ración consumida: +vida y resistencia.')}else if(it.t==='ammo'){P.ammo+=4;it.x=-999;say('Dardos tranquilizantes recogidos.')}else if(it.t==='gren'){P.gren++;it.x=-999;say('Granada aturdidora recogida.')}}
 items=items.filter(i=>i.x>-900);
 const rd=items.find(i=>i.t==='radio'&&D(i,P)<44);
 if(rd&&K.e&&!P.grab){prog+=dt;if(prog>=3){prog=0;const rx=rd.x,ry=rd.y;rd.x=-999;P.docs=true;say('Transmisor saboteado. VARGA: "Silencio total… bien hecho."');for(const g of guards)if(g.st==='patrol'&&Math.hypot(g.x-rx,g.y-ry)<400){g.st='sus';g.target={x:rx,y:ry};g.t=6}}}else prog=0;
 if(inWater(P)&&P.spd>50)for(const g of guards)if(D(g,P)<190&&g.st==='patrol'){g.st='sus';g.target={x:P.x,y:P.y};g.t=5}
 if(P.f&&D(P.f,P)>40){const fa=Math.atan2(P.y-P.f.y,P.x-P.f.x);mv(P.f,Math.cos(fa)*115*dt,Math.sin(fa)*115*dt,9)}
 const wx=M.sx+cam.x,wy=M.sy+cam.y;
 if(!P.box||P.spd>5){P.a=P.spd>5&&P.box?Math.atan2(iy,ix):Math.atan2(wy-P.y,wx-P.x)}
 if(md)shoot();
 for(const g of guards)updateGuard(g,dt);
 // dardos
 for(const d of darts){d.x+=d.vx*dt;d.y+=d.vy*dt;d.life-=dt;
  if(blocked(d.x,d.y,0)){d.life=0;puff(d.x,d.y,5,'200,200,180',70,.3)}
  for(const g of guards)if(d.life>0&&g.st!=='grabbed'&&g.st!=='sleep'&&Math.hypot(d.x-g.x,d.y-g.y)<14){
   d.life=0;drop(g);puff(g.x,g.y,12,'155,229,100',130,.5);g.st='sleep';g.t=70;g.det=0;say('¡Impacto! Guardia dormido.')}}
 darts=darts.filter(d=>d.life>0);
 for(const b of bullets){b.x+=b.vx*dt;b.y+=b.vy*dt;b.life-=dt;
  if(blocked(b.x,b.y,0)){b.life=0;puff(b.x,b.y,5,'230,200,150',70,.3)}
  if(b.life>0&&Math.hypot(b.x-P.x,b.y-P.y)<12){b.life=0;puff(P.x,P.y,10,'220,60,50',110,.45);shk=.25;P.hp-=P.box?14:9;if(P.hp<=0){state='dead'}}}
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
['MISIÓN: AGENTE HALCÓN','Operativo solitario, sin bandera ni uniforme.','1) Recupera el cuaderno de rutas del convoy (campamento central).','2) Libera al Dr. Kuzmin (zona sur) con [E].','3) Llega al punto de extracción dorado.'],
['RADIO · MAYOR VARGA','"Sin armas letales, Halcón. Si te atrapan, negaremos tu existencia.','Usa la selva, el cartón y tus manos."','Ella te entrenó. Confías en ella… por ahora.']];
let story=STORY1;
const inWater=e=>water.some(w=>e.x>w.x&&e.x<w.x+w.w&&e.y>w.y&&e.y<w.y+w.h);
const LV=[
{name:'Selva Tropical',seed:7,rocks:rocks.map(r=>({...r})),goal:{...goal},guards:guardDefs.slice(),water:[],start:{x:100,y:100},trees:95,grass:45,bg:'#223318',needSci:true,
 radio:'VARGA (radio): "Cuaderno de rutas en el campamento central. Muévete, Halcón."',
 obj:['OBJETIVO: cuaderno de rutas (centro)','OBJETIVO: liberar al Dr. Kuzmin (sur) con [E]','OBJETIVO: llevar al doctor a la extracción'],
 items:[{t:'doc',x:1230,y:470},{t:'sci',x:1120,y:1090},{t:'ration',x:350,y:300},{t:'ration',x:1050,y:760},{t:'ration',x:1600,y:600},{t:'ammo',x:700,y:700},{t:'ammo',x:1700,y:480},{t:'gren',x:1000,y:200}],
 end:['Kuzmin está a salvo, pero susurra un código: "La Tejedora".','VARGA calla en la radio… algo no encaja.']},
{name:'Río de Ceniza',seed:19,bg:'#1f3320',needSci:false,start:{x:100,y:1150},goal:{x:1800,y:100,w:110,h:110},trees:70,grass:35,
 water:[{x:880,y:0,w:140,h:520},{x:880,y:640,w:140,h:420},{x:880,y:1180,w:140,h:120}],
 rocks:[{x:300,y:300,w:200,h:30},{x:300,y:300,w:30,h:200},{x:1300,y:560,w:30,h:140},{x:1300,y:700,w:250,h:30},{x:1600,y:260,w:200,h:30},{x:1560,y:900,w:30,h:110},{x:200,y:900,w:300,h:30},{x:1100,y:1000,w:200,h:30}],
 guards:[[[200,1000],[600,1000],[600,1150],[200,1150]],[[400,650],[400,380],[750,380],[750,650]],[[800,580],[1100,580]],[[800,1120],[1100,1120]],[[1150,200],[1150,500],[1450,500],[1450,200]],[[1200,800],[1500,800],[1500,950],[1200,950]],[[1700,500],[1700,900]],[[1600,350],[1800,350],[1800,500]],[[500,800],[750,800],[750,1000]],[[1300,1150],[1700,1150],[1700,1050],[1300,1050]]],
 radio:'VARGA (radio): "Hay un transmisor al este del río. Cruza por los puentes… o mójate y sé ruidoso."',
 obj:['OBJETIVO: sabotear el transmisor (este) · mantén [E]','','OBJETIVO: ve a la extracción (noreste)'],
 items:[{t:'radio',x:1780,y:700},{t:'ration',x:200,y:500},{t:'ration',x:1000,y:900},{t:'ration',x:1450,y:300},{t:'ammo',x:600,y:500},{t:'ammo',x:1300,y:900},{t:'gren',x:700,y:1100},{t:'gren',x:1500,y:650}],
 story:[['MISIÓN 2 · RÍO DE CENIZA','Kuzmin habló: los rebeldes se comunican con un transmisor en las ruinas, al otro lado del río.','VARGA: "Sabotéalo antes del amanecer."','El agua te frena y hace ruido. Mantén [E] junto al transmisor para sabotearlo.']],
 end:['El transmisor calla. En la radio, una voz desconocida ríe:','"Halcón… la Mayor también trabaja para nosotros."']},
{name:'Fortaleza Nocturna',seed:31,bg:'#262b28',needSci:true,night:true,start:{x:100,y:650},goal:{x:1840,y:1120,w:110,h:110},trees:40,grass:20,water:[],
 rocks:[{x:900,y:300,w:300,h:30},{x:1400,y:300,w:300,h:30},{x:900,y:1000,w:300,h:30},{x:1400,y:1000,w:300,h:30},{x:900,y:300,w:30,h:300},{x:900,y:700,w:30,h:330},{x:1670,y:300,w:30,h:300},{x:1670,y:700,w:30,h:330},{x:1050,y:450,w:120,h:100},{x:1450,y:600,w:120,h:100}],
 guards:[[[300,300],[300,900]],[[500,500],[700,500],[700,800],[500,800]],[[800,150],[1800,150]],[[800,1150],[1700,1150]],[[1850,300],[1850,1000]],[[1000,380],[1600,380]],[[1000,950],[1600,950]],[[1000,650],[1000,900]],[[1350,520],[1350,900],[1250,900]],[[1250,250],[1350,250]],[[1600,700],[1600,900]]],
 radio:'VARGA (radio): "Es de noche, Halcón. Solo verás lo que tienes cerca. El libro de mando está dentro."',
 obj:['OBJETIVO: libro de mando (dentro de la fortaleza)','OBJETIVO: liberar al Capitán Ortiz con [E]','OBJETIVO: escapar por la extracción (sureste)'],
 items:[{t:'doc',x:1300,y:750,m:'Libro de mando recuperado. Las órdenes llevan la firma de VARGA…'},{t:'sci',x:1550,y:450,n:'Capitán Ortiz'},{t:'ration',x:600,y:300},{t:'ration',x:1100,y:700},{t:'ration',x:1500,y:800},{t:'ammo',x:400,y:1000},{t:'ammo',x:1750,y:700},{t:'gren',x:700,y:900},{t:'gren',x:1300,y:450}],
 story:[['MISIÓN 3 · FORTALEZA NOCTURNA','La voz habló de Varga. El rastro lleva a una fortaleza rebelde.','Dentro está el Capitán Ortiz, tu antiguo compañero, y el libro de mando.','Es de noche: solo ves a tu alrededor. Confía en el sigilo.']],
 end:['Ortiz confirma la verdad: Varga vendió a tu equipo a los rebeldes.','Un helicóptero se acerca. Hay una cuenta pendiente con la Mayor.','FIN · Gracias por jugar.']}];
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
const GRD={body:'#9b6a46',boot:'#222',hat:'#5c7a62',vest:'#2b2b2b',gun:18,helmet:1},PLY={body:'#5f8a36',pants:'#4a6a2a',boot:'#2a2a1e',hair:'#4a3220',gun:0,sup:0,paint:1,camo:1,harness:1,knife:1},SCI={body:'#e8e8e0',boot:'#333',gun:0},OFC={body:'#8a8a66',pants:'#5a5a48',boot:'#222',hat:'#b02a2a',beret:1,vest:'#3a3a2a',gun:12},HVY={body:'#6a7872',boot:'#111',hat:'#46604a',helmet:1,vest:'#1d1d1d',gun:24,sc:1.18},GT=[GRD,OFC,HVY];
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
function draw(){
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
 if(false){const mw=130,mh=mw*WH/WW,mx=VW-mw-12,my=44;
 ctx.fillStyle='rgba(0,0,0,.55)';ctx.fillRect(mx,my,mw,mh);
 const s=mw/WW;ctx.fillStyle='#ffd60a';ctx.fillRect(mx+goal.x*s,my+goal.y*s,goal.w*s,goal.h*s);for(const it of items)if(it.t!=='ration'){ctx.fillStyle='#fff';ctx.fillRect(mx+it.x*s-2,my+it.y*s-2,4,4)}
 for(const g of guards){ctx.fillStyle=g.st==='alert'?'#f33':(g.st==='sleep'||g.st==='down')?'#777':'#e2a84b';ctx.fillRect(mx+g.x*s-1.5,my+g.y*s-1.5,3,3)}
 ctx.fillStyle='#9be564';ctx.fillRect(mx+P.x*s-2,my+P.y*s-2,4,4)}}
function overlay(t,sub,col){ctx.fillStyle='rgba(0,0,0,.72)';ctx.fillRect(0,0,VW,VH);ctx.fillStyle='rgba(14,22,10,.88)';ctx.beginPath();ctx.roundRect(60,VH/2-125,VW-120,290,14);ctx.fill();ctx.strokeStyle=col;ctx.globalAlpha=.5;ctx.lineWidth=2;ctx.stroke();ctx.globalAlpha=1;ctx.textAlign='center';ctx.fillStyle=col;ctx.font='bold 34px monospace';ctx.fillText(t,VW/2,VH/2-70);
 ctx.fillStyle='#cfd8b0';ctx.font='14px monospace';sub.forEach((l,i)=>ctx.fillText(l,VW/2,VH/2-25+i*22));ctx.textAlign='left'}
const help=['WASD / flechas: mover · SHIFT: avanzar sigilosamente (menos visible)','Ratón: apuntar · CLIC: disparar dardo tranquilizante','ESPACIO: CQC → de nuevo para lanzar · E: interrogar · Q: estrangular · Mantén E: sabotear radio','B: caja de cartón (quieto = casi invisible) · C: tumbarte (más sigilo, más lento)','G: granada aturdidora · T: lanzar casquillo para distraer · ¡No se ve el campo de visión enemigo!','Empiezas sin armas: duerme o estrangula guardias para que suelten dardos y granadas.','Resistencia: come raciones o empezarás a perder vida.','Los conos de visión se bloquean con árboles y rocas. La hierba te oculta.','Recoge el cuaderno, libera al Dr. Kuzmin (E) y llega a la zona dorada. Las raciones curan.'];
let last=performance.now();
function loop(n){const dt=Math.min(.05,(n-last)/1000);last=n;
 if(state==='play')update(dt);
 if(P){draw()}else{ctx.fillStyle='#16200f';ctx.fillRect(0,0,VW,VH)}
 if(state==='title')overlay('OPERACIÓN DEVORADOR DE SERPIENTES 2D',help.concat(['','Pulsa ENTER o haz clic para empezar']),'#9be564');
 if(state==='brief')overlay(story[bp][0],story[bp].slice(1).concat(['','ENTER / clic: continuar']),'#9be564');
 if(state==='dead')overlay('MISIÓN FALLIDA',['Pulsa ENTER o clic para reintentar'],'#ff3b30');
 if(state==='win')overlay('MISIÓN CUMPLIDA',LV[lv].end.concat(['',lv<LV.length-1?'ENTER / clic: siguiente misión':'ENTER / clic: volver al inicio']),'#ffd60a');
 requestAnimationFrame(loop)}
reset();state='title';requestAnimationFrame(loop);
