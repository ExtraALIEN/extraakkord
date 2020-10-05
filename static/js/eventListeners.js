import {setModeToLine, showPopup, hidePopup, changeBasetone,
        loadApplicature, listApplicature, confirmChord, changeLong, setHit,
        activateNote, changeOctave, changeStep, changeDuration} from './existingElementsChange.js';
import {addCycle, rmCycle, loadAllChords, addHit, rmHit} from './dom.js';
import {testChord, testBoi, saveBoi, listenBoi, confirmBoi, playLine, listenNote, confirmNote} from './editor.js';
import {postAjax} from './ajax.js';

let CLICK_LISTENERS = {
  '.change-mode': setModeToLine,
  '.show': showPopup,
  '.closer': hidePopup,
  '[name="add-cycle"]': addCycle,
  '[name="rm-cycle"]': rmCycle,
  '.base button': changeBasetone,
  '.akkord .option': loadApplicature,
  '.extend > div button': listApplicature,
  '.play': testChord,
  '.ok': confirmChord,
  '.play-boi': listenBoi,
  '.ok-boi': confirmBoi,
  '.akkord [name="all"]': loadAllChords,
  '[name="add-hit"]': addHit,
  '[name="rm-hit"]': rmHit,
  '.boi-long button': changeLong,
  '.hit': setHit,
  '[name="test"]': testBoi,
  '[name="save"]': saveBoi,
  '.play-line': playLine,
  '.roll .note': activateNote,
  '.octave button': changeOctave,
  '.play-note': listenNote,
  '.step-change': changeStep,
  '.duration-change': changeDuration,
  '.ok-note': confirmNote,
};

let FORCE_EVENTS = {
  '.akkord .option': 'click',
}

let CLASSNAMES_OF_LISTENERS = {
  'line': [
    '.change-mode',
    '.show',
    '.closer',
    '[name="add-cycle"]',
    '[name="rm-cycle"]',
    '.base button',
    '.akkord .option',
    '.extend > div button',
    '.play',
    '.ok',
    '.akkord [name="all"]',
    '[name="create-boi"]',
    '[name="add-hit"]',
    '[name="rm-hit"]',
    '.boi-long button',
    '.hit',
    '[name="test"]',
    '[name="save"]',
    '.play-boi',
    '.ok-boi',
    '.play-line',
    '.roll .note',
    '.octave button',
    '.play-note',
    '.step-change',
    '.duration-change',
    '.ok-note',
  ],
  'akkord': [
    '.closer',
    '.base button',
    '.akkord .option',
    '.extend > div button',
    '.play',
    '.ok',
    '.akkord [name="all"]',
  ],
  'allAkkords': [
    '.option',
    '.extend > div button',
    '.play',
  ],
  'boi': [
    '.closer',
    '.play-boi',
    '.ok-boi',
  ],
  'hit': [
    '.hit',
  ],
  'vocals':[
    '.closer',
    '.roll .note',
    '.octave button',
    '.play-note',
    '.step-change',
    '.duration-change',
    '.ok-note',
  ],
}

function activateButtons(elem, cl){
  console.log(elem);
  let necessaryListeners = CLASSNAMES_OF_LISTENERS[cl];
  for (let selector of necessaryListeners){
    for (let x of [...elem.querySelectorAll(selector)]){
      x.addEventListener('click', CLICK_LISTENERS[selector]);
      if (selector in FORCE_EVENTS){
        x.dispatchEvent(new Event(FORCE_EVENTS[selector]));
      }
    }

  }
}



export {activateButtons, CLICK_LISTENERS};
