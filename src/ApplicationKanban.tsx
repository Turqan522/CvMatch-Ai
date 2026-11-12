import {useState,type DragEvent} from 'react';
import {APPLICATION_STATUSES,type Application,type ApplicationStatus} from './lib/applications';
import './creative-studio.css';
export default function ApplicationKanban({items,onMove,onEdit,disabled=false}:{items:Application[];onMove:(id:string,status:ApplicationStatus)=>void;onEdit:(item:Application)=>void;disabled?:boolean}){
 const [dragged,setDragged]=useState<string|null>(null);
 const drop=(event:DragEvent,status:ApplicationStatus)=>{event.preventDefault();if(dragged)onMove(dragged,status);setDragged(null)};
 return <section className="work-card kanban-panel" aria-label="Kanban müraciət lövhəsi">
 <div className="application-section-head"><h2>Kanban müraciət lövhəsi</h2><span>Sürüklə-burax və ya status seç</span></div>
 <p className="ci-hint">Müraciətləri mərhələlər arasında hərəkət etdir. Dəyişikliklər mövcud Firebase sinxronizasiyası ilə saxlanılır.</p>
 <div className="kanban-columns">{APPLICATION_STATUSES.map(status=><div key={status} className="kanban-column" onDragOver={e=>e.preventDefault()} onDrop={e=>drop(e,status)}>
 <h3>{status} <span>{items.filter(x=>x.status===status).length}</span></h3>
 {items.filter(x=>x.status===status).map(item=><article className="kanban-item" key={item.id} draggable={!disabled} onDragStart={()=>setDragged(item.id)} onDragEnd={()=>setDragged(null)}>
  <strong>{item.title}</strong><p>{item.company}</p>
  <label>Status<select aria-label={item.title+' statusu'} value={item.status} disabled={disabled} onChange={e=>onMove(item.id,e.target.value as ApplicationStatus)}>{APPLICATION_STATUSES.map(v=><option key={v} value={v}>{v}</option>)}</select></label>
  <button className="ci-small-button" onClick={()=>onEdit(item)}>Düzəliş et</button>
 </article>)}
 {items.every(x=>x.status!==status)&&<p className="ci-hint">Bu mərhələdə müraciət yoxdur</p>}
 </div>)}</div>
 </section>
}