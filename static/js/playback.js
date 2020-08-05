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
     nodes[x].start(now + .3 + .03125*x);
  }
}



function detectTimesOnFret(boi, cycles, chords){
  let totalTicks = cycles * 4;
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
  let boiTick = 4 / boi.divide;
  let boiHits = {};
  for (let x in boi.hits){
    for(let t of boi.hits[x]){
      boiHits[(t-1)*boiTick] = x;
    }
  }
  let hits = {};
  for (let x=0; x< cycles; x++){
    let newHits = Object.fromEntries(
                  Object.entries(boiHits).map(([key, value]) => [Number(key) + 4*x, value])
                );
    hits = Object.assign(hits, newHits);
  }
  return {'frets': board, 'hits': hits};
}

function test(event){
  let boi = {
    'divide': 8,
    'hits': {'down': [1,3,4,6,7,8]}
  }

  let chords = {
    'divide': 8,
    'changes': { '1': {'name': 'Am', 'signature': 'x:0:2:2:1:0'},
                 '3': {'name': 'C', 'signature': 'x:3:2:0:1:0'},
                 '5': {'name': 'Dm', 'signature': 'x:x:0:2:3:1'},
                 '7': {'name': 'G', 'signature': '3:2:0:0:3:3'},
               }
  };
  let res = detectTimesOnFret(boi, 8, chords);
  createSoundSources(140, res);
}

document.body.addEventListener('click', test);

function createSoundSources(bpm, data, offset=2){
  //console.log(data);
  let pos = [0,0,0,0,0,0];
  let cur = [0,0,0,0,0,0];
  let now = ctx.currentTime;
  let tick = 60 / bpm;
  let hits = Object.fromEntries(
             Object.entries(data.hits).map(([key, value]) => [Number(key) , value])
              );
  let frets = [];
  for(let x in Object.keys(data.frets).map(Number).sort((a,b)=>a-b)){
    frets.push((Object.keys(data.frets[x])).map(Number).sort((a,b)=> a-b));
  }
  let nodes = [];
  for(let x of Object.keys(hits).map(Number).sort((a,b)=> a-b)){
    for(let st=0;st<6;st++){
      let t = nextPos(x, frets[st], pos[st]);
      pos[st] = t;
      let frTime = frets[st][t];
      let fr = data.frets[st][frTime];
      if(fr > -1){
        let node = createBufferSource(st, fr);
        node.start(x*tick + offset + now);
        if(cur[st]){
          cur[st].stop(x*tick + offset + now);
        }
        cur[st] = node;
      }else {
        if(cur[st]){
          cur[st].stop(x*tick + offset + now);
          cur[st] = 0;
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

export {playChord};
