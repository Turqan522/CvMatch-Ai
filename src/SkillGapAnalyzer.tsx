import {useMemo,useState} from 'react';
import {BookOpen,CheckCircle2,Target,ArrowUpRight} from 'lucide-react';
import {compareJob} from './lib/careerInsights';
import {extractSkills} from './lib/scoring';
import './creative-studio.css';
const suggestions:Record<string,{task:string;resource:string;url:string}>={
 Python:{task:'Python-da məlumat təmizləmə və fayl emalı mini-layihəsi yarat.',resource:'Python rəsmi təlimatı',url:'https://docs.python.org/3/tutorial/'},
 SQL:{task:'GROUP BY, JOIN və pəncərə funksiyaları ilə 3 SQL sorğusu yaz.',resource:'PostgreSQL təlimatı',url:'https://www.postgresql.org/docs/current/tutorial.html'},
 JavaScript:{task:'DOM və fetch istifadə edən kiçik interaktiv səhifə yarat.',resource:'MDN JavaScript',url:'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide'},
 React:{task:'React komponentləri və state ilə kiçik dashboard hazırla.',resource:'React sənədləri',url:'https://react.dev/learn'},
 Docker:{task:'Sadə API-ni Dockerfile ilə konteynerləşdir.',resource:'Docker təlimatı',url:'https://docs.docker.com/get-started/'},
 Git:{task:'Git branch, pull request və commit tarixçəsi ilə portfolio repozitoriyası hazırla.',resource:'Git kitabı',url:'https://git-scm.com/book/en/v2'},
 'Machine Learning':{task:'Kiçik dataset üçün train/test və qiymətləndirmə pipeline-ı yarat.',resource:'Scikit-learn təlimatı',url:'https://scikit-learn.org/stable/tutorial/index.html'}
};
function saved(uid:string){try{const x=JSON.parse(localStorage.getItem('cvmatch_draft_v1_'+uid)||'{}');return {cv:typeof x.cv==='string'?x.cv:'',job:typeof x.job==='string'?x.job:''}}catch{return{cv:'',job:''}}}
export default function SkillGapAnalyzer({userId}:{userId:string}){
 const initial=useMemo(()=>saved(userId),[userId]);
 const [cv,setCv]=useState(initial.cv),[job,setJob]=useState(initial.job),[done,setDone]=useState(false);
 const result=useMemo(()=>compareJob(cv,job),[cv,job]);
 const required=extractSkills(job),matched=result.cvResult.matched,missing=result.cvResult.missing;
 const run=()=>setDone(true);
 return <main className="app-shell creative-page ci-page"><header className="ci-hero"><span className="eyebrow">AI CAREER · SKILL GAP</span><h1>Skill Gap Analyzer</h1><p>Vakansiyanın texniki tələblərini CV-də qeyd edilən bacarıqlarla müqayisə et və konkret inkişaf planı qur. Bu yerli, izah oluna bilən termin analizidir.</p></header>
 <div className="ci-layout"><section className="ci-card"><h2><BookOpen size={20}/> Məlumatların</h2><label>CV mətni<textarea rows={9} value={cv} onChange={e=>{setCv(e.target.value);setDone(false)}}/></label><label>Vakansiya təsviri<textarea rows={8} value={job} onChange={e=>{setJob(e.target.value);setDone(false)}}/></label><div className="creative-actions"><button className="btn primary" disabled={cv.trim().length<30||job.trim().length<30} onClick={run}><Target size={17}/> Boşluqları analiz et</button><button className="btn secondary" onClick={()=>{const v=saved(userId);setCv(v.cv);setJob(v.job);setDone(false)}}>Saxlanmış CV-ni gətir</button></div></section>
 <section className="ci-card"><h2><Target size={20}/> Nəticə və öyrənmə planı</h2>{!done?<div className="creative-empty">CV və vakansiyanı daxil edib analizi başlat.</div>:<><p className="ci-hint">Tanınan {required.length} texniki tələbdən {matched.length}-i CV-də görünür. Bu işə qəbul ehtimalı deyil.</p>{required.length<3&&<p className="ci-warning">Vakansiyada tanınan bacarıqlar azdır. Nəticə natamam ola bilər.</p>}<div className="creative-grid"><article className="studio-insight-panel"><h3>CV-də olanlar</h3>{matched.length?matched.map(s=><p key={s} className="creative-badge"><CheckCircle2 size={14}/>{s}</p>):<p className="ci-hint">Tanınan uyğunluq yoxdur.</p>}</article><article className="studio-insight-panel"><h3>Öyrənilməli / sübut edilməli</h3>{missing.length?missing.map(s=><p key={s} className="creative-badge">{s}</p>):<p className="ci-hint">Tanınan tələblər arasında boşluq yoxdur.</p>}</article></div><h3>Fərdi inkişaf addımları</h3>{missing.length?missing.map((s,i)=>{const resource=suggestions[s];return <article key={s} className="creative-project"><strong>{i+1}. {s}</strong><p>{resource?.task||'Bu texnologiya üzrə əsasları öyrən, praktik mini-layihə hazırla və əldə etdiyin nəticəni GitHub-da sənədləşdir.'}</p>{resource&&<a href={resource.url} target="_blank" rel="noopener noreferrer">{resource.resource} <ArrowUpRight size={14}/></a>}</article>}):<p className="ci-hint">Vacib: CV-də bir bacarığın adının olması həmin bacarığın sübutu deyil. Layihə və nəticələri göstər.</p>}<p className="ci-hint">Yalnız həqiqi bacarıqları CV-yə əlavə et. Nəticələr açar sözlərə əsaslanır; semantik AI qiymətləndirməsi deyil.</p></>}</section></div></main>;
}