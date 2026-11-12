import {useState} from 'react';
import {CloudDownload,CloudUpload,DatabaseBackup} from 'lucide-react';
import {loadBackup,restoreLocalBackup,saveBackup} from './lib/cloudData';
export default function CloudSync({userId}:{userId:string}){
 const [busy,setBusy]=useState(false),[info,setInfo]=useState(''),[error,setError]=useState('');
 const upload=async()=>{if(!window.confirm('Bu cihazdakı CV və versiyalar Firebase buludundakı ehtiyat nüsxəni əvəz edəcək. Davam edilsin?'))return;setBusy(true);setError('');setInfo('');
  try{const v=await saveBackup(userId);setInfo('CV və '+v.versions+' versiya buludda saxlanıldı.')}catch(e){setError(e instanceof Error?e.message:'Buluda saxlamaq mümkün olmadı.')}finally{setBusy(false)}};
 const download=async()=>{setBusy(true);setError('');setInfo('');
  try{const backup=await loadBackup(userId);if(!window.confirm('Buluddakı CV və '+backup.data.cvVersions.length+' versiya bu cihazdakı məlumatları əvəz edəcək. Son saxlanma: '+(backup.updatedAt||'Məlum deyil')+'. Davam edilsin?'))return;
   restoreLocalBackup(userId,backup.data);setInfo('Məlumatlar bu cihaza bərpa edildi. Yenilənmiş CV-ni görmək üçün müvafiq səhifəni təkrar açın.');
  }catch(e){setError(e instanceof Error?e.message:'Buluddan bərpa alınmadı.')}finally{setBusy(false)}};
 return <section className="work-card" style={{marginTop:22,maxWidth:700,marginLeft:'auto',marginRight:'auto'}}>
  <h2 style={{display:'flex',alignItems:'center',gap:10}}><DatabaseBackup size={23}/> CV bulud ehtiyat nüsxəsi</h2>
  <p className="account-muted">CV redaktorundakı məlumatları və CV versiyalarını Firebase hesabına saxla və başqa cihazda bərpa et. Bu əməliyyatlar yalnız sənin təsdiqinlə edilir.</p>
  <div style={{display:'flex',gap:10,flexWrap:'wrap',marginTop:15}}>
   <button type="button" className="btn primary" disabled={busy} onClick={()=>void upload()}><CloudUpload size={17}/> Buluda saxla</button>
   <button type="button" className="btn secondary" disabled={busy} onClick={()=>void download()}><CloudDownload size={17}/> Buluddan bərpa et</button>
  </div>
  {info&&<p role="status" className="info-box success">{info}</p>}
  {error&&<p role="alert" className="account-alert">{error}</p>}
  <p className="account-muted" style={{fontSize:12}}>Müraciətlər ayrıca Firebase sinxronizasiyasından istifadə edir. CV backup avtomatik deyil; son versiyanın saxlanmasını özün idarə edirsən.</p>
 </section>;
}