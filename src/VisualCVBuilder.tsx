import {useEffect,useState,type DragEvent} from 'react';
import {ArrowDown,ArrowUp,Download,GripVertical,Plus,RotateCcw,Trash2} from 'lucide-react';
import {CV_TEMPLATES,downloadDocx,downloadPdf} from './lib/exporters';
import {builderKey,builderText,cleanBuilder,defaultBuilder,moveBuilderSection,type BuilderDocument} from './lib/creativeStudio';
import './creative-studio.css';
function read(uid:string):BuilderDocument{
 try{const saved=localStorage.getItem(builderKey(uid));if(saved)return cleanBuilder(JSON.parse(saved));
 const draft=JSON.parse(localStorage.getItem('cvmatch_draft_v1_'+uid)||'{}');
 return defaultBuilder(typeof draft.cv==='string'?draft.cv:'');
 }catch{return defaultBuilder()}
}
export default function VisualCVBuilder({userId}:{userId:string}){
 const [value,setValue]=useState(()=>read(userId)),[message,setMessage]=useState(''),[dragged,setDragged]=useState<number|null>(null);
 const text=builderText(value);
 useEffect(()=>{try{localStorage.setItem(builderKey(userId),JSON.stringify(value));setMessage('Bu cihazda saxlanılıb')}catch{setMessage('Saxlama mümkün olmadı')}},[userId,value]);
 const patch=(next:Partial<BuilderDocument>)=>setValue(v=>({...v,...next}));
 const update=(id:string,key:'title'|'body',text:string)=>patch({sections:value.sections.map(s=>s.id===id?{...s,[key]:text}:s)});
 const add=()=>patch({sections:[...value.sections,{id:crypto.randomUUID(),title:'Yeni bölmə',body:''}]});
 const reorder=(from:number,to:number)=>patch({sections:moveBuilderSection(value.sections,from,to)});
 const onDrop=(event:DragEvent,at:number)=>{event.preventDefault();if(dragged!==null)reorder(dragged,at);setDragged(null)};
 const exportFile=async(kind:'docx'|'pdf')=>{try{if(kind==='docx')await downloadDocx(text,value.theme);else downloadPdf(text,value.theme);setMessage(kind==='pdf'?'PDF kimi saxlamaq üçün çap pəncərəsindən istifadə et.':'DOCX yükləndi')}catch{setMessage('İxrac alınmadı')}};
 return <main className="app-shell creative-page">
  <header className="ci-hero"><span className="eyebrow">CV STUDIO · VISUAL EDITOR</span><h1>Vizual CV Builder</h1><p>CV-ni bölmələr üzrə redaktə et, sıralamanı sürükləyərək dəyişdir və DOCX/PDF kimi ixrac et. Bütün məlumatlar sənin nəzarətindədir.</p></header>
  <div className="creative-toolbar"><label>Şablon <select value={value.theme} onChange={e=>patch({theme:e.target.value as BuilderDocument['theme']})}>{CV_TEMPLATES.map(([id,title])=><option key={id} value={id}>{title}</option>)}</select></label><span role="status" className="ci-hint">{message}</span><button className="btn secondary" onClick={()=>void exportFile('docx')}><Download size={16}/> DOCX</button><button className="btn secondary" onClick={()=>void exportFile('pdf')}><Download size={16}/> PDF</button></div>
  <div className="creative-layout"><section className="ci-card">
   <h2>CV məlumatların</h2><label>Ad və soyad<input value={value.name} maxLength={120} onChange={e=>patch({name:e.target.value})}/></label>
   <label>Peşəkar başlıq<input value={value.headline} maxLength={180} onChange={e=>patch({headline:e.target.value})} placeholder="Məsələn: Data Analyst"/></label>
   <p className="ci-hint">Bölmələri yuxarı-aşağı düymələri və ya sürüklə-burax ilə sırala.</p>
   <div className="creative-section-list">{value.sections.map((s,i)=><article className="creative-editor-section" key={s.id} draggable onDragStart={()=>setDragged(i)} onDragOver={e=>e.preventDefault()} onDrop={e=>onDrop(e,i)} onDragEnd={()=>setDragged(null)}>
    <div className="creative-section-header"><GripVertical size={17}/><strong>{i+1}. {s.title}</strong><div className="creative-buttons"><button aria-label="Yuxarı daşı" disabled={i===0} onClick={()=>reorder(i,i-1)}><ArrowUp size={16}/></button><button aria-label="Aşağı daşı" disabled={i===value.sections.length-1} onClick={()=>reorder(i,i+1)}><ArrowDown size={16}/></button><button aria-label="Bölməni sil" onClick={()=>patch({sections:value.sections.filter(x=>x.id!==s.id)})}><Trash2 size={16}/></button></div></div>
    <label>Bölmə başlığı<input value={s.title} maxLength={90} onChange={e=>update(s.id,'title',e.target.value)}/></label>
    <label>Məzmun<textarea rows={3} maxLength={15000} value={s.body} onChange={e=>update(s.id,'body',e.target.value)} placeholder="Yalnız real məlumatlarını əlavə et"/></label>
   </article>)}</div>
   <div className="creative-toolbar"><button className="btn secondary" onClick={add} disabled={value.sections.length>=18}><Plus size={16}/> Bölmə əlavə et</button><button className="btn ghost" onClick={()=>{if(window.confirm('Vizual redaktor sıfırlansın?'))patch(defaultBuilder(text))}}><RotateCcw size={16}/> Yenidən qur</button></div>
  </section><aside className="ci-card creative-preview"><h2>Canlı A4 önizləmə</h2><div className="creative-paper" data-template={value.theme}><h2>{value.name||'Ad Soyad'}</h2>{value.headline&&<p className="creative-headline">{value.headline}</p>}{value.sections.filter(s=>s.body.trim()).map(s=><section key={s.id}><h3>{s.title}</h3><p>{s.body}</p></section>)}{value.sections.every(s=>!s.body.trim())&&<p>Məlumat əlavə etdikcə burada görünəcək.</p>}</div><p className="ci-hint">Bu ekran önizləməsidir; DOCX və PDF tərtibatı fərqli ola bilər.</p></aside></div>
 </main>;
}