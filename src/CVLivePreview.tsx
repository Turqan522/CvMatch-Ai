import type {CVTemplate} from './lib/exporters';
export default function CVLivePreview({text,template='classic'}:{text:string;template?:CVTemplate}){
 const lines=text.trim().slice(0,6000).split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
 const first=lines[0]||'Ad Soyad';
 return <section className="studio-preview" aria-label="Canlı CV önizləməsi">
  <div className="studio-preview-header"><strong>Canlı CV önizləməsi</strong><small>{text.trim()?'Dəyişikliklər dərhal görünür':'CV məlumatlarını daxil et'} · A4 görünüşü</small></div>
  <div className="studio-paper" data-template={template}><h3>{first}</h3>
   {lines.length>1?lines.slice(1,35).map((line,i)=><p key={i}>{line}</p>):<p className="studio-paper-empty">CV mətni burada görünəcək. İş təcrübəsi, bacarıqlar və layihələri əlavə edə bilərsən.</p>}
   {lines.length>36&&<p className="studio-paper-empty">Önizləmənin qalan hissəsi ixracda saxlanılır.</p>}
  </div>
 </section>;
}
