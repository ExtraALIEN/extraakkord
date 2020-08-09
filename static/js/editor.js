import {otherChordsNames} from './music-calc.js';
import {activateButtons} from './eventListeners.js';
import {createSpecimen, getBlockCopy} from './dom.js';
import {playChord, playBoi} from './playback.js';

let opener = document.getElementById('open');
let editor = document.getElementById('editor');
let board = document.getElementById('board');
let closer = document.getElementById('close');
opener.addEventListener('click', () => {editor.classList.add('active')});
closer.addEventListener('click', () => {editor.classList.remove('active')});
let addLineButton = document.getElementById('add-line');
addLineButton.addEventListener('click', addLine);
let firstLine = document.querySelector('.line');
createSpecimen(firstLine, 'line');
for (let x of ['akkord', 'boi']){
  let smpCycle = document.querySelector(`.${x} .cycle`);
  createSpecimen(smpCycle, x);
}
createSpecimen(document.querySelector(`.create .hit`), 'hit');
activateButtons(firstLine, 'line');


function addLine(event){
  let line = getBlockCopy('line');
  activateButtons(line, 'line');
  board.append(line);
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
  playBoi(110, 2, boi, testChords);
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
  playBoi(110, 2, boi, testChords);
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
}


export {testChord, testBoi, saveBoi, listenBoi, confirmBoi};
