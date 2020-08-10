import {activateButtons} from './eventListeners.js';
import {adjacentTone, detectApplicature} from './music-calc.js';

function setModeToLine(event){
  let newMode = this.name;
  this.parentElement.querySelector('.active').classList.remove('active');
  this.classList.add('active');
  let disp = this.closest('.line').querySelector('.display');
  disp.className = `display ${newMode}`;
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

function changeBasetone(event){
  let currentVal = this.parentElement.querySelector('.val');
  let currentTone = currentVal.innerHTML;
  let newTone = adjacentTone(currentTone, this.name === '+');
  currentVal.innerHTML = newTone;
  let cycle = currentVal.closest('.cycle');
  for (let x of [...cycle.querySelectorAll('.option')]){
    x.innerHTML = `${newTone}${x.name}`;
    x.dataset.index = 0;
  }
  activateButtons(cycle.closest('[data-type]'), 'akkord');
}

function loadApplicature(event){
  let currentTone = this.closest('.cell').querySelector('.val').innerHTML;
  if (!('applicatures' in localStorage)){
    localStorage.setItem('applicatures', JSON.stringify({}));
  }
  let locApplicatures = JSON.parse(localStorage.getItem('applicatures'));
  let chord = `${currentTone}${this.name}`;
  if (!(chord in locApplicatures)){
    let applicatures = detectApplicature(currentTone, this.name);
    locApplicatures[chord] = applicatures;
    localStorage.setItem('applicatures', JSON.stringify(locApplicatures));
  }
  let numbers = locApplicatures[chord][this.dataset.index].replace(/:/g, ' ');
  this.parentElement.querySelector('.applicature').innerHTML = numbers;
}

function listApplicature(event){
  let currentTone = this.closest('.cell').querySelector('.val').innerHTML;
  let chordBtn = this.closest('.extend').querySelector('.option');
  let locApplicatures = JSON.parse(localStorage.getItem('applicatures'));
  let chord = `${currentTone}${chordBtn.name}`;
  let applicatures = locApplicatures[chord];
  let len = applicatures.length;
  let index = chordBtn.dataset.index;
  if (this.name === '+'){
    index = (+index + 1) % len;
  } else {
    index = (+index - 1 + len)% len;
  }
  chordBtn.dataset.index = index;
  let numbers = applicatures[index].replace(/:/g, ' ');
  this.parentElement.querySelector('.applicature').innerHTML = numbers;
}

function changeLong(event){
  let span = this.closest('.boi-long').querySelector('span');
  let cur = +span.dataset.long;
  if(this.name === '+'){
    cur += 1;
    cur = Math.min(cur, 16);
  }else{
    cur -= 1;
    cur = Math.max(cur, 1);
  }
  span.dataset.long = cur;
  span.innerHTML = cur;
}

function confirmChord(event){
  let cycle = this.closest('.cycle');
  let span = cycle.querySelector('.next-val');
  let option = this.parentElement.querySelector('.option');
  let chord = option.innerHTML;
  span.dataset.chord = chord;
  span.innerHTML = chord;
  span.dataset.applicature = JSON.parse(
      localStorage.getItem('applicatures'))[chord][option.dataset.index];
}

function setHit(event){
  let bg = this.querySelector('.bg');
  let area = this.closest('.create').querySelector('.area');
  let dir = area.querySelector('[name="direction"]:checked');
  let cov = area.querySelector('[name="cover"]:checked');
  let cl1 = dir.parentElement.className;
  let cl2 = cov.parentElement.className;
  if (!(cl1 && cl2)){
    cl1 = '';
    cl2 = '';
  }
  this.className = `hit ${cl1}`;
  bg.className = `bg ${cl2}`;
  this.dataset.hit = `${dir.value}${cov.value}`;

}

export {setModeToLine, showPopup, hidePopup, changeBasetone, loadApplicature,
        listApplicature, confirmChord, changeLong, setHit};
