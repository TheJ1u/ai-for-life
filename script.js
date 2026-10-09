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

/* ---- next meeting banner: every Thursday 4:00 to 5:00 PM Mountain ---- */
(function(){
var els=document.querySelectorAll('[data-nextmeeting] .nm');if(!els.length)return;
try{
 var f=new Intl.DateTimeFormat('en-US',{timeZone:'America/Denver',year:'numeric',month:'numeric',day:'numeric',hour:'numeric',minute:'numeric',hour12:false,weekday:'short'});
 var parts={};f.formatToParts(new Date()).forEach(function(p){parts[p.type]=p.value;});
 var dow={Sun:0,Mon:1,Tue:2,Wed:3,Thu:4,Fri:5,Sat:6}[parts.weekday];
 var hour=parseInt(parts.hour,10)%24,min=parseInt(parts.minute,10);
 var ahead=(4-dow+7)%7;
 var live=dow===4&&(hour>=16&&hour<17);
 if(dow===4&&hour>=17)ahead=7;
 var d=new Date(Date.UTC(+parts.year,+parts.month-1,+parts.day+ahead,12));
 var label=d.toLocaleDateString('en-US',{timeZone:'UTC',weekday:'long',month:'long',day:'numeric'});
 var txt=live?'Happening now, until 5:00 PM at BYU':(ahead===0?'Today':label)+', 4:00 PM at BYU';
 els.forEach(function(e){e.textContent=txt;});
}catch(e){}
})();

/* ---- prompt library filter ---- */
(function(){
var grid=document.getElementById('pgrid');if(!grid)return;
var q=document.getElementById('pq'),none=document.getElementById('pnone'),cat='all';
function run(){var t=q.value.trim().toLowerCase(),n=0;
 grid.querySelectorAll('.pcard').forEach(function(c){
  var ok=(cat==='all'||c.getAttribute('data-cat')===cat)&&(!t||(c.getAttribute('data-search')||c.textContent.toLowerCase()).indexOf(t)>-1);
  c.hidden=!ok;if(ok)n++;});
 none.hidden=n>0;}
q.addEventListener('input',run);
document.getElementById('chips').addEventListener('click',function(e){var b=e.target.closest('.chip');if(!b)return;
 document.querySelectorAll('.chip').forEach(function(x){x.classList.remove('on')});b.classList.add('on');cat=b.getAttribute('data-c');run();});
})();

/* ---- safe-ai checker ---- */
(function(){
var sel=document.getElementById('sa-select'),out=document.getElementById('sa-result');if(!sel||!out)return;
var R={
public:['green','Generally fine','Public information is low risk. Still check the tool\'s settings, and verify any facts the AI gives back.'],
own:['green','Fine, with a quick check','Your own ideas and drafts are usually fine. Check whether the tool keeps or trains on your chats, and avoid pasting anything you would not want stored.'],
internal:['yellow','Be careful','Pricing, plans and strategy can hurt you if they leak. Use a plan or tool your company approves, or remove names and numbers first.'],
copyright:['yellow','Summarize, do not copy','Pasting whole paid or copyrighted works can break the rules. Summarize in your own words, or ask the AI about public excerpts and link to the source.'],
client:['red','Avoid unless approved','Client and customer details are private. Do not paste them into a general AI tool. Replace names and contact details with placeholders, or use only a tool your organization has approved for client data.'],
health:['red','Do not paste it','Health information is highly sensitive and often legally protected. Keep it out of general AI tools. Use anonymous, made-up examples instead, and follow your organization\'s privacy rules.'],
money:['red','Never paste it','Account numbers and ID numbers (such as a Social Security number) should never go into an AI tool. If you pasted one by mistake, contact the affected person and your organization\'s security contact.'],
secret:['red','Never paste it','Passwords, API keys and tokens give access to your accounts. Never share them with an AI or put them in a public repo. If one leaked, change it immediately.'],
face:['yellow','Get permission first','Do not recreate a real person\'s face or voice without their permission. Do not present AI-made media as real, and follow each platform\'s labeling rules.']
};
sel.addEventListener('change',function(){var r=R[sel.value];if(!r){out.hidden=true;return;}
 out.className='sa-result '+r[0];out.innerHTML='<h3></h3><p></p>';out.querySelector('h3').textContent=r[1];out.querySelector('p').textContent=r[2];out.hidden=false;});
})();

