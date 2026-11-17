const FEEDS = {
  epargne: [
    ['Le Canard enchaîné','https://www.lecanardenchaine.fr/rss/index.xml','fr'],
    ['Mediapart','https://www.mediapart.fr/articles/feed','fr'],
    ['Blast','https://api.blast-info.fr/rss.xml','fr'],
    ['The Intercept','https://theintercept.com/feed/?rss','en'],
    ['ProPublica','https://www.propublica.org/feeds/propublica/main','en'],
    ['Follow the Money','https://www.ftm.eu/rss','en']
  ],
  economie: [
    ['Le Canard enchaîné','https://www.lecanardenchaine.fr/rss/index.xml','fr'],
    ['Mediapart','https://www.mediapart.fr/articles/feed','fr'],
    ['Blast','https://api.blast-info.fr/rss.xml','fr'],
    ['Basta!','https://basta.media/spip.php?page=backend','fr'],
    ['The Intercept','https://theintercept.com/feed/?rss','en'],
    ['ProPublica','https://www.propublica.org/feeds/propublica/main','en'],
    ['openDemocracy','https://www.opendemocracy.net/rss/','en']
  ],
  industrie: [
    ['Le Canard enchaîné','https://www.lecanardenchaine.fr/rss/index.xml','fr'],
    ['Blast','https://api.blast-info.fr/rss.xml','fr'],
    ['Mediapart','https://www.mediapart.fr/articles/feed','fr'],
    ['The Intercept','https://theintercept.com/feed/?rss','en'],
    ['ProPublica','https://www.propublica.org/feeds/propublica/main','en'],
    ['openDemocracy','https://www.opendemocracy.net/rss/','en']
  ],
  ia: [
    ['Le Canard enchaîné','https://www.lecanardenchaine.fr/rss/index.xml','fr'],
    ['The Intercept','https://theintercept.com/feed/?rss','en'],
    ['ProPublica','https://www.propublica.org/feeds/propublica/main','en'],
    ['Mediapart','https://www.mediapart.fr/articles/feed','fr'],
    ['Blast','https://api.blast-info.fr/rss.xml','fr'],
    ['Democracy Now!','https://www.democracynow.org/democracynow.rss','en']
  ],
  rse: [
    ['Le Canard enchaîné','https://www.lecanardenchaine.fr/rss/index.xml','fr'],
    ['Reporterre','https://reporterre.net/spip.php?page=backend-simple','fr'],
    ['Blast','https://api.blast-info.fr/rss.xml','fr'],
    ['Mediapart','https://www.mediapart.fr/articles/feed','fr'],
    ['The Intercept','https://theintercept.com/feed/?rss','en'],
    ['ProPublica','https://www.propublica.org/feeds/propublica/main','en'],
    ['Democracy Now!','https://www.democracynow.org/democracynow.rss','en'],
    ['DeSmog','https://www.desmog.com/feed/','en'],
    ['openDemocracy','https://www.opendemocracy.net/rss/','en']
  ]
};
const headers={'content-type':'application/json; charset=utf-8','cache-control':'public, max-age=180, s-maxage=180'};
function decode(s=''){return s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g,'$1').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;|&apos;/g,"'").replace(/&#(\d+);/g,(_,n)=>String.fromCodePoint(+n)).replace(/&#x([0-9a-f]+);/gi,(_,n)=>String.fromCodePoint(parseInt(n,16)));}
function clean(s=''){return decode(s.replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim());}
function field(block,name){let m=block.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${name}>`,'i'));return m?clean(m[1]):'';}
function linkOf(block){let m=block.match(/<link[^>]*href=["']([^"']+)["'][^>]*\/?>/i);return m?decode(m[1]):field(block,'link');}
function dateOf(block){return field(block,'pubDate')||field(block,'published')||field(block,'updated')||new Date().toISOString();}
function imgOf(block){let m=block.match(/<(?:media:content|media:thumbnail|enclosure)[^>]*url=["']([^"']+)["']/i);return m?decode(m[1]):'';}
function translateUrl(text){return 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=fr&dt=t&q='+encodeURIComponent(text);}
async function translate(text){
  if(!text||text.length<2)return text;
  try{
    const r=await fetch(translateUrl(text.slice(0,850)),{signal:AbortSignal.timeout(6500)});
    if(!r.ok)return text;
    const j=await r.json();
    return (j[0]||[]).map(x=>x[0]||'').join('')||text;
  }catch{return text;}
}
async function fetchFeed(feed){
 const [source,url,language]=feed;
 const r=await fetch(url,{headers:{'user-agent':'LeFil/1.0 (+RSS reader)','accept':'application/rss+xml, application/atom+xml, application/xml, text/xml'},signal:AbortSignal.timeout(9000)});
 if(!r.ok)throw new Error(source+' HTTP '+r.status);
 const xml=await r.text();
 const blocks=[...xml.matchAll(/<(item|entry)(?:\s[^>]*)?>([\s\S]*?)<\/\1>/gi)].map(m=>m[2]);
 return blocks.slice(0,8).map(b=>({source,language,originalTitle:field(b,'title'),originalSummary:field(b,'description')||field(b,'summary')||field(b,'content:encoded'),link:linkOf(b),date:dateOf(b),image:imgOf(b)})).filter(x=>x.originalTitle&&/^https?:\/\//i.test(x.link));
}
exports.handler=async(event)=>{
 const params=event.queryStringParameters||{};
 if(params.catalog==='1')return{statusCode:200,headers,body:JSON.stringify({sources:[{name:'Le Canard enchaîné',status:'active',feeds:['https://www.lecanardenchaine.fr/rss/index.xml','https://www.lecanardenchaine.fr/rss/categories/politique.xml','https://www.lecanardenchaine.fr/rss/categories/societe.xml','https://www.lecanardenchaine.fr/rss/categories/medias.xml','https://www.lecanardenchaine.fr/rss/categories/international.xml']},{name:'Charlie Hebdo',status:'catalogue-only',website:'https://charliehebdo.fr/',feeds:['https://charliehebdo.fr/tag/iran/feed/','https://charliehebdo.fr/tag/turquie/feed/'],note:'Flux thématiques uniquement ; aucun flux général validé.'}]})};
 const topic=params.topic;
 if(!FEEDS[topic])return{statusCode:400,headers,body:JSON.stringify({error:'Rubrique inconnue'})};
 const settled=await Promise.allSettled(FEEDS[topic].map(fetchFeed));
 const raw=settled.filter(x=>x.status==='fulfilled').flatMap(x=>x.value);
 const unique=new Map();raw.forEach(x=>{if(!unique.has(x.link))unique.set(x.link,x);});
 const chosen=[...unique.values()].sort((a,b)=>new Date(b.date)-new Date(a.date)).slice(0,18);
 const translated=await Promise.all(chosen.map(async x=>{
   if(x.language==='fr')return{...x,title:x.originalTitle,summary:x.originalSummary.slice(0,420),translated:false};
   const [title,summary]=await Promise.all([translate(x.originalTitle),translate(x.originalSummary.slice(0,850))]);
   return{...x,title,summary:summary.slice(0,420),translated:title!==x.originalTitle};
 }));
 return{statusCode:200,headers,body:JSON.stringify({items:translated,updatedAt:new Date().toISOString(),sources:FEEDS[topic].length,failedFeeds:settled.filter(x=>x.status==='rejected').length})};
};
