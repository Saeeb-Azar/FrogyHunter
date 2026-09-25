/** Original synthesized audio. Call unlockAudio() from a trusted click/touch. */
type SoundId = 'tap'|'found'|'miss'|'win'|'ui'|'start'|'hint'|'levelup'|'hop'|'star'|'combo';
let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let musicBus: GainNode | null = null;
let echoSend: GainNode | null = null;
let settings = { volume: 0.65, musicEnabled: true, sfxEnabled: true };
let unlocked = false;
let loopTimer: ReturnType<typeof setTimeout> | undefined;
let loopToken = 0;
let currentLoop: string | null = null;
let step = 0;
const voices = new Map<OscillatorNode, 'music'|'sfx'>();
let channel: 'music'|'sfx' = 'sfx';
let listening = false;
function onVisibility() { if(document.hidden) { haltVoices(); void ctx?.suspend().catch(()=>{}); } else if(unlocked) { void ctx?.resume().catch(()=>{}); } }

function haltVoices(only?: 'music'|'sfx') { voices.forEach((kind,v)=>{ if(only&&kind!==only)return; try { v.stop(); } catch { /* already ended */ } voices.delete(v); }); }
function ensureContext() {
  if (ctx) return ctx;
  try {
    ctx = new AudioContext(); master=ctx.createGain(); master.gain.value=settings.volume; master.connect(ctx.destination);
    // Musik-Bus: warmer Tiefpass + weiches Echo, damit nichts piepsig klingt.
    const warm = ctx.createBiquadFilter(); warm.type='lowpass'; warm.frequency.value=2600; warm.Q.value=0.4;
    musicBus = ctx.createGain(); musicBus.gain.value = 0.8; musicBus.connect(warm); warm.connect(master);
    const delay = ctx.createDelay(1.5); delay.delayTime.value = 0.42;
    const feedback = ctx.createGain(); feedback.gain.value = 0.32;
    const dark = ctx.createBiquadFilter(); dark.type='lowpass'; dark.frequency.value=1500;
    echoSend = ctx.createGain(); echoSend.gain.value = 0.3;
    echoSend.connect(delay); delay.connect(dark); dark.connect(feedback); feedback.connect(delay); dark.connect(warm);
  }
  catch { return null; }
  if(!listening) { document.addEventListener('visibilitychange',onVisibility); listening=true; }
  return ctx;
}
export function unlockAudio() {
  unlocked=true; const audio=ensureContext(); if(audio&&!document.hidden) void audio.resume().catch(()=>{});
}
export function configureAudio(next: Partial<typeof settings>) {
  settings={...settings,...next,volume: Number.isFinite(next.volume) ? Math.max(0,Math.min(1,next.volume!)) : settings.volume};
  if(ctx&&master) master.gain.setTargetAtTime(settings.volume,ctx.currentTime,0.035);
  if(!settings.musicEnabled) haltVoices('music');
  if(!settings.sfxEnabled) haltVoices('sfx');
}
interface ToneOpts { type?: OscillatorType; end?: number; attack?: number; dest?: AudioNode; echo?: boolean; detune?: number }
function tone(frequency:number, offset:number, duration:number, gain:number, opts: ToneOpts | OscillatorType = {}, endFrequency?:number) {
  if(!ctx||!master||ctx.state!=='running'||document.hidden)return;
  const o: ToneOpts = typeof opts === 'string' ? { type: opts, end: endFrequency } : opts;
  const now=ctx.currentTime+offset, osc=ctx.createOscillator(), env=ctx.createGain();
  osc.type=o.type ?? 'sine'; osc.frequency.setValueAtTime(frequency,now); if (o.detune) osc.detune.value = o.detune;
  if(o.end)osc.frequency.exponentialRampToValueAtTime(o.end,now+duration);
  const attack = o.attack ?? 0.012;
  env.gain.setValueAtTime(0,now); env.gain.linearRampToValueAtTime(gain,now+attack); env.gain.exponentialRampToValueAtTime(0.0001,now+Math.max(duration, attack + 0.02));
  osc.connect(env); env.connect(o.dest ?? master);
  if (o.echo && echoSend) env.connect(echoSend);
  voices.set(osc,channel);
  osc.onended=()=>{voices.delete(osc);osc.disconnect();env.disconnect();}; osc.start(now); osc.stop(now+duration+0.05);
}
/** Kalimba/Holz-Glocke: Grundton + kurzer, leiser Oberton. */
function pluck(f:number, offset:number, gain:number, dest?:AudioNode, echo=false) {
  tone(f, offset, 1.1, gain, { type:'sine', dest, echo, attack: 0.006 });
  tone(f*3.01, offset, 0.18, gain*0.18, { type:'sine', dest, attack: 0.003 });
  tone(f*2, offset, 0.5, gain*0.12, { type:'triangle', dest, attack: 0.004 });
}
export function playSound(id:SoundId) {
  if(!unlocked||!settings.sfxEnabled||!ctx||document.hidden)return;
  channel='sfx';
  switch(id) {
    case 'tap': case 'ui': tone(880,0,0.07,0.07,{type:'triangle',end:520}); tone(1320,0,0.03,0.025,'sine'); break;
    case 'found': [659.25,783.99,1046.5].forEach((n,i)=>pluck(n,i*0.07,0.16)); tone(2093,0.2,0.3,0.03,'sine'); break;
    case 'miss': tone(196,0,0.18,0.09,{type:'triangle',end:130}); tone(174.6,0.06,0.16,0.05,'sine'); break;
    case 'hint': [1318.5,1567.98,2093].forEach((n,i)=>tone(n,i*0.09,0.5,0.045)); break;
    case 'start': [392,523.25,659.25,783.99,1046.5].forEach((n,i)=>pluck(n,i*0.075,0.12)); break;
    case 'hop': tone(260,0,0.16,0.09,{type:'sine',end:620}); tone(520,0.02,0.1,0.03,'triangle'); break;
    case 'star': tone(1567.98,0,0.6,0.06); tone(2349.3,0.04,0.7,0.035); tone(3135.9,0.08,0.4,0.02); break;
    case 'combo': [783.99,987.77,1174.66,1567.98].forEach((n,i)=>pluck(n,i*0.05,0.12)); break;
    case 'win': case 'levelup':
      [523.25,659.25,783.99,1046.50,987.77,1046.50,1318.5].forEach((n,i)=>pluck(n,i*0.11,0.15));
      [130.81,196,261.63,329.63].forEach(n=>tone(n,0.3,1.4,0.04,{type:'triangle',attack:0.2}));break;
  }
}

