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