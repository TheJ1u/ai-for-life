document.querySelectorAll('[data-copy]').forEach(function(b){b.addEventListener('click',function(){
var t=b.parentElement.querySelector('pre').innerText;
(navigator.clipboard?navigator.clipboard.writeText(t):Promise.reject()).then(function(){b.textContent='Copied';setTimeout(function(){b.textContent='Copy'},1500)}).catch(function(){b.textContent='Select + copy'});});});
var q=document.getElementById('q');
if(q){q.addEventListener('input',function(){
var v=q.value.toLowerCase().trim(),shown=0;
document.querySelectorAll('.term').forEach(function(el){var m=!v||el.dataset.term.indexOf(v)>-1;el.hidden=!m;if(m)shown++;});
document.getElementById('none').hidden=shown>0;});}
