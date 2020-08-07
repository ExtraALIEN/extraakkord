import {setModeToLine, showPopup, hidePopup, changeBasetone,
        loadApplicature, listApplicature, confirmChord, changeLong, setHit} from './existingElementsChange.js';
import {addCycle, rmCycle, loadAllChords, addHit, rmHit} from './dom.js';
import {testChord, testBoi} from './editor.js';

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
  '.akkord [name="all"]': loadAllChords,
  '[name="add-hit"]': addHit,
  '[name="rm-hit"]': rmHit,
  '.boi-long button': changeLong,
  '.hit': setHit,
  '[name="test"]': testBoi,
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
  ],
  'hit': [
    '.hit',
  ]
}

function activateButtons(elem, cl){
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



export {activateButtons};
