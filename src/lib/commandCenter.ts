import type {Application} from './applications';
export type CommandStage={label:string;count:number};
export type ReadinessStep={id:string;label:string;done:boolean;path:string};
export function applicationFunnel(items:Application[]):CommandStage[]{
 return [
  {label:'Planlaşdırılır',count:items.filter(a=>a.status==='Planlaşdırılır').length},
  {label:'Müraciət edildi',count:items.filter(a=>a.status==='Müraciət edildi'||a.status==='Baxılır').length},
  {label:'Müsahibə',count:items.filter(a=>a.status==='Müsahibə').length},
  {label:'Təklif',count:items.filter(a=>a.status==='Təklif').length}
 ];
}
export function careerChecklist(cv:string,job:string,items:Application[],matched:number,recognized:number):ReadinessStep[]{
 return [
  {id:'cv',label:'CV-ni redaktorda tamamla',done:cv.trim().length>=100,path:'#/'},
  {id:'job',label:'Hədəf vakansiya tələblərini əlavə et',done:job.trim().length>=30,path:'#/match'},
  {id:'match',label:'CV-ni vakansiya ilə müqayisə et',done:job.trim().length>=30&&recognized>=3&&matched>0,path:'#/match'},
  {id:'applications',label:'İlk iş müraciətini izləməyə başla',done:items.some(a=>a.status!=='Planlaşdırılır'),path:'#/applications'}
 ];
}
export function checklistProgress(steps:ReadinessStep[]):number{
 return steps.length?Math.round(steps.filter(x=>x.done).length/steps.length*100):0;
}
