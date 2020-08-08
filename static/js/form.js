import {postAjax} from './ajax.js';

let forms = document.querySelectorAll('.ajax');
for (let form of [...forms]){
  form.addEventListener('submit', postAjax);
}
