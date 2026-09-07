/** Original synthesized audio. Call unlockAudio() from a trusted click/touch. */
type SoundId = 'tap'|'found'|'miss'|'win'|'ui'|'start'|'hint'|'levelup';
let ctx: AudioContext | null = null;
let master: GainNode | null = null;
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
  try { ctx = new AudioContext(); master=ctx.createGain(); master.gain.value=settings.volume; master.connect(ctx.destination); }
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
function tone(frequency:number, offset:number, duration:number, gain:number, type:OscillatorType='sine', endFrequency?:number) {
  if(!ctx||!master||ctx.state!=='running'||document.hidden)return;
  const now=ctx.currentTime+offset, osc=ctx.createOscillator(), env=ctx.createGain();
  osc.type=type; osc.frequency.setValueAtTime(frequency,now);
  if(endFrequency)osc.frequency.exponentialRampToValueAtTime(endFrequency,now+duration);
  env.gain.setValueAtTime(0,now); env.gain.linearRampToValueAtTime(gain,now+0.014); env.gain.exponentialRampToValueAtTime(0.0001,now+duration);
  osc.connect(env); env.connect(master); voices.set(osc,channel);
  osc.onended=()=>{voices.delete(osc);osc.disconnect();env.disconnect();}; osc.start(now); osc.stop(now+duration+0.025);
}
export function playSound(id:SoundId) {
  if(!unlocked||!settings.sfxEnabled||!ctx||document.hidden)return;
  channel='sfx';
  switch(id) {
    case 'tap': case 'ui': tone(540,0,0.065,0.10,'sine',360); break;
    case 'found': [523.25,659.25,783.99].forEach((n,i)=>tone(n,i*0.075,0.27,0.12)); break;
    case 'miss': tone(220,0,0.16,0.085,'triangle',147); break;
    case 'hint': tone(880,0,0.32,0.08);tone(1174.66,0.12,0.40,0.065);break;
    case 'start': [392,523.25,659.25,783.99].forEach((n,i)=>tone(n,i*0.08,0.30,0.10));break;
    case 'win': case 'levelup': [523.25,659.25,783.99,1046.50,987.77,1046.50].forEach((n,i)=>tone(n,i*0.12,0.44,0.11)); [130.81,196,261.63].forEach(n=>tone(n,0.36,0.8,0.045,'triangle'));break;
  }
}
/** Starting music is inert until unlockAudio is called by a user gesture. */
export function playMusicLoop(id:string):()=>void {
  const token=++loopToken; currentLoop=id; step=0; clearTimeout(loopTimer); haltVoices('music');
  const melody=[659.25,0,783.99,880,0,783.99,659.25,0,523.25,0,587.33,659.25,0,587.33,523.25,0];
  const tick=()=>{
    if(token!==loopToken||!currentLoop)return;
    if(unlocked&&settings.musicEnabled&&!document.hidden&&ctx?.state==='running') {
      channel='music';
      const note=melody[step%melody.length]; if(note) {tone(note,0,0.65,0.028);tone(note*2,0,0.32,0.006);}
      if(step%4===0)tone([130.81,174.61,146.83,196][Math.floor(step/4)%4],0,1.35,0.035,'sine');
      // Small, occasional birdsong above the soft marimba-like melody.
      if(step%32===23){tone(1800,0,0.11,0.009,'sine',2400);tone(2100,0.16,0.13,0.008,'sine',1700);}
      step++;
    }
    loopTimer=setTimeout(tick,430);
  };
  tick();
  return ()=>{if(token!==loopToken)return;loopToken++;currentLoop=null;clearTimeout(loopTimer);haltVoices('music');};
}

/** Optional application-level teardown (music stop alone keeps SFX available). */
export function disposeAudio() {
  loopToken++; currentLoop=null; clearTimeout(loopTimer); haltVoices();
  document.removeEventListener('visibilitychange',onVisibility); listening=false;
  const previous=ctx; ctx=null; master=null; unlocked=false;
  if(previous&&previous.state!=='closed')void previous.close().catch(()=>{});
}
