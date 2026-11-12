export type BuilderSection={id:string;title:string;body:string};
export type BuilderDocument={name:string;headline:string;sections:BuilderSection[];theme:'classic'|'modern'|'compact'};
export const builderKey=(uid:string)=>'cvmatch_builder_v1_'+uid;
const initialTitles=['Əlaqə','Peşəkar xülasə','Bacarıqlar','Təcrübə','Layihələr','Təhsil','Sertifikatlar'];
export function defaultBuilder(raw=''):BuilderDocument{
 const lines=raw.split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
 return {name:(lines[0]||'Ad Soyad').slice(0,120),headline:'',theme:'modern',sections:initialTitles.map((title,i)=>({id:'section-'+i,title,body:i===1?lines.slice(1).join('\n').slice(0,15000):''}))};
}
export function cleanBuilder(value:unknown):BuilderDocument{
 if(!value||typeof value!=='object')return defaultBuilder();
 const p=value as Partial<BuilderDocument>;
 const sections=Array.isArray(p.sections)?p.sections.filter(x=>x&&typeof x.id==='string'&&typeof x.title==='string'&&typeof x.body==='string').slice(0,18).map(x=>({id:x.id.slice(0,90),title:x.title.slice(0,90),body:x.body.slice(0,15000)})):[];
 return {name:typeof p.name==='string'?p.name.slice(0,120):'',headline:typeof p.headline==='string'?p.headline.slice(0,180):'',sections,theme:p.theme==='classic'||p.theme==='compact'?'classic'===p.theme?'classic':'compact':'modern'};
}
export function moveBuilderSection(sections:BuilderSection[],from:number,to:number):BuilderSection[]{
 if(from<0||to<0||from>=sections.length||to>=sections.length||from===to)return sections;
 const next=sections.slice(),[moved]=next.splice(from,1);next.splice(to,0,moved);return next;
}
export function builderText(p:BuilderDocument):string{
 return [p.name,p.headline,...p.sections.flatMap(s=>s.body.trim()?[s.title.toUpperCase(),s.body.trim()]:[])].filter(Boolean).join('\n\n');
}
export function escapePortfolioHtml(value:string):string{
 return value.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]||c));
}
export function safePortfolioLink(value:string):string{
 try{const url=new URL(value);return ['https:','http:'].includes(url.protocol)?url.href:''}catch{return ''}
}
export type PortfolioData={name:string;headline:string;about:string;skills:string;github:string;linkedin:string;projects:{id:string;title:string;description:string;link:string}[]};
export function cleanPortfolio(value:unknown):PortfolioData{
 const p=value&&typeof value==='object'?value as Partial<PortfolioData>:{};
 const clean=(v:unknown,max:number)=>typeof v==='string'?v.slice(0,max):'';
 return {name:clean(p.name,120),headline:clean(p.headline,180),about:clean(p.about,3500),skills:clean(p.skills,1500),github:safePortfolioLink(clean(p.github,1000)),linkedin:safePortfolioLink(clean(p.linkedin,1000)),projects:Array.isArray(p.projects)?p.projects.filter(x=>x&&typeof x.title==='string'&&typeof x.description==='string').slice(0,12).map(x=>({id:clean(x.id,90),title:clean(x.title,150),description:clean(x.description,1500),link:safePortfolioLink(clean(x.link,1000))})):[]};
}
export function portfolioHtml(p:PortfolioData):string{
 const h=escapePortfolioHtml,links=[['GitHub',p.github],['LinkedIn',p.linkedin]].filter(x=>safePortfolioLink(x[1]));
 const cards=p.projects.map(x=>'<article><h3>'+h(x.title)+'</h3><p>'+h(x.description)+'</p>'+(safePortfolioLink(x.link)?'<a href="'+h(safePortfolioLink(x.link))+'" rel="noopener noreferrer" target="_blank">Layihəyə bax</a>':'')+'</article>').join('');
 return '<!doctype html><html lang="az"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+h(p.name)+' — Portfolio</title><style>body{margin:0;background:#0c1426;color:#f3f7fd;font:16px system-ui;line-height:1.7}main{max-width:900px;margin:auto;padding:64px 22px}h1{font-size:clamp(36px,6vw,65px);line-height:1.1}h2{margin-top:40px}p{white-space:pre-wrap}article{border:1px solid #40516a;padding:22px;border-radius:14px;margin:14px 0}a{color:#8df4d2;margin-right:20px}.tag{display:inline-block;border:1px solid #466075;border-radius:20px;padding:4px 12px;margin:4px}small{color:#9fb5c9}</style></head><body><main><small>PORTFOLIO</small><h1>'+h(p.name)+'</h1><h2>'+h(p.headline)+'</h2><p>'+h(p.about)+'</p><nav>'+links.map(x=>'<a href="'+h(safePortfolioLink(x[1]))+'" target="_blank" rel="noopener noreferrer">'+h(x[0])+'</a>').join('')+'</nav><h2>Bacarıqlar</h2>'+p.skills.split(/[,\n]/).filter(Boolean).map(x=>'<span class="tag">'+h(x.trim())+'</span>').join('')+'<h2>Layihələr</h2>'+cards+'</main></body></html>';
}
