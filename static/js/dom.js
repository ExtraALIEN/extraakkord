import {otherChordsNames} from './music-calc.js';
import {activateButtons} from './eventListeners.js';
import {showPopup, reloadTotalDuration} from './existingElementsChange.js';

let CYCLE_TYPES = {
  'line': 'sampleLine',
  'akkord': 'sampleAkkordCycle',
  'boi': 'sampleBoiCycle',
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
    pick = document.tempLines;
  }
  let {text, bpm, bois, chords, vocals} = pick;
  [text, bois, chords, vocals] = [text, bois, chords, vocals].map(a=>a.split(']['));
  let len = text.length;
  for (let x=0; x<len; x++){
    let line = document.createElement('div');
    line.classList.add('view-line');
    let chordBlock = document.createElement('div');
    chordBlock.classList.add('chords');
    console.log(chords[x]);
    for (let c of chords[x].split(';')){
      let [signature, applicature] = c.split('*').map(a=>a.replace(/:/g, ' '));
      let cycle = document.createElement('div');
      cycle.innerHTML = signature;
      cycle.dataset.chord = signature;
      cycle.dataset.applicature = applicature;
      chordBlock.append(cycle);
    }
    line.append(chordBlock);
    section.append(line);
  }

}

export {addCycle, rmCycle, loadAllChords, createSpecimen, getBlockCopy, addHit,
        rmHit, removeLine, addLine, paste, displayPick};
