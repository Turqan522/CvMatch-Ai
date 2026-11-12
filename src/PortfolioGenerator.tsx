import {useEffect,useState} from 'react';
import {Download,ExternalLink,Plus,Trash2} from 'lucide-react';
import {cleanPortfolio,portfolioHtml,type PortfolioData} from './lib/creativeStudio';
import {fetchGithubProfile} from './lib/career';
import './creative-studio.css';
const key=(uid:string)=>'cvmatch_portfolio_v1_'+uid;
function initial(uid:string,name:string):PortfolioData{
 try{const saved=localStorage.getItem(key(uid));if(saved)return cleanPortfolio(JSON.parse(saved));const draft=JSON.parse(localStorage.getItem('cvmatch_draft_v1_'+uid)||'{}');
 return cleanPortfolio({name,headline:'',about:typeof draft.cv==='string'?draft.cv.slice(0,900):'',skills:'',projects:[]});
 }catch{return cleanPortfolio({name,projects:[]})}
}
export default function PortfolioGenerator({userId,name}:{userId:string;name:string}){
 const [p,setP]=useState(()=>initial(userId,name)),[status,setStatus]=useState(''),[busy,setBusy]=useState(false);
 const set=(next:Partial<PortfolioData>)=>setP(prev=>({...prev,...next}));
 useEffect(()=>{try{localStorage.setItem(key(userId),JSON.stringify(p));setStatus('Bu cihazda saxlanıldı')}catch{setStatus('Brauzerə yazmaq alınmadı')}},[userId,p]);
 const github=async()=>{
  if(!p.github.trim())return;
  setBusy(true);try{
   const profile=await fetchGithubProfile(p.github);
   const projects=profile.repos.slice(0,6).map(r=>({id:'github-'+r.name,title:r.name,description:r.description||r.language||'GitHub layihəsi',link:r.html_url||''}));
   const existing=p.projects.filter(x=>!x.id.startsWith('github-'));
   set({projects:[...existing,...projects].slice(0,12)});setStatus('Açıq GitHub layihələri gətirildi. Məlumatları yoxlayıb redaktə et.');
  }catch{setStatus('GitHub layihələri alınmadı. Linki yoxla.')}finally{setBusy(false)}
 };
 const patchProject=(id:string,key:'title'|'description'|'link',value:string)=>set({projects:p.projects.map(x=>x.id===id?{...x,[key]:value}:x)});
 const saveHtml=()=>{const source=portfolioHtml(cleanPortfolio(p));const blob=new Blob([source],{type:'text/html;charset=utf-8'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='CVMatch_Portfolio.html';a.click();setTimeout(()=>URL.revokeObjectURL(url),2000);setStatus('Portfolio HTML faylı yükləndi. Paylaşmaq üçün ayrıca hostinqə yerləşdirilməlidir.')};
 return <main className="app-shell creative-page"><header className="ci-hero"><span className="eyebrow">CAREER · PORTFOLIO STUDIO</span><h1>AI Portfolio Generator</h1><p>CV və açıq GitHub layihələrindən redaktə edilən şəxsi portfolio yarat. Hazır HTML faylını yükləyib istədiyin hostinqdə paylaş.</p></header>
 <div className="creative-layout"><section className="ci-card"><h2>Portfolio məlumatları</h2>
  <label>Ad və soyad<input maxLength={120} value={p.name} onChange={e=>set({name:e.target.value})}/></label>
  <label>Peşəkar başlıq<input maxLength={180} value={p.headline} onChange={e=>set({headline:e.target.value})} placeholder="Data Scientist • ML Engineer"/></label>
  <label>Haqqımda<textarea rows={5} maxLength={3500} value={p.about} onChange={e=>set({about:e.target.value})}/></label>
  <label>Bacarıqlar (vergüllə ayır)<textarea rows={3} maxLength={1500} value={p.skills} onChange={e=>set({skills:e.target.value})} placeholder="Python, SQL, ML"/></label>
  <label>GitHub (açıq profil linki)<input type="url" value={p.github} onChange={e=>set({github:e.target.value})} placeholder="https://github.com/username"/></label>
  <label>LinkedIn (link)<input type="url" value={p.linkedin} onChange={e=>set({linkedin:e.target.value})}/></label>
  <button className="btn secondary" disabled={busy||!p.github} onClick={()=>void github()}>{busy?'Yüklənir…':'GitHub layihələrini gətir'}</button>
  <h3>Layihələr ({p.projects.length}/12)</h3>
  {p.projects.map(x=><article className="creative-editor-section" key={x.id}><div className="creative-section-header"><strong>{x.title||'Layihə'}</strong><button className="ci-small-button" aria-label="Layihəni sil" onClick={()=>set({projects:p.projects.filter(y=>y.id!==x.id)})}><Trash2 size={16}/></button></div><label>Başlıq<input value={x.title} maxLength={150} onChange={e=>patchProject(x.id,'title',e.target.value)}/></label><label>Təsvir<textarea rows={3} value={x.description} maxLength={1500} onChange={e=>patchProject(x.id,'description',e.target.value)}/></label><label>Layihə linki<input value={x.link} onChange={e=>patchProject(x.id,'link',e.target.value)}/></label></article>)}
  <div className="creative-toolbar"><button className="btn secondary" disabled={p.projects.length>=12} onClick={()=>set({projects:[...p.projects,{id:crypto.randomUUID(),title:'',description:'',link:''}]})}><Plus size={16}/> Layihə əlavə et</button><button className="btn primary" onClick={saveHtml}><Download size={16}/> HTML portfolio yüklə</button></div><p className="ci-hint" role="status">{status}</p>
 </section><aside className="ci-card creative-preview"><h2>Canlı portfolio önizləməsi</h2><div className="creative-paper" data-template="modern"><h2>{p.name||'Ad Soyad'}</h2><p className="creative-headline">{p.headline}</p><p style={{whiteSpace:'pre-wrap'}}>{p.about}</p><div className="creative-actions">{p.github&&<a href={p.github} target="_blank" rel="noopener noreferrer">GitHub <ExternalLink size={13}/></a>}{p.linkedin&&<a href={p.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn <ExternalLink size={13}/></a>}</div><h3>Bacarıqlar</h3><div>{p.skills.split(/[,\n]/).filter(Boolean).map((s,i)=><span className="creative-badge" key={i}>{s.trim()}</span>)}</div><h3>Layihələr</h3>{p.projects.length?p.projects.map(x=><article className="creative-project" key={x.id}><strong>{x.title}</strong><p style={{whiteSpace:'pre-wrap'}}>{x.description}</p>{x.link&&<a href={x.link} target="_blank" rel="noopener noreferrer">Layihəyə bax</a>}</article>):<p className="ci-hint">GitHub layihələrini gətir və ya əlavə et.</p>}</div><p className="ci-hint">Yalnız ictimai paylaşmaq istədiyin məlumatları daxil et. Fayl brauzerində yaradılır və avtomatik yayımlanmır.</p></aside></div>
 </main>;
}