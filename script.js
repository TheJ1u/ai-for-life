document.querySelectorAll('[data-copy]').forEach(function(b){b.addEventListener('click',function(){
var t=b.parentElement.querySelector('pre').innerText;
(navigator.clipboard?navigator.clipboard.writeText(t):Promise.reject()).then(function(){b.textContent='Copied';setTimeout(function(){b.textContent='Copy'},1500)}).catch(function(){b.textContent='Select + copy'});});});
var q=document.getElementById('q');
if(q){q.addEventListener('input',function(){
var v=q.value.toLowerCase().trim(),shown=0;
document.querySelectorAll('.term').forEach(function(el){var m=!v||el.dataset.term.indexOf(v)>-1;el.hidden=!m;if(m)shown++;});
document.getElementById('none').hidden=shown>0;});}

/* ---- site-wide search, share, install, offline ---- */
(function(){
var root=document.body.getAttribute('data-root')||'';
var siteUrl=new URL(root||'./',location.href).href.replace(/index\.html$/,'');
var linkEl=document.getElementById('linktext');if(linkEl)linkEl.textContent=siteUrl;

function flash(btn,txt){var o=btn.textContent;btn.textContent=txt;setTimeout(function(){btn.textContent=o},1600);}
function copy(t){return navigator.clipboard?navigator.clipboard.writeText(t):Promise.reject();}
document.querySelectorAll('[data-share]').forEach(function(b){b.addEventListener('click',function(){
 var data={title:'AI For Life',text:'AI tool guides and a glossary from the AI For Life club',url:siteUrl};
 if(navigator.share){navigator.share(data).catch(function(){});}
 else{copy(siteUrl).then(function(){flash(b,'Link copied')}).catch(function(){flash(b,'Copy the link below')});}
});});
document.querySelectorAll('[data-copylink]').forEach(function(b){b.addEventListener('click',function(){
 copy(siteUrl).then(function(){flash(b,'Copied')}).catch(function(){flash(b,'Select the link')});});});

var deferred=null;
window.addEventListener('beforeinstallprompt',function(e){e.preventDefault();deferred=e;
 document.querySelectorAll('[data-install]').forEach(function(b){b.hidden=false;});});
document.querySelectorAll('[data-install]').forEach(function(b){b.addEventListener('click',function(){
 if(!deferred)return;deferred.prompt();deferred.userChoice.finally(function(){deferred=null;b.hidden=true;});});});

if('serviceWorker' in navigator && location.protocol.indexOf('http')===0){
 navigator.serviceWorker.register(root+'sw.js').catch(function(){});}

var box=document.getElementById('site-search'),res=document.getElementById('results'),idx=null,loading=null;
if(!box||!res)return;
function load(){if(idx)return Promise.resolve(idx);
 if(!loading)loading=fetch(root+'search-index.json').then(function(r){return r.json()}).then(function(j){idx=j;return j}).catch(function(){idx=[];return idx;});
 return loading;}
function esc(s){return s.replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]});}
function hi(s,toks){var out=esc(s);toks.forEach(function(t){if(t.length<2)return;out=out.replace(new RegExp('('+t.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+')','ig'),'<mark>$1</mark>');});return out;}
function snippet(x,toks){var l=x.toLowerCase(),p=-1;for(var i=0;i<toks.length;i++){p=l.indexOf(toks[i]);if(p>-1)break;}
 if(p<0)return x.slice(0,110);var s=Math.max(0,p-45);return (s>0?'…':'')+x.slice(s,s+120)+(s+120<x.length?'…':'');}
function run(){var q=box.value.trim().toLowerCase();
 if(!q){res.hidden=true;return;}
 var toks=q.split(/\s+/).filter(Boolean);
 load().then(function(d){
  var hits=[];d.forEach(function(e){var t=e.t.toLowerCase(),x=e.x.toLowerCase(),sc=0,ok=true;
   toks.forEach(function(k){var inT=t.indexOf(k)>-1,inX=x.indexOf(k)>-1;if(!inT&&!inX){ok=false;return;}
    sc+=inT?(t===k?30:10):0;sc+=inX?2:0;});
   if(ok){if(e.k==='Glossary')sc+=1;hits.push({e:e,s:sc});}});
  hits.sort(function(a,b){return b.s-a.s});hits=hits.slice(0,8);
  if(!hits.length){res.innerHTML='<div class="empty">No matches. Try a different word.</div>';res.hidden=false;return;}
  res.innerHTML=hits.map(function(h){return '<a href="'+root+h.e.u+'"><span class="kind">'+h.e.k+'</span><strong>'+hi(h.e.t,toks)+'</strong><small>'+hi(snippet(h.e.x,toks),toks)+'</small></a>';}).join('');
  res.hidden=false;});}
box.addEventListener('input',run);box.addEventListener('focus',function(){load();if(box.value.trim())run();});
document.addEventListener('keydown',function(e){
 if(e.key==='/'&&document.activeElement!==box&&!/input|textarea/i.test(document.activeElement.tagName)){e.preventDefault();box.focus();}
 if(e.key==='Escape'){res.hidden=true;box.blur();}});
document.addEventListener('click',function(e){if(!res.contains(e.target)&&e.target!==box)res.hidden=true;});
})();
/* iPhone/iPad: Safari has no install button, so show the manual steps */
(function(){
var ua=navigator.userAgent||'';
var ios=/iPhone|iPad|iPod/.test(ua)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
var standalone=window.navigator.standalone||(window.matchMedia&&matchMedia('(display-mode: standalone)').matches);
var anchor=document.querySelector('[data-install]');
if(!anchor||standalone)return;
if(ios){var d=document.createElement('div');d.className='iostip';
 d.innerHTML='<strong>On iPhone or iPad:</strong> there is no install button. Tap the <strong>Share</strong> icon in Safari (square with an arrow), then <strong>Add to Home Screen</strong>, then <strong>Add</strong>.';
 anchor.parentNode.insertBefore(d,anchor);}
})();
