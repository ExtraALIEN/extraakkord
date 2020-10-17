import {otherChordsNames, readNote} from './music-calc.js';
import {activateButtons} from './eventListeners.js';
import {createSpecimen, addLine, paste, displayPick, buildEditor} from './dom.js';
import {playChord, playBoi, playNote, playVocals, ctx} from './playback.js';
import {reloadTotalDuration} from './existingElementsChange.js';

createSpecimen(document.querySelector(`.create .hit`), 'hit');
let create = document.querySelector('.create');
activateButtons(create, 'createBoi');
console.log(1);
