import {otherChordsNames} from './music-calc.js';
import {activateButtons} from './eventListeners.js';
import {createSpecimen, getBlockCopy} from './dom.js';
import {playChord} from './playback.js';

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

function testBoi(event){
  let block = this.closest('.create');
  let hitElements = block.querySelectorAll('.boi-field .hit');
  let cycleLength = block.querySelector('[data-long]').dataset.long;
  let hits = [...hitElements].map(a=> a.dataset.hit).map(a=> a.length > 1? a: '00');
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
}


export {testChord, testBoi};
