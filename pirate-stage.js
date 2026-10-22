const sentenceTasks=[
{before:'Красная ',answer:'роза',after:' растёт у забора.'},
{before:'Красный ',answer:'краб',after:' ползёт по песку.'},
{before:'Рома нашёл розовую ',answer:'ракушку',after:'.'},
{before:'',answer:'Русалка',after:' нашла красную ракушку.'},
{before:'',answer:'Радуга',after:' сияет над горой.'},
{before:'Рома громко стучит в ',answer:'барабан',after:'.'},
{before:'Рома сварил сочную ',answer:'кукурузу',after:'.'},
{before:'Рома собрал ',answer:'горох',after:' в огороде.'},
{before:'Король надел дорогую ',answer:'корону',after:'.'},
{before:'Красные ',answer:'кораллы',after:' растут на дне.'},
{before:'',answer:'Воздушный шар',after:' летит над двором.'},
{before:'Крыса грызёт ',answer:'сыр',after:'.'},
{before:'Папа рубит дрова ',answer:'топором',after:'.'},
{before:'',answer:'Комар',after:' кружит над ромашкой.'},
{before:'Рома и брат пьют чай из ',answer:'самовара',after:'.'}
];
const pirateGame={index:0,used:new Set(),selected:null,locked:false,done:false,drag:null};
document.querySelector('main').insertAdjacentHTML('beforeend',`<section id="pirate-stage" hidden aria-label="Отдаём сокровища пирату"><div class="pirate-top"><h2>Сокровища для капитана</h2><span class="pirate-progress" id="pirate-progress" role="status">Отдано 0 / 15</span></div><p id="pirate-instruction">Педагог читает предложение. Перетащи нужную монету на пропуск.</p><div class="pirate-layout"><div class="tasks-area"><div class="sentence-card" id="sentence-card"><div><span id="sentence-before"></span><button id="word-gap" aria-label="Пропущенное слово: поместить выбранную монету">...</button><span id="sentence-after"></span></div></div><div class="coin-bank" id="coin-bank" aria-label="Монеты с картинками"></div><div class="pirate-bottom"><p id="answer-feedback" role="status" aria-live="polite">Можно также выбрать монету нажатием, затем нажать на ...</p><button class="next-sentence" id="next-sentence" disabled>Дальше</button></div><div class="final-message" id="pirate-final" hidden><h3>Все сокровища у капитана!</h3><p>Ты помог пирату и выполнил все 15 заданий.</p><button class="replay" id="replay-adventure">Новое путешествие</button></div></div><div class="captain-wrap"><canvas id="captain" width="512" height="768" role="img" aria-label="Пират машет рукой, получая монету"></canvas><div class="pirate-speech" id="pirate-speech">Помоги мне собрать сокровища!</div></div></div></section>`);
const pirateStage=document.getElementById('pirate-stage'),coinBank=document.getElementById('coin-bank'),sentenceCard=document.getElementById('sentence-card'),wordGap=document.getElementById('word-gap'),captain=document.getElementById('captain');
function coinCanvas(id,size=240){const c=document.createElement('canvas');c.width=c.height=size;paintCoin(id,size/2,size/2,size*.47,1,c.getContext('2d'));return c}
function cancelCoinDrag(){const d=pirateGame.drag;if(d){d.ghost?.remove();pirateGame.drag=null}sentenceCard.classList.remove('over')}
function selectCoin(id){if(pirateGame.locked||pirateGame.used.has(id))return;pirateGame.selected=id;for(const b of coinBank.children)b.setAttribute('aria-pressed',String(Number(b.dataset.coin)===id));document.getElementById('answer-feedback').textContent='Теперь нажми на ... в предложении.'}
function submitCoin(id,dropPoint=null){
if(pirateGame.locked||pirateGame.done||pirateGame.used.has(id))return false;
if(id!==pirateGame.index){document.getElementById('answer-feedback').textContent='Попробуй другую монету.';document.getElementById('pirate-speech').textContent='Послушай предложение ещё раз.';pirateGame.selected=null;for(const b of coinBank.children)b.setAttribute('aria-pressed','false');return false}
pirateGame.locked=true;pirateGame.used.add(id);pirateGame.selected=null;
for(const b of coinBank.children){b.setAttribute('aria-pressed','false');b.disabled=pirateGame.used.has(Number(b.dataset.coin))}
wordGap.textContent=sentenceTasks[id].answer;wordGap.disabled=true;sentenceCard.classList.add('correct');
document.getElementById('answer-feedback').textContent='Верно! Монета летит к капитану.';
const next=document.getElementById('next-sentence');next.disabled=true;next.textContent=id===14?'Завершить':'Дальше';
playCaptainResponse(id,dropPoint,()=>{
 document.getElementById('pirate-progress').textContent='Отдано '+pirateGame.used.size+' / 15';
 document.getElementById('answer-feedback').textContent='Верно! Монета у капитана.';
 document.getElementById('pirate-speech').textContent=['Ура! Спасибо за сокровище!','Вот это находка!','Ты отлично справляешься!'][id%3];
},()=>{next.disabled=false;next.focus()});
return true;
}
function renderSentence(){const task=sentenceTasks[pirateGame.index];document.getElementById('sentence-before').textContent=task.before;document.getElementById('sentence-after').textContent=task.after;wordGap.textContent='...';wordGap.disabled=false;sentenceCard.classList.remove('correct');pirateGame.locked=false;document.getElementById('next-sentence').disabled=true;document.getElementById('next-sentence').textContent='Дальше';document.getElementById('answer-feedback').textContent='Перетащи нужную монету на предложение.';cancelCaptainResponse();drawCaptain(0)}
function buildCoinBank(){
coinBank.replaceChildren();const order=Array.from({length:15},(_,i)=>i);for(let i=14;i>0;i--){const j=Math.floor(Math.random()*(i+1));[order[i],order[j]]=[order[j],order[i]]}
for(const id of order){const b=document.createElement('button');b.className='word-coin';b.dataset.coin=id;b.setAttribute('aria-label',treasureWords[id]);b.setAttribute('aria-pressed','false');b.append(coinCanvas(id));coinBank.append(b);
b.onpointerdown=e=>{if(pirateGame.locked||b.disabled||e.button!==0)return;e.preventDefault();cancelCoinDrag();b.focus();b.setPointerCapture(e.pointerId);pirateGame.drag={id,pointer:e.pointerId,x:e.clientX,y:e.clientY,moved:false,ghost:null}};
b.onpointermove=e=>{const d=pirateGame.drag;if(!d||d.pointer!==e.pointerId)return;if(!d.moved&&Math.hypot(e.clientX-d.x,e.clientY-d.y)>5){d.moved=true;d.ghost=coinCanvas(id);d.ghost.className='drag-coin';d.ghost.setAttribute('aria-hidden','true');document.body.append(d.ghost)}if(d.ghost){d.ghost.style.left=e.clientX+'px';d.ghost.style.top=e.clientY+'px'}const r=sentenceCard.getBoundingClientRect();sentenceCard.classList.toggle('over',e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top&&e.clientY<=r.bottom)};
b.onpointerup=e=>{const d=pirateGame.drag;if(!d||d.pointer!==e.pointerId)return;const r=sentenceCard.getBoundingClientRect(),inside=e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top&&e.clientY<=r.bottom;cancelCoinDrag();if(d.moved&&inside)submitCoin(id,{x:e.clientX,y:e.clientY});else if(!d.moved)selectCoin(id)};
b.onpointercancel=b.onlostpointercapture=()=>cancelCoinDrag();
b.onclick=e=>{if(e.detail===0)selectCoin(id)};
}
}
function startPirateStage(){
cancelCoinDrag();Object.assign(pirateGame,{index:0,used:new Set(),selected:null,locked:false,done:false});
document.querySelector('main>header').hidden=true;document.querySelector('.stage').hidden=true;pirateStage.hidden=false;
document.getElementById('pirate-final').hidden=true;sentenceCard.hidden=false;coinBank.hidden=false;document.querySelector('.pirate-bottom').hidden=false;document.getElementById('pirate-instruction').hidden=false;
document.getElementById('pirate-progress').textContent='Отдано 0 / 15';document.getElementById('pirate-speech').textContent='Помоги мне собрать сокровища!';buildCoinBank();renderSentence();wordGap.focus();
}
wordGap.onclick=()=>{if(pirateGame.selected!==null)submitCoin(pirateGame.selected);else document.getElementById('answer-feedback').textContent='Сначала выбери монету с подходящей картинкой.'};
document.getElementById('next-sentence').onclick=()=>{
if(!pirateGame.locked||captainRig.busy)return;
if(pirateGame.index===14){pirateGame.done=true;sentenceCard.hidden=true;coinBank.hidden=true;document.querySelector('.pirate-bottom').hidden=true;document.getElementById('pirate-instruction').hidden=true;document.getElementById('pirate-final').hidden=false;document.getElementById('pirate-speech').textContent='Спасибо! Все 15 сокровищ на месте!';document.getElementById('replay-adventure').focus();return}
pirateGame.index++;pirateGame.selected=null;renderSentence();wordGap.focus();
};
document.getElementById('replay-adventure').onclick=()=>{cancelCaptainResponse();cancelCoinDrag();pirateStage.hidden=true;document.querySelector('main>header').hidden=false;document.querySelector('.stage').hidden=false;document.getElementById('again').click()};
document.addEventListener('keydown',e=>{if(e.key==='Escape'){cancelCoinDrag();pirateGame.selected=null;for(const b of coinBank.children)b.setAttribute('aria-pressed','false')}});
addEventListener('blur',cancelCoinDrag);
