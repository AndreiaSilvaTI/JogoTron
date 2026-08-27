let actx = null;

function getAudioCtx() {
  if (!actx) actx = new (window.AudioContext || window.webkitAudioContext)();
  if (actx.state === 'suspended') actx.resume();
  return actx;
}

function envGain(ac, node, t0, attack, hold, release, peak) {
  const g = ac.createGain();
  node.connect(g);
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(peak, t0 + attack);
  g.gain.setValueAtTime(peak, t0 + attack + hold);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + attack + hold + release);
  return g;
}

function noiseBuffer(ac, dur) {
  const buf = ac.createBuffer(1, ac.sampleRate * dur, ac.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  return buf;
}

function playLaser() {
  try {
    const ac = getAudioCtx(); const t0 = ac.currentTime;
    const src = ac.createBufferSource();
    src.buffer = noiseBuffer(ac, 0.3);
    const bp = ac.createBiquadFilter();
    bp.type = 'bandpass'; bp.frequency.setValueAtTime(1800, t0); bp.Q.value = 6;
    const g1 = envGain(ac, bp, t0, 0.002, 0.02, 0.15, 0.5);
    src.connect(bp); g1.connect(ac.destination);
    src.start(t0); src.stop(t0 + 0.3);

    const osc = ac.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(2200, t0);
    osc.frequency.exponentialRampToValueAtTime(140, t0 + 0.28);
    const g2 = envGain(ac, osc, t0, 0.001, 0.02, 0.26, 0.35);
    osc.connect(g2); g2.connect(ac.destination);
    osc.start(t0); osc.stop(t0 + 0.32);
  } catch (e) {}
}

function playThrow() {
  try {
    const ac = getAudioCtx(); const t0 = ac.currentTime;
    const osc = ac.createOscillator();
    osc.type = 'square';
    osc.frequency.setValueAtTime(400, t0);
    osc.frequency.linearRampToValueAtTime(1400, t0 + 0.18);
    osc.frequency.linearRampToValueAtTime(200, t0 + 0.45);
    const filt = ac.createBiquadFilter();
    filt.type = 'bandpass'; filt.frequency.setValueAtTime(900, t0); filt.Q.value = 3;
    const g = envGain(ac, filt, t0, 0.01, 0.25, 0.2, 0.3);
    osc.connect(filt); g.connect(ac.destination);
    osc.start(t0); osc.stop(t0 + 0.5);
  } catch (e) {}
}

function playDerez() {
  try {
    const ac = getAudioCtx(); const t0 = ac.currentTime;
    const src = ac.createBufferSource();
    src.buffer = noiseBuffer(ac, 0.6);
    const filt = ac.createBiquadFilter();
    filt.type = 'lowpass';
    filt.frequency.setValueAtTime(4000, t0);
    filt.frequency.exponentialRampToValueAtTime(80, t0 + 0.55);
    const g = envGain(ac, filt, t0, 0.005, 0.1, 0.5, 0.4);
    src.connect(filt); g.connect(ac.destination);
    src.start(t0); src.stop(t0 + 0.6);

    const osc = ac.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, t0);
    osc.frequency.exponentialRampToValueAtTime(40, t0 + 0.5);
    const g2 = envGain(ac, osc, t0, 0.005, 0.05, 0.45, 0.25);
    osc.connect(g2); g2.connect(ac.destination);
    osc.start(t0); osc.stop(t0 + 0.55);
  } catch (e) {}
}

function playPortal() {
  try {
    const ac = getAudioCtx(); const t0 = ac.currentTime;
    for (let i = 0; i < 3; i++) {
      const osc = ac.createOscillator();
      osc.type = 'sine';
      const start = 150 + i * 40;
      osc.frequency.setValueAtTime(start, t0 + i * 0.03);
      osc.frequency.exponentialRampToValueAtTime(start * 9, t0 + i * 0.03 + 0.5);
      const g = envGain(ac, osc, t0 + i * 0.03, 0.02, 0.3, 0.25, 0.15);
      osc.connect(g); g.connect(ac.destination);
      osc.start(t0 + i * 0.03); osc.stop(t0 + i * 0.03 + 0.6);
    }
  } catch (e) {}
}

