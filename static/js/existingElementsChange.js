import {activateButtons} from './eventListeners.js';
import {adjacentTone, detectApplicature, applyAlternativeBass} from './music-calc.js';
import {fractureSum} from './utils.js';


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
  let bass = cycle.querySelector('.tone .val');
  bass.innerHTML = newTone;
  for (let x of [...cycle.querySelectorAll('.option')]){
    x.innerHTML = `${newTone}${x.name}`;
    x.dataset.index = 0;
  }
  activateButtons(cycle.closest('[data-type]'), 'akkord');
}

function changeBass(event){
  let currentVal = this.parentElement.querySelector('.val');
  let currentBass = currentVal.innerHTML;
  let newBass = adjacentTone(currentBass, this.name === '+');
  currentVal.innerHTML = newBass;
  let cycle = currentVal.closest('.cycle');
  let tone = cycle.querySelector('.base .val').innerHTML;
  for (let x of [...cycle.querySelectorAll('.option')]){
    x.dataset.bass = newBass === tone ? '': `/${newBass}`;
    x.innerHTML = `${tone}${x.name}${x.dataset.bass}`;
    loadApplicature.call(x, null);
    let chord = x.closest('.extend').querySelector('.applicature')
                                          .innerHTML;
    if (newBass !== tone){
      let newApplicature = applyAlternativeBass(newBass, chord);
      x.closest('.extend').querySelector('.applicature').innerHTML = newApplicature;
      if (newApplicature === chord){
        x.innerHTML = `${tone}${x.name}`;
      }
    }
  }
  // activateButtons(cycle.closest('[data-type]'), 'akkord');
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
  let cycle = chordBtn.closest('.cycle');
  let currentBass = cycle.querySelector('.tone .val').innerHTML;
  let newApplicature;
  if (currentBass !== currentTone){
    newApplicature = applyAlternativeBass(currentBass, numbers);
  } else{
    newApplicature = numbers;
  }
  this.parentElement.querySelector('.applicature').innerHTML = newApplicature;
  if (newApplicature !== numbers){
    chordBtn.dataset.bass = currentBass === currentTone ? '': `/${currentBass}`;
    chordBtn.innerHTML = `${chord}${chordBtn.dataset.bass}`;
  }else{
    chordBtn.innerHTML = `${chord}`;
  }

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
  //span.dataset.applicature = JSON.parse(
  //    localStorage.getItem('applicatures'))[chord][option.dataset.index];
  span.dataset.applicature = option.parentElement
                                   .querySelector('.applicature').innerHTML
                                   .split(' ').join(':');
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

function activateNote(event){
  let roll = this.closest('.roll');
  let cur = roll.querySelector('.active');
  if (this === cur){
    this.closest('.full').querySelector('.play-note').dispatchEvent(new Event('click'));
  }else {
    cur.classList.remove('active');
    this.classList.add('active');
  }
}

function changeOctave(event){
  let span = this.closest('.octave').querySelector('.notation');
  let cur = +span.dataset.octave;
  if(this.name === '+'){
    cur += 1;
    cur = Math.min(cur, 6);
  }else{
    cur -= 1;
    cur = Math.max(cur, 2);
  }
  span.dataset.octave = cur;
  span.innerHTML = cur;
}

function changeStep(event){
  let span = this.closest('.duration').querySelector('.step');
  let step = span.dataset.lower;
  let k = 2;
  if (this.name === '/'){
    step *= k;
    step = Math.min(step, 32);
  } else {
    step /= k;
    step = Math.max(step, 1);
  }
  span.dataset.lower = step;
  span.innerHTML = `(Шаг: ${span.dataset.upper}/${span.dataset.lower})`;
}

function changeDuration(event){
  let block = this.closest('.duration');
  let span = block.querySelector('.step');
  let val = block.querySelector('.val');
  let [durUpper, durLower] = [+val.dataset.upper, +val.dataset.lower];
  let [stepUpper, stepLower] = [+span.dataset.upper, +span.dataset.lower];
  if (this.name === '-'){
    while (durUpper/durLower <= stepUpper/stepLower && stepLower < 32){
      let stepDown = block.querySelector('.step-change[name="/"]');
      changeStep.call(stepDown, null);
      stepLower = +span.dataset.lower;
    }
    stepUpper *= -1;
  }

  let sum = fractureSum([durUpper, durLower], [stepUpper, stepLower]);
  val.dataset.upper = sum[0];
  val.dataset.lower = sum[1];
  val.innerHTML = `${val.dataset.upper}/${val.dataset.lower}`;
}

function reloadTotalDuration(elem, type){
  if (!(['vocals', 'boi'].includes(type))){
    return;
  }
  let grid = elem.closest('.grid');
  let cycles = grid.querySelectorAll('.cycle .next-val');
  let durations = [[0, 4]];
  let last = 0;
  for (let x of [...cycles]){
    let upper = 0;
    let lower = 4;
    if (type === 'vocals'){
      if (x.dataset.code){
        let code = x.dataset.code.split('*');
        [ , , upper, lower] = [ , , +code[2], +code[3]];
      }
    } else if (type === 'boi'){
      if (x.dataset.cycle){
        upper = +x.dataset.cycle;
        last = upper;
      } else {
        upper = last;
      }
    }
    durations.push([upper, lower]);
  }
  let result = durations.reduce((acc,cur) => fractureSum(acc,cur), [0,4]);
  let count = result[0] * 4 / result[1];
  grid.parentElement.querySelector('.count span').innerHTML = `${count}/4`;
}

function toggleCopyLine(event){
  let line = this.closest('.line');
  line.classList.toggle('to-copy');
}

function changeSpeed(event){
  let span = this.closest('.tempo').querySelector('.speed');
  let speed = +span.dataset.speed;
  if (this.name === '+'){
    speed += 1;
    speed = Math.min(speed, 240);
  }else {
    speed -= 1;
    speed = Math.max(speed, 40);
  }
  span.dataset.speed = speed;
  span.innerHTML = span.dataset.speed;
}

export {setModeToLine, showPopup, hidePopup, changeBasetone, loadApplicature,
        listApplicature, confirmChord, changeLong, setHit, activateNote,
        changeOctave, changeStep, changeDuration, reloadTotalDuration, toggleCopyLine,
        changeSpeed, changeBass};
