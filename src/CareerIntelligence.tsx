import {useMemo,useState} from 'react';
import {CheckCircle2,ClipboardCheck,FileSearch,Lightbulb,RefreshCw,ShieldCheck,Sparkles,Target} from 'lucide-react';
import {compareJob,evaluateCV} from './lib/careerInsights';
import {fetchGithubProfile} from './lib/career';
import './career-intelligence.css';
type Mode='match'|'quality';
const saved=(uid:string)=>{try{const d=JSON.parse(localStorage.getItem('cvmatch_draft_v1_'+uid)||'{}');return {cv:typeof d.cv==='string'?d.cv:'',job:typeof d.job==='string'?d.job:''}}catch{return {cv:'',job:''}}};
export default function CareerIntelligence({userId,mode}:{userId:string;mode:Mode}){
 const initial=useMemo(()=>saved(userId),[userId]);
 const [cv,setCv]=useState(initial.cv),[job,setJob]=useState(initial.job),[profile,setProfile]=useState('');
 const [githubInput,setGithubInput]=useState(()=>{try{return localStorage.getItem('career_github_'+userId)||''}catch{return ''}});
 const [githubStatus,setGithubStatus]=useState(''),[githubBusy,setGithubBusy]=useState(false);
 const [evaluated,setEvaluated]=useState(false);
 const quality=useMemo(()=>evaluateCV(cv),[cv]);
 const match=useMemo(()=>compareJob(cv,job,profile),[cv,job,profile]);
 const reload=()=>{const d=saved(userId);setCv(d.cv);setJob(d.job);setEvaluated(false)};
 const loadGithub=async()=>{setGithubBusy(true);setGithubStatus('');try{const p=await fetchGithubProfile(githubInput);setProfile([p.bio||'',...p.repos.slice(0,30).flatMap(r=>[r.name,r.language||'',r.description||''])].join('\n'));setGithubStatus('GitHub açıq profil məlumatları nəzərə alındı. Şəxsi repozitoriyalar oxunmur.')}catch{setGithubStatus('GitHub məlumatı alınmadı. İstifadəçi adını yoxlayın.')}finally{setGithubBusy(false)}};
 return <main className="app-shell ci-page">
 <header className="ci-hero"><span className="eyebrow">{mode==='match'?'CAREER INTELLIGENCE':'CV STUDIO'}</span><h1>{mode==='match'?'AI Job Match Engine':'ATS CV Quality Checker'}</h1><p>{mode==='match'?'CV-ni vakansiya tələbləri ilə müqayisə et, sübutları və çatışmayan bacarıqları gör.':'CV məzmununu, strukturunu və zəif tərəflərini şəffaf meyarlarla yoxla.'}</p></header>
 <div className="ci-layout">
  <section className="ci-card"><div className="ci-head"><h2><FileSearch size={21}/> Məlumatlar</h2><button type="button" className="ci-small-button" onClick={reload}><RefreshCw size={15}/> Cari CV-ni yenilə</button></div>
   <label>CV mətni<textarea rows={12} value={cv} onChange={e=>{setCv(e.target.value);setEvaluated(false)}} placeholder="CV-ni buraya daxil edin..."/></label>
   {mode==='match'&&<><label>Vakansiyanın tələbləri<textarea rows={8} value={job} onChange={e=>{setJob(e.target.value);setEvaluated(false)}} placeholder="Vakansiyanın tələblərini buraya yerləşdirin..."/></label>
    <div className="ci-github"><h3>GitHub sübutları (istəyə bağlı)</h3><p>GitHub hesabınızın yalnız açıq repo adları, təsvirləri və dilləri analizə əlavə olunur.</p><div className="ci-inline"><input aria-label="GitHub istifadəçi adı" value={githubInput} onChange={e=>setGithubInput(e.target.value)} placeholder="github.com/istifadəçi"/><button type="button" className="btn secondary" disabled={githubBusy||!githubInput.trim()} onClick={()=>void loadGithub()}>{githubBusy?'Yüklənir…':'GitHub-u yoxla'}</button></div>{githubStatus&&<small role="status">{githubStatus}</small>}</div>
   </>}
   <button className="btn primary ci-main-action" type="button" disabled={cv.trim().length<30||(mode==='match'&&job.trim().length<30)} onClick={()=>setEvaluated(true)}><Sparkles size={17}/> {mode==='match'?'Uyğunluğu hesabla':'CV keyfiyyətini yoxla'}</button>
  </section>
  <section className="ci-card ci-results">
   <h2><Target size={21}/> {mode==='match'?'Uyğunluq nəticəsi':'Keyfiyyət hesabatı'}</h2>
   {!evaluated?<div className="ci-placeholder"><ShieldCheck size={42}/><h3>Analizə hazırdır</h3><p>Məlumatlarını yoxla və analiz düyməsinə bas.</p></div>:mode==='match'?<>
    <div className="ci-score-row"><div><span>CV uyğunluğu</span><strong>{match.cvResult.keywordCoverage}%</strong></div><div><span>CV + açıq GitHub</span><strong>{match.combined.keywordCoverage}%</strong></div></div>
    <p className="ci-hint">Bu göstərici yalnız tanınan texniki açar sözlərin əhatəsini ölçür; işə qəbul ehtimalı və ya rəsmi ATS balı deyil.</p>
    {match.confidence==='limited'&&<p className="ci-warning">Vakansiyada tanınan texniki tələblər azdır. Faiz nəticəsi məhdud məlumat əsasında hesablanıb.</p>}
    <h3><CheckCircle2 size={18}/> CV-də uyğun bacarıqlar</h3><div className="ci-chips">{match.cvResult.matched.length?match.cvResult.matched.map(s=><span className="ci-chip good" key={s}>{s}</span>):<p>Hələ uyğun bacarıq tapılmayıb.</p>}</div>
    <h3><Lightbulb size={18}/> CV-də görünməyən tələblər</h3><div className="ci-chips">{match.cvResult.missing.length?match.cvResult.missing.map(s=><span className="ci-chip warn" key={s}>{s}</span>):<p>Tanınan tələblər arasında çatışmayan yoxdur.</p>}</div>
    {match.portfolioSkills.length>0&&<><h3>GitHub-da görünən əlavə bacarıqlar</h3><div className="ci-chips">{match.portfolioSkills.map(s=><span className="ci-chip good" key={s}>{s}</span>)}</div><p className="ci-hint">Bunlar GitHub təsvirlərində görünən terminlərdir; bacarıq səviyyəsini təsdiq etmir.</p></>}
    <div className="ci-suggestions"><h3>Növbəti addımlar</h3>{match.cvResult.suggestions.map((s,i)=><p key={i}>{s}</p>)}</div>
    <a className="ci-link" href="#/jobs">Uyğun vakansiyalara bax</a>
   </>:<>
    <div className="ci-quality-score"><strong>{quality.score}/100</strong><span>{quality.findings.filter(f=>f.passed).length}/{quality.findings.length} meyar yerinə yetirilib · {quality.wordCount} söz</span></div>
    <p className="ci-hint">Bu CV struktur və məzmun keyfiyyəti üçün ilkin heuristik göstəricidir; rəsmi ATS qiyməti deyil.</p>
    <div className="ci-checklist">{quality.findings.map(f=><article key={f.id} className={'ci-check'+(f.passed?' passed':'')}><span className="ci-check-marker">{f.passed?'✓':'!'}</span><div><b>{f.label}</b><p>{f.passed?'Yoxlama meyarına uyğundur.':f.detail}</p></div><small>{f.priority==='high'?'Yüksək':f.priority==='medium'?'Orta':'Aşağı'}</small></article>)}</div>
    <a className="ci-link" href="#/">CV-ni redaktə et</a>
   </>}
  </section>
 </div>
 </main>;
}