let motoNodes = null;
let motoLevel = 0;

function startMotoAudio() {
  if (motoNodes) return;
  try {
    const ac = getAudioCtx();
    const osc1 = ac.createOscillator(); osc1.type = 'sawtooth'; osc1.frequency.value = 60;
    const osc2 = ac.createOscillator(); osc2.type = 'square'; osc2.frequency.value = 61.5;
    const filt = ac.createBiquadFilter(); filt.type = 'lowpass'; filt.frequency.value = 300;
    const g = ac.createGain(); g.gain.value = 0.0001;
    osc1.connect(filt); osc2.connect(filt); filt.connect(g); g.connect(ac.destination);
    osc1.start(); osc2.start();
    motoNodes = { osc1, osc2, filt, g, ac };
  } catch (e) {}
}

function updateMotoAudio(isMoving) {
  if (!motoNodes && isMoving) startMotoAudio();
  if (!motoNodes) return;

  const { osc1, osc2, filt, g, ac } = motoNodes;
  if (isMoving) {
    motoLevel = Math.min(1, motoLevel + 0.04);
  } else {
    motoLevel = Math.max(0, motoLevel - 0.04);
  }

  const t = ac.currentTime;
  const freq = 55 + motoLevel * 260;
  osc1.frequency.setTargetAtTime(freq, t, 0.05);
  osc2.frequency.setTargetAtTime(freq * 1.02, t, 0.05);
  filt.frequency.setTargetAtTime(300 + motoLevel * 3000, t, 0.05);
  g.gain.setTargetAtTime(0.01 + motoLevel * 0.12, t, 0.05);

  if (!isMoving && motoLevel <= 0.01) {
    try { osc1.stop(t + 0.05); osc2.stop(t + 0.05); } catch (e) {}
    motoNodes = null;
  }
}

function stopMotoAudioInstant() {
  if (!motoNodes) return;
  try {
    motoNodes.osc1.stop();
    motoNodes.osc2.stop();
  } catch (e) {}
  motoNodes = null;
  motoLevel = 0;
}

let padNodes = null;
function startPad() {
  if (padNodes) return;
  try {
    const ac = getAudioCtx();
    const notes = [55, 82.41, 110, 130.81];
    const master = ac.createGain(); master.gain.value = 0.0001;
    master.connect(ac.destination);
    master.gain.linearRampToValueAtTime(0.06, ac.currentTime + 1.5);

    const filt = ac.createBiquadFilter();
    filt.type = 'lowpass'; filt.frequency.value = 800;
    filt.connect(master);

    const lfo = ac.createOscillator(); lfo.type = 'sine'; lfo.frequency.value = 0.08;
    const lfoGain = ac.createGain(); lfoGain.gain.value = 300;
    lfo.connect(lfoGain); lfoGain.connect(filt.frequency);
    lfo.start();

    const oscs = notes.map((f, i) => {
      const o = ac.createOscillator();
      o.type = i % 2 === 0 ? 'sawtooth' : 'triangle';
      o.frequency.value = f;
      o.detune.value = (i - 1.5) * 4;
      o.connect(filt);
      o.start();
      return o;
    });

    padNodes = { master, filt, lfo, oscs, ac };
  } catch (e) {}
}

function stopPad() {
  if (!padNodes) return;
  try {
    const { master, lfo, oscs, ac } = padNodes;
    const t = ac.currentTime;
    master.gain.linearRampToValueAtTime(0.0001, t + 0.5);
    setTimeout(() => {
      try {
        oscs.forEach(o => o.stop());
        lfo.stop();
      } catch (e) {}
    }, 550);
  } catch (e) {}
  padNodes = null;
}
