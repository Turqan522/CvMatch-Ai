import {useEffect,useMemo,useState} from 'react';
import {doc,getDoc} from 'firebase/firestore';
import {BarChart3,BriefcaseBusiness,CalendarDays,CheckCircle2,Cloud,CloudOff,FileText,TrendingUp} from 'lucide-react';
import {db} from './firebase';
import {parseApplications,trackerKey,type Application} from './lib/applications';
import {scoreResume} from './lib/scoring';
import './career-analytics.css';
type Version={id:string;name?:string;cv:string;createdAt:string};
const read=(key:string)=>{try{return JSON.parse(localStorage.getItem(key)||'[]')}catch{return []}};
function localApplications(uid:string):Application[]{return parseApplications(read(trackerKey(uid)))}
function localVersions(uid:string):Version[]{const data=read('cvmatch_cv_versions_v1_'+uid);return Array.isArray(data)?data.filter((v:Version)=>v&&typeof v.cv==='string'&&typeof v.createdAt==='string'):[]}
function draftJob(uid:string):string{try{return String(JSON.parse(localStorage.getItem('cvmatch_draft_v1_'+uid)||'{}').job||'')}catch{return ''}}
function monthKey(date:string){if(!/^\d{4}-\d{2}-\d{2}/.test(date))return '';return date.slice(0,7)}
function months(count:number){const now=new Date();return Array.from({length:count},(_,i)=>{const d=new Date(now.getFullYear(),now.getMonth()-count+1+i,1);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`})}
function percentage(a:number,b:number){return b?Math.round(a/b*100):0}
export default function CareerAnalytics({userId}:{userId:string}){
 const [items,setItems]=useState<Application[]>(()=>localApplications(userId));
 const [source,setSource]=useState<'loading'|'cloud'|'local'>('loading');
 const [range,setRange]=useState<6|12>(6);
 const [versions]=useState<Version[]>(()=>localVersions(userId));
 const [job]=useState(()=>draftJob(userId));
 useEffect(()=>{let active=true;void getDoc(doc(db,'users',userId)).then(s=>{if(!active)return;const remote=s.data()?.applications;if(Array.isArray(remote)){setItems(parseApplications(remote));setSource('cloud')}else setSource('local')}).catch(()=>{if(active)setSource('local')});return()=>{active=false}},[userId]);
 const sent=items.filter(a=>a.status!=='Planlaşdırılır');
 const interviews=items.filter(a=>a.status==='Müsahibə'||a.status==='Təklif');
 const offers=items.filter(a=>a.status==='Təklif');
 const dates=useMemo(()=>months(range),[range]);
 const counts=dates.map(month=>({month,count:sent.filter(a=>monthKey(a.appliedAt)===month).length}));
 const max=Math.max(1,...counts.map(x=>x.count));
 const statuses=['Planlaşdırılır','Müraciət edildi','Baxılır','Müsahibə','Təklif','İmtina'] as const;
 const total=Math.max(1,items.length);
 const scoredVersions=versions.filter(v=>job.trim().length>=20&&v.cv.trim().length>=30).sort((a,b)=>a.createdAt.localeCompare(b.createdAt)).map(v=>({...v,score:scoreResume(v.cv,job).score}));
 return <main className="app-shell analytics-page">
 <header className="analytics-hero"><span className="eyebrow"><TrendingUp size={15}/> CAREER INTELLIGENCE</span><h1>Career Progress Analytics</h1><p>Müraciətlərin, müsahibələrin və CV inkişafının statistikası.</p><small>{source==='cloud'?<><Cloud size={15}/> Firebase-dən oxunub</>:source==='loading'?'Məlumatlar yoxlanılır…':<><CloudOff size={15}/> Brauzer məlumatları</>}</small></header>
 <section className="analytics-stats" aria-label="Əsas göstəricilər">
 {[{icon:<BriefcaseBusiness/>,label:'Göndərilən müraciət',value:sent.length},{icon:<CalendarDays/>,label:'Müsahibə / təklif',value:interviews.length},{icon:<CheckCircle2/>,label:'İş təklifi',value:offers.length},{icon:<BarChart3/>,label:'Müsahibə payı',value:percentage(interviews.length,sent.length)+'%'}].map(c=><article className="analytics-card" key={c.label}><div>{c.icon}<span>{c.label}</span></div><strong>{c.value}</strong></article>)}
 </section>
 <section className="analytics-grid"><article className="analytics-panel"><div className="analytics-title"><div><h2>Aylıq müraciətlər</h2><p>Müraciət tarixinə əsasən</p></div><label className="analytics-range">Dövr <select value={range} onChange={e=>setRange(Number(e.target.value) as 6|12)}><option value={6}>Son 6 ay</option><option value={12}>Son 12 ay</option></select></label></div>
 <div className="analytics-bars" role="img" aria-label={counts.map(x=>`${x.month}: ${x.count} müraciət`).join(', ')}>{counts.map(x=><div className="analytics-bar-group" key={x.month}><span>{x.count}</span><div className="analytics-bar-track"><div style={{height:`${x.count?Math.max(5,x.count/max*100):0}%`}}/></div><small>{x.month.slice(5)}/{x.month.slice(2,4)}</small></div>)}</div>{!sent.length&&<p className="analytics-empty">Müraciətlərim bölməsində ilk müraciətini əlavə et.</p>}</article>
 <article className="analytics-panel"><h2>Müraciət statusları</h2><div className="analytics-status-list">{statuses.map(status=>{const count=items.filter(a=>a.status===status).length;return <div key={status}><div><span>{status}</span><b>{count}</b></div><div className="analytics-progress"><div style={{width:`${count/total*100}%`}}/></div></div>})}</div><p className="analytics-tiny">Müraciətdən təklifə: {percentage(offers.length,sent.length)}%</p></article></section>
 <section className="analytics-panel"><h2><FileText size={20}/> CV inkişafı</h2>{scoredVersions.length>=2?<><p>Bütün versiyalar eyni saxlanılmış vakansiyaya əsasən müqayisə edilir.</p><div className="analytics-timeline">{scoredVersions.map((v,i)=><div key={v.id}><span>{new Date(v.createdAt).toLocaleDateString('az-AZ')}</span><b>{v.name||`Versiya ${i+1}`}</b><strong>{v.score}/100</strong></div>)}</div><p className="analytics-tiny">İlk versiya: {scoredVersions[0].score}/100 · Son versiya: {scoredVersions[scoredVersions.length-1].score}/100</p></>:<p className="analytics-empty">CV inkişaf qrafiki üçün CV Studio-da iki versiya saxla və vakansiya mətni əlavə et.</p>}</section>
 <p className="analytics-disclaimer">Statistikalar müraciətlərin cari statusuna əsaslanır. CV balı rəsmi ATS nəticəsi deyil və müsahibə payı təxmini göstəricidir.</p>
 </main>;
}