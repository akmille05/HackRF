// --- Navigation -------------------------------------------------
 
document.querySelectorAll('[data-target]').forEach((el) => {
  el.addEventListener('click', () => {
    window.location.href = el.dataset.target;
  });
});
 
// --- Background spectrum analyzer animation ----------------------
 
const canvas = document.getElementById('spectrum');
const ctx = canvas.getContext('2d');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 
let width, height, bars, barCount;
 
function resize() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
  barCount = Math.max(24, Math.floor(width / 28));
  bars = new Array(barCount).fill(0).map(() => ({
    value: Math.random() * 0.3,
    target: Math.random(),
    speed: 0.02 + Math.random() * 0.03
  }));
}
 
window.addEventListener('resize', resize);
resize();
 
function draw() {
  ctx.clearRect(0, 0, width, height);
 
  const barWidth = width / barCount;
  const baseline = height * 0.86;
 
  for (let i = 0; i < barCount; i++) {
    const bar = bars[i];
 
    // drift toward a target level, occasionally pick a new target
    bar.value += (bar.target - bar.value) * bar.speed;
    if (Math.abs(bar.target - bar.value) < 0.02) {
      bar.target = Math.random() * Math.random(); // biased low, occasional spikes
    }
 
    const maxBarHeight = height * 0.32;
    const barHeight = bar.value * maxBarHeight;
 
    const x = i * barWidth;
    const gradient = ctx.createLinearGradient(0, baseline, 0, baseline - barHeight);
    gradient.addColorStop(0, 'rgba(122, 52, 20, 0.05)');
    gradient.addColorStop(0.55, 'rgba(255, 106, 26, 0.35)');
    gradient.addColorStop(1, 'rgba(255, 145, 66, 0.85)');
 
    ctx.fillStyle = gradient;
    ctx.fillRect(x, baseline - barHeight, barWidth - 3, barHeight);
  }
 
  // faint baseline sweep
  ctx.strokeStyle = 'rgba(107, 107, 116, 0.4)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, baseline);
  ctx.lineTo(width, baseline);
  ctx.stroke();
 
  if (!reduceMotion) {
    requestAnimationFrame(draw);
  }
}
 
draw();