import {fretToHz, fretOffset} from './music-calc.js';
import {ober} from './obertones.js';

let HIT_TYPES = {
  'd': 'd',
  'x': 'd',
  'u': 'u',
  's': 'u',
  'i': 'u',
  'p': 'u',
  '0': 'd',

}

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
}

let ctx = new AudioContext();
let soundBank = createBuffer();
let cur = [0,0,0,0,0,0];


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
  for(let type of ['u', 'd']){
    for(let x=0; x<6;x++){
      let name = `${x}${type}`;
      fetch(`/static/wav/${name}.wav`)
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
  gain.connect(ctx.destination);
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
  console.log(boiHits);
  return {'frets': board, 'hits': hits};
}

function test(event){
  // let boi = {
  //   'divide': 8,
  //   'cycleLength': 4,
  //   'hits': {'d': [3,7],
  //            's': [1,],
  //            'u': [4,6,8]}
  // };

  // let boi = {
  //   'divide': 16,
  //   'cycleLength': 4,
  //   'hits': {'de': [5,13],
  //            'dh': [7,15],
  //            'sg': [1,3,11],
  //            'uh': [8,10,12,]}
  // };
  //

  let boi = {
    'divide': 32,
    'cycleLength': 8,
    'hits': {'xz': [7, 15, 23, 31],
             'sh': [1, 11, 27],
             'sz': [3],
             'ue': [9, 13, 25, 29],
             'uh': [2],
             'iw': [17, 21]}
  };

  let boi1 = {
    'divide': 6,
    'cycleLength': 2,
    'hits': {'pb': [1],
             'p3': [2,6],
             'p2': [3,5],
             'p1': [4]
           }
  };
  //
  // let boi = {
  //   'divide': 3,
  //   'cycleLength': 1,
  //   'hits': {'pb': [1],
  //            'pe': [2,3],
  //          }
  // };

  // let boi = {
  //   'divide': 4,
  //   'cycleLength': 2,
  //   'hits': {'down': [1,2,4,]}
  // };

  let chords1 = {
    'divide': 8,
    'changes': { '1': {'name': 'Am', 'signature': 'x:0:2:2:1:0'},
                 '3': {'name': 'G', 'signature': '3:2:0:0:3:3'},
                 '5': {'name': 'Dm', 'signature': 'x:x:0:2:3:1'},
                 '7': {'name': 'E', 'signature': '0:2:2:1:0:0'},
                 '8': {'name': 'F', 'signature': '1:3:3:2:1:1'},
               }
  };
  let chords = {
    'divide': 16,
    'changes': { '1': {'name': 'Em', 'signature': '0:2:2:0:0:0'},
                 '5': {'name': 'D', 'signature': 'x:x:0:2:3:2'},
                 '9': {'name': 'Hm', 'signature': 'x:2:4:4:3:2'},
                 '13': {'name': 'C', 'signature': 'x:3:5:5:5:3'},
                 '15': {'name': 'Am', 'signature': 'x:0:2:2:1:0'},
                 '16': {'name': 'D', 'signature': 'x:x:0:2:3:2'},
               }
  };

  // let chords = {
  //   'divide': 4,
  //   'changes': { '1': {'name': 'Em', 'signature': '0:2:2:0:0:0'},
  //              }
  // };

  let res = detectTimesOnFret(boi, 4, chords);
  //let res1 = detectTimesOnFret(boi1, 16, chords1);
  let now = ctx.currentTime;
  let offset = now + 1;
    createSoundSources(140, res, offset);
    offset += soundDuration(140, 4, boi);
    createSoundSources(140, res, offset);
    offset += soundDuration(140, 4, boi);
    createSoundSources(140, res, offset);
    offset += soundDuration(140, 4, boi);
    // createSoundSources(120, res1, offset);
    // offset += soundDuration(120, 16, boi1);
    // createSoundSources(120, res, offset);
    // offset += soundDuration(120, 4, boi);
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
    let type = hits[x][0];
    let area = hits[x][1];
    if (area in HIT_AREA){
      range = HIT_AREA[area];
    } else if (area === 'b'){
      range = [0,1,2,3,4,5].filter(a=>a>lastBass);
    }

    for(let st of range){
      let t = nextPos(x, frets[st], pos[st]);
      pos[st] = t;
      let frTime = frets[st][t];
      let fr = data.frets[st][frTime];
      let startTime = x*tick + offset;
      let stopTime = startTime + .075;
      if (type === 'i'){
        stopTime = startTime + .3;
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