// ---------- Hintergrundmusik: sanftes Wald-Wiegenlied (C-Dur-Pentatonik) ----------
const N = { C3:130.81, D3:146.83, E3:164.81, F3:174.61, G3:196, A3:220, C4:261.63, D4:293.66, E4:329.63, F4:349.23, G4:392, A4:440, B4:493.88, C5:523.25, D5:587.33, E5:659.25, G5:783.99, A5:880 }
/** Akkorde je 2 Takte: Cmaj7 · Am7 · Fmaj7 · G6 */
const CHORDS = [
  { bass: N.C3, pad: [N.E4, N.G4, N.B4] },
  { bass: N.A3 / 2, pad: [N.C4, N.E4, N.G4] },
  { bass: N.F3, pad: [N.A3, N.C4, N.E4] },
  { bass: N.G3, pad: [N.D4, N.G4, N.B4] },
]
/** Melodie-Phrasen (16 Achtel pro Akkord), 0 = Pause. Drei Varianten wechseln sich ab. */
const PHRASES: number[][][] = [
  [[N.E5,0,N.G5,0,N.E5,N.D5,0,0, N.C5,0,0,N.D5,N.E5,0,0,0], [N.C5,0,N.E5,0,N.A4,0,0,0, N.C5,N.D5,0,0,N.E5,0,0,0], [N.A4,0,N.C5,0,N.D5,0,N.E5,0, 0,0,N.D5,0,N.C5,0,0,0], [N.D5,0,0,N.E5,N.G5,0,0,0, N.E5,0,N.D5,0,0,0,0,0]],
  [[0,0,N.G4,0,N.C5,0,N.E5,0, 0,0,0,0,N.D5,0,N.C5,0], [N.E5,0,0,0,N.D5,0,N.C5,0, N.A4,0,0,0,0,0,0,0], [N.C5,0,N.A4,0,0,0,N.C5,N.D5, N.E5,0,0,0,0,0,0,0], [N.G4,0,N.A4,0,N.D5,0,0,0, N.E5,0,N.D5,0,N.G4,0,0,0]],
  [[N.G5,0,0,0,N.E5,0,0,0, N.D5,0,N.E5,0,N.C5,0,0,0], [0,0,N.A4,N.C5,N.E5,0,0,0, N.D5,0,0,0,N.C5,0,0,0], [N.C5,0,0,N.A4,0,0,N.G4,0, N.A4,0,N.C5,0,0,0,0,0], [N.D5,0,N.E5,0,N.G5,0,N.A5,0, N.G5,0,0,0,N.E5,0,0,0]],
]
const STEP_S = 0.36 // Achtel bei ~83 BPM

