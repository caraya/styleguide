/*
* Uses font face observer to load all fonts needed for the document.
*
* Requires font-face observer to be loaded before this script
* */

const mono = new FontFaceObserver('notomono_regular');
const sans = new FontFaceObserver('notosans_regular');
const italic = new FontFaceObserver('notosans_italics');
const bold = new FontFaceObserver('notosans_bold');
const bolditalic = new FontFaceObserver('notosans_bolditalic');

let html = document.documentElement;

html.classList.add('fonts-loading');

Promise.all([
  mono.load(), sans.load(), italic.load(), bolditalic.load()
]).then(() => {
  html.classList.remove('fonts-loading');
  html.classList.add('fonts-loaded');
  console.log('All fonts have loaded.');
}).catch(() =>{
  html.classList.remove('fonts-loading');
  html.classList.add('fonts-failed');
  console.log('One or more fonts failed to load')
});
