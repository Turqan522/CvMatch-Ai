import {doc,getDoc,updateDoc} from 'firebase/firestore';
import {db} from '../firebase';
export type Draft={cv:string;job:string;url:string;role:string};
export type CVVersion={id:string;name:string;cv:string;createdAt:string};
export const draftKey=(uid:string)=>'cvmatch_draft_v1_'+uid;
export const versionKey=(uid:string)=>'cvmatch_cv_versions_v1_'+uid;
export function parseDraft(x:unknown):Draft{
 const d=x&&typeof x==='object'?x as Record<string,unknown>:{};
 const value=(key:string,max:number)=>typeof d[key]==='string'?String(d[key]).slice(0,max):'';
 return {cv:value('cv',30000),job:value('job',30000),url:value('url',1000),role:value('role',120)};
}
export function parseVersions(x:unknown):CVVersion[]{
 if(!Array.isArray(x))return [];
 return x.filter((v:unknown)=>!!v&&typeof v==='object'&&
  typeof (v as CVVersion).id==='string'&&typeof (v as CVVersion).name==='string'&&
  typeof (v as CVVersion).cv==='string'&&typeof (v as CVVersion).createdAt==='string')
 .slice(0,20).map(v=>({id:v.id.slice(0,100),name:v.name.slice(0,80),cv:v.cv.slice(0,30000),createdAt:v.createdAt.slice(0,100)}));
}
export function readLocalBackup(uid:string){let draft:unknown=null,versions:unknown=null;
 try{draft=JSON.parse(localStorage.getItem(draftKey(uid))||'null');versions=JSON.parse(localStorage.getItem(versionKey(uid))||'null')}catch{/* invalid data */}
 return {draft:parseDraft(draft),cvVersions:parseVersions(versions)};
}
export async function saveBackup(uid:string){
 const data=readLocalBackup(uid);
 // Explicit owner-scoped update. Reject excessive payload before attempting Firestore write.
 const bytes=new TextEncoder().encode(JSON.stringify(data)).length;
 if(bytes>850000)throw new Error('CV arxivi çox böyükdür. Köhnə versiyaları azaldın.');
 await updateDoc(doc(db,'users',uid),{...data,draftUpdatedAt:new Date().toISOString(),cvVersionsUpdatedAt:new Date().toISOString()});
 return {versions:data.cvVersions.length,bytes};
}
export async function loadBackup(uid:string){
 const snapshot=await getDoc(doc(db,'users',uid));
 if(!snapshot.exists())throw new Error('İstifadəçi profili tapılmadı.');
 const value=snapshot.data();
 // Never erase local data when the cloud fields are not present.
 if(!value.draft&&!Array.isArray(value.cvVersions))throw new Error('Buludda CV ehtiyat nüsxəsi yoxdur.');
 const data={draft:parseDraft(value.draft),cvVersions:parseVersions(value.cvVersions)};
 return {data,updatedAt:String(value.draftUpdatedAt||value.cvVersionsUpdatedAt||'')};
}
export function restoreLocalBackup(uid:string,data:{draft:Draft;cvVersions:CVVersion[]}){
 const prevDraft=localStorage.getItem(draftKey(uid)),prevVersions=localStorage.getItem(versionKey(uid));
 try{
  localStorage.setItem(draftKey(uid),JSON.stringify(data.draft));
  localStorage.setItem(versionKey(uid),JSON.stringify(data.cvVersions));
 }catch(e){
  if(prevDraft===null)localStorage.removeItem(draftKey(uid));else localStorage.setItem(draftKey(uid),prevDraft);
  if(prevVersions===null)localStorage.removeItem(versionKey(uid));else localStorage.setItem(versionKey(uid),prevVersions);
  throw e;
 }
}
