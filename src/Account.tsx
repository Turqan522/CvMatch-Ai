import {useEffect,useRef,useState,type FormEvent} from 'react';
import {createUserWithEmailAndPassword,onAuthStateChanged,signInWithEmailAndPassword,signOut,updateProfile} from 'firebase/auth';
import {doc,getDoc,setDoc,updateDoc} from 'firebase/firestore';
import App from './App';
import Career from './Career';
import AIAssistant from './AIAssistant';
import Interview from './Interview';
import Roadmap from './Roadmap';
import Applications from './Applications';
import CoverLetter from './CoverLetter';
import CVVersions from './CVVersions';
import CareerAnalytics from './CareerAnalytics';
import FollowUp from './FollowUp';
import MultilingualCV from './MultilingualCV';
import CareerIntelligence from './CareerIntelligence';
import CareerCommandCenter from './CareerCommandCenter';
import {Moon,Sun} from 'lucide-react';
import {auth,db} from './firebase';
import './account.css';
import './navigation.css';

type User={id:string;name:string;email:string;title:string;bio:string;createdAt:string};
function savedCv(userId:string):string{try{const draft=JSON.parse(localStorage.getItem('cvmatch_draft_v1_'+userId)||'{}');return typeof draft.cv==='string'?draft.cv:'';}catch{return '';}}
function savedJob(userId:string):string{try{const draft=JSON.parse(localStorage.getItem('cvmatch_draft_v1_'+userId)||'{}');return typeof draft.job==='string'?draft.job:'';}catch{return '';}}
function readableError(error:unknown){
  const code=(error as {code?:string})?.code;
  const messages:Record<string,string>={
    'auth/email-already-in-use':'Bu e-poçt artıq qeydiyyatdan keçib.',
    'auth/invalid-email':'E-poçt ünvanı düzgün deyil.',
    'auth/weak-password':'Daha güclü şifrə seçin.',
    'auth/invalid-credential':'E-poçt və ya şifrə yanlışdır.',
    'auth/too-many-requests':'Çox sayda cəhd edildi. Bir az sonra yenidən yoxlayın.',
    'auth/network-request-failed':'İnternet bağlantısını yoxlayın.',
    'permission-denied':'Profil məlumatlarına giriş icazəsi yoxdur.'
  };
  return messages[code||'']||(error instanceof Error?error.message:'Xəta baş verdi.');
}
async function loadUser(firebaseUser:NonNullable<typeof auth.currentUser>):Promise<User>{
  const snapshot=await getDoc(doc(db,'users',firebaseUser.uid));
  const profile=snapshot.exists()?snapshot.data():{};
  return {id:firebaseUser.uid,name:String(profile.name||firebaseUser.displayName||firebaseUser.email?.split('@')[0]||'İstifadəçi'),email:firebaseUser.email||'',title:String(profile.title||''),bio:String(profile.bio||''),createdAt:String(profile.createdAt||firebaseUser.metadata.creationTime||'')};
}
export default function Account(){
  const [theme,setTheme]=useState<'dark'|'saas'>(()=>{try{return localStorage.getItem('cvmatch_theme')==='saas'?'saas':'dark';}catch{return 'dark';}});
  useEffect(()=>{document.documentElement.dataset.theme=theme;try{localStorage.setItem('cvmatch_theme',theme);}catch{/* storage unavailable */}},[theme]);
  const [user,setUser]=useState<User|null>(null),[ready,setReady]=useState(false),[error,setError]=useState(''),[busy,setBusy]=useState(false);
  const [openMenu,setOpenMenu]=useState<string|null>(null);
  const navRef=useRef<HTMLDivElement|null>(null);
  useEffect(()=>{
    const outside=(event:PointerEvent)=>{if(navRef.current&&!navRef.current.contains(event.target as Node))setOpenMenu(null);};
    const keyboard=(event:KeyboardEvent)=>{if(event.key==='Escape')setOpenMenu(null);};
    document.addEventListener('pointerdown',outside);
    document.addEventListener('keydown',keyboard);
    return()=>{document.removeEventListener('pointerdown',outside);document.removeEventListener('keydown',keyboard);};
  },[]);
  const currentPage=()=>location.hash.slice(1)||'/';
  const [page,setPage]=useState(currentPage),[notice,setNotice]=useState('');
  const go=(path:string)=>{setOpenMenu(null);location.hash=path;setPage(path);setError('');setNotice('');window.scrollTo({top:0,behavior:'smooth'});};
  useEffect(()=>{
    if(currentPage().startsWith('/admin'))location.hash='/login';
    const pop=()=>{setOpenMenu(null);setPage(currentPage());setError('');};
    window.addEventListener('hashchange',pop);
    let active=true;
    const unsubscribe=onAuthStateChanged(auth,async firebaseUser=>{
      if(!firebaseUser){if(active){setUser(null);setReady(true);}return;}
      try{const profile=await loadUser(firebaseUser);if(active)setUser(profile);}
      catch(e){if(active)setError(readableError(e));}
      finally{if(active)setReady(true);}
    });
    return()=>{active=false;unsubscribe();window.removeEventListener('hashchange',pop);};
  },[]);
  async function submit(event:FormEvent<HTMLFormElement>,kind:string){
    event.preventDefault();setBusy(true);setError('');setNotice('');const data=Object.fromEntries(new FormData(event.currentTarget));
    try{
      if(kind==='register' && data.password!==data.confirm)throw new Error('Şifrələr uyğun gəlmir.');
      if(kind==='profile'){
        if(!auth.currentUser)throw new Error('Əvvəlcə hesabınıza daxil olun.');
        await updateDoc(doc(db,'users',auth.currentUser.uid),{name:String(data.name).trim(),title:String(data.title||'').trim(),bio:String(data.bio||'').trim(),updatedAt:new Date().toISOString()});
        setUser(await loadUser(auth.currentUser));setNotice('Profiliniz yadda saxlanıldı.');
      }else if(kind==='register'){
        const credential=await createUserWithEmailAndPassword(auth,String(data.email).trim(),String(data.password));
        const name=String(data.name).trim();
        await updateProfile(credential.user,{displayName:name});
        await setDoc(doc(db,'users',credential.user.uid),{name,email:credential.user.email,title:'',bio:'',createdAt:new Date().toISOString()});
        setUser(await loadUser(credential.user));go('/');
      }else{
        const credential=await signInWithEmailAndPassword(auth,String(data.email).trim(),String(data.password));
        setUser(await loadUser(credential.user));go('/');
      }
    }catch(e){setError(readableError(e));}finally{setBusy(false);}
  }
  async function logout(){setBusy(true);setError('');try{await signOut(auth);setUser(null);go('/login');}catch(e){setError(readableError(e));}finally{setBusy(false);}}
  if(!ready)return <div className="account-shell"><p role="status">Hesab yoxlanılır…</p></div>;
  const register=page==='/register';
  const authPage=!user||page==='/login'||page==='/register';
  return <><div className="account-bar"><a className="brand" href="/" onClick={e=>{e.preventDefault();go('/');}}>CVMatch <em>AI</em></a><nav aria-label="Hesab menyusu"><button className="theme-switch" type="button" onClick={()=>setTheme(value=>value==='dark'?'saas':'dark')} aria-label={theme==='dark'?'Premium açıq SaaS rejiminə keç':'Tünd-göy rejimə keç'} title={theme==='dark'?'Açıq SaaS rejimi':'Tünd-göy rejim'}>{theme==='dark'?<Sun size={16}/>:<Moon size={16}/>}<span>{theme==='dark'?'SaaS rejimi':'Tünd-göy'}</span></button>{user?<><span>{user.name}</span><div className="nav-groups" ref={navRef}>
  <div className="nav-tabs">
    {([
      {id:'cv',label:'CV Studio'},
      {id:'jobs',label:'İş axtarışı'},
      {id:'career',label:'Karyera inkişafı'},
      {id:'account',label:'Hesab'}
    ] as {id:string;label:string}[]).map(group=>
      <button key={group.id} type="button" className={'nav-trigger'+(openMenu===group.id?' is-active':'')}
        aria-expanded={openMenu===group.id} aria-controls="cvmatch-submenu"
        onClick={()=>setOpenMenu(current=>current===group.id?null:group.id)}>
        {group.label}<span aria-hidden="true" className="nav-chevron">⌄</span>
      </button>
    )}
    <button className="nav-ai" type="button" onClick={()=>go('/ai')}>✨ AI Köməkçi</button>
  </div>
  {openMenu&&<div id="cvmatch-submenu" className="nav-submenu" role="navigation" aria-label="Alt bölmələr">
    {({
      cv:[['CV analizi','/'],['CV keyfiyyət yoxlaması','/quality'],['CV versiyaları','/versions'],['Çoxdilli CV Studio','/multilingual'],['Motivasiya məktubu','/letter']],
      jobs:[['Command Center','/dashboard'],['AI Job Match','/match'],['Vakansiyalar','/jobs'],['Müraciətlərim','/applications'],['Follow-Up Assistant','/followup'],['Karyera statistikası','/analytics']],
      career:[['LinkedIn + GitHub','/profiles'],['Karyera planı','/roadmap'],['HR müsahibə','/interview']],
      account:[['Profilim','/profile']]
    } as Record<string,[string,string][]>)[openMenu].map(([label,path])=>
      <a key={path} href={'#'+path} aria-current={page===path?'page':undefined}
        onClick={event=>{event.preventDefault();go(path);}}>{label}</a>
    )}
    {openMenu==='account'&&<button type="button" disabled={busy} onClick={()=>{setOpenMenu(null);void logout()}}>Çıxış</button>}
  </div>}
</div></>:<><button onClick={()=>go('/login')}>Daxil ol</button><button onClick={()=>go('/register')}>Hesab yarat</button></>}</nav></div>
    {error&&<div className="account-alert" role="alert">{error}</div>}
    {authPage?<main className="account-shell auth-layout"><section className="account-intro"><span className="eyebrow">KARYERANA NÖVBƏTİ ADDIM</span><h1>{register?'Yeni başlanğıc,\nyeni imkanlar.':'Xoş gəlmisiniz.'}</h1><p>{'Profilinizi yaradın, CV-nizi vakansiyaya uyğunlaşdırın və bacarıqlarınızı önə çıxarın.'}</p><div className="account-feature">01 — Şəxsi profil<br/>02 — CV və vakansiya analizi<br/>03 — Hazır CV ixracı</div></section><section className="work-card account-form"><h2>{register?'Hesab yarat':'Hesabına daxil ol'}</h2><p className="account-muted">{register?'Başlamaq üçün məlumatlarınızı daxil edin.':'E-poçt və şifrənizlə davam edin.'}</p><form key={page} onSubmit={e=>void submit(e,register?'register':'login')}>
      {register&&<label>Ad və soyad<input name="name" autoComplete="name" minLength={2} maxLength={100} required/></label>}
      <label>E-poçt<input name="email" type="email" autoComplete="username" maxLength={254} required/></label>
      <label>Şifrə<input name="password" type="password" autoComplete={register?'new-password':'current-password'} minLength={register?10:undefined} maxLength={128} required/></label>
      {register&&<><small>Ən azı 10 simvol istifadə edin.</small><label>Şifrəni təkrarla<input name="confirm" type="password" autoComplete="new-password" minLength={10} maxLength={128} required/></label></>}
      <button className="btn primary" disabled={busy}>{busy?'Gözləyin…':register?'Hesabımı yarat':'Daxil ol'}</button>
    </form><button className="text-button" onClick={()=>go(register?'/login':'/register')}>{register?'Hesabınız var? Daxil olun':'Hesabınız yoxdur? Qeydiyyatdan keçin'}</button></section></main>:page==='/profile'?<main className="account-shell"><section className="work-card account-form profile-form"><span className="eyebrow">ŞƏXSİ HESAB</span><h1>Profilim</h1><p className="account-muted">{user.email} · İstifadəçi</p>{notice&&<p role="status" className="info-box success">{notice}</p>}<form onSubmit={e=>void submit(e,'profile')}><label>Ad və soyad<input name="name" defaultValue={user.name} minLength={2} maxLength={100} autoComplete="name" required/></label><label>İxtisas / peşə<input name="title" defaultValue={user.title} maxLength={120} placeholder="Məsələn, Frontend developer"/></label><label>Haqqımda<textarea name="bio" defaultValue={user.bio} maxLength={2000} rows={5} placeholder="Təcrübə və karyera hədəfləriniz"/></label><button disabled={busy} className="btn primary">{busy?'Saxlanılır…':'Dəyişiklikləri saxla'}</button></form></section></main>:page==='/dashboard'?<CareerCommandCenter key={user.id} userId={user.id} name={user.name}/>:page==='/quality'?<CareerIntelligence key={user.id} userId={user.id} mode="quality"/>:page==='/match'?<CareerIntelligence key={user.id} userId={user.id} mode="match"/>:page.startsWith('/applications')?<Applications key={`${user.id}-${page}`} userId={user.id} mode={page==='/dashboard'?'dashboard':'tracker'}/>:page==='/followup'?<FollowUp key={user.id} userId={user.id} name={user.name}/>:page==='/multilingual'?<MultilingualCV key={user.id} userId={user.id}/>:page==='/versions'?<CVVersions key={user.id} userId={user.id}/>:page==='/analytics'?<CareerAnalytics key={user.id} userId={user.id}/>:page==='/letter'?<CoverLetter key={user.id} userId={user.id} name={user.name} cv={savedCv(user.id)} job={savedJob(user.id)}/>:page==='/roadmap'?<Roadmap key={user.id} userId={user.id} cv={savedCv(user.id)}/>:page==='/interview'?<main className="app-shell interview-page"><div className="interview-page-heading"><span className="eyebrow">CVMatch AI · KARYERA MƏRKƏZİ</span><h1>HR müsahibəsinə hazırlaşın</h1><p>CV və vakansiya məlumatlarınıza əsaslanan suallarla özünüzü yoxlayın.</p></div><Interview cv={savedCv(user.id)} job={savedJob(user.id)}/></main>:page==='/ai'?<AIAssistant key={user.id} userId={user.id}/>:page==='/profiles'||page==='/jobs'?<main className="app-shell career-page"><Career key={`${user.id}-${page}`} userId={user.id} cv={savedCv(user.id)} mode={page==='/jobs'?'jobs':'profiles'}/></main>:<App key={user.id} userId={user.id}/>}</>;
}
