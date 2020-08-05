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
let firstAkkordCycle = document.querySelector('.akkord .cycle');
createSpecimen(firstLine, 'line');
createSpecimen(firstAkkordCycle, 'akkord');
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


export {testChord};
