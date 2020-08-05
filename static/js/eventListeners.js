import {setModeToLine, showPopup, hidePopup, changeBasetone,
        loadApplicature, listApplicature, confirmChord} from './existingElementsChange.js';
import {addCycle, rmCycle, loadAllChords} from './dom.js';
import {testChord} from './editor.js';

let CLICK_LISTENERS = {
  '.change-mode': setModeToLine,
  '.cycle': showPopup,
  '.closer': hidePopup,
  '[name="add-cycle"]': addCycle,
  '[name="rm-cycle"]': rmCycle,
  '.base button': changeBasetone,
  '.akkord .option': loadApplicature,
  '.extend > div button': listApplicature,
  '.play': testChord,
  '.ok': confirmChord,
  '.akkord [name="all"]': loadAllChords,
};

let FORCE_EVENTS = {
  '.akkord .option': 'click',
}

let CLASSNAMES_OF_LISTENERS = {
  'line': [
    '.change-mode',
    '.cycle',
    '.closer',
    '[name="add-cycle"]',
    '[name="rm-cycle"]',
    '.base button',
    '.akkord .option',
    '.extend > div button',
    '.play',
    '.ok',
    '.akkord [name="all"]',
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
