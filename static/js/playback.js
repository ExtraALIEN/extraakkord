import {fretToHz, fretOffset, noteToHz} from './music-calc.js';
import {ober} from './obertones.js';

let HIT_TYPES = {
  'd': 'd',
  'x': 'd',
  'u': 'u',
  's': 'u',
  'i': 'u',
  'p': 'u',
  '0': 'd',
};

let OFFSET_DIRECTIONS = {
  'd': 'd',
  'x': 'd',
  'u': 'u',
  's': 'd',
  'i': 'u',
  'p': 'p',
  '0': 'd',
};

// let DYNAMIC_OFFSET = {
//   'd': [0, 0.01, 0.02, 0.03, 0.04, 0.05],
//   'u': [0.05, 0.04, 0.03, 0.02, 0.01, 0],
//   'p': [0, 0, 0, 0, 0, 0],
// };

let DYNAMIC_OFFSET = {
  'd': [0, 0.0075, 0.015, 0.0225, 0.03, 0.0375],
  'u': [0.05, 0.04, 0.03, 0.02, 0.01, 0],
  'p': [0, 0, 0, 0, 0, 0],
};

let HIT_AREA = {
  '0': [],
  '1': [5],
  '2': [4],
  '3': [3],
  '4': [2],
  '5': [1],
  '6': [0],
  'z': [0,1,2,3,4,5],
  'q': [1,2,3,4,5],
  'w': [2,3,4,5],
  'e': [3,4,5],
  'r': [4,5],
  'd': [0,1],
  'f': [0,1,2],
  'g': [0,1,2,3],
  'h': [0,1,2,3,4],
};

let ctx = new AudioContext();
let vocalsGain = ctx.createGain();
vocalsGain.gain.value = .25;
vocalsGain.connect(ctx.destination);
let guitarGain = ctx.createGain();
guitarGain.gain.value = 1;
guitarGain.connect(ctx.destination);
let soundBank = createBuffer();
let cur = [0,0,0,0,0,0];

function createOsc(freq, offset){
  let real = new Float32Array(ober.real);
  let imag = new Float32Array(ober.imag);
  let table = ctx.createPeriodicWave(real, imag);
  let oscillator = ctx.createOscillator();
  oscillator.setPeriodicWave(table);
  oscillator.connect(vocalsGain);
  oscillator.frequency.setValueAtTime(freq, offset);
  return oscillator;
}



function createBuffer(){
  let bank = {};
  for(let type of ['u', 'd']){
    for(let x=0; x<6;x++){
      let name = `${x}${type}`;
      fetch(`/static/ogg/${name}.ogg`)
        .then(response => response.arrayBuffer())
        .then(arrayBuffer => ctx.decodeAudioData(arrayBuffer))
        .then(buffer => {
            bank[name] = buffer;
            console.log('buffer created');
          });
    }
  }
  return bank;
}

function createBufferSource(st, fr, type='d'){
  let node = new AudioBufferSourceNode(ctx, {detune : fr*100, playbackRate: 1});
  node.buffer = soundBank[`${st}${HIT_TYPES[type]}`];
  let gain = ctx.createGain();
  node.connect(gain);
  node.gainControl = gain;
  gain.gain.value = .25;
  gain.connect(guitarGain);
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
     nodes[x].start(now + .3 + .03125*x);
  }
}



function detectTimesOnFret(boi, cycles, chords){
  let cycleLength = boi.cycleLength / 4;
  let totalTicks = cycles * 4 * cycleLength;
  let chordLength = totalTicks/chords.divide;
  let board = {};
  for (let x=0; x< 6; x++){
    board[x] = {0: -1};
  }
  let changes = Object.fromEntries(
                Object.entries(chords.changes).map(([key, value]) => [Number(key), value])
              );

  for (let x of Object.keys(changes).sort((a,b)=> a-b)){
    let time = (x - 1) * chordLength;
    let frets = changes[x].signature.split(':').map(a=> a === 'x' ? -1: a).map(Number);
    for (let f in frets){
      board[f][time] = frets[f];
    }
  }
  let boiTick = 4 * cycleLength / boi.divide;
  let boiHits = {};
  for (let x in boi.hits){
    for(let t of boi.hits[x]){
      boiHits[(t-1)*boiTick] = x;
    }
  }
  let hits = {};
  for (let x=0; x< cycles; x++){
    let newHits = Object.fromEntries(
                  Object.entries(boiHits).map(([key, value]) => [Number(key) + 4*cycleLength*x, value])
                );
    hits = Object.assign(hits, newHits);
  }
  console.log(boi, boiHits);
  return {'frets': board, 'hits': hits};
}


