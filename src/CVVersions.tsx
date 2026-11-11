import {useMemo,useState} from 'react';
import {extractSkills,scoreResume} from './lib/scoring';
import './cv-versions.css';
type Version={id:string;name:string;cv:string;createdAt:string};
const storageKey=(id:string)=>'cvmatch_cv_versions_v1_'+id;
function load(id:string):Version[]{try{const list=JSON.parse(localStorage.getItem(storageKey(id))||'[]');return Array.isArray(list)?list.filter((v:Version)=>v&&typeof v.cv==='string'&&typeof v.id==='string').slice(0,20):[]}catch{return []}}
function draft(id:string):{cv?:string;job?:string}{try{return JSON.parse(localStorage.getItem('cvmatch_draft_v1_'+id)||'{}')}catch{return {}}}
function tokens(s:string){return new Set(s.toLocaleLowerCase('az-AZ').match(/[\p{L}\p{N}+#.]{3,}/gu)||[])}
export default function CVVersions({userId}:{userId:string}){
 const [items,setItems]=useState<Version[]>(()=>load(userId));
 const [label,setLabel]=useState(''),[input,setInput]=useState(''),[message,setMessage]=useState('');
 const [left,setLeft]=useState(''),[right,setRight]=useState('');
 const [job,setJob]=useState(()=>String(draft(userId).job||''));
 const first=items.find(i=>i.id===left),second=items.find(i=>i.id===right);
 const comparison=useMemo(()=>{
  if(!first||!second)return null;
  const a=tokens(first.cv),b=tokens(second.cv);
  const oldSkills=new Set(extractSkills(first.cv));const newSkills=new Set(extractSkills(second.cv));
  return {added:[...b].filter(x=>!a.has(x)).slice(0,60),removed:[...a].filter(x=>!b.has(x)).slice(0,60),addedSkills:[...newSkills].filter(x=>!oldSkills.has(x)),removedSkills:[...oldSkills].filter(x=>!newSkills.has(x))};
 },[first,second]);
 const persist=(next:Version[])=>{try{localStorage.setItem(storageKey(userId),JSON.stringify(next));setItems(next);setMessage('Versiyalar bu brauzerdə saxlanıldı.')}catch{setMessage('Brauzer yaddaşına yazmaq mümkün olmadı.')}};
 const add=()=>{const cv=(input||draft(userId).cv||'').trim();if(cv.length<30){setMessage('Ən azı 30 simvol CV mətni daxil edin.');return}
 const v:Version={id:crypto.randomUUID(),name:label.trim()||'CV '+new Date().toLocaleDateString('az-AZ'),cv,createdAt:new Date().toISOString()};
 const next=[v,...items].slice(0,20);persist(next);if(!left&&items[0])setLeft(items[0].id);setRight(v.id);setInput('');setLabel('')};
 const restore=(v:Version)=>{try{localStorage.setItem('cvmatch_draft_v1_'+userId,JSON.stringify({...draft(userId),cv:v.cv}));setMessage('CV redaktoruna köçürüldü. CV analizi səhifəsinə keçin.')}catch{setMessage('CV-ni redaktora köçürmək mümkün olmadı.')}};
 const before=first&&job.trim().length>=20?scoreResume(first.cv,job):null;
 const after=second&&job.trim().length>=20?scoreResume(second.cv,job):null;
 return <main className="cvv-wrap">
 <div className="cvv-heading"><span className="eyebrow">CV STUDIO</span><h1>CV versiyalarının müqayisəsi</h1><p>Əvvəlki və yeni CV-ni, bacarıqları və vakansiya uyğunluğunu müqayisə edin.</p></div>
 <section className="cvv-panel"><h2>Yeni versiya saxla</h2><div className="cvv-fields"><label>Versiyanın adı<input value={label} maxLength={80} onChange={e=>setLabel(e.target.value)} placeholder="Məsələn: Data Analyst — yenilənmiş"/></label><label>CV mətni<textarea value={input} rows={5} onChange={e=>setInput(e.target.value)} placeholder="Buraya CV yerləşdirin; boş qalsa cari CV istifadə ediləcək."/></label></div><button className="cvv-primary" onClick={add}>+ Versiyanı yadda saxla</button>{message&&<p role="status" className="cvv-note">{message}</p>}<p className="cvv-muted">Versiyalar yalnız bu brauzerdə saxlanılır. Maksimum 20 versiya.</p></section>
 <section className="cvv-panel"><h2>İki CV-ni müqayisə et</h2><div className="cvv-selectors"><label>Əvvəlki CV<select value={left} onChange={e=>setLeft(e.target.value)}><option value="">Versiya seçin</option>{items.map(v=><option key={v.id} value={v.id}>{v.name}</option>)}</select></label><label>Yeni CV<select value={right} onChange={e=>setRight(e.target.value)}><option value="">Versiya seçin</option>{items.map(v=><option key={v.id} value={v.id}>{v.name}</option>)}</select></label></div>
 {first&&second?<><div className="cvv-columns">{[first,second].map((v,index)=><div key={v.id+'-'+index} className="cvv-resume"><h3>{index===0?'Əvvəlki: ':'Yeni: '}{v.name}</h3><div className="cvv-cv">{v.cv}</div><button className="cvv-secondary" onClick={()=>restore(v)}>Redaktora köçür</button></div>)}</div>
 {comparison&&<div className="cvv-columns"><div><h3 className="cvv-green">+ Əlavə olunan bacarıqlar</h3><div className="cvv-chips">{comparison.addedSkills.length?comparison.addedSkills.map(s=><span className="cvv-chip cvv-add" key={s}>{s}</span>):<span className="cvv-muted">Yeni bacarıq aşkar edilmədi.</span>}</div><h3 className="cvv-green">+ Yeni sözlər</h3><div className="cvv-chips">{comparison.added.map(s=><span className="cvv-chip cvv-add" key={s}>{s}</span>)}</div></div><div><h3 className="cvv-red">− Çıxarılan bacarıqlar</h3><div className="cvv-chips">{comparison.removedSkills.length?comparison.removedSkills.map(s=><span className="cvv-chip cvv-remove" key={s}>{s}</span>):<span className="cvv-muted">Çıxarılan bacarıq aşkar edilmədi.</span>}</div><h3 className="cvv-red">− Çıxarılan sözlər</h3><div className="cvv-chips">{comparison.removed.map(s=><span className="cvv-chip cvv-remove" key={s}>{s}</span>)}</div></div></div>}
 <div className="cvv-ats"><label>ATS müqayisəsi üçün vakansiya mətni<textarea rows={3} value={job} onChange={e=>setJob(e.target.value)} placeholder="Eyni vakansiya tələblərini daxil edin"/></label>{before&&after?<p>Əvvəlki CV: <strong>{before.score}/100</strong> → Yeni CV: <strong>{after.score}/100</strong> · Açar söz uyğunluğu: {before.keywordCoverage}% → {after.keywordCoverage}%</p>:<p className="cvv-muted">Vakansiya mətni daxil edin.</p>}<small>Bu lokal hesablamadır, real ATS balı və iş təklifi zəmanəti deyil.</small></div>
 </>:<p className="cvv-muted">Müqayisə üçün iki saxlanılmış versiya seçin.</p>}</section>
 <section className="cvv-panel"><h2>Versiya tarixçəsi</h2>{items.length?items.map(v=><div className="cvv-history" key={v.id}><div><strong>{v.name}</strong><span>{new Date(v.createdAt).toLocaleString('az-AZ')}</span></div><div className="cvv-actions"><button onClick={()=>restore(v)}>Bərpa et</button><button onClick={()=>{if(window.confirm('Bu CV versiyasını silmək istəyirsiniz?')){persist(items.filter(x=>x.id!==v.id));if(left===v.id)setLeft('');if(right===v.id)setRight('')}}}>Sil</button></div></div>):<p className="cvv-muted">Hələ CV versiyası saxlanılmayıb.</p>}</section>
 </main>
}