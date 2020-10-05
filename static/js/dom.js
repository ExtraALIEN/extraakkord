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

export {addCycle, rmCycle, loadAllChords, createSpecimen, getBlockCopy, addHit, rmHit};
