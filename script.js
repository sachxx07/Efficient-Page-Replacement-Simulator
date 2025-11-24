// script.js - frontend logic (vanilla JS)
// Sends request to backend -> receives JSON steps -> animates
const API_BASE = "http://localhost:3000";


const runBtn = document.getElementById('runBtn');
const stepBtn = document.getElementById('stepBtn');
const resetBtn = document.getElementById('resetBtn');
const algoSel = document.getElementById('algo');
const framesInput = document.getElementById('frames');
const refInput = document.getElementById('refString');
const animation = document.getElementById('animation');
const logArea = document.getElementById('logArea');
const hitsEl = document.getElementById('hits');
const missesEl = document.getElementById('misses');
const hitRatioEl = document.getElementById('hitRatio');
const sequenceEl = document.getElementById('sequence');
const speedEl = document.getElementById('speed');

let simulation = null;
let timer = null;
let currentStep = 0;

function showMessage(msg){
  logArea.innerText = `${new Date().toLocaleTimeString()} — ${msg}\n` + logArea.innerText;
}

function buildFramesView(framesCount){
  animation.innerHTML = ''; // clear
  for(let i=0;i<framesCount;i++){
    const col = document.createElement('div');
    col.className = 'frameCol';
    col.innerHTML = `<div class="frameLabel">Frame ${i+1}</div>
      <div class="frame" id="frame-${i}"></div>`;
    animation.appendChild(col);
  }
}

function renderStep(stepObj, framesCount){
  // stepObj: { ref: number, state: [ ... ], result: "hit"|"miss" }
  for(let i=0;i<framesCount;i++){
    const cellWrap = document.getElementById(`frame-${i}`);
    cellWrap.innerHTML = '';
    const cell = document.createElement('div');
    cell.className = 'cell ' + (stepObj.result === 'miss' ? 'miss':'hit');
    cell.innerText = (stepObj.state[i] === -1 ? '' : stepObj.state[i]);
    cellWrap.appendChild(cell);
  }
  // update sequence highlight
  Array.from(sequenceEl.children).forEach(ch => ch.classList.remove('active'));
  const idx = Number(stepObj.idx);
  if(!isNaN(idx) && sequenceEl.children[idx]) {
    sequenceEl.children[idx].classList.add('active');
  }
  showMessage(`Ref ${stepObj.ref} => ${stepObj.result.toUpperCase()}`);
}

function displaySummary(sim){
  hitsEl.innerText = sim.hits;
  missesEl.innerText = sim.misses;
  const total = sim.hits + sim.misses;
  const ratio = total ? ((sim.hits/total)*100).toFixed(1) : '0.0';
  hitRatioEl.innerText = `${ratio}%`;
}

function renderSequence(sequence){
  sequenceEl.innerHTML = '';
  sequence.forEach((v, idx) => {
    const node = document.createElement('div');
    node.className = 'ref';
    node.innerText = v;
    node.title = `Index ${idx}`;
    sequenceEl.appendChild(node);
  });
}

// animate whole simulation with playback speed
function playSimulation(){
  if(!simulation) return;
  const speed = Number(speedEl.value);
  currentStep = 0;
  stepBtn.disabled = false;
  resetBtn.disabled = false;
  if(timer) clearInterval(timer);
  timer = setInterval(()=>{
    if(currentStep >= simulation.steps.length){
      clearInterval(timer);
      timer = null;
      showMessage('Simulation completed.');
      return;
    }
    renderStep(simulation.steps[currentStep], simulation.frames);
    displaySummary({
      hits: simulation.steps.slice(0,currentStep+1).filter(s=>s.result==='hit').length,
      misses: simulation.steps.slice(0,currentStep+1).filter(s=>s.result==='miss').length
    });
    currentStep++;
  }, speed);
}

// step forward one step
function stepForward(){
  if(!simulation) return;
  if(timer) { clearInterval(timer); timer=null; }
  if(currentStep >= simulation.steps.length) return;
  renderStep(simulation.steps[currentStep], simulation.frames);
  displaySummary({
    hits: simulation.steps.slice(0,currentStep+1).filter(s=>s.result==='hit').length,
    misses: simulation.steps.slice(0,currentStep+1).filter(s=>s.result==='miss').length
  });
  currentStep++;
  if(currentStep >= simulation.steps.length){
    showMessage('Simulation completed (stepped).');
  }
}

// reset UI to initial
function resetUI(){
  if(timer) { clearInterval(timer); timer=null; }
  simulation = null;
  currentStep = 0;
  animation.innerHTML = '';
  hitsEl.innerText = '0';
  missesEl.innerText = '0';
  hitRatioEl.innerText = '0%';
  sequenceEl.innerHTML = '';
  logArea.innerText = '';
  stepBtn.disabled = true;
  resetBtn.disabled = true;
}

// Run button handler
runBtn.addEventListener('click', async () => {
  const algo = algoSel.value;
  const frames = parseInt(framesInput.value,10);
  const raw = refInput.value.trim();

  if(!raw){ alert('Enter a reference string'); return; }
  const refs = raw.split(',').map(s => Number(s.trim())).filter(v => !isNaN(v));
  if(refs.length === 0){ alert('Reference string invalid. Use numbers separated by commas.'); return; }

  // disable UI while fetching
  runBtn.disabled = true;
  showMessage('Sending request to server...');
  try{
    const res = await fetch(`${API_BASE}/run`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ algorithm: algo, frames: frames, refs: refs })
});

    if(!res.ok){
      const txt = await res.text();
      throw new Error(txt || 'Server error');
    }
    const data = await res.json();
    // data: { frames: n, hits: , misses:, steps: [ {ref, state:[], result, idx } ], sequence: [] }
    simulation = data;
    buildFramesView(data.frames);
    renderSequence(data.sequence);
    logArea.innerText = '';
    showMessage('Simulation data received. Playing...');
    playSimulation();
  }catch(err){
    console.error(err);
    alert('Error: ' + err.message);
    showMessage('Error: ' + err.message);
  }finally{
    runBtn.disabled = false;
    stepBtn.disabled = false;
    resetBtn.disabled = false;
  }
});

stepBtn.addEventListener('click', stepForward);
resetBtn.addEventListener('click', resetUI);

// keyboard: space to step when paused
document.addEventListener('keydown', (e) => {
  if(e.code === 'Space'){
    e.preventDefault();
    stepForward();
  }
});