/** Starting music is inert until unlockAudio is called by a user gesture. */
export function playMusicLoop(id:string):()=>void {
  const token=++loopToken; currentLoop=id; step=0; clearTimeout(loopTimer); haltVoices('music');
  const tick=()=>{
    if(token!==loopToken||!currentLoop)return;
    if(unlocked&&settings.musicEnabled&&!document.hidden&&ctx?.state==='running'&&musicBus) {
      channel='music';
      const perChord = 16, cycle = perChord * CHORDS.length
      const chordIdx = Math.floor((step % cycle) / perChord), inChord = step % perChord
      const variant = Math.floor(step / cycle) % PHRASES.length
      const chord = CHORDS[chordIdx]
      if (inChord === 0) {
        // weiche Fläche (langsamer Einsatz) + Bass
        chord.pad.forEach((f, i) => { tone(f, i * 0.03, STEP_S * 16, 0.022, { type: 'triangle', attack: 1.2, dest: musicBus!, detune: i % 2 ? 6 : -6 }); tone(f, 0.05, STEP_S * 16, 0.012, { type: 'sine', attack: 1.6, dest: musicBus! }) })
        tone(chord.bass, 0, STEP_S * 7, 0.07, { type: 'sine', attack: 0.04, dest: musicBus! })
      }
      if (inChord === 8) tone(chord.bass * 1.5, 0, STEP_S * 6, 0.035, { type: 'sine', attack: 0.05, dest: musicBus! })
      const note = PHRASES[variant][chordIdx][inChord]
      if (note) pluck(note, 0, 0.05, musicBus, true)
      // leise Arpeggio-Tupfer auf den Off-Beats
      if (inChord % 4 === 2 && !note) pluck(chord.pad[(inChord / 2) % 3] * 2, 0, 0.012, musicBus, true)
      // ab und zu Vogelgezwitscher
      if (step % 64 === 45) { tone(2400,0,0.09,0.006,{type:'sine',end:3100,dest:musicBus}); tone(2800,0.14,0.1,0.005,{type:'sine',end:2200,dest:musicBus}); tone(2600,0.3,0.08,0.004,{type:'sine',end:3300,dest:musicBus}) }
      step++;
    }
    loopTimer=setTimeout(tick,STEP_S*1000);
  };
  tick();
  return ()=>{if(token!==loopToken)return;loopToken++;currentLoop=null;clearTimeout(loopTimer);haltVoices('music');};
}

/** Optional application-level teardown (music stop alone keeps SFX available). */
export function disposeAudio() {
  loopToken++; currentLoop=null; clearTimeout(loopTimer); haltVoices();
  document.removeEventListener('visibilitychange',onVisibility); listening=false;
  const previous=ctx; ctx=null; master=null; musicBus=null; echoSend=null; unlocked=false;
  if(previous&&previous.state!=='closed')void previous.close().catch(()=>{});
}
