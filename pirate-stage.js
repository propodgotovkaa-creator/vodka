const sentenceTasks=[
{before:'Красная ',answer:'роза',after:' растёт у забора.'},
{before:'Красный ',answer:'краб',after:' ползёт по песку.'},
{before:'Рома нашёл розовую ',answer:'ракушку',after:'.'},
{before:'',answer:'Русалка',after:' нашла красную ракушку.'},
{before:'',answer:'Радуга',after:' сияет над горой.'},
{before:'Рома громко стучит в ',answer:'барабан',after:'.'},
{before:'Сочная ',answer:'кукуруза',after:' растёт в поле.'},
{before:'Рома собрал ',answer:'горох',after:' в огороде.'},
{before:'Король надел дорогую ',answer:'корону',after:'.'},
{before:'Красные ',answer:'кораллы',after:' растут на дне.'},
{before:'',answer:'Воздушный шар',after:' летит над двором.'},
{before:'Крыса грызёт ',answer:'сыр',after:'.'},
{before:'Папа рубит дрова ',answer:'топором',after:'.'},
{before:'',answer:'Комар',after:' кружит над ромашкой.'},
{before:'Рома и Рая пьют чай из ',answer:'самовара',after:'.'}
];
const pirateGame={index:0,used:new Set(),locked:false,done:false};
document.querySelector('main').insertAdjacentHTML('beforeend',`<section id="pirate-stage" hidden aria-label="Отдаём сокровища пирату"><div class="pirate-top"><h2>Отдай все сокровища пирату</h2><span class="pirate-progress" id="pirate-progress" role="status">Отдано 0 / 15</span></div><p id="pirate-instruction">Заполни пропуск в предложении. Повтори готовое предложение.</p><div class="pirate-layout"><div class="tasks-area"><div class="sentence-card" id="sentence-card"><div><span id="sentence-before"></span><span id="word-gap">...</span><span id="sentence-after"></span></div></div><div class="coin-bank" id="coin-bank" aria-label="Монеты с картинками"></div><div class="pirate-bottom"><p id="answer-feedback" role="status" aria-live="polite"></p><button class="next-sentence" id="next-sentence" disabled>Дальше</button></div><div class="final-message" id="pirate-final" hidden><h3>Все сокровища у пирата!</h3><p>Ты помог пирату и выполнил все 15 заданий.</p><button class="replay" id="replay-adventure">Новое путешествие</button></div></div><div class="captain-wrap"><canvas id="captain" width="512" height="768" role="img" aria-label="Пират машет рукой, получая монету"></canvas></div></div></section>`);
const pirateStage=document.getElementById('pirate-stage'),coinBank=document.getElementById('coin-bank'),sentenceCard=document.getElementById('sentence-card'),wordGap=document.getElementById('word-gap'),captain=document.getElementById('captain');
function coinCanvas(id,size=600){const c=document.createElement('canvas');c.width=c.height=size;paintCoin(id,size/2,size/2,size*.47,1,c.getContext('2d'));return c}
function submitCoin(id,dropPoint=null){
if(pirateGame.locked||pirateGame.done||pirateGame.used.has(id))return false;
if(id!==pirateGame.index){document.getElementById('answer-feedback').textContent='Попробуй другую монету.';return false}
pirateGame.locked=true;pirateGame.used.add(id);
for(const b of coinBank.children){b.disabled=pirateGame.used.has(Number(b.dataset.coin))}
wordGap.textContent=sentenceTasks[id].answer;wordGap.classList.add('filled');sentenceCard.classList.add('correct');
document.getElementById('answer-feedback').textContent='';
const next=document.getElementById('next-sentence');next.disabled=true;next.textContent=id===14?'Завершить':'Дальше';
playCaptainResponse(id,dropPoint,()=>{
 document.getElementById('pirate-progress').textContent='Отдано '+pirateGame.used.size+' / 15';


},()=>{next.disabled=false;next.focus()});
return true;
}
function renderSentence(){const task=sentenceTasks[pirateGame.index];document.getElementById('sentence-before').textContent=task.before;document.getElementById('sentence-after').textContent=task.after;wordGap.textContent='...';wordGap.classList.remove('filled');sentenceCard.classList.remove('correct');pirateGame.locked=false;document.getElementById('next-sentence').disabled=true;document.getElementById('next-sentence').textContent='Дальше';document.getElementById('answer-feedback').textContent='';cancelCaptainResponse();drawCaptain(0)}
function buildCoinBank(){
coinBank.replaceChildren();const order=Array.from({length:15},(_,i)=>i);for(let i=14;i>0;i--){const j=Math.floor(Math.random()*(i+1));[order[i],order[j]]=[order[j],order[i]]}
for(const id of order){const b=document.createElement('button');b.className='word-coin';b.dataset.coin=id;b.setAttribute('aria-label',treasureWords[id]);b.append(coinCanvas(id));coinBank.append(b);
b.onclick=()=>{const r=b.getBoundingClientRect();submitCoin(id,{x:r.left+r.width/2,y:r.top+r.height/2})};
}
}
function fitPirateStage(){
const bounds=document.querySelector('main').getBoundingClientRect();
document.querySelector('main').style.setProperty('--pirate-scale',Math.min(bounds.width/1600,bounds.height/900));
}
addEventListener('resize',fitPirateStage);
function startPirateStage(){
fitPirateStage();pirateStage.classList.remove('is-complete');document.getElementById('intro-stage').hidden=true;document.querySelector('main').classList.remove('intro-active');
Object.assign(pirateGame,{index:0,used:new Set(),locked:false,done:false});
document.querySelector('.stage').hidden=true;pirateStage.hidden=false;
document.getElementById('pirate-final').hidden=true;sentenceCard.hidden=false;coinBank.hidden=false;document.querySelector('.pirate-bottom').hidden=false;document.getElementById('pirate-instruction').hidden=false;
document.getElementById('pirate-progress').textContent='Отдано 0 / 15';buildCoinBank();renderSentence();coinBank.querySelector('button:not(:disabled)')?.focus();
}
document.getElementById('next-sentence').onclick=()=>{
if(!pirateGame.locked||captainRig.busy)return;
if(pirateGame.index===14){pirateGame.done=true;pirateStage.classList.add('is-complete');sentenceCard.hidden=true;coinBank.hidden=true;document.querySelector('.pirate-bottom').hidden=true;document.getElementById('pirate-instruction').hidden=true;document.getElementById('pirate-final').hidden=false;document.getElementById('replay-adventure').focus();return}
pirateGame.index++;renderSentence();coinBank.querySelector('button:not(:disabled)')?.focus();
};
document.getElementById('replay-adventure').onclick=()=>{cancelCaptainResponse();pirateStage.hidden=true;document.querySelector('.stage').hidden=false;document.getElementById('again').click();showIntro()};

document.querySelector('main').insertAdjacentHTML('beforeend',`<section id="intro-stage" aria-labelledby="intro-title"><div class="intro-card"><h1 id="intro-title">Пиратские сокровища</h1><h2>Подводная экспедиция</h2><ol><li>Управляй подводной лодкой и избегай мин.</li><li>Открывай сундуки и собери все 15 монет.</li><li>В конце отдай сокровища пирату: составь предложения с найденными словами.</li></ol><p>Нажимай на нужную монету, чтобы заполнить пропуск.<br>Повтори готовое предложение.</p><button id="start-adventure" disabled>Загружаем игру…</button></div></section>`);
function showIntro(){paused=true;keys.clear();pointerKeys.clear();fitPirateStage();pirateStage.hidden=true;document.querySelector('.stage').hidden=true;document.getElementById('intro-stage').hidden=false;document.querySelector('main').classList.add('intro-active');document.getElementById('start-adventure').focus()}
document.getElementById('start-adventure').onclick=()=>{document.getElementById('intro-stage').hidden=true;document.querySelector('main').classList.remove('intro-active');document.querySelector('.stage').hidden=false;paused=false;last=0};
fitPirateStage();document.querySelector('main').classList.add('intro-active');document.querySelector('.stage').hidden=true;
