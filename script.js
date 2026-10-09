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

/* ---- Install button (works on every page, every device) ---- */
(function(){
var root=document.body.getAttribute('data-root')||'';
var ua=navigator.userAgent||'';
var ios=/iPhone|iPad|iPod/.test(ua)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
var android=/Android/i.test(ua);
var inApp=/GroupMe|FBAN|FBAV|Instagram|Line\/|MicroMessenger|Snapchat|TikTok|; wv\)|\bwv\b/i.test(ua)||(ios&&!/Safari\//.test(ua));
var iosChrome=ios&&/CriOS|FxiOS|EdgiOS/.test(ua);
var standalone=window.navigator.standalone||(window.matchMedia&&matchMedia('(display-mode: standalone)').matches);
var deferred=null,btns=[].slice.call(document.querySelectorAll('[data-install]'));
if(standalone){btns.forEach(function(b){b.hidden=true});return;}
window.addEventListener('beforeinstallprompt',function(e){e.preventDefault();deferred=e;});
window.addEventListener('appinstalled',function(){btns.forEach(function(b){b.hidden=true});close();});

var modal=document.createElement('div');modal.className='modal';modal.hidden=true;
modal.innerHTML='<div class="modalbox" role="dialog" aria-modal="true" aria-label="Install AI For Life"><button class="x" type="button" aria-label="Close">&times;</button><h3>Install AI For Life</h3><div class="modalbody"></div><div class="btnrow"><button class="btn" type="button" data-mcopy>Copy link</button><button class="btn ghost" type="button" data-mclose>Close</button></div></div>';
document.body.appendChild(modal);
var body=modal.querySelector('.modalbody');
function close(){modal.hidden=true;}
function steps(){
 var u=new URL(root||'./',location.href).href;
 if(inApp)return '<p>This looks like an in-app browser (like GroupMe), which cannot install apps.</p><ol><li>Tap <strong>Copy link</strong> below.</li><li>Open '+(ios?'<strong>Safari</strong>':'<strong>Chrome</strong>')+' and paste the link in the address bar.</li><li>Tap the Install button again there.</li></ol>';
 if(ios&&iosChrome)return '<p>On iPhone, installing only works from Safari.</p><ol><li>Tap <strong>Copy link</strong> below.</li><li>Open <strong>Safari</strong> and paste the link.</li><li>Tap the <strong>Share</strong> icon, then <strong>Add to Home Screen</strong>, then <strong>Add</strong>.</li></ol>';
 if(ios)return '<p>Apple does not let websites install themselves, so it takes 3 taps:</p><ol><li>Tap the <strong>Share</strong> icon in Safari (square with an arrow up). It is at the bottom of the screen, or top right on iPad.</li><li>Scroll down and tap <strong>Add to Home Screen</strong>.</li><li>Tap <strong>Add</strong>. The AI For Life icon appears on your home screen.</li></ol>';
 if(android)return '<ol><li>Tap the <strong>three dots</strong> menu in Chrome.</li><li>Tap <strong>Install app</strong> or <strong>Add to Home screen</strong>.</li><li>Tap <strong>Install</strong>.</li></ol>';
 return '<p>Look for the install icon at the right end of the address bar (Chrome or Edge), or open the browser menu and choose <strong>Install AI For Life</strong>.</p><p>On Firefox or desktop Safari you can bookmark the page instead.</p>';
}
function open(){body.innerHTML=steps();modal.hidden=false;modal.querySelector('[data-mclose]').focus();}
modal.addEventListener('click',function(e){if(e.target===modal||e.target.classList.contains('x')||e.target.hasAttribute('data-mclose'))close();});
modal.querySelector('[data-mcopy]').addEventListener('click',function(e){var b=e.target,u=new URL(root||'./',location.href).href;
 var done=function(t){var o=b.textContent;b.textContent=t;setTimeout(function(){b.textContent=o},1600);};
 (navigator.clipboard?navigator.clipboard.writeText(u):Promise.reject()).then(function(){done('Copied')}).catch(function(){done('Select the link')});});
document.addEventListener('keydown',function(e){if(e.key==='Escape')close();});
btns.forEach(function(b){b.hidden=false;b.addEventListener('click',function(){
 if(deferred){deferred.prompt();deferred.userChoice.finally(function(){deferred=null;});}
 else open();});});
})();
document.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('[data-install-link]');if(a){e.preventDefault();var b=document.querySelector('button[data-install]');if(b)b.click();}});
