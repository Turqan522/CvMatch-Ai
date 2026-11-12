import {useEffect,useMemo,useRef,useState,type FormEvent} from 'react';
import {doc,getDoc,updateDoc} from 'firebase/firestore';
import {ArrowUpRight,BriefcaseBusiness,CalendarClock,CheckCircle2,ClipboardList,Cloud,CloudOff,ExternalLink,Plus,Save,Search,Trash2,X} from 'lucide-react';
import {db} from './firebase';
import ApplicationKanban from './ApplicationKanban';
import {APPLICATION_STATUSES,applicationStats,parseApplications,safeJobUrl,trackerKey,upcomingInterviews,type Application,type ApplicationStatus} from './lib/applications';
import './applications.css';

type Mode='dashboard'|'tracker';
type FormDataState={title:string;company:string;url:string;status:ApplicationStatus;appliedAt:string;interviewAt:string;notes:string};
const emptyForm=():FormDataState=>({title:'',company:'',url:'',status:'Planlaşdırılır',appliedAt:new Date().toISOString().slice(0,10),interviewAt:'',notes:''});
function localRead(userId:string){try{return parseApplications(JSON.parse(localStorage.getItem(trackerKey(userId))||'[]'));}catch{return [];}}
function localWrite(userId:string,items:Application[]){try{localStorage.setItem(trackerKey(userId),JSON.stringify(items));return true;}catch{return false;}}
function prefilling(){const query=location.hash.split('?')[1]||'';const params=new URLSearchParams(query);return {title:(params.get('title')||'').slice(0,150),company:(params.get('company')||'').slice(0,120),url:safeJobUrl(params.get('url')||'')};}
export default function Applications({userId,mode}:{userId:string;mode:Mode}){
  const [items,setItems]=useState<Application[]>(()=>localRead(userId));
  const [form,setForm]=useState<FormDataState>(()=>({...emptyForm(),...prefilling()}));
  const [editing,setEditing]=useState<string|null>(null);
  const [filter,setFilter]=useState(''),[statusFilter,setStatusFilter]=useState('Hamısı');
  const [open,setOpen]=useState(()=>!!prefilling().title);
  const [view,setView]=useState<'list'|'kanban'>('list');
  const [sync,setSync]=useState<'loading'|'cloud'|'local'|'saving'>('loading');
  const [message,setMessage]=useState('');
  const latest=useRef(items);
  const revision=useRef(0);
  useEffect(()=>{let active=true;const revisionAtLoad=revision.current;
    void getDoc(doc(db,'users',userId)).then(snapshot=>{
      if(!active)return;
      const cloud=snapshot.data()?.applications;
      if(revision.current!==revisionAtLoad)return;
      if(Array.isArray(cloud)){const parsed=parseApplications(cloud);latest.current=parsed;setItems(parsed);localWrite(userId,parsed);setSync('cloud');}
      else if(latest.current.length){setSync('local');setMessage('Bu brauzerdə müraciətlər mövcuddur, amma buludda hələ yoxdur. Növbəti dəyişiklik zamanı sinxronizasiya yoxlanacaq.');}
      else setSync('cloud');
    }).catch(()=>{if(active){setSync('local');setMessage('Bulud sinxronizasiyası əlçatan deyil. Dəyişikliklər bu brauzerdə saxlanılacaq.');}});
    return()=>{active=false;};
  },[userId]);
  const persist=async(next:Application[])=>{
    const safe=next.slice(0,100);revision.current+=1;const current=revision.current;
    latest.current=safe;setItems(safe);
    const localOk=localWrite(userId,safe);
    setSync('saving');setMessage('');
    try{await updateDoc(doc(db,'users',userId),{applications:safe,applicationsUpdatedAt:new Date().toISOString()});if(revision.current===current)setSync('cloud');}
    catch{if(revision.current===current){setSync('local');setMessage(localOk?'Buluda yazmaq alınmadı. Məlumatlar bu brauzerdə qalır; başqa cihazda görünməyə bilər.':'Dəyişiklikləri saxlamaq alınmadı. Brauzer yaddaşını yoxlayın.');}}
  };
  const save=(event:FormEvent)=>{event.preventDefault();if(!form.title.trim()||!form.company.trim())return;if(form.url&&!safeJobUrl(form.url)){setMessage('Vakansiya linki http:// və ya https:// ilə başlamalıdır.');return;}
    const current=items.find(x=>x.id===editing);
    const next:Application={id:current?.id||crypto.randomUUID(),title:form.title.trim(),company:form.company.trim(),url:safeJobUrl(form.url),status:form.status,appliedAt:form.appliedAt,interviewAt:form.status==='Müsahibə'?form.interviewAt:'',notes:form.notes.trim(),updatedAt:Date.now()};
    void persist(current?items.map(x=>x.id===editing?next:x):[next,...items]);setOpen(false);setEditing(null);setForm(emptyForm());
  };
  const edit=(item:Application)=>{setEditing(item.id);setForm({title:item.title,company:item.company,url:item.url,status:item.status,appliedAt:item.appliedAt,interviewAt:item.interviewAt,notes:item.notes});setOpen(true);window.scrollTo({top:0,behavior:'smooth'});};
  const shown=useMemo(()=>items.filter(x=>(statusFilter==='Hamısı'||x.status===statusFilter)&&`${x.title} ${x.company}`.toLocaleLowerCase().includes(filter.toLocaleLowerCase())).sort((a,b)=>b.updatedAt-a.updatedAt),[items,filter,statusFilter]);
  const stats=applicationStats(items),interviews=upcomingInterviews(items);
  const move=(id:string,status:ApplicationStatus)=>{
    const next=items.map(item=>item.id===id?{...item,status,interviewAt:status==='Müsahibə'?item.interviewAt:'',updatedAt:Date.now()}:item);
    void persist(next);
  };
  return <main className="app-shell application-page"><header className="application-hero"><span className="small-kicker"><BriefcaseBusiness size={15}/> CVMATCH AI · CAREER INTELLIGENCE</span><h1>{mode==='dashboard'?'Career Dashboard':'AI Application Tracker'}</h1><p>{mode==='dashboard'?'Müraciətlərinizin vəziyyətini, qarşıdakı müsahibələri və növbəti addımlarınızı bir yerdə görün.':'Vakansiya müraciətlərini və müsahibə tarixlərini bir paneldən izləyin.'}</p></header>
    <section className="application-stats" aria-label="Müraciət göstəriciləri"><div><ClipboardList/><span>Cəmi müraciət</span><strong>{stats.total}</strong></div><div><CheckCircle2/><span>Aktiv proses</span><strong>{stats.active}</strong></div><div><CalendarClock/><span>Müsahibə</span><strong>{stats.interviews}</strong></div><div><BriefcaseBusiness/><span>Təklif</span><strong>{stats.offers}</strong></div></section>
    <div className="application-toolbar"><div className={'application-sync '+(sync==='cloud'?'online':'')} role="status">{sync==='cloud'?<Cloud size={16}/>:<CloudOff size={16}/>} {sync==='cloud'?'Firebase ilə sinxron':'loading'===sync?'Məlumatlar yüklənir…':sync==='saving'?'Yadda saxlanılır…':'Yerli yaddaş rejimi'}</div><button className="btn primary" onClick={()=>{setEditing(null);setForm(emptyForm());setOpen(!open);}}><Plus size={17}/> Yeni müraciət</button></div>
    {message&&<p className="application-notice" role="alert">{message}</p>}
    {open&&<section className="work-card application-form-card"><div className="application-section-head"><h2>{editing?'Müraciəti redaktə et':'Yeni müraciət əlavə et'}</h2><button className="btn ghost" aria-label="Formu bağla" onClick={()=>{setOpen(false);setEditing(null);}}><X size={18}/></button></div><form onSubmit={save} className="application-form"><label>Vəzifə adı *<input maxLength={150} required value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="Junior Data Analyst"/></label><label>Şirkət *<input maxLength={120} required value={form.company} onChange={e=>setForm({...form,company:e.target.value})} placeholder="Şirkətin adı"/></label><label>Vakansiyanın linki<input type="url" maxLength={1000} value={form.url} onChange={e=>setForm({...form,url:e.target.value})} placeholder="https://..."/></label><label>Status<select value={form.status} onChange={e=>setForm({...form,status:e.target.value as ApplicationStatus})}>{APPLICATION_STATUSES.map(status=><option key={status}>{status}</option>)}</select></label><label>Müraciət tarixi<input type="date" value={form.appliedAt} onChange={e=>setForm({...form,appliedAt:e.target.value})}/></label>{form.status==='Müsahibə'&&<label>Müsahibə vaxtı<input type="datetime-local" value={form.interviewAt} onChange={e=>setForm({...form,interviewAt:e.target.value})}/></label>}<label className="application-wide">Qeydlər<textarea maxLength={2000} rows={3} value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} placeholder="HR-dan cavab, növbəti addım, müsahibə hazırlığı…"/></label><button className="btn primary"><Save size={16}/> Müraciəti saxla</button></form></section>}
    {mode==='dashboard'&&<section className="application-overview"><div className="work-card"><h2><CalendarClock size={20}/> Qarşıdakı müsahibələr</h2>{interviews.length?interviews.slice(0,4).map(item=><div className="application-upcoming" key={item.id}><strong>{item.title}</strong><span>{item.company} · {new Date(item.interviewAt).toLocaleString('az-AZ')}</span></div>):<p>Planlaşdırılmış müsahibəniz yoxdur.</p>}</div><div className="work-card"><h2>Özünü inkişaf etdir</h2><p>Profil analizinə, 30/60/90 günlük plana və HR müsahibəsinə hazırlıq bölməsinə keç.</p><div className="application-quick-links"><a href="#/profiles">Profil analizi <ArrowUpRight size={15}/></a><a href="#/roadmap">Karyera planı <ArrowUpRight size={15}/></a><a href="#/interview">HR müsahibə <ArrowUpRight size={15}/></a><a href="#/jobs">Vakansiyalar <ArrowUpRight size={15}/></a></div></div></section>}
    <div className="creative-actions" role="group" aria-label="Müraciət görünüşü"><button className={view==='list'?'btn primary':'btn secondary'} aria-pressed={view==='list'} onClick={()=>setView('list')}>Siyahı görünüşü</button><button className={view==='kanban'?'btn primary':'btn secondary'} aria-pressed={view==='kanban'} onClick={()=>setView('kanban')}>Kanban lövhəsi</button></div>
    {view==='kanban'?<ApplicationKanban items={items} onMove={move} onEdit={edit} disabled={sync==='saving'}/>:<section className="work-card application-list-card"><div className="application-section-head"><h2>{mode==='dashboard'?'Son müraciətlər':'Müraciət tarixçəsi'}</h2><span>{shown.length} nəticə</span></div><div className="application-filters"><div><Search size={17}/><input aria-label="Müraciət axtar" value={filter} onChange={e=>setFilter(e.target.value)} placeholder="Vəzifə və ya şirkət axtar…"/></div><select aria-label="Statusa görə filtr" value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}><option>Hamısı</option>{APPLICATION_STATUSES.map(status=><option key={status}>{status}</option>)}</select></div>{shown.length?shown.map(item=><article className="application-item" key={item.id}><div><span className="application-status">{item.status}</span><h3>{item.title}</h3><p>{item.company} · {item.appliedAt||'Tarix göstərilməyib'}</p>{item.notes&&<small>{item.notes}</small>}{item.interviewAt&&<small>📅 {new Date(item.interviewAt).toLocaleString('az-AZ')}</small>}</div><div className="application-item-actions">{item.url&&<a className="btn secondary" href={item.url} target="_blank" rel="noopener noreferrer">Elan <ExternalLink size={14}/></a>}<button className="btn secondary" onClick={()=>edit(item)}>Düzəliş et</button><button className="btn ghost" aria-label={`${item.title} müraciətini sil`} onClick={()=>{if(window.confirm('Bu müraciət silinsin?'))void persist(items.filter(x=>x.id!==item.id));}}><Trash2 size={16}/></button></div></article>):<p className="application-empty">Hələ müraciət yoxdur. “Yeni müraciət” düyməsi ilə başlayın.</p>}</section>}
    <p className="application-footnote">Müraciət statusları istifadəçinin daxil etdiyi məlumatlardır. CVMatch AI şirkətin daxili qərarlarını avtomatik görmür. İmtina səbəbi yalnız şirkət bildirəndə məlum olur.</p>
  </main>;
}
