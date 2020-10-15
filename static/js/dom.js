import {otherChordsNames, NOTE_NUMBERS} from './music-calc.js';
import {activateButtons} from './eventListeners.js';
import {showPopup, reloadTotalDuration} from './existingElementsChange.js';
import {confirmNote} from './editor.js';

let CYCLE_TYPES = {
  'line': 'sampleLine',
  'akkord': 'sampleAkkordCycle',
  'boi': 'sampleBoiCycle',
  'vocals': 'sampleVocalsCycle',
  'hit': 'sampleHit',
  'applicature': 'sampleApplicatureLine',
};

function createSpecimen(original, storage){
  document.body[CYCLE_TYPES[storage]] = original.cloneNode(true);
}

function getBlockCopy(storage){
  return document.body[CYCLE_TYPES[storage]].cloneNode(true);
}

function addLine(event){
  let board = this.closest('.board');
  let line = getBlockCopy('line');
  activateButtons(line, 'line');
  board.append(line);
}

function paste(event){
  let board = this.closest('.board');
  let buffer = [];
  for (let x of [...board.querySelectorAll('.line.to-copy')]){
    let cp = x.cloneNode(true);
    cp.classList.remove('to-copy');
    activateButtons(cp, 'line');
    buffer.push(cp);
  }
  for (let x of buffer){
    board.append(x);
  }
}

function addCycle(event){
  let block = this.closest('[data-type]');
  let blockType = block.dataset.type;
  let cycle = getBlockCopy(blockType);
  block.querySelector('.grid').append(cycle);
  cycle.addEventListener('click', showPopup);
  activateButtons(cycle, blockType);
  reloadTotalDuration(block.querySelector('.grid'), blockType);
}

function rmCycle(event){
  let block = this.closest('[data-type]');
  let blockType = block.dataset.type;
  let grid = this.closest('[data-type]').querySelector('.grid');
  let last = grid.lastChild;
  if (last){
    last.remove();
    reloadTotalDuration(grid, blockType);
  }
}

function addHit(event){
  let block = this.closest('.show');
  let cycle = getBlockCopy('hit');
  block.querySelector('.boi-field').append(cycle);
  activateButtons(block.querySelector('.boi-field'), 'hit');
}

function rmHit(event){
  let grid = this.closest('.show').querySelector('.boi-field');
  let last = grid.lastChild;
  if (last){
    last.remove();
  }
}

function loadAllChords(event){
  let currentTone = this.closest('.cell').querySelector('.val').innerHTML;
  let div = this.closest('.full');
  createSpecimen(div.querySelector('.extend:nth-child(2)'), 'applicature');
  this.remove();
  for (let x of otherChordsNames()){
    let newBlock = getBlockCopy('applicature');
    let btn = newBlock.querySelector('.option');
    btn.name = x;
    btn.innerHTML = `${currentTone}${x}`;
    div.append(newBlock);
    activateButtons(div, 'akkord');
  }
}

function removeLine(event){
  let line = this.closest('.line');
  line.remove();
}

