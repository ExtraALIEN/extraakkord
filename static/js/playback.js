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
  for(let x=0; x<6;x++){
    fetch(`/static/wav/${x}.wav`)
      .then(response => response.arrayBuffer())
      .then(arrayBuffer => ctx.decodeAudioData(arrayBuffer))
      .then(buffer => {
          bank[x] = buffer;
        });
  }
  return bank;
}

function createBufferSource(st, fr){
  let node = new AudioBufferSourceNode(ctx, {detune : fr*100, playbackRate: 1});
  node.buffer = soundBank[st];

  node.connect(ctx.destination);
  return node;
  //node.stop(4.1);
}

function playChord(frets){
  let nodes = [];
  for(let x in frets){
    if(frets[x] !== -1){
      nodes.push(createBufferSource(x, frets[x]));
    }
  }
  let now = ctx.currentTime;
  for(let x in nodes){
     nodes[x].start(now + .3 + .003125*x);
  }
}

export {playChord};
