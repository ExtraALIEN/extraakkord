import {adjacentTone, detectApplicature, otherChordsNames} from './music-calc.js';
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
document.body.sampleLine = firstLine.cloneNode(true);
document.body.sampleAkkordCycle = firstAkkordCycle.cloneNode(true);
activateLineButtons(firstLine);

function activateLineButtons(line){
  for (let x of [...line.querySelectorAll('.change-mode')]){
    x.addEventListener('click', setModeToLine)
  }
  for (let x of [...line.querySelectorAll('.cycle')]){
    x.addEventListener('click', showPopup);
  }
  for (let x of [...line.querySelectorAll('.closer')]){
    x.addEventListener('click', hidePopup);
  }
  for (let x of [...line.querySelectorAll('[name="add-cycle"]')]){
    x.addEventListener('click', addCycle);
  }
  for (let x of [...line.querySelectorAll('[name="rm-cycle"]')]){
    x.addEventListener('click', rmCycle);
  }
  for (let x of [...line.querySelectorAll('.base button')]){
    x.addEventListener('click', changeBasetone);
  }
  for (let x of [...line.querySelectorAll('.akkord .option')]){
    x.addEventListener('click', loadApplicature);
    x.dispatchEvent(new Event('click'));
  }
  for (let x of [...line.querySelectorAll('.extend > div button')]){
    x.addEventListener('click', listApplicature);
  }
  for (let x of [...line.querySelectorAll('.play')]){
    x.addEventListener('click', testChord);
  }

  for (let x of [...line.querySelectorAll('.ok')]){
    x.addEventListener('click', confirmChord);
  }

  for (let x of [...line.querySelectorAll('.akkord [name="all"]')]){
    x.addEventListener('click', loadAllChords);
  }
}

function loadAllChords(event){
  let currentTone = this.parentElement
                       .parentElement
                       .parentElement.querySelector('.val').innerHTML;
  let div = this.parentElement;
  let sample = this.parentElement.querySelector('.extend:nth-child(2)').cloneNode(true);
  this.remove();
  for (let x of otherChordsNames()){
    let btn = sample.querySelector('.option');
    btn.name = x;
    btn.innerHTML = `${currentTone}${x}`;
    let newBlock = sample.cloneNode(true);
    div.append(newBlock);
    btn = newBlock.querySelector('.option');
    btn.addEventListener('click', loadApplicature);
    btn.dispatchEvent(new Event('click'));
    for (let b of [...newBlock.querySelectorAll('.extend div button')]){
       b.addEventListener('click', listApplicature);
    }
    for (let b of [...newBlock.querySelectorAll('.play')]){
      b.addEventListener('click', testChord);
    }



  }

}

function confirmChord(event){
  let cycle = this.parentElement
                  .parentElement
                  .parentElement
                  .parentElement;
  let span = cycle.querySelector('.next-val');
  let option = this.parentElement.querySelector('.option');
  span.dataset.chord = option.innerHTML;
  span.innerHTML = option.innerHTML;
  span.dataset.applicature = JSON.parse(localStorage.getItem('applicatures'))[option.innerHTML][option.dataset.index];

}

function testChord(event){
  let frets = this.parentElement.querySelector('.applicature').innerHTML;
  let nums = frets.split(' ').map(a => a === 'x'? '-1' : a).map(Number);
  playChord(nums);
}

function listApplicature(event){
  let currentTone = this.parentElement
                        .parentElement
                        .parentElement
                        .parentElement.querySelector('.val').innerHTML;
  let chordBtn = this.parentElement
                     .parentElement.querySelector('.option');
  let locApplicatures = JSON.parse(localStorage.getItem('applicatures'));
  let applicatures = locApplicatures[`${currentTone}${chordBtn.name}`];
  let len = applicatures.length;
  let index = chordBtn.dataset.index;
  if (this.name === '+'){
    index = (+index + 1) % len;
  } else {
    index = (+index - 1 + len)% len;
  }
  chordBtn.dataset.index = index;
  let numbers = applicatures[chordBtn.dataset.index].replace(/:/g, ' ');
  this.parentElement.querySelector('.applicature').innerHTML = numbers;
}

function loadApplicature(event){
  let currentTone = this.parentElement
                       .parentElement
                       .parentElement.querySelector('.val').innerHTML;
  if (!('applicatures' in localStorage)){
    localStorage.setItem('applicatures', JSON.stringify({}));
  }
  let locApplicatures = JSON.parse(localStorage.getItem('applicatures'));
  if (!((`${currentTone}${this.name}`) in locApplicatures)){
    let applicatures = detectApplicature(currentTone, this.name);
    locApplicatures[`${currentTone}${this.name}`] = applicatures;
    localStorage.setItem('applicatures', JSON.stringify(locApplicatures));
  }
  let numbers = locApplicatures[`${currentTone}${this.name}`][this.dataset.index].replace(/:/g, ' ');
  this.parentElement.querySelector('.applicature').innerHTML = numbers;
}

function changeBasetone(event){
  let currentVal = this.parentElement.querySelector('.val');
  let currentTone = currentVal.innerHTML;
  let newTone = adjacentTone(currentTone, this.name === '+');
  currentVal.innerHTML = newTone;
  let cycle = currentVal.parentElement.parentElement;
  for (let x of [...cycle.querySelectorAll('.option')]){
    x.innerHTML = `${newTone}${x.name}`;
    x.dataset.index = 0;
    x.addEventListener('click', loadApplicature);
    x.dispatchEvent(new Event('click'));
  }
}

function showPopup(event){
  for (let x of [...editor.querySelectorAll('.popup.active')]){
    x.classList.remove('active');
  }
  this.querySelector('.popup').classList.add('active');
}

function hidePopup(event){
  event.stopPropagation();
  this.parentElement.classList.remove('active');
}

function createCycle(type){
  if (type === 'akkord'){
    return document.body.sampleAkkordCycle.cloneNode(true);
  }
}

function addCycle(event){
  let block = event.target.parentElement.parentElement;
  let blockType = block.dataset.type;
  let cycle = createCycle(blockType);
  block.querySelector('.grid').append(cycle);
  cycle.addEventListener('click', showPopup);
  cycle.querySelector('.closer').addEventListener('click', hidePopup);
  for (let x of [...cycle.querySelectorAll('.base button')]){
    x.addEventListener('click', changeBasetone);
  }
  for (let x of [...cycle.querySelectorAll('.akkord .option')]){
    x.addEventListener('click', loadApplicature);
    x.dispatchEvent(new Event('click'));
  }
  for (let x of [...cycle.querySelectorAll('.extend > div button')]){
    x.addEventListener('click', listApplicature);
  }
  for (let x of [...cycle.querySelectorAll('.play')]){
    x.addEventListener('click', testChord);
  }

  for (let x of [...cycle.querySelectorAll('.ok')]){
    x.addEventListener('click', confirmChord);
  }

  for (let x of [...cycle.querySelectorAll('.akkord [name="all"]')]){
    x.addEventListener('click', loadAllChords);
  }
}

function rmCycle(event){
  let grid = event.target.parentElement.parentElement.querySelector('.grid');
  let last = grid.lastChild;
  if (last){
    last.remove();
  }
}

function setModeToLine(event){
  let newMode = event.target.name;
  event.target.parentElement.querySelector('.active').classList.remove('active');
  event.target.classList.add('active');
  let disp = event.target.parentElement.parentElement.querySelector('.display');
  disp.className = `display ${newMode}`;
}

function addLine(event){
  let line = document.body.sampleLine.cloneNode(true);
  activateLineButtons(line);
  board.append(line);
}
