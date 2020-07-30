for (let a of [...document.querySelectorAll('a')]){
  if (a.href === window.location.href){
    a.classList.add('current-location');
  }
}