function displayPick(fromLocal=false){
  let section = document.getElementById('pick');
  section.innerHTML = '';
  let pick;
  if (fromLocal){
    pick = JSON.parse(localStorage.getItem('tempLines'));
  }
  let {text, bpm, bois, chords, vocals, boiNames} = pick;
  [text, bois, chords, vocals] = [text, bois, chords, vocals].map(a=>a.split(']['));
  let len = text.length;
  let allBois = [];
  let lastChord = '';
  for (let x=0; x<len; x++){
    let line = document.createElement('div');
    line.classList.add('view-line');
    let chordBlock = document.createElement('div');
    chordBlock.classList.add('chords');
    for (let c of chords[x].split(';')){
      let [signature, applicature] = c.split('*').map(a=>a.replace(/:/g, ' '));
      let cycle = document.createElement('div');

      cycle.dataset.chord = signature;
      cycle.dataset.applicature = applicature;
      cycle.classList.add('cycle-chord');
      if (signature !== lastChord){
        cycle.innerHTML = signature;
        lastChord = signature;
        if (signature){
          let popup = document.createElement('div');
          popup.classList.add('app');
          popup.innerHTML = `${cycle.dataset.chord} ${cycle.dataset.applicature}`;
          cycle.append(popup);
        }
      }

      chordBlock.append(cycle);
    }
    line.append(chordBlock);
    let textBlock = document.createElement('div');
    let textLine = document.createElement('span');
    textLine.innerHTML = text[x];
    textBlock.append(textLine);
    line.append(textBlock);
    let boiBlock = document.createElement('div');
    boiBlock.classList.add('boi-block');
    for (let b of bois[x].split(';')){
      if (!allBois.includes(b)){
        allBois.push(b);
      }
      let cycle = document.createElement('div');
      let [boiCycles, code] = b.split('*');
      cycle.classList.add('cycle-boi');
      cycle.classList.add(`boi-${allBois.indexOf(b)}`);
      cycle.dataset.cycles = boiCycles;
      cycle.dataset.code = code;
      cycle.style.flexGrow = cycle.dataset.cycles;
      if (+boiCycles){
        boiBlock.append(cycle);
      }
    }
    chordBlock.append(boiBlock);
    let noteBlock = document.createElement('div');
    noteBlock.classList.add('note-block');
    for (let v of vocals[x].split(';')){
      let [note, octave, upper, lower] = v.split('*');
      let cycle = document.createElement('div');
      cycle.dataset.note = note;
      cycle.dataset.octave = octave;
      cycle.dataset.upper = upper;
      cycle.dataset.lower = lower;
      if (note){
        noteBlock.append(cycle);
      }
    }
    line.append(noteBlock);
    section.append(line);
  }

}

function buildEditor(){
  let board = document.getElementById('board');
  for (let x of [...board.querySelectorAll('.line')]){
    x.remove();
  }
  let pick = JSON.parse(localStorage.getItem('tempLines'));
  let {text, bpm, bois, chords, vocals, boiNames} = pick;
  [text, bois, chords, vocals] = [text, bois, chords, vocals].map(a=>a.split(']['));
  let len = text.length;
  console.log(pick);
  for (let x=0; x<len; x++){
    let line = getBlockCopy('line');
    for (let x of [...line.querySelectorAll('.cycle')]){
      x.remove();
    }
    line.querySelector('input.text').value = text[x];
    let chordBlock = line.querySelector('.akkord .grid');
    for (let c of chords[x].split(';')){
      let [signature, applicature] = c.split('*');
      console.log(signature, applicature);
      let cycle = getBlockCopy('akkord');
      let nextVal = cycle.querySelector('.next-val');
      nextVal.dataset.chord = signature;
      nextVal.dataset.applicature = applicature;
      nextVal.innerHTML = signature;
      if (signature){
        chordBlock.append(cycle);
      }
    }
    let boiBlock = line.querySelector('.boi .grid');
    for (let b of bois[x].split(';')){
      let cycle = getBlockCopy('boi');
      let [boiCycles, code] = b.split('*');
      let nextVal = cycle.querySelector('.next-val');
      nextVal.dataset.cycle = +boiCycles;
      nextVal.dataset.code = code;
      nextVal.dataset.name = boiNames[b];
      console.log(boiNames, b);
      nextVal.innerHTML = nextVal.dataset.name;
      if (+boiCycles){
        boiBlock.append(cycle);
      }
    }
    reloadTotalDuration(boiBlock, 'boi');
    let vocalsBlock = line.querySelector('.vocals .grid');
    for (let v of vocals[x].split(';')){
      let [note, octave, upper, lower] = v.split('*');
      let cycle = getBlockCopy('vocals');
      let nextVal = cycle.querySelector('.next-val');
      nextVal.dataset.code = v;
      if (note){
        cycle.querySelector('.note.active').classList.remove('active');
        cycle.querySelector(`.note[data-note="${NOTE_NUMBERS[note]}"]`).classList.add('active');
        let oct = cycle.querySelector(`.notation`);
        oct.dataset.octave = +octave === -1 ? 4 : octave;
        oct.innerHTML = oct.dataset.octave;
        let duration = cycle.querySelector('.duration .val');
        duration.dataset.upper = upper;
        duration.dataset.lower = lower;
        duration.innerHTML = `${upper}/${lower}`;
        vocalsBlock.append(cycle);
        confirmNote.call(cycle, null);
      }
    }

    board.append(line);

    activateButtons(line, 'line');
  }
}

export {addCycle, rmCycle, loadAllChords, createSpecimen, getBlockCopy, addHit,
        rmHit, removeLine, addLine, paste, displayPick, buildEditor};
