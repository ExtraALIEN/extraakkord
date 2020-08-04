import {fretToHz, fretOffset} from './music-calc.js';
import {ober} from './obertones.js';

let ctx = new AudioContext();
let soundBank = createBuffer();

function createOsc(freq){
  let real = new Float32Array(ober.real);
  let imag = new Float32Array(ober.imag);
  let table = ctx.createPeriodicWave(real, imag);
  let oscillator = ctx.createOscillator();
  oscillator.setPeriodicWave(table);
  oscillator.frequency.value = freq;
  oscillator.connect(ctx.destination);
  return oscillator;
}



function createBuffer(){
  let bank = {};
    fetch(`/static/wav/0.wav`)
      .then(response => response.arrayBuffer())
      .then(arrayBuffer => ctx.decodeAudioData(arrayBuffer))
      .then(buffer => {
          bank['0'] = buffer;
        });
  return bank;
}

function createBufferSource(hz){
  let node = new AudioBufferSourceNode(ctx, {detune : hz*100, playbackRate: 1});
  node.buffer = soundBank['0'];
  console.log(node);
  node.connect(ctx.destination);
  return node;
  //node.stop(4.1);
}

function playChord(frets){
  let hz = [];
  for(let x in frets){
    if(frets[x] !== -1){
      hz.push(fretOffset(x, frets[x]));
    }
  }
  let now = ctx.currentTime;
  for(let x in hz){
     let src = createBufferSource(hz[x]);
     src.start(now + .3 + .012*x);
  }
}



export {playChord};
