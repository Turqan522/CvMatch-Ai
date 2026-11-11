export const APPLICATION_STATUSES=['Planlaşdırılır','Müraciət edildi','Baxılır','Müsahibə','Təklif','İmtina'] as const;
export type ApplicationStatus=typeof APPLICATION_STATUSES[number];
export type Application={id:string;title:string;company:string;url:string;status:ApplicationStatus;appliedAt:string;interviewAt:string;notes:string;updatedAt:number};
export const trackerKey=(uid:string)=>`cvmatch_applications_${uid}`;

export function validApplication(value:unknown):value is Application{
  if(!value||typeof value!=='object')return false;
  const item=value as Partial<Application>;
  return typeof item.id==='string'&&item.id.length>0&&typeof item.title==='string'&&item.title.length<=150&&typeof item.company==='string'&&item.company.length<=120&&typeof item.url==='string'&&item.url.length<=1000&&typeof item.appliedAt==='string'&&typeof item.interviewAt==='string'&&typeof item.notes==='string'&&item.notes.length<=2000&&typeof item.updatedAt==='number'&&Number.isFinite(item.updatedAt)&&APPLICATION_STATUSES.includes(item.status as ApplicationStatus);
}
export function parseApplications(value:unknown):Application[]{return Array.isArray(value)?value.filter(validApplication).slice(0,100):[];}
export function safeJobUrl(value:string):string{
  if(!value.trim())return '';
  try{const url=new URL(value);return url.protocol==='https:'||url.protocol==='http:'?url.href:'';}catch{return '';}
}
export function applicationStats(items:Application[]){return {total:items.length,interviews:items.filter(x=>x.status==='Müsahibə').length,offers:items.filter(x=>x.status==='Təklif').length,active:items.filter(x=>!['İmtina','Təklif'].includes(x.status)).length};}
export function upcomingInterviews(items:Application[],now=Date.now()){
  return items.filter(x=>x.status==='Müsahibə'&&x.interviewAt&&new Date(x.interviewAt).getTime()>=now).sort((a,b)=>a.interviewAt.localeCompare(b.interviewAt));
}
