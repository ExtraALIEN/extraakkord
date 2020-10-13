import {otherChordsNames, readNote} from './music-calc.js';
import {activateButtons} from './eventListeners.js';
import {createSpecimen, addLine, paste, displayPick, buildEditor} from './dom.js';
import {playChord, playBoi, playNote, playVocals, ctx} from './playback.js';
import {reloadTotalDuration} from './existingElementsChange.js';

let opener = document.getElementById('open');
let editor = document.getElementById('editor');
let board = document.getElementById('board');
let closer = document.getElementById('close');
opener.addEventListener('click', () => {editor.classList.add('active')});
closer.addEventListener('click', () => {editor.classList.remove('active')});
let addLineButton = document.getElementById('add-line');
addLineButton.addEventListener('click', addLine);
let pasteButton = document.getElementById('paste');
pasteButton.addEventListener('click', paste);
let firstLine = document.querySelector('.line');
createSpecimen(firstLine, 'line');
for (let x of ['akkord', 'boi', 'vocals']){
  let smpCycle = document.querySelector(`.${x} .cycle`);
  createSpecimen(smpCycle, x);
}
createSpecimen(document.querySelector(`.create .hit`), 'hit');
activateButtons(firstLine, 'line');
let tools = document.querySelector('.tools');
activateButtons(tools, 'tools');
activateButtons(editor, 'editor');
if (localStorage.getItem('tempLines')){
  displayPick(true);
  buildEditor();
}


function testChord(event){
  let frets = this.parentElement.querySelector('.applicature').innerHTML;
  let nums = frets.split(' ').map(a => a === 'x'? '-1' : a).map(Number);
  playChord(nums);
}

function buildBoiData(elem, save=false){
  let block = elem.closest('.create');
  let hitElements = block.querySelectorAll('.boi-field .hit');
  let cycleLength = block.querySelector('[data-long]').dataset.long;
  let hits = [...hitElements].map(a=> a.dataset.hit).map(a=> a.length > 1? a: '00');
  if (save){
    return hits;
  }
  let hitObj = {};
  for(let i=0; i< hits.length; i++){
    let h = hits[i];
    if (!(h in hitObj)){
      hitObj[h] = [];
    }
    hitObj[h].push(i+1);
  }
  let boi = {'divide': hits.length,
             'cycleLength': cycleLength,
            'hits': hitObj};
  return boi;
}

function testBoi(event){
  let boi = buildBoiData(this);
  let testChords = {
    'divide': 2,
    'changes': { '1': {'name': 'Gm', 'signature': '3:5:5:3:3:3'},
                 '2': {'name': 'A#', 'signature': '1:1:3:3:3:1'},
               }
  };
  let startTime = ctx.currentTime;
  playBoi(110, 2, boi, testChords, startTime);
}

function saveBoi(event){
  let code = buildBoiData(this, true).join('.');
  let block = this.closest('.create');
  let cycleLength = block.querySelector('[data-long]').dataset.long;
  let name = block.querySelector('[name="boi-name"]').value;
  let form = block.querySelector('form');
  form.querySelector('[name="name"]').value = name;
  form.querySelector('[name="cycle_length"]').value = cycleLength;
  form.querySelector('[name="code"]').value = code;
  form.dispatchEvent(new Event('submit', {cancelable: true}));
}

function listenBoi(event){
  let hits = this.dataset.code.split('.');
  let hitObj = {};
  for(let i=0; i< hits.length; i++){
    let h = hits[i];
    if (!(h in hitObj)){
      hitObj[h] = [];
    }
    hitObj[h].push(i+1);
  }
  let cycleLength = this.dataset.cycle;
  let testChords = {
    'divide': 2,
    'changes': { '1': {'name': 'Gm', 'signature': '3:5:5:3:3:3'},
                 '2': {'name': 'A#', 'signature': '1:1:3:3:3:1'},
               }
  };
  let boi = {'divide': hits.length,
             'cycleLength': cycleLength,
            'hits': hitObj};
  let startTime = ctx.currentTime;
  playBoi(110, 2, boi, testChords, startTime);
}

function confirmBoi(event){
  let block = this.closest('.extend');
  let span = this.closest('.cycle').querySelector('.next-val');
  let boiEl = block.querySelector('.play-boi');
  let name = block.querySelector('div').innerHTML;
  let code = boiEl.dataset.code;
  let cycleLength = boiEl.dataset.cycle;
  span.innerHTML = name;
  span.dataset.code = code;
  span.dataset.cycle = cycleLength;
  reloadTotalDuration(this, 'boi');
}

function playLine(event, delay=-1){
  let line = this.closest('.line');
  console.log(delay);
  let boiCycles = line.querySelectorAll('.boi > .grid .next-val');
  let lineBoi = buildLineBoi(boiCycles);
  //console.log(lineBoi);
  let chordCycles = line.querySelectorAll('.akkord > .grid .next-val');
  let lineChords = buildLineChords(chordCycles);
  //console.log(lineChords);
  let vocalsElems = line.querySelectorAll('.vocals > .grid .next-val');
  let vocals = [...vocalsElems].filter(a => a.dataset.code)
                               .map(a => readNote(a.dataset.code));
  //console.log(vocals);
  let startTime = delay;
  if (delay === -1){
    startTime = ctx.currentTime + 1;
  }
  let bpm = detectBPM();
  let offset = playBoi(bpm, 1, lineBoi, lineChords, startTime);
  playVocals(bpm, vocals, startTime);
  return offset;
}



