import type {CareerReport} from './career';

export type CareerSnapshot={version:1;createdAt:number;cvFingerprint:string;skills:string[];roles:string[];findings:CareerReport['findings'];sources:{cv:boolean;linkedin:boolean;github:boolean}};
export const snapshotKey=(userId:string)=>`cvmatch_career_snapshot_${userId}`;
export function cvFingerprint(cv:string){const text=cv.trim();let hash=2166136261;for(let i=0;i<text.length;i++){hash=Math.imul(hash^text.charCodeAt(i),16777619);}return `${text.length}:${hash>>>0}`;}
export function makeCareerSnapshot(report:CareerReport,cv:string,linkedin:string,githubLoaded:boolean,profileSkills:string[]):CareerSnapshot{
  return {version:1,createdAt:Date.now(),cvFingerprint:cvFingerprint(cv),skills:profileSkills.slice(0,80),roles:report.roles.slice(0,5),findings:report.findings.slice(0,30),sources:{cv:!!cv.trim(),linkedin:!!linkedin.trim(),github:githubLoaded}};
}
export function readCareerSnapshot(userId:string):CareerSnapshot|null{
  try{const raw=localStorage.getItem(snapshotKey(userId));if(!raw)return null;const value:unknown=JSON.parse(raw);if(!value||typeof value!=='object')return null;const data=value as CareerSnapshot;
    if(data.version!==1||!Number.isFinite(data.createdAt)||!Array.isArray(data.skills)||!Array.isArray(data.roles)||!Array.isArray(data.findings)||!data.sources||typeof data.cvFingerprint!=='string')return null;
    return data;
  }catch{return null;}
}
export function saveCareerSnapshot(userId:string,snapshot:CareerSnapshot){try{localStorage.setItem(snapshotKey(userId),JSON.stringify(snapshot));return true;}catch{return false;}}
