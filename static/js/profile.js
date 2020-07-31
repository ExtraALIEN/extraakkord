function requestChangePassword(event){
  event.preventDefault();
  let options = {method: 'POST',
                 body: new FormData(event.target)};
  fetch(event.target.action, options).then(res => res.json())
                                     .then(data => populateStatus(data));
}

function populateStatus(data){
  let status = document.getElementById('status');
  status.innerHTML = '';
  for (let x in data){
    let p = document.createElement('p');
    p.className = `ajax-${x}`;
    p.innerHTML = data[x];
    status.append(p);
    console.log(p);
  }
}

let psform = document.getElementById('change-password');
psform.addEventListener('submit', requestChangePassword);