function buildLineBoi(elements){
  let cycles = 0;
  let lastCycles = 0;
  let hitObj = {};
  let lastHits = [];
  for (let el of [...elements]){
    if(el.dataset.cycle !== ''){
      lastCycles = +el.dataset.cycle;
    }
    cycles += lastCycles;
    if (lastCycles){
      if (el.dataset.code !== ''){
        lastHits = el.dataset.code.split('.');
      }
      let hitLength = lastCycles/(lastHits.length);
      for(let i=0; i<lastHits.length; i++){
        let h = lastHits[i];
        if (!(h in hitObj)){
          hitObj[h] = [];
        }
        hitObj[h].push((1 + i*hitLength + cycles - lastCycles));
      }
    }
  }
  return {'hits': hitObj, 'cycleLength': cycles, 'divide': cycles};
}

function buildLineChords(elements){
  let arr = [...elements];
  let divide = arr.length;
  let changes = {};
  for (let i=0; i< arr.length; i++){
    let chord = arr[i].dataset.chord;
    if (chord !== ''){
      changes[i+1] = {'name': chord, 'signature': arr[i].dataset.applicature};
    }
  }
  return {'divide': divide, 'changes': changes};
}

function listenNote(event){
  let block = this.closest('.full');
  let octave = +block.querySelector('.notation').dataset.octave;
  let note = +block.querySelector('.note.active').dataset.note;
  let durElem = block.querySelector('.duration .val');
  let ticks = (+durElem.dataset.upper / +durElem.dataset.lower) * 4;
  let bpm = detectBPM();
  playNote(bpm, ticks ,octave, note);
}

function confirmNote(event){
  let block = this.closest('.cycle');
  let span = block.querySelector('.next-val');
  let noteEl = block.querySelector('.note.active');
  let note = noteEl.innerHTML;
  let octave = block.querySelector('.notation').dataset.octave;
  if (note === '_'){
    octave = '-1';
  }
  let duration = block.querySelector('.duration .val');
  span.dataset.code = `${note}*${octave}*${duration.dataset.upper}*${duration.dataset.lower}`;
  span.innerHTML = `${note !== '_' ? note : '--'}${octave >=0 ? octave : ''}  ${duration.dataset.upper}/${duration.dataset.lower}`;
  reloadTotalDuration(this, 'vocals');
  let long = +duration.dataset.upper/+duration.dataset.lower;
  block.style.flexBasis = `${long * 4 * 100}%`;
  block.style.maxWidth = `${Math.min(long, 0.25) * 4 * 100}%`;
  block.style.height = `${Math.max(long*4, 1)}rem`;
  let clone = block.cloneNode(true);
  clone.querySelector('.popup.active').classList.remove('active');
  createSpecimen(clone, 'vocals');
}

function playAll(event){
  let lines = document.querySelectorAll('.line');
  let offset = ctx.currentTime + 1;
  for (let x of [...lines]){
    offset = playLine.call(x, null, offset);
  }
}

function detectBPM(){
  let span = document.querySelector('.tempo .speed');
  return +span.dataset.speed;
}

function saveTemporary(event){
  let bpm = detectBPM();
  let tempLines = {
    'bpm': bpm,
    'text': [],
    'chords': [],
    'bois': [],
    'vocals': [],
  };
  for (let line of [...board.querySelectorAll('.line')]){
    let text = line.querySelector('input.text').value;
    tempLines.text.push(text);
    let chords = [];
    let lastChord = '';
    let lastApplicature = '';
    for (let chord of [...line.querySelectorAll('[data-type="akkord"] .next-val')]){
      let ch = chord.dataset.chord;
      if (ch) {
        lastChord = ch;
      }else {
        ch = lastChord;
      }
      let ap = chord.dataset.applicature;
      if (ap) {
        lastApplicature = ap;
      } else {
        ap = lastApplicature;
      }
      chords.push(`${ch}*${ap}`);
    }
    tempLines.chords.push(chords.join(';'));
    let lastCycle = '';
    let lastBoi = '';
    let bois = [];
    for (let boi of [...line.querySelectorAll('[data-type="boi"] .next-val')]){
      let cy = boi.dataset.cycle;
      if (cy) {
        lastCycle = cy;
      }else {
        cy = lastCycle;
      }
      let co = boi.dataset.code;
      if (co) {
        lastBoi = co;
      } else {
        co = lastBoi;
      }
      bois.push(`${cy}*${co}`);
    }
    tempLines.bois.push(bois.join(';'));
    let vocals = [];
    for (let note of [...line.querySelectorAll('[data-type="vocals"] .next-val')]){
      vocals.push(`${note.dataset.code}`);
    }
    tempLines.vocals.push(vocals.join(';'));

  }
  for (let x of ['bois', 'vocals', 'chords', 'text']){
    tempLines[x] = tempLines[x].join('][');
  }
  localStorage.setItem('tempLines', JSON.stringify(tempLines));
  displayPick(true);
}

export {testChord, testBoi, saveBoi, listenBoi, confirmBoi, playLine, listenNote,
        confirmNote, playAll, saveTemporary};