/* ---- cost calculator ---- */
(function(){
var form=document.getElementById('calc');if(!form)return;
var D={videos:8,rate:30,paid:300,hrsnow:2,tool:40,extra:0,hrsai:3},ids=Object.keys(D),el={};
ids.forEach(function(i){el[i]=document.getElementById(i);});
function num(i){var v=parseFloat(el[i].value);return isFinite(v)&&v>=0?v:0;}
function $(n){return (n<0?'-':'')+'$'+Math.abs(Math.round(n)).toLocaleString('en-US');}
function setv(o){ids.forEach(function(i){el[i].value=(o&&o[i]!=null)?o[i]:D[i];});}
var q={};try{new URLSearchParams(location.search).forEach(function(v,k){if(D.hasOwnProperty(k)&&isFinite(parseFloat(v)))q[k]=Math.max(0,parseFloat(v));});}catch(e){}
setv(q);
function t(id,v){document.getElementById(id).textContent=v;}
function run(){
 var v=num('videos'),r=num('rate'),paid=num('paid'),hn=num('hrsnow'),tool=num('tool'),ex=num('extra'),ha=num('hrsai');
 var nowPer=paid+hn*r,aiPer=ex+ha*r,now=v*nowPer,ai=tool+v*aiPer,save=now-ai;
 t('o-now',$(now));t('o-ai',$(ai));t('o-save',$(save));t('o-year',$(save*12));
 var m=Math.max(now,ai,1);document.getElementById('b-now').style.width=(now/m*100)+'%';document.getElementById('b-ai').style.width=(ai/m*100)+'%';
 var msg='';
 if(v===0){msg='Enter how many videos you make per month.';}
 else{
  var gap=nowPer-aiPer;
  if(gap>0){var be=tool/gap;msg='Break-even: AI costs less once you make about '+(be<1?'1':Math.ceil(be))+' video'+(Math.ceil(be)===1||be<1?'':'s')+' a month. ';}
  else{msg='With these numbers, each AI video costs as much as or more than your current way, so the subscription does not pay off. ';}
  if(r>0){var mh=(nowPer-ex-tool/v)/r;if(mh>0)msg+='AI stays cheaper as long as a video takes you under '+(Math.round(mh*10)/10)+' hours.';}
 }
 t('o-text',msg);
 try{var p=new URLSearchParams();ids.forEach(function(i){p.set(i,num(i));});history.replaceState(null,'','?'+p.toString());}catch(e){}
}
ids.forEach(function(i){el[i].addEventListener('input',run);});
document.getElementById('calc-reset').addEventListener('click',function(){setv(null);run();});
document.getElementById('calc-copy').addEventListener('click',function(e){var b=e.target,o=b.textContent;
 (navigator.clipboard?navigator.clipboard.writeText(location.href):Promise.reject()).then(function(){b.textContent='Copied'}).catch(function(){b.textContent='Copy the address bar'});setTimeout(function(){b.textContent=o},1600);});
run();
})();

/* ---- resume bullet builder + proof links ---- */
(function(){
var out=document.getElementById('rb-out');
function g(i){var e=document.getElementById(i);return e?e.value.trim():'';}
function block(title,text){var d=document.createElement('div');var h=document.createElement('h3');h.textContent=title;d.appendChild(h);
 var c=document.createElement('div');c.className='code';var b=document.createElement('button');b.className='copy';b.type='button';b.textContent='Copy';
 var pre=document.createElement('pre');pre.textContent=text;b.addEventListener('click',function(){(navigator.clipboard?navigator.clipboard.writeText(text):Promise.reject()).then(function(){b.textContent='Copied';setTimeout(function(){b.textContent='Copy'},1500)}).catch(function(){});});
 c.appendChild(b);c.appendChild(pre);d.appendChild(c);return d;}
function build(){
 if(!out)return;out.innerHTML='';
 var lv=g('rb-level'),what=g('rb-what'),topic=g('rb-topic'),link=g('rb-link'),res=g('rb-result'),ai=g('rb-ai')==='yes';
 if(!what){var p=document.createElement('p');p.className='note';p.textContent='Fill in "What you added" to see your bullets.';out.appendChild(p);return;}
 var aiTxt=ai?' with AI assistance':'';
 var proof=link?' ('+link+')':'';
 var resTxt=res?'; '+res:'';
 var role=lv==='Maintainer'?'Maintain and review contributions to':'Contributed to';
 out.appendChild(block('Resume bullet (short)',role+' AI For Life, a student-run club knowledge site on GitHub Pages: added '+what+(topic?' covering '+topic:'')+aiTxt+' through a reviewed pull request'+resTxt+proof+'.'));
 out.appendChild(block('Resume bullet (skills focus)','Wrote beginner-friendly documentation'+(topic?' on '+topic:'')+' and submitted it via Git and GitHub pull requests, practicing code review and open-source collaboration'+aiTxt+proof+'.'));
 out.appendChild(block('LinkedIn project description','AI For Life Club Website. A shared learning site for our AI club. I '+(lv==='Maintainer'?'help review and merge contributions and ':'')+'added '+what+(topic?' about '+topic:'')+aiTxt+'. Skills: GitHub, pull requests, technical writing'+(topic?', '+topic:'')+'.'+(res?' '+res.charAt(0).toUpperCase()+res.slice(1)+'.':'')+(link?' Proof: '+link:'')));
}
['rb-level','rb-what','rb-topic','rb-link','rb-result','rb-ai'].forEach(function(i){var e=document.getElementById(i);if(e){e.addEventListener('input',build);e.addEventListener('change',build);}});
build();
var u=document.getElementById('vf-user'),vo=document.getElementById('vf-out');
if(u&&vo)u.addEventListener('input',function(){
 var n=u.value.trim().replace(/[^A-Za-z0-9-]/g,'');vo.innerHTML='';if(!n)return;
 var R='https://github.com/TheJ1u/ai-for-life';
 [['Your pull requests to this site',R+'/pulls?q=is%3Apr+author%3A'+n],['Your commits to this site',R+'/commits?author='+n],['Your GitHub profile','https://github.com/'+n]].forEach(function(x){
  var li=document.createElement('li'),a=document.createElement('a');a.href=x[1];a.target='_blank';a.rel='noopener';a.textContent=x[0]+' ↗';li.appendChild(a);vo.appendChild(li);});
});
})();
