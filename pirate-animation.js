const captainRig={raf:0,epoch:0,busy:false,flight:null,flightAnimation:null,angle:0};
function drawCaptain(progress=0){
if(!images['pirate-body']||!images['pirate-arm'])return;
const c=captain.getContext('2d');c.clearRect(0,0,512,768);c.save();c.scale(.5,.5);
const moving=progress>0&&progress<1&&!matchMedia('(prefers-reduced-motion: reduce)').matches;
const envelope=moving?Math.min(1,progress/.13,(1-progress)/.18):0;
const lean=moving?-Math.sin(progress*Math.PI)*.025:0;
const angle=moving?envelope*(.06+Math.sin(progress*Math.PI*6)*.28):0;
captainRig.angle=angle;
c.translate(510,1450);c.rotate(lean);c.translate(-510,-1450);
c.drawImage(images['pirate-body'],0,0,1024,1536);
// Rounded sleeve overlap conceals the elbow joint throughout the wave.
c.save();c.translate(257,493);c.rotate(angle);c.scale(.72,.72);c.translate(-330,-620);
c.drawImage(images['pirate-arm'],0,0,1024,1536);c.restore();c.restore();
}
function cancelCaptainResponse(){
captainRig.epoch++;cancelAnimationFrame(captainRig.raf);captainRig.raf=0;
captainRig.flightAnimation?.cancel();captainRig.flight?.remove();captainRig.flight=null;captainRig.flightAnimation=null;captainRig.busy=false;captainRig.angle=0;captain.classList.remove('happy');
}
function playCaptainResponse(id,point,onArrive,onFinish){
cancelCaptainResponse();captainRig.busy=true;captain.classList.add('happy');
const epoch=captainRig.epoch,reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const from=wordGap.getBoundingClientRect(),to=captain.getBoundingClientRect();
const start=point||{x:from.left+from.width/2,y:from.top+from.height/2};
const end={x:to.left+to.width*.66,y:to.top+to.height*.52};
const coin=coinCanvas(id);coin.className='delivery-coin';coin.setAttribute('aria-hidden','true');coin.style.left=start.x+'px';coin.style.top=start.y+'px';document.body.append(coin);captainRig.flight=coin;
const dx=end.x-start.x,dy=end.y-start.y,duration=reduced?160:900;
captainRig.flightAnimation=coin.animate([
{transform:'translate(-50%,-50%) scale(1)',opacity:1},
{transform:`translate(calc(-50% + ${dx*.5}px),calc(-50% + ${dy*.5-75}px)) scale(.85) rotate(-14deg)`,opacity:1,offset:.5},
{transform:`translate(calc(-50% + ${dx}px),calc(-50% + ${dy}px)) scale(.22) rotate(16deg)`,opacity:0}
],{duration,easing:'cubic-bezier(.3,.05,.4,1)',fill:'forwards'});
captainRig.flightAnimation.finished.then(()=>{if(epoch!==captainRig.epoch)return;coin.remove();captainRig.flight=null;captainRig.flightAnimation=null;onArrive()}).catch(()=>{});
const began=performance.now(),total=reduced?240:2300;
function frame(now){if(epoch!==captainRig.epoch)return;const progress=Math.min(1,(now-began)/total);drawCaptain(progress);if(progress<1)captainRig.raf=requestAnimationFrame(frame);else{captainRig.busy=false;captainRig.raf=0;captain.classList.remove('happy');onFinish()}}
captainRig.raf=requestAnimationFrame(frame);
}
