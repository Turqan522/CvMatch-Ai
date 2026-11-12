import {useEffect,useMemo,useState} from 'react';
import {doc,getDoc} from 'firebase/firestore';
import {ArrowUpRight,BriefcaseBusiness,CalendarDays,CheckCircle2,ClipboardCheck,FileSearch,Target,TrendingUp} from 'lucide-react';
import {db} from './firebase';
import {parseApplications,trackerKey,upcomingInterviews,type Application} from './lib/applications';
import {evaluateCV,compareJob} from './lib/careerInsights';
import {applicationFunnel,careerChecklist,checklistProgress} from './lib/commandCenter';
import './career-intelligence.css';
const read=(key:string)=>{try{return JSON.parse(localStorage.getItem(key)||'null')}catch{return null}};
function localApplications(uid:string){return parseApplications(read(trackerKey(uid)))}
function localDraft(uid:string):{cv:string;job:string}{const d=read('cvmatch_draft_v1_'+uid);return {cv:typeof d?.cv==='string'?d.cv:'',job:typeof d?.job==='string'?d.job:''}}
type Action={label:string;detail:string;link:string;icon:React.ReactNode};
export default function CareerCommandCenter({userId,name}:{userId:string;name:string}){
 const [items,setItems]=useState<Application[]>(()=>localApplications(userId));
 const [source,setSource]=useState('Yerli məlumatlar');
 const [draft,setDraft]=useState(()=>localDraft(userId));
 useEffect(()=>{let active=true;void getDoc(doc(db,'users',userId)).then(s=>{if(!active)return;const remote=s.data()?.applications;if(Array.isArray(remote)){setItems(parseApplications(remote));setSource('Firebase hesabı')}else setSource('Yerli məlumatlar')}).catch(()=>{if(active)setSource('Yerli məlumatlar — bulud əlçatan deyil')});return()=>{active=false}},[userId]);
 const quality=useMemo(()=>draft.cv.length>=30?evaluateCV(draft.cv):null,[draft.cv]);
 const match=useMemo(()=>draft.cv.length>=30&&draft.job.length>=30?compareJob(draft.cv,draft.job):null,[draft.cv,draft.job]);
 const interviews=upcomingInterviews(items);
 const offers=items.filter(a=>a.status==='Təklif').length;
 const active=items.filter(a=>!['Təklif','İmtina'].includes(a.status)).length;
 const funnel=useMemo(()=>applicationFunnel(items),[items]);
 const checklist=useMemo(()=>careerChecklist(draft.cv,draft.job,items,match?.cvResult.matched.length||0,match?.cvResult.required.length||0),[draft,items,match]);
 const completion=checklistProgress(checklist);
 const next=useMemo<Action[]>(()=>{
  const arr:Action[]=[];
  if(!draft.cv.trim())arr.push({label:'CV-ni əlavə et',detail:'Analiz və tövsiyələr üçün CV lazım olacaq.',link:'#/',icon:<FileSearch size={18}/>});
  else if(quality&&quality.findings.some(f=>!f.passed&&f.priority==='high'))arr.push({label:'CV-ni gücləndir',detail:'Əsas keyfiyyət yoxlamalarındakı çatışmazlıqları aradan qaldır.',link:'#/quality',icon:<ClipboardCheck size={18}/>});
  if(!draft.job.trim())arr.push({label:'Vakansiya tələblərini daxil et',detail:'CV uyğunluğunu dəqiq müqayisə etmək üçün.',link:'#/match',icon:<Target size={18}/>});
  if(items.length===0)arr.push({label:'İlk müraciətini əlavə et',detail:'İş axtarışı tarixçəsini toplamağa başla.',link:'#/applications',icon:<BriefcaseBusiness size={18}/>});
  if(interviews.length)arr.push({label:'Müsahibəyə hazırlaş',detail:interviews[0].company+' · '+interviews[0].title,link:'#/interview',icon:<CalendarDays size={18}/>});
  arr.push({label:'Karyera inkişaf planını aç',detail:'30/60/90 günlük tapşırıqlarını izləyin.',link:'#/roadmap',icon:<TrendingUp size={18}/>});
  return arr.slice(0,4);
 },[draft,quality,items,interviews]);
 return <main className="app-shell ci-page">
  <header className="ci-hero"><span className="eyebrow">PERSONAL CAREER COMMAND CENTER</span><h1>Xoş gəldin, {name.split(' ')[0]||'istifadəçi'}!</h1><p>CV, vakansiya, müraciətlər və müsahibələrini bir paneldən idarə et.</p><small>{source}</small></header>
  <section className="ci-card" aria-label="Karyera hazırlıq planı" style={{marginBottom:20}}>
   <div className="ci-head"><h2><CheckCircle2 size={20}/> İş axtarışı hazırlığı</h2><span className="ci-hint">Bu göstərici işə qəbul ehtimalı deyil</span></div>
   <div className="command-completion">
    <div className="command-ring" style={{'--ring':completion+'%'} as React.CSSProperties}><span>{completion}%</span></div>
    <div><strong>{checklist.filter(x=>x.done).length}/{checklist.length} əsas addım tamamlanıb</strong><p>Vacib addımları tamamladıqca irəliləyişin yenilənir.</p></div>
   </div>
   <div className="ci-actions">{checklist.map(x=><a key={x.id} href={x.path}>
    <span className="ci-action-icon">{x.done?<CheckCircle2 size={19}/>:<Target size={19}/>}</span>
    <span><strong>{x.label}</strong><small>{x.done?'Tamamlandı':'Növbəti addım'}</small></span><ArrowUpRight size={15}/>
   </a>)}</div>
  </section>
  <div className="ci-kpis">
   <article><FileSearch size={21}/><span>CV keyfiyyəti</span><strong>{quality?quality.score+'/100':'—'}</strong><a href="#/quality">Yoxla <ArrowUpRight size={14}/></a></article>
   <article><Target size={21}/><span>Vakansiya uyğunluğu</span><strong>{match?match.cvResult.keywordCoverage+'%':'—'}</strong><a href="#/match">Müqayisə et <ArrowUpRight size={14}/></a></article>
   <article><BriefcaseBusiness size={21}/><span>Aktiv müraciətlər</span><strong>{active}</strong><a href="#/applications">Tarixçə <ArrowUpRight size={14}/></a></article>
   <article><CheckCircle2 size={21}/><span>İş təklifləri</span><strong>{offers}</strong><a href="#/analytics">Statistika <ArrowUpRight size={14}/></a></article>
  </div>
  <section className="ci-card" style={{marginBottom:20}} aria-label="Müraciət mərhələləri">
   <div className="ci-head"><h2><BriefcaseBusiness size={20}/> Müraciət prosesin</h2><a className="ci-link" href="#/applications">Müraciətləri idarə et <ArrowUpRight size={14}/></a></div>
   <div className="command-pipeline">{funnel.map(x=><article key={x.label}><strong>{x.count}</strong><span>{x.label}</span></article>)}</div>
   <p className="ci-hint">Yalnız özün qeyd etdiyin müraciət statusları göstərilir. İmtina edilənlər bu mərhələ panelinə daxil deyil.</p>
  </section>
  <div className="ci-layout">
   <section className="ci-card"><h2><TrendingUp size={20}/> Sənin üçün növbəti addımlar</h2><div className="ci-actions">{next.map((x,i)=><a href={x.link} key={x.link+i}><span className="ci-action-icon">{x.icon}</span><span><strong>{x.label}</strong><small>{x.detail}</small></span><ArrowUpRight size={17}/></a>)}</div><div className="ci-refresh"><button className="ci-small-button" onClick={()=>setDraft(localDraft(userId))}>Cari CV-ni yenilə</button><span>Göstəricilər yalnız saxlanmış məlumatlara əsaslanır.</span></div></section>
   <section className="ci-card"><h2><CalendarDays size={20}/> Qarşıdakı müsahibələr</h2>{interviews.length?interviews.slice(0,4).map(x=><article className="ci-interview" key={x.id}><strong>{x.title}</strong><span>{x.company}</span><time>{new Date(x.interviewAt).toLocaleString('az-AZ')}</time></article>):<p className="ci-hint">Hələ planlaşdırılmış müsahibə yoxdur. Müraciətlərim bölməsində tarix əlavə edə bilərsən.</p>}<a className="ci-link" href="#/applications">Müraciətlərimə keç</a></section>
  </div>
  <section className="ci-card ci-quick"><h2>Sürətli alətlər</h2><div className="ci-quick-grid"><a href="#/jobs">Vakansiyalar</a><a href="#/versions">CV versiyaları</a><a href="#/profiles">LinkedIn + GitHub</a><a href="#/letter">Motivasiya məktubu</a><a href="#/analytics">Karyera statistikası</a><a href="#/followup">Follow-Up Assistant</a></div><p className="ci-hint">CV və keyfiyyət balları ilkin məzmun analizidir, real işə qəbul şansı deyil. Müraciət statusları öz qeyd etdiyin məlumatlardır.</p></section>
 </main>;
}