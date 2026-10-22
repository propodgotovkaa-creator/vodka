const treasureWords=['Роза','Краб','Ракушка','Русалка','Радуга','Барабан','Кукуруза','Горох','Корона','Кораллы','Воздушный шар','Сыр','Топор','Комар','Самовар'];
const treasure={phase:'travel',index:0,t:0,collected:0,origin:null};
const chestStart=1500,chestSpacing=1600;
const treasureButton=document.getElementById('treasure-action');
const counter=document.getElementById('treasure-count');
const finishPanel=document.getElementById('finish');
const ease=p=>1-(1-Math.max(0,Math.min(1,p)))**3;
function chestWorld(i){return chestStart+i*chestSpacing}
function clearOfChest(worldX){const i=Math.round((worldX-chestStart)/chestSpacing);return i<0||i>=15||Math.abs(worldX-chestWorld(i))>440}
function setTreasurePhase(phase){
treasure.phase=phase;treasure.t=0;keys.clear();pointerKeys.clear();
document.querySelector('.controls').hidden=phase!=='travel';


treasureButton.hidden=true;
if(phase==='ready'){treasureButton.setAttribute('aria-label','Открыть сундук');treasureButton.hidden=false;treasureButton.focus()}
if(phase==='coin'){treasureButton.setAttribute('aria-label','Забрать монету после выполнения задания');treasureButton.hidden=false;treasureButton.focus()}
if(phase==='complete'){finishPanel.hidden=false;document.getElementById('again').focus()}
if(phase==='pirate')startPirateStage();
}
function activateTreasure(){if(paused)return;if(treasure.phase==='ready')setTreasurePhase('opening');else if(treasure.phase==='coin')setTreasurePhase('collecting')}
treasureButton.onclick=activateTreasure;
document.getElementById('again').onclick=()=>{
Object.assign(treasure,{phase:'travel',index:0,t:0,collected:0,origin:null});camera=0;boat={x:720,y:H*.47,vx:0,vy:0};paused=false;protection=1.2;shake=0;particles=[];burst=[];touchedMines.clear();counter.textContent='0 / 15';finishPanel.hidden=true;setTreasurePhase('travel');
};
function updateTreasure(dt){
if(treasure.phase==='complete'||treasure.phase==='pirate')return;
treasure.t+=dt;
const x=chestWorld(treasure.index)-camera;
if(treasure.phase==='travel'&&x<=boat.x+330){treasure.origin={camera,x:boat.x,y:boat.y};boat.vx=boat.vy=0;setTreasurePhase('docking')}
else if(treasure.phase==='docking'){
const p=ease(treasure.t/1.25),o=treasure.origin;
const targetCamera=Math.max(o.camera,chestWorld(treasure.index)-1000);
const targetBoat=Math.max(235,Math.min(680,chestWorld(treasure.index)-targetCamera-300));
camera=o.camera+(targetCamera-o.camera)*p;
boat.x=o.x+(targetBoat-o.x)*p;boat.y=o.y+(H-310-o.y)*p;
if(treasure.t>=1.25)setTreasurePhase('ready');
}else if(treasure.phase==='opening'&&treasure.t>=2)setTreasurePhase('coin');
else if(treasure.phase==='collecting'&&treasure.t>=.85){
treasure.collected++;treasure.index++;counter.textContent=treasure.collected+' / 15';
if(treasure.collected===15)setTreasurePhase('pirate');else{protection=1.2;setTreasurePhase('travel')}
}
}
function glow(x,y,r,alpha){ctx.save();ctx.globalAlpha=alpha;const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,'#fff4a9cc');g.addColorStop(.4,'#ffca4455');g.addColorStop(1,'#ffd04600');ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2);ctx.restore()}
function drawChests(){
for(let i=Math.max(0,treasure.index-1);i<Math.min(15,treasure.index+2);i++){
const x=chestWorld(i)-camera;if(x< -200||x>W+200)continue;
const active=i===treasure.index,opened=i<treasure.index||['coin','collecting','complete'].includes(treasure.phase);
if(active)glow(x,H-165,155,.6+Math.sin(time*2)*.12);
const opening=active&&treasure.phase==='opening'?ease(treasure.t/.85):opened?1:0;
ctx.save();ctx.globalAlpha=1-opening;ctx.drawImage(images['chest-closed'],x-140,H-335,280,280);ctx.globalAlpha=opening;ctx.drawImage(images['chest-open'],x-140,H-335,280,280);ctx.restore();
if(active&&treasure.phase==='ready'){
const y=H-330+Math.sin(time*3)*9;ctx.fillStyle='#ffdf68';ctx.strokeStyle='#8a5814';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x-19,y);ctx.lineTo(x+19,y);ctx.lineTo(x,y+24);ctx.closePath();ctx.fill();ctx.stroke();
}
}
}
function paintCoin(index,x,y,r,spin=1,context=ctx){
// Five illustrations per sheet: 478px circular crops, no neighboring rims.
const slot=index%5, sx=[262,768,1274][slot%3],sy=slot<3?254:750,sr=239;
const source=images['coins-hd-'+(Math.floor(index/5)+1)];
const c=context;c.save();c.imageSmoothingEnabled=true;c.imageSmoothingQuality="high";c.translate(x,y);c.scale(spin,1);c.beginPath();c.arc(0,0,r,0,Math.PI*2);c.fillStyle='#d39c25';c.fill();c.clip();c.drawImage(source,sx-sr,sy-sr,sr*2,sr*2,-r,-r,r*2,r*2);c.strokeStyle='#c28a20';c.lineWidth=Math.max(1,r*.012);c.stroke();c.restore();
}
function placeTreasureButton(x,y,w,h){
const box=canvas.getBoundingClientRect(),scale=Math.min(box.width/W,box.height/H),ox=(box.width-W*scale)/2,oy=(box.height-H*scale)/2;
treasureButton.style.left=(ox+(x-w/2)*scale)+'px';treasureButton.style.top=(oy+(y-h/2)*scale)+'px';treasureButton.style.width=w*scale+'px';treasureButton.style.height=h*scale+'px';treasureButton.hidden=paused;
}
function drawTreasureOverlay(){
treasureButton.hidden=true;
const phase=treasure.phase;
if(phase==='ready')placeTreasureButton(chestWorld(treasure.index)-camera,H-175,300,240);
if(['opening','coin','collecting'].includes(phase)){
let x=800,y=H/2-20,r=255,spin=1,veil=.28;
if(phase==='opening'){
const p=ease((treasure.t-.55)/1.45);x=(chestWorld(treasure.index)-camera)*(1-p)+800*p;y=(H-200)*(1-p)+(H/2-20)*p;r=32+223*p;spin=.25+.75*Math.abs(Math.cos((1-p)*Math.PI*2));veil*=p;
if(treasure.t<.55){glow(chestWorld(treasure.index)-camera,H-200,180,treasure.t);return}
}else if(phase==='collecting'){
const p=ease(treasure.t/.85);x=800+(1480-800)*p;y=(H/2-20)+(60-(H/2-20))*p-Math.sin(p*Math.PI)*110;r=255+(23-255)*p;veil*=1-p;
}
ctx.fillStyle='rgba(0,29,49,'+veil+')';ctx.fillRect(0,0,W,H);glow(x,y,r*1.5,.8);paintCoin(treasure.index,x,y,r,spin);
if(phase==='coin')placeTreasureButton(x,y,r*2,r*2);
}
if(phase==='complete')for(let i=0;i<38;i++){const x=(i*157+Math.sin(time+i)*25)%W,y=(time*65+i*89)%H;ctx.fillStyle=i%2?'#ffe28b':'#ffc74c';ctx.beginPath();ctx.ellipse(x,y,5+Math.sin(time+i)*2,7,Math.sin(time+i),0,Math.PI*2);ctx.fill()}
}
