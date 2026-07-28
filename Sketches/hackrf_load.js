<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>HackRF One — RF Monitor</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=Barlow+Condensed:wght@500;600;700&display=swap" rel="stylesheet">
<style>
  :root{
    --bg: #0a0e0f;
    --panel: #12181a;
    --panel-raised: #1b2326;
    --amber: #ffb000;
    --amber-dim: #7a5700;
    --amber-glow: rgba(255,176,0,0.35);
    --cyan: #3fdbd3;
    --steel: #3d484d;
    --steel-light: #57666c;
    --text: #e8e4d8;
    --text-dim: #8b9296;
    --red: #ff4438;
    --green: #56d15c;
  }
  *{box-sizing:border-box;}
  html,body{
    margin:0; padding:0; height:100%;
    background: radial-gradient(ellipse at 50% -10%, #16201f 0%, #060809 65%);
    color: var(--text);
    font-family:'Barlow Condensed', sans-serif;
    display:flex; align-items:center; justify-content:center;
    -webkit-font-smoothing:antialiased;
  }
  .rig{
    width:min(1180px, 96vw);
    margin:24px auto;
    background: linear-gradient(180deg, #171f21 0%, #101617 100%);
    border:1px solid var(--steel);
    border-radius:10px;
    box-shadow: 0 40px 80px -30px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.04);
    padding:18px;
    position:relative;
  }
  .bolt{
    position:absolute; width:9px; height:9px; border-radius:50%;
    background: radial-gradient(circle at 35% 30%, #6b7378, #23292b 70%);
    box-shadow: inset 0 0 2px rgba(0,0,0,0.8), 0 1px 0 rgba(255,255,255,0.05);
  }
  .bolt.tl{top:10px; left:10px;} .bolt.tr{top:10px; right:10px;}
  .bolt.bl{bottom:10px; left:10px;} .bolt.br{bottom:10px; right:10px;}
 
  /* ===== Top bar ===== */
  .top-bar{
    display:flex; align-items:center; justify-content:space-between;
    padding:6px 14px 14px;
    border-bottom:1px solid var(--steel);
    margin-bottom:14px;
  }
  .brand{ display:flex; align-items:baseline; gap:10px; }
  .brand h1{
    font-family:'Barlow Condensed', sans-serif;
    font-weight:700; font-size:22px; letter-spacing:2px;
    margin:0; color:var(--text); text-transform:uppercase;
  }
  .brand span{ font-size:12px; color:var(--text-dim); letter-spacing:3px; text-transform:uppercase; }
  .leds{ display:flex; gap:16px; align-items:center; }
  .led-item{ display:flex; align-items:center; gap:6px; font-size:11px; letter-spacing:1.5px; color:var(--text-dim); text-transform:uppercase; }
  .led{ width:8px; height:8px; border-radius:50%; background:#2a3336; box-shadow: inset 0 0 2px #000; }
  .led.on-green{ background:var(--green); box-shadow: 0 0 8px var(--green), 0 0 2px var(--green); }
  .led.on-blue{ background:#4aa8ff; box-shadow: 0 0 8px #4aa8ff; animation: blink 2.2s infinite; }
  .led.on-red{ background:var(--red); box-shadow: 0 0 10px var(--red); }
  @keyframes blink{ 0%,100%{opacity:1;} 50%{opacity:0.25;} }
 
  /* ===== Display frame ===== */
  .display-frame{
    background:#050807;
    border:1px solid #000;
    border-radius:6px;
    padding:14px 16px;
    box-shadow: inset 0 0 40px rgba(0,0,0,0.7), inset 0 2px 6px rgba(0,0,0,0.9);
    position:relative;
  }
  .freq-row{
    display:flex; justify-content:space-between; align-items:flex-end;
    margin-bottom:8px; flex-wrap:wrap; gap:8px;
  }
  .freq-readout{
    font-family:'JetBrains Mono', monospace;
    font-size:clamp(28px, 5vw, 44px);
    font-weight:700;
    color:var(--amber);
    text-shadow: 0 0 12px var(--amber-glow), 0 0 2px var(--amber);
    letter-spacing:1px;
  }
  .freq-readout small{ font-size:0.4em; color:var(--text-dim); margin-left:8px; font-weight:400; letter-spacing:2px;}
  .meta-readouts{ display:flex; gap:22px; font-family:'JetBrains Mono', monospace; font-size:12px; color:var(--cyan); }
  .meta-readouts div span{ display:block; color:var(--text-dim); font-family:'Barlow Condensed'; font-size:10px; letter-spacing:1.5px; text-transform:uppercase; margin-bottom:2px;}
 
  canvas#spectrum{ width:100%; height:150px; display:block; border-radius:3px; }
  canvas#waterfall{ width:100%; height:210px; display:block; border-radius:3px; margin-top:6px; border-top:1px solid #1c2426; }
 
  .scale-row{ display:flex; justify-content:space-between; font-family:'JetBrains Mono', monospace; font-size:10px; color:var(--text-dim); margin-top:4px; padding:0 2px;}
 
  /* ===== Control deck ===== */
  .control-deck{
    display:grid;
    grid-template-columns: 170px 1fr 220px;
    gap:16px;
    margin-top:16px;
  }
  .deck-panel{
    background: var(--panel-raised);
    border:1px solid var(--steel);
    border-radius:8px;
    padding:12px 14px;
  }
  .deck-label{
    font-size:11px; letter-spacing:2px; text-transform:uppercase; color:var(--text-dim);
    margin:0 0 10px; padding-bottom:6px; border-bottom:1px solid var(--steel);
  }
 
  /* knob */
  .knob-wrap{ display:flex; flex-direction:column; align-items:center; gap:10px; }
  .knob-outer{ width:104px; height:104px; border-radius:50%; position:relative;
    background: radial-gradient(circle at 40% 30%, #3a4649, #1a2224 70%);
    box-shadow: 0 6px 14px rgba(0,0,0,0.6), inset 0 1px 1px rgba(255,255,255,0.08);
    cursor: grab; touch-action:none; user-select:none;
  }
  .knob-outer:active{ cursor:grabbing; }
  .knob-tick{ position:absolute; inset:0; }
  .knob-inner{
    position:absolute; inset:14px; border-radius:50%;
    background: radial-gradient(circle at 40% 30%, #4a5659, #212a2c 75%);
    box-shadow: inset 0 2px 4px rgba(0,0,0,0.6), 0 1px 0 rgba(255,255,255,0.05);
  }
  .knob-pointer{
    position:absolute; top:8px; left:50%; width:3px; height:20px;
    background: var(--amber); box-shadow:0 0 6px var(--amber-glow);
    transform-origin: 50% 44px; margin-left:-1.5px; border-radius:2px;
  }
  .knob-hint{ font-size:10px; color:var(--text-dim); letter-spacing:1px; text-align:center; }
  .step-btns{ display:flex; gap:6px; }
  .step-btn{
    flex:1; background:#20292b; border:1px solid var(--steel); color:var(--text);
    font-family:'JetBrains Mono', monospace; font-size:11px; padding:5px 0; border-radius:4px; cursor:pointer;
  }
  .step-btn:hover{ background:#2a3538; border-color:var(--steel-light); }
 
  /* mode buttons */
  .mode-grid{ display:flex; gap:6px; flex-wrap:wrap; margin-bottom:12px; }
  .mode-btn{
    background:#181f21; border:1px solid var(--steel); color:var(--text-dim);
    font-family:'JetBrains Mono', monospace; font-size:12px; padding:7px 12px; border-radius:4px;
    cursor:pointer; letter-spacing:1px;
  }
  .mode-btn.active{
    color:#0a0e0f; background:var(--amber); border-color:var(--amber);
    box-shadow: 0 0 10px var(--amber-glow); font-weight:700;
  }
  .bw-row{ display:flex; align-items:center; gap:10px; }
  .bw-row label{ font-size:11px; color:var(--text-dim); letter-spacing:1px; text-transform:uppercase; min-width:64px;}
  select{
    flex:1; background:#181f21; border:1px solid var(--steel); color:var(--cyan);
    font-family:'JetBrains Mono', monospace; font-size:12px; padding:6px 8px; border-radius:4px;
  }
 
  /* sliders */
  .slider-block{ margin-bottom:14px; }
  .slider-block:last-child{ margin-bottom:0; }
  .slider-label{ display:flex; justify-content:space-between; font-size:11px; letter-spacing:1px; text-transform:uppercase; color:var(--text-dim); margin-bottom:6px; }
  .slider-label b{ color:var(--cyan); font-family:'JetBrains Mono', monospace; font-weight:400; }
  input[type=range]{
    -webkit-appearance:none; width:100%; height:4px; background:#2a3336; border-radius:2px; outline:none;
  }
  input[type=range]::-webkit-slider-thumb{
    -webkit-appearance:none; width:14px; height:14px; border-radius:50%;
    background: var(--amber); box-shadow: 0 0 6px var(--amber-glow); cursor:pointer; margin-top:-5px;
  }
  .amp-toggle{
    display:flex; align-items:center; justify-content:space-between;
    background:#181f21; border:1px solid var(--steel); border-radius:4px; padding:8px 10px; margin-top:4px;
  }
  .amp-toggle span{ font-size:11px; letter-spacing:1px; text-transform:uppercase; color:var(--text-dim); }
  .switch{ width:36px; height:18px; border-radius:10px; background:#2a3336; position:relative; cursor:pointer; border:1px solid var(--steel); }
  .switch::after{ content:''; position:absolute; width:14px; height:14px; border-radius:50%; background:var(--text-dim); top:1px; left:1px; transition:.15s; }
  .switch.on{ background: #3a2a10; border-color:var(--amber-dim); }
  .switch.on::after{ left:19px; background:var(--amber); box-shadow:0 0 5px var(--amber-glow); }
 
  .footer-note{ text-align:center; font-size:10px; color:var(--text-dim); letter-spacing:1.5px; margin-top:14px; text-transform:uppercase; }
 
  @media (max-width: 800px){
    .control-deck{ grid-template-columns:1fr; }
  }
</style>
</head>
<body>
<div class="rig">
  <div class="bolt tl"></div><div class="bolt tr"></div><div class="bolt bl"></div><div class="bolt br"></div>
 
  <div class="top-bar">
    <div class="brand">
      <h1>HackRF One</h1>
      <span>RF Monitor · SIGINT-1 Panel</span>
    </div>
    <div class="leds">
      <div class="led-item"><div class="led on-green"></div>PWR</div>
      <div class="led-item"><div class="led on-blue"></div>USB 2.0</div>
      <div class="led-item"><div class="led" id="rxLed"></div>RX</div>
    </div>
  </div>
 
  <div class="display-frame">
    <div class="freq-row">
      <div class="freq-readout" id="freqReadout">099.500 <small>MHz</small></div>
      <div class="meta-readouts">
        <div><span>Sample Rate</span>10.0 MSPS</div>
        <div><span>Peak</span><span id="peakVal">-42 dBm</span></div>
        <div><span>Noise Floor</span>-96 dBm</div>
      </div>
    </div>
    <canvas id="spectrum"></canvas>
    <canvas id="waterfall"></canvas>
    <div class="scale-row">
      <span id="scaleLow">-2.0 MHz</span><span>center</span><span id="scaleHigh">+2.0 MHz</span>
    </div>
  </div>
 
  <div class="control-deck">
    <div class="deck-panel">
      <div class="deck-label">Tune</div>
      <div class="knob-wrap">
        <div class="knob-outer" id="knob">
          <div class="knob-pointer" id="knobPointer"></div>
          <div class="knob-inner"></div>
        </div>
        <div class="knob-hint">drag / scroll to tune</div>
        <div class="step-btns">
          <button class="step-btn" data-step="-1000000">-1M</button>
          <button class="step-btn" data-step="-1000">-1k</button>
          <button class="step-btn" data-step="1000">+1k</button>
          <button class="step-btn" data-step="1000000">+1M</button>
        </div>
      </div>
    </div>
 
    <div class="deck-panel">
      <div class="deck-label">Demodulation</div>
      <div class="mode-grid" id="modeGrid">
        <button class="mode-btn active" data-mode="WFM">WFM</button>
        <button class="mode-btn" data-mode="NFM">NFM</button>
        <button class="mode-btn" data-mode="AM">AM</button>
        <button class="mode-btn" data-mode="USB">USB</button>
        <button class="mode-btn" data-mode="LSB">LSB</button>
        <button class="mode-btn" data-mode="RAW">RAW IQ</button>
      </div>
      <div class="bw-row">
        <label>Bandwidth</label>
        <select id="bwSelect">
          <option>2.5 MHz</option>
          <option selected>5.0 MHz</option>
          <option>10.0 MHz</option>
          <option>20.0 MHz</option>
        </select>
      </div>
    </div>
 
    <div class="deck-panel">
      <div class="deck-label">Gain Stage</div>
      <div class="slider-block">
        <div class="slider-label"><span>LNA Gain</span><b id="lnaVal">24 dB</b></div>
        <input type="range" id="lnaGain" min="0" max="40" step="8" value="24">
      </div>
      <div class="slider-block">
        <div class="slider-label"><span>VGA Gain</span><b id="vgaVal">20 dB</b></div>
        <input type="range" id="vgaGain" min="0" max="62" step="2" value="20">
      </div>
      <div class="slider-block">
        <div class="slider-label"><span>Squelch</span><b id="sqVal">-70 dBm</b></div>
        <input type="range" id="squelch" min="-100" max="-20" step="1" value="-70">
      </div>
      <div class="amp-toggle">
        <span>RF Amp</span>
        <div class="switch" id="ampSwitch"></div>
      </div>
    </div>
  </div>
 
  <div class="footer-note">HackRF One · 1 MHz – 6 GHz · Half-Duplex Transceiver — simulated feed for UI preview</div>
</div>
 
<script>
(() => {
  // ---------- state ----------
  let centerFreq = 99500000; // Hz
  let stepIndex = 0;
  let ampOn = false;
  let squelchDbm = -70;
 
  const freqReadout = document.getElementById('freqReadout');
  const scaleLow = document.getElementById('scaleLow');
  const scaleHigh = document.getElementById('scaleHigh');
  const rxLed = document.getElementById('rxLed');
  const peakVal = document.getElementById('peakVal');
 
  function formatFreq(hz){
    const mhz = hz / 1e6;
    return mhz.toFixed(3).padStart(7,'0');
  }
  function updateFreqDisplay(){
    freqReadout.innerHTML = formatFreq(centerFreq) + ' <small>MHz</small>';
    const span = 2.0; // MHz half-span shown on scale
    scaleLow.textContent = '-' + span.toFixed(1) + ' MHz';
    scaleHigh.textContent = '+' + span.toFixed(1) + ' MHz';
  }
  updateFreqDisplay();
 
  // ---------- knob ----------
  const knob = document.getElementById('knob');
  const knobPointer = document.getElementById('knobPointer');
  let knobAngle = 0;
  let dragging = false;
  let lastAngle = 0;
 
  function angleFromEvent(e, rect){
    const cx = rect.left + rect.width/2;
    const cy = rect.top + rect.height/2;
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - cx;
    const y = (e.touches ? e.touches[0].clientY : e.clientY) - cy;
    return Math.atan2(y, x);
  }
 
  function startDrag(e){
    dragging = true;
    const rect = knob.getBoundingClientRect();
    lastAngle = angleFromEvent(e, rect);
    e.preventDefault();
  }
  function moveDrag(e){
    if(!dragging) return;
    const rect = knob.getBoundingClientRect();
    const a = angleFromEvent(e, rect);
    let delta = a - lastAngle;
    if(delta > Math.PI) delta -= Math.PI*2;
    if(delta < -Math.PI) delta += Math.PI*2;
    lastAngle = a;
    knobAngle += delta;
    knobPointer.style.transform = `rotate(${knobAngle}rad)`;
    const hzChange = delta * 500000; // sensitivity
    centerFreq = Math.max(1000000, Math.min(6000000000, centerFreq + hzChange));
    updateFreqDisplay();
  }
  function endDrag(){ dragging = false; }
 
  knob.addEventListener('mousedown', startDrag);
  window.addEventListener('mousemove', moveDrag);
  window.addEventListener('mouseup', endDrag);
  knob.addEventListener('touchstart', startDrag, {passive:false});
  window.addEventListener('touchmove', moveDrag, {passive:false});
  window.addEventListener('touchend', endDrag);
  knob.addEventListener('wheel', (e) => {
    e.preventDefault();
    const dir = e.deltaY > 0 ? -1 : 1;
    knobAngle += dir * 0.12;
    knobPointer.style.transform = `rotate(${knobAngle}rad)`;
    centerFreq = Math.max(1000000, Math.min(6000000000, centerFreq + dir*10000));
    updateFreqDisplay();
  }, {passive:false});
 
  document.querySelectorAll('.step-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      centerFreq = Math.max(1000000, Math.min(6000000000, centerFreq + parseInt(btn.dataset.step,10)));
      updateFreqDisplay();
    });
  });
 
  // ---------- mode buttons ----------
  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
 
  // ---------- sliders ----------
  const lnaGain = document.getElementById('lnaGain');
  const vgaGain = document.getElementById('vgaGain');
  const squelch = document.getElementById('squelch');
  lnaGain.addEventListener('input', () => document.getElementById('lnaVal').textContent = lnaGain.value + ' dB');
  vgaGain.addEventListener('input', () => document.getElementById('vgaVal').textContent = vgaGain.value + ' dB');
  squelch.addEventListener('input', () => {
    squelchDbm = parseInt(squelch.value,10);
    document.getElementById('sqVal').textContent = squelchDbm + ' dBm';
  });
 
  const ampSwitch = document.getElementById('ampSwitch');
  ampSwitch.addEventListener('click', () => {
    ampOn = !ampOn;
    ampSwitch.classList.toggle('on', ampOn);
  });
 
  // ---------- spectrum + waterfall simulation ----------
  const specCanvas = document.getElementById('spectrum');
  const wfCanvas = document.getElementById('waterfall');
  const specCtx = specCanvas.getContext('2d');
  const wfCtx = wfCanvas.getContext('2d');
 
  const BINS = 320;
  let data = new Float32Array(BINS).fill(-96);
  let peaks = [
    { pos: 0.35, amp: 40, width: 10, phase: Math.random()*10 },
    { pos: 0.62, amp: 28, width: 6, phase: Math.random()*10 }
  ];
  let sweeper = { active:false, pos:0, timer: 200 };
 
  function resizeCanvases(){
    [specCanvas, wfCanvas].forEach(c => {
      const rect = c.getBoundingClientRect();
      c.width = rect.width * devicePixelRatio;
      c.height = rect.height * devicePixelRatio;
    });
  }
  resizeCanvases();
  window.addEventListener('resize', resizeCanvases);
 
  function stepData(t){
    const ampBoost = ampOn ? 8 : 0;
    for(let i=0;i<BINS;i++){
      let base = -96 + Math.random()*4; // noise floor
      for(const p of peaks){
        const center = p.pos * BINS + Math.sin(t/900 + p.phase)*8;
        const d = (i - center) / p.width;
        base += p.amp * Math.exp(-d*d);
      }
      if(sweeper.active){
        const d = (i - sweeper.pos)/4;
        base += 34 * Math.exp(-d*d);
      }
      base += ampBoost;
      data[i] = data[i]*0.55 + base*0.45;
    }
    sweeper.timer--;
    if(sweeper.timer <= 0){
      if(!sweeper.active && Math.random() < 0.01){
        sweeper.active = true; sweeper.pos = 0; sweeper.timer = BINS;
      } else if(sweeper.active){
        sweeper.pos += 3;
        if(sweeper.pos >= BINS){ sweeper.active = false; sweeper.timer = 300 + Math.random()*400; }
      } else {
        sweeper.timer = 20;
      }
    }
  }
 
  function drawSpectrum(){
    const w = specCanvas.width, h = specCanvas.height;
    specCtx.clearRect(0,0,w,h);
    // grid
    specCtx.strokeStyle = 'rgba(63,219,211,0.08)';
    specCtx.lineWidth = 1;
    for(let gx=0; gx<=8; gx++){
      const x = w*gx/8;
      specCtx.beginPath(); specCtx.moveTo(x,0); specCtx.lineTo(x,h); specCtx.stroke();
    }
    for(let gy=0; gy<=4; gy++){
      const y = h*gy/4;
      specCtx.beginPath(); specCtx.moveTo(0,y); specCtx.lineTo(w,y); specCtx.stroke();
    }
 
    const min = -100, max = -20;
    const toY = v => h - ((v-min)/(max-min))*h;
 
    // filled area
    specCtx.beginPath();
    specCtx.moveTo(0, h);
    for(let i=0;i<BINS;i++){
      const x = (i/(BINS-1))*w;
      specCtx.lineTo(x, toY(data[i]));
    }
    specCtx.lineTo(w,h);
    specCtx.closePath();
    const grad = specCtx.createLinearGradient(0,0,0,h);
    grad.addColorStop(0, 'rgba(255,176,0,0.35)');
    grad.addColorStop(1, 'rgba(255,176,0,0.02)');
    specCtx.fillStyle = grad;
    specCtx.fill();
 
    // line
    specCtx.beginPath();
    for(let i=0;i<BINS;i++){
      const x = (i/(BINS-1))*w;
      const y = toY(data[i]);
      if(i===0) specCtx.moveTo(x,y); else specCtx.lineTo(x,y);
    }
    specCtx.strokeStyle = '#ffb000';
    specCtx.lineWidth = 2 * devicePixelRatio;
    specCtx.shadowColor = 'rgba(255,176,0,0.8)';
    specCtx.shadowBlur = 8;
    specCtx.stroke();
    specCtx.shadowBlur = 0;
 
    // squelch line
    const sqY = toY(squelchDbm);
    specCtx.beginPath();
    specCtx.setLineDash([5,5]);
    specCtx.moveTo(0, sqY); specCtx.lineTo(w, sqY);
    specCtx.strokeStyle = 'rgba(63,219,211,0.6)';
    specCtx.lineWidth = 1;
    specCtx.stroke();
    specCtx.setLineDash([]);
 
    // peak marker
    let maxV = -200, maxI = 0;
    for(let i=0;i<BINS;i++){ if(data[i] > maxV){ maxV = data[i]; maxI = i; } }
    peakVal.textContent = Math.round(maxV) + ' dBm';
    rxLed.classList.toggle('on-red', maxV > squelchDbm);
  }
 
  function colorForAmp(v){
    // map -100..-20 to a phosphor color ramp: black -> amber -> cyan-white
    const t = Math.max(0, Math.min(1, (v+100)/80));
    if(t < 0.5){
      const k = t/0.5;
      const r = Math.round(10 + k*(122-10));
      const g = Math.round(14 + k*(72-14));
      const b = Math.round(15 + k*(0-15));
      return `rgb(${r},${g},${b})`;
    } else {
      const k = (t-0.5)/0.5;
      const r = Math.round(255 - k*(255-63));
      const g = Math.round(176 + k*(219-176));
      const b = Math.round(0 + k*(211-0));
      return `rgb(${r},${g},${b})`;
    }
  }
 
  function drawWaterfall(){
    const w = wfCanvas.width, h = wfCanvas.height;
    // shift existing image down by 1px
    wfCtx.drawImage(wfCanvas, 0, 0, w, h-1, 0, 1, w, h-1);
    // draw new row at top
    const colW = w / BINS;
    for(let i=0;i<BINS;i++){
      wfCtx.fillStyle = colorForAmp(data[i]);
      wfCtx.fillRect(Math.floor(i*colW), 0, Math.ceil(colW), 1);
    }
  }
 
  let t = 0;
  function loop(){
    t += 16;
    stepData(t);
    drawSpectrum();
    drawWaterfall();
    requestAnimationFrame(loop);
  }
  loop();
})();
</script>
</body>
</html>