function playBoi(bpm, cycles, boi, chords, startTime){
  let data = detectTimesOnFret(boi, cycles, chords);
  let offset = startTime;
  createSoundSources(bpm, data, offset);
  offset += soundDuration(bpm, cycles, boi);
  return offset;
}

function soundDuration(bpm, cycles, boi){
  let tick = 60 / bpm;
  return tick * boi.cycleLength * cycles;
}

//document.body.addEventListener('click', test);

function createSoundSources(bpm, data, offset){
  //console.log(data);
  let pos = [0,0,0,0,0,0];
  let tick = 60 / bpm;
  let hits = Object.fromEntries(
             Object.entries(data.hits).map(([key, value]) => [Number(key) , value])
              );
  let frets = [];
  for(let x in Object.keys(data.frets).map(Number).sort((a,b)=>a-b)){
    frets.push((Object.keys(data.frets[x])).map(Number).sort((a,b)=> a-b));
  }
  let nodes = [];
  let range = [];
  let playedBass = false;
  let lastBass = -1;
  for(let x of Object.keys(hits).map(Number).sort((a,b)=> a-b)){
    //console.log(x);
    let type = hits[x][0];
    let area = hits[x][1];
    if (area in HIT_AREA){
      range = HIT_AREA[area];
    } else if (area === 'b'){
      range = [0,1,2,3,4,5].filter(a=>a>lastBass);
    } else if (area === 'v'){
      range = [0,1,2,3,4,5];
    }

    for(let st of range){
      let t = nextPos(x, frets[st], pos[st]);
      pos[st] = t;
      //console.log(st, t);
      let frTime = frets[st][t];
      //console.log(frTime);
      let fr = data.frets[st][frTime];
      let dyn = type === 'p' ? 0 : DYNAMIC_OFFSET[OFFSET_DIRECTIONS[type]][st];
      let startTime = x*tick + offset + dyn;
      let stopTime = startTime + .1 - dyn;
      if (type === 'i'){
        stopTime = startTime + .3 - dyn;
      }
      if(fr > -1){
        let node = createBufferSource(st, fr, type);
        if(cur[st]){
          cur[st].gainControl.gain.exponentialRampToValueAtTime(0.001, startTime);
          cur[st].stop(startTime);
          cur[st] = 0;
        }
        node.start(startTime);
        if('xi'.includes(type) ){
          node.gainControl.gain.setValueAtTime(0.3, stopTime - .05);
          node.gainControl.gain.exponentialRampToValueAtTime(0.001, stopTime);
          node.stop(stopTime);
        }
          cur[st] = node;
        if (area === 'b'){
          if(range[0] !== 0){
            lastBass = -1;
          }else {
            lastBass = st;
          }
          break;
        } else if (area === 'v'){
          break;
        }

      }
    }
  }
}

function nextPos(num, sortedArray, startPos){
  let pos = startPos;
  while(num >= sortedArray[pos]){
    pos++;
    if(pos === sortedArray.length){
      break;
    }
  }
  return pos - 1;
}

function createVocalsSoundSource(note, octave, startTime, duration){
  let freq = noteToHz(octave, note);
  let osc = createOsc(freq, startTime);
  osc.start(startTime);
  osc.stop(startTime + duration);

}

function playVocals(bpm, notes, startTime){
  let offset = startTime;
  for (let x of notes){
    let [note, octave, upper, lower] = x;
    let duration = soundDuration(bpm, upper * 4 / lower, {cycleLength: 1});
    if (octave > -1){
      createVocalsSoundSource(note, octave, offset, duration);
    }
    offset += duration;
  }
}

function playNote(bpm, ticks, octave, note){
  let now = ctx.currentTime;
  let offset = now + .2;
  let duration = ticks * (60/bpm);
  if(note >= 0){
    let freq = noteToHz(octave, note);
    let voc = createOsc(freq, offset);
    voc.start(offset);
    voc.stop(offset + duration);
  }
}

export {playChord, playBoi, playNote, playVocals, ctx};
