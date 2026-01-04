document.querySelectorAll('.nav-button').forEach(btn => {
  if (btn.href === window.location.href) {
    btn.classList.add('active-page');
  }
});
//Essientially shows what webpage the user is on(in the footer)