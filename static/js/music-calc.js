const BASE_TONES = ['E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'H', 'C', 'C#', 'D', 'D#'];

const CHORD_SEMITONES = {
  '': [4, 3],
  'm': [3, 4],
  '7': [4, 3, 3],
  'm7': [3, 4, 3],
  'sus2': [2, 5],
  'sus4': [5, 2],
  'madd4': [3, 2, 2],
  'dim': [3, 3],
  'maj7': [4, 3, 4],
  'dim7': [3, 3, 3],
  '+': [4, 4],
  '-5': [4, 2],
  'm+5': [3, 5],
  '6': [4, 3, 2],
  'm6': [3, 4, 2],
  'add9': [4, 3, 7],
  'madd9': [3, 4, 7],
  'add9+5': [4, 4, 6],
  '5': [7],
  '6/9': [4, 3, 2, 5],
  'm6/9': [3, 4, 2, 5],
  'dim9': [3, 3, 3, 5],
  'm+7': [3, 4, 4],
  '+7+5': [4, 4, 3],
  '7+5': [4, 4, 2],
  'm7-5': [3, 3, 4],
  '7sus2': [4, 2, 4],
  '7sus4': [5, 2, 3],
  '7/11': [4, 3, 3, 7],
  'm7/11': [3, 4, 3, 7],
  '7/13': [4, 3, 3, 11],
  '7/-13': [4, 3, 3, 10],
  '9': [4, 3, 3, 4],
  'm9': [3, 4, 3, 4],
  'maj9': [4, 3, 4, 3],
  'mmaj9' : [3, 4, 4, 3],
  '7-9': [4, 3, 3, 3],
  '7+9': [4, 3, 3, 5],
  '+9': [4, 4, 2, 4],
  '9maj7+5': [4, 4, 3, 3],
  '9maj7-5': [4, 2, 5, 3],
  'dim9': [3, 3, 3, 5],
  'dim-9': [3, 3, 3, 4],
  '9sus4': [5, 2, 3, 4],
  '9/13': [4, 3, 3, 4, 7],
  '9-9/13': [4, 3, 3, 3, 8],
  '9+9/13': [4, 3, 3, 5, 6],
  '9-9/-13': [4, 3, 3, 3, 7],
  '9+9/13': [4, 3, 3, 5, 5],
};

const STRING_OFFSET = [0, 5, 10, 15, 19, 24];

const NOTE_NUMBERS = {
  'c': 0,
  'c#': 1,
  'd': 2,
  'd#': 3,
  'e': 4,
  'f': 5,
  'f#': 6,
  'g': 7,
  'g#': 8,
  'a': 9,
  'a#': 10,
  'h': 11,
  '_': -1,
}

function detectApplicature(base, signature){
  let baseResults = new Set();
  let results = new Set();
  let chordNotes = CHORD_SEMITONES[signature]
                    .reduce( (acc, cur) => acc.concat(acc[acc.length-1]+cur),
                    [BASE_TONES.indexOf(base)])
                    .map(x => BASE_TONES[x%12]);
  for (let st=0; st<6; st++){
    let cur = [-1,-1,-1,-1,-1,-1];
    for (let x of findPossibleApplicatures([], cur, chordNotes, st)){
      baseResults.add(x);
    }
  }
  let sortedBaseResults = [...baseResults]
                          .sort((a,b) => closestToZeroFret(a)-closestToZeroFret(b))
                          .map(a => a.split(':').map(Number));
  let fretsToAdd = possibleChordFrets(sortedBaseResults);
  for(let f of sortedBaseResults){
    for (let x of extendChord([], f, fretsToAdd, 0)){
      results.add(x);
    }
  }
  let sortedResults = [...results]
                          .sort((a,b) => closestToZeroFret(a)-closestToZeroFret(b))
                          .map(a => a.split(':').map(Number));
  let finalResults = filterMainTone(base, chordNotes, sortedResults);
  let final = [...finalResults].sort((a,b) => minRange(a) - minRange(b));
  let output = [];
  for(let x of final){
    output.push(x.replace(/-1/g, 'x'));
  }
  return output;
}

function filterMainTone(base, chordNotes, results){
  let output = new Set();
  for (let x of results){
    let chord = x.slice();
    for (let st=0;st<=6-chordNotes.length;st++){
      if(x[st] !== detectFret(base, st)){
          chord[st] = -1;
      } else if (allNotesExist(chordNotes, chord)){
          output.add(chord.join(':'));
          break;
      }
    }
  }
  return output;
}


function extendChord(allResults, result, possibleFrets, strNum){
  if (strNum > 5){
    allResults.push(result.join(':'));
    return allResults;
  } else if (result[strNum] !== -1){
    return extendChord(allResults, result, possibleFrets, strNum+1);
  }
  for(let fret of possibleFrets[strNum]){
    if (fretInRange(fret, result)){
      let newResult = result.slice();
      newResult[strNum] = fret;
      let newPossibleFrets = Object.assign({}, possibleFrets);
      delete newPossibleFrets[strNum];
      let newStrNum = strNum + 1;
      allResults = extendChord(allResults, newResult, newPossibleFrets, newStrNum);
    }
  }
  return allResults;
}

function possibleChordFrets(baseResults){
  let tones = {};
  for (let x of baseResults){
    for(let i=0; i<6;i++){
      if(x[i] !== -1){
        if(!(i in tones)){
          tones[i] = new Set();
        }
        tones[i].add(x[i]);
      }
    }
  }
  return tones;
}


function closestToZeroFret(frets){
  let numbers = frets.split(':').map(Number).filter(a => a !== -1);
  return numbers.reduce((acc, cur) => acc + cur, 0);
}

function minRange(frets){
  let numbers = frets.split(':').map(Number).filter(a => a !== -1);
  numbers.sort((a,b)=> b-a);
  return numbers[0] - numbers[numbers.length-1];
}

function findPossibleApplicatures(allResults, result, notes, start){
  if (notes.length === 0){
    allResults.push(result.join(':'));
    return allResults;
  }
  let nextNote = notes[0];
  for (let i=0; i<6; i++){
    let strNum = (i+start)%6;
    if(result[strNum] === -1){
      let fret = detectFret(nextNote, strNum);
      if (fretInRange(fret, result)){
        let newResult = result.slice();
        newResult[strNum] = fret;
        let newNotes = notes.slice(1);
        let newStart = (strNum+1)%6;
        allResults = findPossibleApplicatures(allResults, newResult, newNotes, newStart);
      }
    }
  }
  return allResults;
}

function fretInRange(fret, result){
  let used = result.filter(a => a > 0);
  if (used.length === 0){
    return true;
  }
  used.push(fret);
  used.sort( (a,b) => b-a);
  let range = Math.abs(used[0] - used[used.length-1]);
  return range < 5;
}

function allNotesExist(notes, chord){
  for(let x of notes){
    let exists = false;
    for(let i=0;i<6;i++){
      if (chord[i] !== -1 && chord[i] === detectFret(x, i)){
        exists = true;
      }
    }
    if(!exists){
      return false;
    }
  }
  return true;
}

function applyAlternativeBass(note, chord){
  let frets = chord.split(' ').map(a=> a=== 'x'? -1 : +a);
  let found = false;
  for (let st=0; st<6; st++){
    let result = frets.slice();
    if (frets[st] < 0){
      let bassFret = detectFret(note, st);
      result.splice(st, 1);
      if (fretInRange(bassFret, result)){
        result.splice(st, 0, bassFret)
        return result.map(a=> a < 0? 'x' : `${a}`).join(' ');
      }
    } else {
      let bassFret = detectFret(note, st);
      result.splice(st, 1);
      if (fretInRange(bassFret, result)){
        result.splice(st, 0, bassFret)
        return result.map(a=> a < 0? 'x' : `${a}`).join(' ');
      }
      break;
    }
  }
  return chord;
  //console.log(note, frets);

}

function detectFret(note, stringIndex){
  let noteIndex = 0;
  while (BASE_TONES[((noteIndex + STRING_OFFSET[stringIndex])%12)] !== note){
    noteIndex = (noteIndex + 1) % 12;
  }
  return noteIndex;
}


function adjacentTone(tone, inc){
  let index = BASE_TONES.indexOf(tone);
  if (inc) {
    index = (index+1)%12;
  }
  else{
    index = (index-1+12)%12;
  }
  return BASE_TONES[index];
}

function fretToHz(st, fr){
  let deltaSemitones = STRING_OFFSET[st] - 24 - 5 + fr;
  return 440 * ((2**(1/12))**(deltaSemitones));
}

function fretOffset(st, fr){
  let deltaSemitones = 29 + STRING_OFFSET[st] - 24 - 5 + fr;
  return deltaSemitones;
}

function otherChordsNames(){
  return Object.keys(CHORD_SEMITONES).filter( a=> !(['','m','7'].includes(a)));
}

function noteToHz(octave, note){
  let deltaSemitones = octave*12 + note - 57; // a4 440Hz
  return 440 * ((2**(1/12))**(deltaSemitones));
}

function readNote(code){
  let [note, octave, upper, lower] = code.split('*');
  return [NOTE_NUMBERS[note], +octave, +upper, +lower];
}

export {adjacentTone, detectApplicature, fretToHz, fretOffset, otherChordsNames,
        noteToHz, readNote, applyAlternativeBass, NOTE_NUMBERS};
